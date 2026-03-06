import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true } },
      importer: { select: { id: true, name: true, businessName: true, phone: true } },
      supplier: { select: { id: true, name: true, businessName: true, phone: true } },
      payments: true,
      creditLine: true,
      messages: {
        include: {
          sender: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Verify access
  if (
    session.user.role !== "ADMIN" &&
    order.importerId !== session.user.id &&
    order.supplierId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { status, shippingRef, customsRef, estimatedDelivery } = body;

  const order = await db.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const updateData: any = {};

  if (status) {
    updateData.status = status;
    if (status === "CONFIRMED") updateData.confirmedAt = new Date();
    if (status === "SHIPPED") updateData.shippedAt = new Date();
    if (status === "DELIVERED") updateData.deliveredAt = new Date();
  }

  if (shippingRef) updateData.shippingRef = shippingRef;
  if (customsRef) updateData.customsRef = customsRef;
  if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

  const updated = await db.order.update({
    where: { id: params.id },
    data: updateData,
    include: {
      items: { include: { product: true } },
      importer: { select: { name: true, businessName: true } },
      supplier: { select: { name: true, businessName: true } },
    },
  });

  return NextResponse.json({ order: updated });
}
