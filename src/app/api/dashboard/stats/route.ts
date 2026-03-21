import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CreditStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const role = session.user.role;
  const activeCreditStatuses: CreditStatus[] = [CreditStatus.ACTIVE, CreditStatus.OVERDUE];

  const orderWhere =
    role === "IMPORTER" ? { importerId: userId } : role === "SUPPLIER" ? { supplierId: userId } : {};
  const paymentWhere = role === "ADMIN" ? {} : { userId };
  const creditWhere =
    role === "IMPORTER"
      ? { borrowerId: userId, status: { in: activeCreditStatuses } }
      : role === "SUPPLIER"
        ? { lenderId: userId, status: { in: activeCreditStatuses } }
        : { status: { in: activeCreditStatuses } };

  const [
    totalOrders,
    activeOrders,
    completedOrders,
    totalRevenue,
    pendingPayments,
    activeCredit,
  ] = await Promise.all([
    db.order.count({ where: orderWhere }),
    db.order.count({
      where: { ...orderWhere, status: { in: ["SUBMITTED", "CONFIRMED", "PROCESSING", "SHIPPED", "IN_CUSTOMS"] } },
    }),
    db.order.count({ where: { ...orderWhere, status: "COMPLETED" } }),
    db.payment.aggregate({
      where: { ...paymentWhere, status: "COMPLETED" },
      _sum: { amountUsd: true },
    }),
    db.payment.aggregate({
      where: { ...paymentWhere, status: { in: ["PENDING", "PROCESSING"] } },
      _sum: { amountUsd: true },
    }),
    db.creditLine.aggregate({
      where: creditWhere,
      _sum: { amountUsd: true },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    totalOrders,
    activeOrders,
    completedOrders,
    totalRevenue: totalRevenue._sum.amountUsd || 0,
    pendingPayments: pendingPayments._sum.amountUsd || 0,
    activeCreditAmount: activeCredit._sum?.amountUsd || 0,
    activeCreditCount: activeCredit._count || 0,
  });
}
