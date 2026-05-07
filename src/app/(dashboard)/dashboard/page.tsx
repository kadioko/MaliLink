import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import {
  CreditCard,
  Package,
  Plus,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTzsFromUsd } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, ResponsiveTable, SectionCard, StatCard } from "@/components/dashboard-ui";

const dashboardQuickActions: Record<
  UserRole,
  Array<{ label: string; href: string; icon: typeof Plus; description: string }>
> = {
  IMPORTER: [
    { label: "New Order",        href: "/orders?new=1", icon: Plus,       description: "Place a new trade order" },
    { label: "Browse Suppliers", href: "/suppliers",    icon: Store,      description: "Find verified suppliers" },
    { label: "Make Payment",     href: "/payments",     icon: CreditCard, description: "Settle outstanding orders" },
    { label: "View Credit",      href: "/credit",       icon: Wallet,     description: "Track your credit lines" },
  ],
  SUPPLIER: [
    { label: "Add Product",     href: "/products",  icon: Package,    description: "Expand your catalog" },
    { label: "Review Orders",   href: "/orders",    icon: Truck,      description: "Fulfil incoming orders" },
    { label: "Track Payments",  href: "/payments",  icon: CreditCard, description: "Monitor receivables" },
    { label: "Monitor Credit",  href: "/credit",    icon: Wallet,     description: "Review lending exposure" },
  ],
  ADMIN: [
    { label: "Review Orders",    href: "/orders",        icon: Truck,       description: "Platform order activity" },
    { label: "Inspect Products", href: "/products",      icon: Package,     description: "Catalog audit" },
    { label: "Review Suppliers", href: "/suppliers",     icon: Store,       description: "Marketplace listings" },
    { label: "Manage Users",     href: "/admin/users",   icon: ShieldCheck, description: "Accounts and KYC" },
  ],
};

const dashboardHeaderActions: Record<UserRole, { label: string; href: string }> = {
  IMPORTER: { label: "+ New Order", href: "/orders?new=1" },
  SUPPLIER: { label: "+ Add Product", href: "/products" },
  ADMIN: { label: "View Platform Orders", href: "/orders" },
};

