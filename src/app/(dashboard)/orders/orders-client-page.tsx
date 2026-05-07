"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Boxes, Clock3, Download, PackageCheck, Truck } from "lucide-react";
import { exportToCsv } from "@/lib/csv";
import { formatTzsFromUsd } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, ResponsiveTable, SectionCard, TabsRow } from "@/components/dashboard-ui";
import { NewOrderPanel } from "./new-order-panel";

type OrdersClientPageProps = {
  role: "IMPORTER" | "SUPPLIER" | "ADMIN";
  userName?: string | null;
  initialStatusFilter: string;
  initialOrders: Array<{
    id: string;
    orderNumber: string;
    totalUsd: number;
    status: string;
    source: string;
    createdAt: Date | string;
    items: Array<unknown>;
    supplier: { businessName: string };
    importer: { businessName: string };
    optimisticState?: "pending" | "failed";
    optimisticMessage?: string;
  }>;
  suppliers: Array<{
    id: string;
    businessName: string;
    location: string | null;
    products: Array<{
      id: string;
      name: string;
      category: string;
      unit: string;
      moq: number;
      priceTzs: number;
      inStock: boolean;
      imageUrls: string[];
      description: string | null;
    }>;
  }>;
  orderStatuses: readonly string[];
};

const statusToneMap: Record<string, "warning" | "success" | "danger" | "info" | "default"> = {
  SUBMITTED: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "warning",
  IN_CUSTOMS: "warning",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export function OrdersClientPage({
  role,
  userName,
  initialStatusFilter,
  initialOrders,
  suppliers,
  orderStatuses,
}: OrdersClientPageProps) {
  const [orders, setOrders] = useState(initialOrders);
  const statusFilter = initialStatusFilter;

  const filteredOrders = useMemo(
    () => (statusFilter === "ALL" ? orders : orders.filter((order) => order.status === statusFilter)),
    [orders, statusFilter],
  );

  const orderTabs = [
    { label: `All Orders (${orders.length})`, active: statusFilter === "ALL", href: "/orders" },
    ...orderStatuses.map((status) => ({
      label: `${status} (${orders.filter((order) => order.status === status).length})`,
      active: statusFilter === status,
      href: `/orders?status=${status}`,
    })),
  ];

  const totalVisibleValue = filteredOrders.reduce((sum, order) => sum + order.totalUsd, 0);
  const activeVisibleOrders = filteredOrders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status)).length;

  function handleExportCsv() {
    exportToCsv("orders", filteredOrders.map((o) => ({
      "Order #": o.orderNumber,
      Counterparty: role === "SUPPLIER" ? o.importer.businessName : o.supplier.businessName,
      Items: o.items.length,
      "Total (TZS)": Math.round(o.totalUsd * 2600),
      Status: o.status,
      Source: o.source,
      Date: new Date(o.createdAt).toLocaleDateString(),
    })));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Orders"
        description={
          role === "IMPORTER"
            ? "Track order progress, review TZS totals, and manage new web-based order submissions."
            : role === "SUPPLIER"
              ? "Track incoming buyer orders, review fulfillment progress, and monitor TZS totals."
              : "Review marketplace-wide order activity, counterparties, and fulfillment progress in one place."
        }
        badge={<Badge tone="info">TZS-first</Badge>}
        action={
          role === "IMPORTER" ? (
            <Link
              href="/orders?new=1"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-medium transition hover:bg-emerald-700"
            >
              + New Order
            </Link>
          ) : null
        }
      />

      {role === "IMPORTER" ? (
        <NewOrderPanel
          suppliers={suppliers}
          onOptimisticOrderCreated={(order) => {
            setOrders((current) => [{ ...order, optimisticState: "pending" }, ...current]);
          }}
          onOptimisticOrderCommitted={(tempId, order) => {
            setOrders((current) =>
              current.map((entry) =>
                entry.id === tempId ? { ...order, optimisticState: undefined, optimisticMessage: undefined } : entry,
              ),
            );
          }}
          onOptimisticOrderFailed={(tempId, message) => {
            setOrders((current) => current.filter((entry) => entry.id !== tempId));
            setOrders((current) => [
              {
                id: `${tempId}-failed`,
                orderNumber: "Order not saved",
                totalUsd: 0,
                status: "CANCELLED",
                source: "WEB",
                createdAt: new Date().toISOString(),
                items: [],
                supplier: { businessName: "Submission failed" },
                importer: { businessName: userName ?? "Your business" },
                optimisticState: "failed",
                optimisticMessage: message,
              },
              ...current,
            ]);
          }}
          importerBusinessName={userName ?? "Your business"}
        />
      ) : null}

      <TabsRow tabs={orderTabs} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card rounded-[1.6rem] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">Visible orders</div>
              <div className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.05em] text-slate-950">
                {filteredOrders.length}
              </div>
            </div>
          </div>
        </div>
        <div className="surface-card rounded-[1.6rem] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">Still moving</div>
              <div className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.05em] text-slate-950">
                {activeVisibleOrders}
              </div>
            </div>
          </div>
        </div>
        <div className="surface-card rounded-[1.6rem] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">Visible value</div>
              <div className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.05em] text-slate-950">
                {formatTzsFromUsd(totalVisibleValue)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionCard
        title="Order History"
        description={
          statusFilter === "ALL"
            ? "Recent order activity with source, counterparty, item count, and status."
            : `Showing ${statusFilter.toLowerCase().replaceAll("_", " ")} orders only.`
        }
        action={
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        }
      >
        <ResponsiveTable>
          <table className="min-w-[860px] w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Order #</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Counterparty</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Source</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={`border-b last:border-b-0 hover:bg-gray-50/70 ${order.optimisticState === "pending" ? "bg-amber-50/50 opacity-80" : ""} ${order.optimisticState === "failed" ? "bg-rose-50/70" : ""}`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <Link href={`/orders/${order.id}`} className="text-emerald-700 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{role === "SUPPLIER" ? order.importer.businessName : order.supplier.businessName}</div>
                      {order.optimisticMessage ? <div className="mt-1 text-xs text-rose-600">{order.optimisticMessage}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.items.length}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatTzsFromUsd(order.totalUsd)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={statusToneMap[order.status] ?? "default"}>{order.status}</Badge>
                        {order.optimisticState === "pending" ? <Badge tone="warning">Syncing</Badge> : null}
                        {order.optimisticState === "failed" ? <Badge tone="danger">Rolled Back</Badge> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        {order.source === "WEB" ? <ArrowUpRight className="h-4 w-4 text-sky-600" /> : <Truck className="h-4 w-4 text-emerald-600" />}
                        {order.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon="📦"
                      title={statusFilter === "ALL" ? "No orders yet" : `No ${statusFilter.toLowerCase().replaceAll("_", " ")} orders`}
                      description={
                        statusFilter === "ALL"
                          ? role === "IMPORTER"
                            ? "Place your first order or browse suppliers to get started."
                            : role === "SUPPLIER"
                              ? "Incoming customer orders will appear here once importers begin ordering from your catalog."
                              : "Marketplace orders will appear here once trading activity begins."
                          : "Try a different order state to inspect more activity."
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      </SectionCard>
    </div>
  );
}
