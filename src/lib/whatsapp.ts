import { db } from "./db";

interface WhatsAppMessage {
  from: string;
  body: string;
  profileName?: string;
}

interface BotResponse {
  message: string;
  mediaUrl?: string;
}

const MENU = `🇲🇱 *MaliLink - Kariakoo Trade Hub*

Karibu! Choose an option:

1️⃣ *Tafuta bidhaa* - Search products
2️⃣ *Angalia bei* - Browse categories
3️⃣ *Oda mpya* - Place new order
4️⃣ *Hali ya oda* - Check order status
5️⃣ *Lipa* - Make payment
6️⃣ *Msaada* - Help / Support

Reply with a number or type what you need.`;

const CATEGORIES_MENU = `📦 *Product Categories*

1. Electronics
2. Textiles & Clothing
3. Machinery & Equipment
4. Building Materials
5. Auto Parts
6. Household Goods
7. Food & Beverages
8. Cosmetics & Beauty

Reply with category number to browse.`;

export async function handleWhatsAppMessage(msg: WhatsAppMessage): Promise<BotResponse> {
  const phone = msg.from.replace("whatsapp:", "");
  const text = msg.body.trim().toLowerCase();

  // Find or suggest registration
  const user = await db.user.findFirst({
    where: { OR: [{ phone }, { whatsappId: phone }] },
  });

  if (!user) {
    return {
      message: `🇲🇱 *Karibu MaliLink!*

Hujasajiliwa bado. / You're not registered yet.

To start ordering from Kariakoo's best suppliers:
👉 Register at malilink.co.tz/register

Or reply *SAJILI* with your business name to quick-register.

Example: SAJILI Mama Fatma Electronics`,
    };
  }

  // Get or create session
  let session = await db.whatsAppSession.findFirst({
    where: { userId: user.id, phoneNumber: phone },
  });

  if (!session) {
    session = await db.whatsAppSession.create({
      data: { userId: user.id, phoneNumber: phone, state: "IDLE" },
    });
  }

  // Update last active
  await db.whatsAppSession.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  // Route based on state and input
  if (text === "menu" || text === "start" || text === "habari" || text === "hi" || text === "hello") {
    await resetSession(session.id);
    return { message: MENU };
  }

  switch (session.state) {
    case "IDLE":
      return handleIdleState(text, user.id, session.id);
    case "BROWSING":
      return handleBrowsingState(text, user.id, session.id);
    case "ORDERING":
      return handleOrderingState(text, user.id, session.id);
    case "CHECKING_ORDER":
      return handleCheckOrderState(text, user.id, session.id);
    default:
      await resetSession(session.id);
      return { message: MENU };
  }
}

async function handleIdleState(
  text: string,
  userId: string,
  sessionId: string
): Promise<BotResponse> {
  switch (text) {
    case "1":
    case "tafuta":
    case "search":
      await updateSession(sessionId, "BROWSING", { action: "search" });
      return { message: "🔍 *Andika jina la bidhaa* / Type product name to search:\n\nExample: phone charger" };

    case "2":
    case "bei":
    case "categories":
      await updateSession(sessionId, "BROWSING", { action: "categories" });
      return { message: CATEGORIES_MENU };

    case "3":
    case "oda":
    case "order":
      await updateSession(sessionId, "ORDERING", { step: "select_supplier" });
      return { message: "📋 *Oda Mpya / New Order*\n\nType the supplier name or product you want to order:" };

    case "4":
    case "hali":
    case "status":
      return await getOrderStatus(userId);

    case "5":
    case "lipa":
    case "pay":
      return await getPendingPayments(userId);

    case "6":
    case "msaada":
    case "help":
      return {
        message: `📞 *MaliLink Support*\n\nEmail: support@malilink.co.tz\nPhone: +255 123 456 789\nHours: Mon-Sat 8am-8pm EAT\n\nOr describe your issue here and we'll get back to you.`,
      };

    default:
      // Try to interpret as product search
      return await searchProducts(text, sessionId);
  }
}

