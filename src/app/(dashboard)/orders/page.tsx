import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowUpRight, Boxes, Clock3, PackageCheck, Truck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTzsFromUsd } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, ResponsiveTable, SectionCard, TabsRow } from "@/components/dashboard-ui";
import { NewOrderPanel } from "./new-order-panel";

const ORDER_STATUSES = ["SUBMITTED", "CONFIRMED", "PROCESSING", "SHIPPED", "IN_CUSTOMS", "DELIVERED", "COMPLETED"] as const;

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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: { status?: string; new?: string };
}) {
  const session = await getServerSession(authOptions);
  const statusFilter = searchParams?.status && ORDER_STATUSES.includes(searchParams.status as (typeof ORDER_STATUSES)[number])
    ? searchParams.status
    : "ALL";

  const where =
    session?.user.role === "SUPPLIER"
      ? { supplierId: session.user.id }
      : session?.user.role === "IMPORTER"
        ? { importerId: session.user.id }
        : {};

  const orders = await db.order.findMany({
    where,
    include: {
      items: true,
      supplier: { select: { businessName: true } },
      importer: { select: { businessName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const suppliers = session?.user.role === "IMPORTER"
    ? await db.user.findMany({
        where: {
          role: "SUPPLIER",
          products: {
            some: { inStock: true },
          },
        },
        select: {
          id: true,
          businessName: true,
          location: true,
          products: {
            where: { inStock: true },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              category: true,
              unit: true,
              moq: true,
              priceTzs: true,
              inStock: true,
              imageUrls: true,
              description: true,
            },
          },
        },
        orderBy: { businessName: "asc" },
      })
    : [];

  const filteredOrders = statusFilter === "ALL"
    ? orders
    : orders.filter((order) => order.status === statusFilter);

  const orderTabs = [
    { label: `All Orders (${orders.length})`, active: statusFilter === "ALL", href: "/orders" },
    ...ORDER_STATUSES.map((status) => ({
      label: `${status} (${orders.filter((order) => order.status === status).length})`,
      active: statusFilter === status,
      href: `/orders?status=${status}`,
    })),
  ];

  const totalVisibleValue = filteredOrders.reduce((sum, order) => sum + order.totalUsd, 0);
  const activeVisibleOrders = filteredOrders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status)).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Orders"
        description={
          session?.user.role === "IMPORTER"
            ? "Track order progress, review TZS totals, and manage new web-based order submissions."
            : session?.user.role === "SUPPLIER"
              ? "Track incoming buyer orders, review fulfillment progress, and monitor TZS totals."
              : "Review marketplace-wide order activity, counterparties, and fulfillment progress in one place."
        }
        badge={<Badge tone="info">TZS-first</Badge>}
        action={
          session?.user.role === "IMPORTER" ? (
            <Link
              href="/orders?new=1"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-medium transition hover:bg-emerald-700"
            >
              + New Order
            </Link>
          ) : null
        }
      />

      {session?.user.role === "IMPORTER" ? <NewOrderPanel suppliers={suppliers} /> : null}

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
                  <tr key={order.id} className="border-b last:border-b-0 hover:bg-gray-50/70">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session?.user.role === "SUPPLIER" ? order.importer.businessName : order.supplier.businessName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.items.length}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatTzsFromUsd(order.totalUsd)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <Badge tone={statusToneMap[order.status] ?? "default"}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        {order.source === "WEB" ? (
                          <ArrowUpRight className="h-4 w-4 text-sky-600" />
                        ) : (
                          <Truck className="h-4 w-4 text-emerald-600" />
                        )}
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
                          ? session?.user.role === "IMPORTER"
                            ? "Place your first order or browse suppliers to get started."
                            : session?.user.role === "SUPPLIER"
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
