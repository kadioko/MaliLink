"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock3, ReceiptText, SmartphoneCharging } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatTzs } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/dashboard-ui";

type PayableOrder = {
  id: string;
  orderNumber: string;
  totalTzs: number;
  paidTzs: number;
  supplierName: string;
  status: string;
};

type MpesaPaymentPanelProps = {
  orders: PayableOrder[];
};

type PaymentStatusResponse = {
  payment: {
    id: string;
    status: string;
    transactionRef: string | null;
    mpesaReceiptNo: string | null;
    paidAt: string | null;
    notes: string | null;
  };
};

const paymentToneMap: Record<string, "warning" | "success" | "danger" | "info" | "default"> = {
  PENDING: "warning",
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "danger",
};

export function MpesaPaymentPanel({ orders }: MpesaPaymentPanelProps) {
  const router = useRouter();
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [receiptRef, setReceiptRef] = useState<string | null>(null);
  const [paidAt, setPaidAt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const hasOrders = orders.length > 0;
  const outstandingAmount = selectedOrder ? Math.max(selectedOrder.totalTzs - selectedOrder.paidTzs, 0) : 0;

  useEffect(() => {
    if (!paymentId || !paymentStatus || !["PENDING", "PROCESSING"].includes(paymentStatus)) {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}`, { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as PaymentStatusResponse;
        setPaymentStatus(data.payment.status);
        setTransactionRef(data.payment.transactionRef);
        setReceiptRef(data.payment.mpesaReceiptNo);
        setPaidAt(data.payment.paidAt);

        if (data.payment.status === "COMPLETED") {
          setSuccess("Payment completed successfully. Your receipt/reference is available below.");
          startTransition(() => {
            router.refresh();
          });
        }

        if (data.payment.status === "FAILED") {
          setError("Payment failed. You can retry the M-Pesa checkout for this order.");
        }
      } catch {
        return;
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [paymentId, paymentStatus]);

  if (!hasOrders) {
    return (
      <div className="surface-card rounded-[1.85rem] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              M-Pesa Checkout
            </h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Start a Snippe-hosted M-Pesa payment for any unpaid order balance in TZS.
            </p>
          </div>
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">Snippe Connected</div>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50">
          <EmptyState
            icon="💳"
            title="No unpaid orders available"
            description="Create or confirm an order with an outstanding balance, then return here to start M-Pesa checkout."
          />
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setCheckoutUrl(null);
    setPaymentId(null);
    setPaymentStatus(null);
    setTransactionRef(null);
    setReceiptRef(null);
    setPaidAt(null);

    if (!selectedOrder) {
      setError("Select an unpaid order to initiate M-Pesa checkout.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/payments/snippe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder.id }),
      });

      const data = (await response.json()) as {
        error?: string | { message?: string }[];
        paymentId?: string;
        paymentStatus?: string;
        checkoutUrl?: string;
        reference?: string;
        shortCode?: string;
      };

      if (!response.ok) {
        const message = Array.isArray(data.error)
          ? data.error.map((entry) => entry.message).filter(Boolean).join(", ")
          : data.error || "Failed to start M-Pesa checkout.";
        throw new Error(message);
      }

      setSuccess(`M-Pesa request started for ${selectedOrder.orderNumber}. Complete the payment in the Snippe checkout while MaliLink tracks the status here.`);
      setPaymentId(data.paymentId ?? null);
      setPaymentStatus(data.paymentStatus ?? "PENDING");
      setTransactionRef(data.reference ?? null);
      setCheckoutUrl(data.checkoutUrl ?? null);
      startTransition(() => {
        router.refresh();
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to start M-Pesa checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="surface-card rounded-[1.85rem] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            M-Pesa Checkout
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Start a Snippe-hosted M-Pesa payment for any unpaid order balance in TZS.
          </p>
        </div>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">Snippe Connected</div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr,0.9fr]">
        <div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Select Order</span>
            <select
              value={selectedOrderId}
              onChange={(event) => {
                setSelectedOrderId(event.target.value);
                setError(null);
                setSuccess(null);
                setCheckoutUrl(null);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} - {order.supplierName}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 space-y-3">
            {orders.map((order) => {
              const remaining = Math.max(order.totalTzs - order.paidTzs, 0);
              const active = order.id === selectedOrderId;

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full rounded-[1.4rem] border p-4 text-left transition ${
                    active ? "border-emerald-300 bg-emerald-50/80" : "border-gray-200 bg-white hover:border-emerald-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{order.orderNumber}</div>
                      <div className="mt-1 text-sm text-gray-500">{order.supplierName}</div>
                    </div>
                    <Badge tone="default">{order.status}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Outstanding</div>
                      <div className="mt-1 font-semibold text-slate-950">{formatTzs(remaining)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Already paid</div>
                      <div className="mt-1 font-semibold text-slate-950">{formatTzs(order.paidTzs)}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-gray-200 bg-gray-50 p-4">
          <h3 className="font-[var(--font-display)] text-xl font-semibold text-slate-950">Checkout Summary</h3>
          {selectedOrder ? (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-gray-500">
                <span>Order</span>
                <span className="font-medium text-gray-900">{selectedOrder.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-gray-500">
                <span>Supplier</span>
                <span className="font-medium text-gray-900">{selectedOrder.supplierName}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-gray-500">
                <span>Outstanding</span>
                <span className="text-lg font-semibold text-gray-900">{formatTzs(outstandingAmount)}</span>
              </div>
              {paymentStatus ? (
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-gray-500">
                  <span>Payment status</span>
                  <Badge tone={paymentToneMap[paymentStatus] ?? "default"}>{paymentStatus}</Badge>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 text-sm text-gray-500">No unpaid orders available for checkout.</div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white px-3 py-3 text-center">
              <SmartphoneCharging className="mx-auto h-5 w-5 text-emerald-700" />
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">Request</div>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 text-center">
              <Clock3 className="mx-auto h-5 w-5 text-amber-700" />
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">Track</div>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 text-center">
              <ReceiptText className="mx-auto h-5 w-5 text-sky-700" />
              <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">Receipt</div>
            </div>
          </div>

          {error ? <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
          {success ? (
            <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          {transactionRef || receiptRef || paidAt ? (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm">
              <div className="flex items-center gap-2 font-medium text-gray-900">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                Payment tracking
              </div>
              <div className="mt-3 space-y-2 text-gray-600">
                {transactionRef ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>Snippe reference</span>
                    <span className="font-medium text-gray-900">{transactionRef}</span>
                  </div>
                ) : null}
                {receiptRef ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>M-Pesa receipt</span>
                    <span className="font-medium text-gray-900">{receiptRef}</span>
                  </div>
                ) : null}
                {paidAt ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>Paid at</span>
                    <span className="font-medium text-gray-900">{new Date(paidAt).toLocaleString()}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-black"
            >
              Open Snippe Checkout
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !selectedOrder || outstandingAmount <= 0}
            className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting ? "Starting checkout..." : "Pay with M-Pesa"}
          </button>
        </div>
      </div>
    </form>
  );
}
