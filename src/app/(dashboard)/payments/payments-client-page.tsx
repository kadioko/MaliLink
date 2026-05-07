"use client";

import { useState } from "react";
import { Building2, Download, Landmark, Smartphone, WalletCards } from "lucide-react";
import { exportToCsv } from "@/lib/csv";
import { formatTzsFromUsd } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, ResponsiveTable, SectionCard, StatCard } from "@/components/dashboard-ui";
import { MpesaPaymentPanel } from "./mpesa-payment-panel";

type PaymentRecord = {
  id: string;
  orderId?: string | null;
  amountUsd: number;
  amountTzs: number;
  platformFeeUsd: number;
  status: string;
  method: string;
  transactionRef: string | null;
  mpesaReceiptNo: string | null;
  createdAt: Date | string;
  optimisticState?: "pending" | "failed";
  optimisticMessage?: string;
};

type PayableOrder = {
  id: string;
  orderNumber: string;
  totalTzs: number;
  paidTzs: number;
  supplierName: string;
  status: string;
};

type PaymentsClientPageProps = {
  role: "IMPORTER" | "SUPPLIER" | "ADMIN";
  initialPayments: PaymentRecord[];
  initialUnpaidOrders: PayableOrder[];
};

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

export function PaymentsClientPage({ role, initialPayments, initialUnpaidOrders }: PaymentsClientPageProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [unpaidOrders, setUnpaidOrders] = useState(initialUnpaidOrders);

  let totalPaid = 0;
  let pending = 0;
  let platformFees = 0;

  for (const payment of payments) {
    platformFees += payment.platformFeeUsd;
    if (payment.status === "COMPLETED") totalPaid += payment.amountUsd;
    if (["PENDING", "PROCESSING"].includes(payment.status)) pending += payment.amountUsd;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Payments"
        description="Monitor settled, pending, and gateway-tracked mobile-money payments with TZS-first reporting."
        badge={<Badge tone="success">Mobile Money Ready</Badge>}
      />

      {role === "IMPORTER" ? (
        <MpesaPaymentPanel
          orders={unpaidOrders}
          onOptimisticPaymentStarted={(payment) => {
            setPayments((current) => [{ ...payment, optimisticState: "pending" }, ...current]);
            setUnpaidOrders((current) =>
              current
                .map((order) =>
                  order.id === payment.orderId
                    ? { ...order, paidTzs: Math.min(order.totalTzs, order.paidTzs + payment.amountTzs) }
                    : order,
                )
                .filter((order) => order.paidTzs < order.totalTzs),
            );
          }}
          onOptimisticPaymentFailed={(payment, message) => {
            setPayments((current) => [
              { ...payment, status: "FAILED", optimisticState: "failed", optimisticMessage: message },
              ...current.filter((entry) => entry.id !== payment.id),
            ]);
            setUnpaidOrders((current) => {
              const existing = current.find((order) => order.id === payment.orderId);
              if (existing) {
                return current.map((order) =>
                  order.id === payment.orderId ? { ...order, paidTzs: Math.max(0, order.paidTzs - payment.amountTzs) } : order,
                );
              }
              return current;
            });
          }}
          onOptimisticPaymentCompleted={(paymentId, updates) => {
            setPayments((current) =>
              current.map((payment) => (payment.id === paymentId ? { ...payment, ...updates, optimisticState: undefined, optimisticMessage: undefined } : payment)),
            );
          }}
        />
      ) : (
        <SectionCard title="M-Pesa Checkout" description="Checkout initiation is currently available to importer accounts with payable orders." action={<Badge tone="warning">Importer only</Badge>}>
          <EmptyState icon="💳" title="Payment initiation unavailable for this account" description="Switch to an importer account to start a Snippe-hosted M-Pesa payment for an order balance." />
        </SectionCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Paid" value={formatTzsFromUsd(totalPaid)} tone="success" delta="Successfully settled" />
            <StatCard label="Pending" value={formatTzsFromUsd(pending)} tone="warning" delta="Awaiting completion" />
            <StatCard label="Platform Fees" value={formatTzsFromUsd(platformFees)} tone="default" delta="1.5% transaction fee" />
          </div>

          <SectionCard
            title="Payment History"
            description="Recent payment records including gateway references and final receipts."
            action={
              <button
                onClick={() => exportToCsv("payments", payments.map((p) => ({
                  Date: new Date(p.createdAt).toLocaleDateString(),
                  Method: p.method,
                  "Amount (TZS)": p.amountTzs,
                  Status: p.status,
                  Reference: p.mpesaReceiptNo ?? p.transactionRef ?? "",
                })))}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            }
          >
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
                      <tr key={payment.id} className={`border-b last:border-b-0 hover:bg-gray-50/70 ${payment.optimisticState === "pending" ? "bg-amber-50/50 opacity-80" : ""} ${payment.optimisticState === "failed" ? "bg-rose-50/70" : ""}`}>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.method}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatTzsFromUsd(payment.amountUsd)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-2">
                            <Badge tone={paymentToneMap[payment.status] ?? "default"}>{payment.status}</Badge>
                            {payment.optimisticState === "pending" ? <Badge tone="warning">Syncing</Badge> : null}
                            {payment.optimisticState === "failed" ? <Badge tone="danger">Rolled Back</Badge> : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>{payment.mpesaReceiptNo ?? payment.transactionRef ?? "-"}</div>
                          {payment.optimisticMessage ? <div className="mt-1 text-xs text-rose-600">{payment.optimisticMessage}</div> : null}
                        </td>
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
                <div key={method.name} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
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
          <p className="mt-4 text-xs text-gray-400">1.5% transaction fee applies. Mobile money and gateway integrations still require production credentials.</p>
        </SectionCard>
      </div>
    </div>
  );
}
