import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTzsFromUsd } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, ResponsiveTable, SectionCard, TabsRow } from "@/components/dashboard-ui";
import { NewOrderPanel } from "./new-order-panel";

const ORDER_STATUSES = ["SUBMITTED", "CONFIRMED", "PROCESSING", "SHIPPED", "IN_CUSTOMS", "DELIVERED", "COMPLETED"];

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

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
            },
          },
        },
        orderBy: { businessName: "asc" },
      })
    : [];

  const orderTabs = [
    { label: `All Orders (${orders.length})`, active: true },
    ...ORDER_STATUSES.map((status) => ({
      label: `${status} (${orders.filter((order: (typeof orders)[number]) => order.status === status).length})`,
      active: false,
    })),
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Orders"
        description="Track order progress, review TZS totals, and manage new web-based order submissions."
        badge={<Badge tone="info">TZS-first</Badge>}
        action={
          <Link
            href="/orders?new=1"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-medium transition hover:bg-emerald-700"
          >
            + New Order
          </Link>
        }
      />

      {session?.user.role === "IMPORTER" ? <NewOrderPanel suppliers={suppliers} /> : null}

      <TabsRow tabs={orderTabs} />

      <SectionCard title="Order History" description="Recent order activity with source, counterparty, item count, and status.">
        <ResponsiveTable>
        <table className="min-w-[860px] w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order #</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Counterparty</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Items</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Source</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length ? (
              orders.map((order: (typeof orders)[number]) => (
                <tr key={order.id} className="border-b last:border-b-0 hover:bg-gray-50/70">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {session?.user.role === "SUPPLIER" ? order.importer.businessName : order.supplier.businessName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{order.items.length}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatTzsFromUsd(order.totalUsd)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600"><Badge tone={order.status === "COMPLETED" ? "success" : order.status === "CANCELLED" ? "danger" : "warning"}>{order.status}</Badge></td>
                  <td className="py-3 px-4 text-sm text-gray-600">{order.source}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}><EmptyState icon="📦" title="No orders yet" description="Place your first order or browse suppliers to get started." /></td>
              </tr>
            )}
          </tbody>
        </table>
        </ResponsiveTable>
      </SectionCard>
    </div>
  );
}