const dashboardDescriptions: Record<UserRole, string> = {
  IMPORTER: "Your financial overview is shown in Tanzanian shillings with role-aware activity highlights for buying, payment, and credit.",
  SUPPLIER: "Your supplier workspace highlights catalog performance, incoming orders, receivables, and credit exposure in Tanzanian shillings.",
  ADMIN: "Your platform-wide operations workspace highlights cross-market order, payment, and credit activity in Tanzanian shillings.",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const role = session.user.role;

  const orderWhere =
    role === "SUPPLIER"
      ? { supplierId: session.user.id }
      : role === "IMPORTER"
        ? { importerId: session.user.id }
        : {};

  const paymentWhere = role === "ADMIN" ? {} : { userId: session.user.id };

  const creditWhere =
    role === "SUPPLIER"
      ? { lenderId: session.user.id }
      : role === "IMPORTER"
        ? { borrowerId: session.user.id }
        : {};

  const quickActions = dashboardQuickActions[role];
  const headerAction = dashboardHeaderActions[role];

  const [recentOrders, allOrderCounts, payments, creditLines, unreadNotifications] = await Promise.all([
    db.order.findMany({
      where: orderWhere,
      include: {
        supplier: { select: { id: true, businessName: true } },
        importer: { select: { id: true, businessName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.order.groupBy({
      by: ["status"],
      where: orderWhere,
      _count: { id: true },
      _sum: { totalUsd: true },
    }),
    db.payment.findMany({
      where: paymentWhere,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.creditLine.findMany({
      where: creditWhere,
      orderBy: { createdAt: "desc" },
    }),
    db.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
  ]);

  const totalOrderCount = allOrderCounts.reduce((s, g) => s + g._count.id, 0);
  const totalRevenue    = allOrderCounts.reduce((s, g) => s + (g._sum.totalUsd ?? 0), 0);
  const activeOrders    = allOrderCounts.filter((g) => !["COMPLETED", "CANCELLED"].includes(g.status)).reduce((s, g) => s + g._count.id, 0);
  const completedOrders = allOrderCounts.find((g) => g.status === "COMPLETED")?._count.id ?? 0;

  let pendingPayments = 0;
  for (const p of payments) {
    if (["PENDING", "PROCESSING"].includes(p.status)) pendingPayments += p.amountUsd;
  }

  let activeCredit = 0;
  for (const cl of creditLines) {
    if (["ACTIVE", "APPROVED", "REQUESTED", "OVERDUE"].includes(cl.status)) {
      activeCredit += cl.amountUsd - cl.paidAmount;
    }
  }

  const stats = [
    { label: "Total Orders",     value: String(totalOrderCount),          delta: "All-time order count",         tone: "default"  as const },
    { label: "Active Orders",    value: String(activeOrders),             delta: "In-progress orders",           tone: "warning"  as const },
    { label: "Revenue (TZS)",    value: formatTzsFromUsd(totalRevenue),   delta: "Cumulative order value",       tone: "success"  as const },
    { label: "Pending Payments", value: formatTzsFromUsd(pendingPayments),delta: "Awaiting settlement",         tone: "warning"  as const },
    { label: "Active Credit",    value: formatTzsFromUsd(activeCredit),   delta: "Outstanding financing",        tone: "default"  as const },
    { label: "Completed",        value: String(completedOrders),          delta: "Successfully fulfilled",       tone: "info"     as const },
  ];

  const activityFeed: Array<{ label: string; value: string; tone: "success" | "warning" | "info" | "default" }> = [
    { label: "Total orders",       value: String(totalOrderCount),              tone: "default"  },
    { label: "Active orders",      value: String(activeOrders),                 tone: activeOrders > 0 ? "warning" : "success" },
    { label: "Completed orders",   value: String(completedOrders),              tone: "success"  },
    { label: "Pending payments",   value: formatTzsFromUsd(pendingPayments),    tone: pendingPayments > 0 ? "warning" : "success" },
    { label: "Active credit",      value: formatTzsFromUsd(activeCredit),       tone: activeCredit > 0 ? "info" : "default" },
    { label: "Unread notifications", value: String(unreadNotifications),        tone: unreadNotifications > 0 ? "warning" : "default" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session?.user.name}. ${dashboardDescriptions[role]}`}
        badge={<Badge tone="success">{role}</Badge>}
        action={
          <Link
            href={headerAction.href}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            {headerAction.label}
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} delta={stat.delta} tone={stat.tone} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <SectionCard title="Quick Actions" description="Recommended next steps based on your current role and responsibilities.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{action.label}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{action.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Live Pulse" description="Real-time snapshot of your account activity.">
          <div className="space-y-2">
            {activityFeed.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className={`text-sm font-semibold ${
                  item.tone === "success" ? "text-emerald-700" :
                  item.tone === "warning" ? "text-amber-700" :
                  item.tone === "info"    ? "text-sky-700" :
                  "text-gray-900"
                }`}>{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent Orders"
        description="Latest visible orders with TZS totals, source, and current status."
        action={<Badge tone="info">Displayed in TZS</Badge>}
      >
        <ResponsiveTable>
        <table className="min-w-[760px] w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order #</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Counterparty</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Source</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length ? (
              recentOrders.map((currentOrder) => (
                <tr key={currentOrder.id} className="cursor-pointer border-b last:border-b-0 hover:bg-emerald-50/40" onClick={() => { window.location.href = `/orders/${currentOrder.id}`; }}>
                  <td className="py-3 px-4 text-sm font-semibold text-emerald-700">{currentOrder.orderNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {role === "SUPPLIER"
                      ? currentOrder.importer.businessName
                      : role === "IMPORTER"
                        ? currentOrder.supplier.businessName
                        : `${currentOrder.importer.businessName} → ${currentOrder.supplier.businessName}`}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600"><Badge tone={currentOrder.status === "COMPLETED" ? "success" : currentOrder.status === "CANCELLED" ? "danger" : "warning"}>{currentOrder.status}</Badge></td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatTzsFromUsd(currentOrder.totalUsd)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{currentOrder.source}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(currentOrder.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon="📦"
                    title="No orders yet"
                    description={role === "IMPORTER" ? "Place your first order or browse suppliers to get started." : role === "SUPPLIER" ? "Orders from importers will appear here once your catalog starts receiving demand." : "Platform orders will appear here once marketplace activity begins."}
                    action={
                      role === "IMPORTER" ? (
                        <Link href="/orders?new=1" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                          <Plus className="h-4 w-4" /> Place First Order
                        </Link>
                      ) : role === "SUPPLIER" ? (
                        <Link href="/products" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                          <Package className="h-4 w-4" /> Add Products
                        </Link>
                      ) : null
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </ResponsiveTable>
      </SectionCard>

      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold">Order via WhatsApp</h3>
            <p className="text-emerald-100 mt-1">
              Send &quot;Hi&quot; to your WhatsApp line to browse products, place orders, and follow updates.
            </p>
          </div>
          <div className="text-sm font-semibold uppercase tracking-wide bg-white/15 px-4 py-2 rounded-lg">
            WhatsApp Ready
          </div>
        </div>
      </div>
    </div>
  );
}
