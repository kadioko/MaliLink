import { getServerSession } from "next-auth";
import { Building2, Landmark, Smartphone, WalletCards } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTzsFromUsd } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, ResponsiveTable, SectionCard, StatCard } from "@/components/dashboard-ui";
import { MpesaPaymentPanel } from "./mpesa-payment-panel";

const PAYMENT_METHODS = [
  { name: "MPESA", icon: Smartphone },
  { name: "TIGO_PESA", icon: Smartphone },
  { name: "AIRTEL_MONEY", icon: Smartphone },
  { name: "BANK_TRANSFER", icon: Landmark },
  { name: "CASH", icon: WalletCards },
  { name: "CREDIT", icon: Building2 },
] as const;

const paymentToneMap: Record<string, "warning" | "success" | "danger" | "info" | "default"> = {
  PENDING: "warning",
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "danger",
};

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  const where = session?.user.role === "ADMIN" ? {} : { userId: session?.user.id };

  const payments = await db.payment.findMany({
    where,
    include: {
      order: { select: { orderNumber: true, status: true } },
      creditLine: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const payableOrders = session?.user.role === "IMPORTER"
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

  let totalPaid = 0;
  let pending = 0;
  let platformFees = 0;

  for (const payment of payments) {
    platformFees += payment.platformFeeUsd;
    if (payment.status === "COMPLETED") {
      totalPaid += payment.amountUsd;
    }
    if (["PENDING", "PROCESSING"].includes(payment.status)) {
      pending += payment.amountUsd;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Payments"
        description="Monitor settled, pending, and gateway-tracked mobile-money payments with TZS-first reporting."
        badge={<Badge tone="success">Mobile Money Ready</Badge>}
      />

      {session?.user.role === "IMPORTER" ? (
        <MpesaPaymentPanel orders={unpaidOrders} />
      ) : (
        <SectionCard
          title="M-Pesa Checkout"
          description="Checkout initiation is currently available to importer accounts with payable orders."
          action={<Badge tone="warning">Importer only</Badge>}
        >
          <EmptyState
            icon="💳"
            title="Payment initiation unavailable for this account"
            description="Switch to an importer account to start a Snippe-hosted M-Pesa payment for an order balance."
          />
        </SectionCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Paid" value={formatTzsFromUsd(totalPaid)} tone="success" delta="Successfully settled" />
            <StatCard label="Pending" value={formatTzsFromUsd(pending)} tone="warning" delta="Awaiting completion" />
            <StatCard label="Platform Fees" value={formatTzsFromUsd(platformFees)} tone="default" delta="1.5% transaction fee" />
          </div>

          <SectionCard title="Payment History" description="Recent payment records including gateway references and final receipts.">
            {payments.length ? (
              <ResponsiveTable>
                <table className="min-w-[760px] w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b last:border-b-0 hover:bg-gray-50/70">
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.method}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatTzsFromUsd(payment.amountUsd)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <Badge tone={paymentToneMap[payment.status] ?? "default"}>{payment.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.mpesaReceiptNo ?? payment.transactionRef ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            ) : (
              <EmptyState icon="💳" title="No payments recorded yet" description="Payment history will appear here once orders begin settling." />
            )}
          </SectionCard>
        </div>

        <SectionCard title="Payment Methods" description="Available collection channels configured for the current marketplace setup.">
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;

              return (
                <div
                  key={method.name}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
                >
                  <span className="inline-flex items-center gap-3 font-medium text-gray-700">
                    <span className="rounded-2xl bg-emerald-50 p-2 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    {method.name}
                  </span>
                  <Badge tone="success">Available</Badge>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-gray-400">
            1.5% transaction fee applies. Mobile money and gateway integrations still require production credentials.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