async function handleBrowsingState(
  text: string,
  userId: string,
  sessionId: string
): Promise<BotResponse> {
  const context = await getSessionContext(sessionId);

  if (text === "0" || text === "back" || text === "rudi") {
    await resetSession(sessionId);
    return { message: MENU };
  }

  if (context?.action === "categories") {
    const categories = [
      "Electronics", "Textiles & Clothing", "Machinery & Equipment",
      "Building Materials", "Auto Parts", "Household Goods",
      "Food & Beverages", "Cosmetics & Beauty",
    ];
    const idx = parseInt(text) - 1;
    if (idx >= 0 && idx < categories.length) {
      return await searchProducts(categories[idx], sessionId);
    }
  }

  return await searchProducts(text, sessionId);
}

async function handleOrderingState(
  text: string,
  userId: string,
  sessionId: string
): Promise<BotResponse> {
  if (text === "0" || text === "cancel" || text === "acha") {
    await resetSession(sessionId);
    return { message: "❌ Order cancelled.\n\n" + MENU };
  }

  const context = await getSessionContext(sessionId);

  if (context?.step === "select_supplier") {
    // Search for matching products/suppliers
    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: text, mode: "insensitive" } },
          { nameSwahili: { contains: text, mode: "insensitive" } },
        ],
        inStock: true,
      },
      include: { supplier: { select: { businessName: true, id: true } } },
      take: 5,
    });

    if (products.length === 0) {
      return { message: `😕 Hakuna bidhaa "${text}" / No products found.\n\nTry another search or type *0* to go back.` };
    }

    let msg = "📦 *Products Found:*\n\n";
    products.forEach((p, i) => {
      msg += `${i + 1}. *${p.name}*\n   ${p.supplier.businessName}\n   💰 $${p.priceUsd} / ${p.unit} (MOQ: ${p.moq})\n\n`;
    });
    msg += "Reply with number to order, or *0* to go back.";

    await updateSession(sessionId, "ORDERING", {
      step: "select_product",
      products: products.map((p) => ({ id: p.id, supplierId: p.supplier.id, name: p.name, price: p.priceUsd, unit: p.unit, moq: p.moq })),
    });

    return { message: msg };
  }

  if (context?.step === "select_product") {
    const idx = parseInt(text) - 1;
    if (idx >= 0 && idx < (context.products?.length || 0)) {
      const product = context.products[idx];
      await updateSession(sessionId, "ORDERING", {
        step: "quantity",
        selectedProduct: product,
      });
      return {
        message: `✅ *${product.name}* selected\n💰 $${product.price} per ${product.unit}\n📦 Minimum: ${product.moq}\n\nHow many ${product.unit}s do you want? (type a number)`,
      };
    }
    return { message: "Invalid selection. Reply with a valid number or *0* to go back." };
  }

  if (context?.step === "quantity") {
    const qty = parseInt(text);
    const product = context.selectedProduct;
    if (isNaN(qty) || qty < product.moq) {
      return { message: `⚠️ Minimum order is ${product.moq} ${product.unit}s. Please enter a valid quantity.` };
    }

    const total = qty * product.price;
    await updateSession(sessionId, "ORDERING", {
      step: "confirm",
      selectedProduct: product,
      quantity: qty,
      total,
    });

    return {
      message: `📋 *Order Summary*\n\n📦 ${product.name}\n🔢 Quantity: ${qty} ${product.unit}s\n💰 Total: $${total.toFixed(2)}\n\nReply *CONFIRM* to place order or *0* to cancel.`,
    };
  }

  if (context?.step === "confirm" && (text === "confirm" || text === "ndio" || text === "yes")) {
    // Create the order
    const order = await db.order.create({
      data: {
        orderNumber: `ML${Date.now().toString(36).toUpperCase()}`,
        importerId: userId,
        supplierId: context.selectedProduct.supplierId,
        source: "WHATSAPP",
        subtotalUsd: context.total,
        totalUsd: context.total,
        totalTzs: context.total * 2500,
        exchangeRate: 2500,
        status: "SUBMITTED",
        items: {
          create: {
            productId: context.selectedProduct.id,
            quantity: context.quantity,
            unitPrice: context.selectedProduct.price,
            totalPrice: context.total,
          },
        },
      },
    });

    await resetSession(sessionId);

    return {
      message: `🎉 *Oda imewekwa! / Order Placed!*\n\n📋 Order: ${order.orderNumber}\n💰 Total: $${context.total.toFixed(2)}\n📊 Status: Submitted\n\nYou'll receive updates here. Type *4* to check status anytime.\n\n` + MENU,
    };
  }

  return { message: "Type *CONFIRM* to place order or *0* to cancel." };
}

