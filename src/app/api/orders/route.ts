import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { generateOrderNumber, calculatePlatformFee } from "@/lib/utils";

const createOrderSchema = z.object({
  supplierId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  notes: z.string().optional(),
  source: z.enum(["WEB", "WHATSAPP", "API"]).default("WEB"),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};

  if (session.user.role === "IMPORTER") {
    where.importerId = session.user.id;
  } else if (session.user.role === "SUPPLIER") {
    where.supplierId = session.user.id;
  }

  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        importer: { select: { id: true, name: true, businessName: true } },
        supplier: { select: { id: true, name: true, businessName: true } },
        creditLine: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createOrderSchema.parse(body);

    // Fetch products and calculate totals
    const products = await db.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotalUsd = 0;
    const orderItems = data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const totalPrice = product.priceUsd * item.quantity;
      subtotalUsd += totalPrice;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.priceUsd,
        totalPrice,
      };
    });

    const totalUsd = subtotalUsd;
    const exchangeRate = 2500; // TODO: fetch live USD/TZS rate
    const totalTzs = totalUsd * exchangeRate;

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        importerId: session.user.id,
        supplierId: data.supplierId,
        source: data.source,
        subtotalUsd,
        totalUsd,
        totalTzs,
        exchangeRate,
        notes: data.notes,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: true } },
        supplier: { select: { name: true, businessName: true } },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
