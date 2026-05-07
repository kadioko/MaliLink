"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/dashboard-ui";

const STATUS_TRANSITIONS: Record<string, { next: string; label: string; tone: "success" | "warning" | "info" }> = {
  SUBMITTED:  { next: "CONFIRMED",   label: "Confirm Order",     tone: "success" },
  CONFIRMED:  { next: "PROCESSING",  label: "Mark Processing",   tone: "info"    },
  PROCESSING: { next: "SHIPPED",     label: "Mark Shipped",      tone: "info"    },
  SHIPPED:    { next: "IN_CUSTOMS",  label: "Mark In Customs",   tone: "warning" },
  IN_CUSTOMS: { next: "DELIVERED",   label: "Mark Delivered",    tone: "success" },
  DELIVERED:  { next: "COMPLETED",   label: "Complete Order",    tone: "success" },
};

const CANCEL_ALLOWED = ["SUBMITTED", "CONFIRMED", "PROCESSING"];

type OrderActionsProps = {
  orderId: string;
  currentStatus: string;
  role: "IMPORTER" | "SUPPLIER" | "ADMIN";
};

export function OrderActions({ orderId, currentStatus, role }: OrderActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transition = STATUS_TRANSITIONS[currentStatus];
  const canAdvance = (role === "SUPPLIER" || role === "ADMIN") && !!transition;
  const canCancel = (role === "SUPPLIER" || role === "ADMIN") && CANCEL_ALLOWED.includes(currentStatus);

  async function updateStatus(newStatus: string) {
    setIsLoading(newStatus);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Status update failed.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setIsLoading(null);
    }
  }

  if (!canAdvance && !canCancel) return null;

  return (
    <div className="space-y-3">
      {canAdvance && transition ? (
        <button
          onClick={() => updateStatus(transition.next)}
          disabled={!!isLoading}
          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${
            transition.tone === "success"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : transition.tone === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-sky-600 hover:bg-sky-700"
          }`}
        >
          <span>{transition.label}</span>
          {isLoading === transition.next ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ) : null}

      {canCancel ? (
        <button
          onClick={() => updateStatus("CANCELLED")}
          disabled={!!isLoading}
          className="flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
        >
          <span>Cancel Order</span>
          {isLoading === "CANCELLED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