async function handleCheckOrderState(
  text: string,
  userId: string,
  sessionId: string
): Promise<BotResponse> {
  await resetSession(sessionId);
  return await getOrderStatus(userId);
}

async function searchProducts(query: string, sessionId: string): Promise<BotResponse> {
  const products = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { nameSwahili: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ],
      inStock: true,
    },
    include: { supplier: { select: { businessName: true } } },
    take: 5,
  });

  if (products.length === 0) {
    return {
      message: `😕 Hakuna "${query}" / Nothing found.\n\nTry a different search or type *menu* to start over.`,
    };
  }

  let msg = `🔍 *Results for "${query}":*\n\n`;
  products.forEach((p, i) => {
    msg += `${i + 1}. *${p.name}*\n   ${p.supplier.businessName}\n   💰 $${p.priceUsd} per ${p.unit}\n\n`;
  });
  msg += "Reply *3* to start ordering or *menu* for main menu.";

  await updateSession(sessionId, "BROWSING", { results: query });

  return { message: msg };
}

async function getOrderStatus(userId: string): Promise<BotResponse> {
  const orders = await db.order.findMany({
    where: { importerId: userId, status: { not: "COMPLETED" } },
    include: { supplier: { select: { businessName: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (orders.length === 0) {
    return { message: "📋 Huna oda zinazoendelea / No active orders.\n\nType *3* to place a new order." };
  }

  const statusEmoji: Record<string, string> = {
    DRAFT: "📝", SUBMITTED: "📤", CONFIRMED: "✅", PROCESSING: "⚙️",
    SHIPPED: "🚢", IN_CUSTOMS: "🛃", DELIVERED: "📦", CANCELLED: "❌", DISPUTED: "⚠️",
  };

  let msg = "📋 *Your Active Orders:*\n\n";
  orders.forEach((o) => {
    msg += `${statusEmoji[o.status] || "📋"} *${o.orderNumber}*\n`;
    msg += `   ${o.supplier.businessName}\n`;
    msg += `   Status: ${o.status} | $${o.totalUsd.toFixed(2)}\n\n`;
  });

  return { message: msg };
}

async function getPendingPayments(userId: string): Promise<BotResponse> {
  const orders = await db.order.findMany({
    where: {
      importerId: userId,
      status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
    },
    include: {
      payments: { where: { status: "COMPLETED" } },
      supplier: { select: { businessName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const unpaid = orders.filter((o) => {
    const paid = o.payments.reduce((sum, p) => sum + p.amountUsd, 0);
    return paid < o.totalUsd;
  });

  if (unpaid.length === 0) {
    return { message: "✅ Huna malipo yanayosubiri / No pending payments!\n\nType *menu* for main menu." };
  }

  let msg = "💳 *Pending Payments:*\n\n";
  unpaid.forEach((o) => {
    const paid = o.payments.reduce((sum, p) => sum + p.amountUsd, 0);
    const remaining = o.totalUsd - paid;
    msg += `📋 *${o.orderNumber}* - ${o.supplier.businessName}\n`;
    msg += `   Remaining: $${remaining.toFixed(2)}\n`;
    msg += `   M-Pesa: Lipa Na M-PESA 123456\n\n`;
  });

  return { message: msg };
}

async function updateSession(sessionId: string, state: string, context: any) {
  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: { state: state as any, context: JSON.stringify(context) },
  });
}

async function resetSession(sessionId: string) {
  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: { state: "IDLE", context: null },
  });
}

async function getSessionContext(sessionId: string): Promise<any> {
  const session = await db.whatsAppSession.findUnique({ where: { id: sessionId } });
  return session?.context ? JSON.parse(session.context) : null;
}
