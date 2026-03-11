import { SessionState } from "@prisma/client";
import { db } from "./db";
import { formatTzs, formatTzsFromUsd, getUsdToTzsRate } from "./utils";

interface WhatsAppMessage {
  from: string;
  body: string;
  profileName?: string;
}

interface BotResponse {
  message: string;
  mediaUrl?: string;
}

interface SessionProduct {
  id: string;
  supplierId: string;
  name: string;
  price: number;
  unit: string;
  moq: number;
}

interface SessionContext {
  action?: "search" | "categories";
  step?: "select_supplier" | "select_product" | "quantity" | "confirm";
  results?: string;
  products?: SessionProduct[];
  selectedProduct?: SessionProduct;
  quantity?: number;
  total?: number;
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
    products.forEach((product: (typeof products)[number], index: number) => {
      msg += `${index + 1}. *${product.name}*\n   ${product.supplier.businessName}\n   💰 ${formatTzsFromUsd(product.priceUsd)} / ${product.unit} (MOQ: ${product.moq})\n\n`;
    });
    msg += "Reply with number to order, or *0* to go back.";

    await updateSession(sessionId, "ORDERING", {
      step: "select_product",
      products: products.map((product: (typeof products)[number]) => ({
        id: product.id,
        supplierId: product.supplier.id,
        name: product.name,
        price: product.priceUsd,
        unit: product.unit,
        moq: product.moq,
      })),
    });

    return { message: msg };
  }

  if (context?.step === "select_product") {
    const idx = parseInt(text) - 1;
    const availableProducts = context.products ?? [];
    if (idx >= 0 && idx < availableProducts.length) {
      const product = availableProducts[idx];
      await updateSession(sessionId, "ORDERING", {
        step: "quantity",
        selectedProduct: product,
      });
      return {
        message: `✅ *${product.name}* selected\n💰 ${formatTzsFromUsd(product.price)} per ${product.unit}\n📦 Minimum: ${product.moq}\n\nHow many ${product.unit}s do you want? (type a number)`,
      };
    }
    return { message: "Invalid selection. Reply with a valid number or *0* to go back." };
  }

  if (context?.step === "quantity") {
    const qty = parseInt(text);
    const product = context.selectedProduct;
    if (!product) {
      await resetSession(sessionId);
      return { message: "Your order session expired. Type *3* to start a new order.\n\n" + MENU };
    }
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
      message: `📋 *Order Summary*\n\n📦 ${product.name}\n🔢 Quantity: ${qty} ${product.unit}s\n💰 Total: ${formatTzsFromUsd(total)}\n\nReply *CONFIRM* to place order or *0* to cancel.`,
    };
  }

  if (context?.step === "confirm" && (text === "confirm" || text === "ndio" || text === "yes")) {
    if (!context.selectedProduct || typeof context.total !== "number" || typeof context.quantity !== "number") {
      await resetSession(sessionId);
      return { message: "Your order session expired. Type *3* to start a new order.\n\n" + MENU };
    }

    const selectedProduct = context.selectedProduct;
    const total = context.total;
    const quantity = context.quantity;

    // Create the order
    const exchangeRate = getUsdToTzsRate();
    const order = await db.order.create({
      data: {
        orderNumber: `ML${Date.now().toString(36).toUpperCase()}`,
        importerId: userId,
        supplierId: selectedProduct.supplierId,
        source: "WHATSAPP",
        subtotalUsd: total,
        totalUsd: total,
        totalTzs: total * exchangeRate,
        exchangeRate,
        status: "SUBMITTED",
        items: {
          create: {
            productId: selectedProduct.id,
            quantity,
            unitPrice: selectedProduct.price,
            totalPrice: total,
          },
        },
      },
    });

    await resetSession(sessionId);

    return {
      message: `🎉 *Oda imewekwa! / Order Placed!*\n\n📋 Order: ${order.orderNumber}\n💰 Total: ${formatTzsFromUsd(total)}\n📊 Status: Submitted\n\nYou'll receive updates here. Type *4* to check status anytime.\n\n` + MENU,
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
  products.forEach((product: (typeof products)[number], index: number) => {
    msg += `${index + 1}. *${product.name}*\n   ${product.supplier.businessName}\n   💰 ${formatTzsFromUsd(product.priceUsd)} per ${product.unit}\n\n`;
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
  orders.forEach((order: (typeof orders)[number]) => {
    msg += `${statusEmoji[order.status] || "📋"} *${order.orderNumber}*\n`;
    msg += `   ${order.supplier.businessName}\n`;
    msg += `   Status: ${order.status} | ${formatTzsFromUsd(order.totalUsd)}\n\n`;
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

  const unpaid = orders.filter((order: (typeof orders)[number]) => {
    const paid = order.payments.reduce((sum: number, payment: (typeof order.payments)[number]) => sum + payment.amountUsd, 0);
    return paid < order.totalUsd;
  });

  if (unpaid.length === 0) {
    return { message: "✅ Huna malipo yanayosubiri / No pending payments!\n\nType *menu* for main menu." };
  }

  let msg = "💳 *Pending Payments:*\n\n";
  unpaid.forEach((order: (typeof unpaid)[number]) => {
    const paid = order.payments.reduce((sum: number, payment: (typeof order.payments)[number]) => sum + payment.amountUsd, 0);
    const remaining = order.totalUsd - paid;
    msg += `📋 *${order.orderNumber}* - ${order.supplier.businessName}\n`;
    msg += `   Remaining: ${formatTzsFromUsd(remaining)}\n`;
    msg += `   M-Pesa: Lipa Na M-PESA 123456\n\n`;
  });

  return { message: msg };
}

async function updateSession(sessionId: string, state: SessionState, context: SessionContext) {
  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: { state, context: JSON.stringify(context) },
  });
}

async function resetSession(sessionId: string) {
  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: { state: "IDLE", context: null },
  });
}

async function getSessionContext(sessionId: string): Promise<SessionContext | null> {
  const session = await db.whatsAppSession.findUnique({ where: { id: sessionId } });
  return session?.context ? (JSON.parse(session.context) as SessionContext) : null;
}
