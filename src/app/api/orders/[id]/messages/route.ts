import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await db.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canAccess =
    session.user.role === "ADMIN" ||
    order.importerId === session.user.id ||
    order.supplierId === session.user.id;
  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await db.message.findMany({
    where: { orderId: params.id },
    include: { sender: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await db.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canAccess =
    session.user.role === "ADMIN" ||
    order.importerId === session.user.id ||
    order.supplierId === session.user.id;
  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Message content required" }, { status: 400 });

  const receiverId = session.user.id === order.importerId ? order.supplierId : order.importerId;

  const message = await db.message.create({
    data: {
      senderId: session.user.id,
      receiverId,
      orderId: params.id,
      content: content.trim(),
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  await db.notification.create({
    data: {
      userId: receiverId,
      title: "New order message",
      body: `${session.user.name ?? "Someone"} sent a message on order ${order.orderNumber}.`,
      type: "order_update",
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
