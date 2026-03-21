import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTzsFromUsd } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, ResponsiveTable, SectionCard, StatCard } from "@/components/dashboard-ui";

const dashboardQuickActions: Record<UserRole, Array<{ label: string; href: string; icon: string }>> = {
  IMPORTER: [
    { label: "New Order", href: "/orders?new=1", icon: "Create" },
    { label: "Browse Suppliers", href: "/suppliers", icon: "Find" },
    { label: "Make Payment", href: "/payments", icon: "Pay" },
    { label: "View Credit", href: "/credit", icon: "Credit" },
  ],
  SUPPLIER: [
    { label: "Add Product", href: "/products", icon: "Catalog" },
    { label: "Review Orders", href: "/orders", icon: "Fulfill" },
    { label: "Track Payments", href: "/payments", icon: "Reconcile" },
    { label: "Monitor Credit", href: "/credit", icon: "Finance" },
  ],
  ADMIN: [
    { label: "Review Orders", href: "/orders", icon: "Ops" },
    { label: "Inspect Products", href: "/products", icon: "Catalog" },
    { label: "Review Suppliers", href: "/suppliers", icon: "Network" },
    { label: "Audit Payments", href: "/payments", icon: "Audit" },
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

  const [orders, payments, creditLines] = await Promise.all([
    db.order.findMany({
      where: orderWhere,
      include: {
        supplier: { select: { businessName: true } },
        importer: { select: { businessName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.payment.findMany({
      where: paymentWhere,
      orderBy: { createdAt: "desc" },
    }),
    db.creditLine.findMany({
      where: creditWhere,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let totalRevenue = 0;
  let activeOrders = 0;
  let completedOrders = 0;

  for (const currentOrder of orders) {
    totalRevenue += currentOrder.totalUsd;
    if (!["COMPLETED", "CANCELLED"].includes(currentOrder.status)) {
      activeOrders += 1;
    }
    if (currentOrder.status === "COMPLETED") {
      completedOrders += 1;
    }
  }

  let pendingPayments = 0;
  for (const currentPayment of payments) {
    if (["PENDING", "PROCESSING"].includes(currentPayment.status)) {
      pendingPayments += currentPayment.amountUsd;
    }
  }

  let activeCredit = 0;
  for (const currentCreditLine of creditLines) {
    if (["ACTIVE", "APPROVED", "REQUESTED", "OVERDUE"].includes(currentCreditLine.status)) {
      activeCredit += currentCreditLine.amountUsd - currentCreditLine.paidAmount;
    }
  }

  const stats = [
    { label: "Total Orders", value: String(orders.length), delta: "Across your visible workspace", tone: "default" as const },
    { label: "Active Orders", value: String(activeOrders), delta: "Needs follow-up or delivery", tone: "warning" as const },
    { label: "Revenue (TZS)", value: formatTzsFromUsd(totalRevenue), delta: "TZS-first business view", tone: "success" as const },
    { label: "Pending Payments", value: formatTzsFromUsd(pendingPayments), delta: "Awaiting settlement", tone: "warning" as const },
    { label: "Active Credit", value: formatTzsFromUsd(activeCredit), delta: "Outstanding financing", tone: "default" as const },
    { label: "Completed", value: String(completedOrders), delta: "Orders finished successfully", tone: "info" as const },
  ];

  const activityFeed =
    role === "IMPORTER"
      ? [
          `${orders.length} recent orders are visible in your buyer workspace`,
          `${payments.length} payment records are available for settlement review`,
          `${creditLines.length} credit records are currently tied to your borrowing activity`,
        ]
      : role === "SUPPLIER"
        ? [
            `${orders.length} recent incoming orders are visible in your supplier workspace`,
            `${payments.length} payment records are available for receivables tracking`,
            `${creditLines.length} credit records are currently tied to your lending activity`,
          ]
        : [
            `${orders.length} recent platform orders are visible in the admin workspace`,
            `${payments.length} payment records are available for operational review`,
            `${creditLines.length} credit records are currently being monitored across the marketplace`,
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
                className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="text-sm font-semibold uppercase tracking-wide text-emerald-600">{action.icon}</div>
                <div className="mt-2 font-medium text-gray-900">{action.label}</div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity" description="A quick pulse of current platform movement in your account.">
          <div className="space-y-3">
            {activityFeed.map((item) => (
              <div key={item} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                {item}
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
            {orders.length ? (
              orders.map((currentOrder: (typeof orders)[number]) => (
                <tr key={currentOrder.id} className="border-b last:border-b-0 hover:bg-gray-50/70">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{currentOrder.orderNumber}</td>
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
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(currentOrder.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}><EmptyState icon="📦" title="No orders yet" description={role === "IMPORTER" ? "Place your first order or browse suppliers to get started." : role === "SUPPLIER" ? "Orders from importers will appear here once your catalog starts receiving demand." : "Platform orders will appear here once marketplace activity begins."} /></td>
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
