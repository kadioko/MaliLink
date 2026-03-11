import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { DEFAULT_CREDIT_TERM_DAYS, DEFAULT_INTEREST_RATE } from "@/lib/constants";
import { getUsdToTzsRate } from "@/lib/utils";

const requestCreditSchema = z.object({
  orderId: z.string(),
  termDays: z.number().int().positive().default(DEFAULT_CREDIT_TERM_DAYS),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where: any = {};
  if (session.user.role === "IMPORTER") where.borrowerId = session.user.id;
  if (session.user.role === "SUPPLIER") where.lenderId = session.user.id;

  const creditLines = await db.creditLine.findMany({
    where,
    include: {
      order: { select: { orderNumber: true, totalUsd: true } },
      lender: { select: { businessName: true } },
      borrower: { select: { businessName: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ creditLines });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "IMPORTER") {
    return NextResponse.json({ error: "Only importers can request credit" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = requestCreditSchema.parse(body);

    const order = await db.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.importerId !== session.user.id) {
      return NextResponse.json({ error: "Not your order" }, { status: 403 });
    }

    const existingCredit = await db.creditLine.findUnique({
      where: { orderId: data.orderId },
    });

    if (existingCredit) {
      return NextResponse.json({ error: "Credit already requested for this order" }, { status: 409 });
    }

    const exchangeRate = getUsdToTzsRate();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + data.termDays);

    const creditLine = await db.creditLine.create({
      data: {
        orderId: data.orderId,
        lenderId: order.supplierId,
        borrowerId: session.user.id,
        amountUsd: order.totalUsd,
        amountTzs: order.totalUsd * exchangeRate,
        interestRate: DEFAULT_INTEREST_RATE,
        termDays: data.termDays,
        dueDate,
      },
    });

    return NextResponse.json({ creditLine }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to request credit" }, { status: 500 });
  }
}
