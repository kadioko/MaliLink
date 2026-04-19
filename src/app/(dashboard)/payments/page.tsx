import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PaymentsClientPage } from "./payments-client-page";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  const where = session?.user.role === "ADMIN" ? {} : { userId: session?.user.id };

  const payments = await db.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const payableOrders =
    session?.user.role === "IMPORTER"
      ? await db.order.findMany({
          where: {
            importerId: session.user.id,
            status: { in: ["SUBMITTED", "CONFIRMED", "PROCESSING", "SHIPPED", "IN_CUSTOMS", "DELIVERED", "COMPLETED"] },
          },
          include: {
            supplier: { select: { businessName: true } },
            payments: { where: { status: "COMPLETED" }, select: { amountTzs: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const unpaidOrders = payableOrders
    .map((order) => {
      const paidTzs = order.payments.reduce((sum: number, payment: { amountTzs: number }) => sum + payment.amountTzs, 0);
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        totalTzs: order.totalTzs,
        paidTzs,
        supplierName: order.supplier.businessName,
        status: order.status,
      };
    })
    .filter((order: { paidTzs: number; totalTzs: number }) => order.paidTzs < order.totalTzs);

  return (
    <PaymentsClientPage
      role={session?.user.role ?? "IMPORTER"}
      initialPayments={payments}
      initialUnpaidOrders={unpaidOrders}
    />
  );
}
