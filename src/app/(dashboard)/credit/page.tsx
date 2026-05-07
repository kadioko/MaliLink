import Link from "next/link";
import { getServerSession } from "next-auth";
import { AlertTriangle, Clock } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTzsFromUsd } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, ResponsiveTable, SectionCard, StatCard } from "@/components/dashboard-ui";

function RepaymentBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  return (
    <div className="min-w-[120px]">
      <div className="mb-1 flex justify-between text-xs text-gray-500">
        <span>{pct}% repaid</span>
        <span>{formatTzsFromUsd(paid)} / {formatTzsFromUsd(total)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : pct > 60 ? "bg-sky-500" : pct > 30 ? "bg-amber-500" : "bg-rose-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function OverduePill({ dueDate }: { dueDate: Date | null }) {
  if (!dueDate) return <span className="text-sm text-gray-400">—</span>;
  const now = new Date();
  const due = new Date(dueDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil((due.getTime() - now.getTime()) / msPerDay);
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
        <AlertTriangle className="h-3 w-3" />
        {Math.abs(diff)}d overdue
      </span>
    );
  }
  if (diff <= 7) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <Clock className="h-3 w-3" />
        Due in {diff}d
      </span>
    );
  }
  return <span className="text-sm text-gray-600">{due.toLocaleDateString()}</span>;
}

export default async function CreditPage() {
  const session = await getServerSession(authOptions);

  const where =
    session?.user.role === "SUPPLIER"
      ? { lenderId: session.user.id }
      : session?.user.role === "IMPORTER"
        ? { borrowerId: session.user.id }
        : {};

  const creditLines = await db.creditLine.findMany({
    where,
    include: {
      order: { select: { orderNumber: true, id: true } },
      lender: { select: { businessName: true } },
      borrower: { select: { businessName: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  let totalOutstanding = 0;
  let totalRepaid = 0;
  let overdueAmount = 0;
  let activeCount = 0;
  let overdueCount = 0;

  for (const cl of creditLines) {
    totalRepaid += cl.paidAmount;
    const outstanding = cl.amountUsd - cl.paidAmount;
    if (["ACTIVE", "APPROVED", "REQUESTED", "OVERDUE"].includes(cl.status)) {
      totalOutstanding += outstanding;
      activeCount += 1;
    }
    if (cl.status === "OVERDUE") {
      overdueAmount += outstanding;
      overdueCount += 1;
    }
  }

  const role = session?.user.role;

  const emptyDescription =
    role === "IMPORTER"
      ? "Credit becomes available when you place orders with qualifying suppliers offering financing terms."
      : role === "SUPPLIER"
        ? "Credit lines will appear here once you extend financing to importer orders."
        : "Platform credit records will appear here once financing activity begins.";

  const emptyAction =
    role === "IMPORTER" ? (
      <Link
        href="/suppliers"
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Browse Suppliers
      </Link>
    ) : role === "SUPPLIER" ? (
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Review Orders
      </Link>
    ) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Credit Management"
        description={
          role === "IMPORTER"
            ? "Track outstanding balances, repayments, and overdue exposure for supplier credit in Tanzanian shillings."
            : role === "SUPPLIER"
              ? "Track lending exposure, repayments, and overdue buyer balances in Tanzanian shillings."
              : "Monitor marketplace-wide credit exposure, repayments, and overdue balances in Tanzanian shillings."
        }
        badge={
          overdueCount > 0 ? (
            <Badge tone="danger">{overdueCount} overdue</Badge>
          ) : (
            <Badge tone="warning">Credit Monitoring</Badge>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Credit Lines" value={String(activeCount)} delta="Currently open relationships" />
        <StatCard label="Total Outstanding" value={formatTzsFromUsd(totalOutstanding)} tone="warning" delta="Still to be recovered" />
        <StatCard label="Total Repaid" value={formatTzsFromUsd(totalRepaid)} tone="success" delta="Settled to date" />
        <StatCard label="Overdue" value={formatTzsFromUsd(overdueAmount)} tone="danger" delta={overdueCount > 0 ? `${overdueCount} line${overdueCount > 1 ? "s" : ""} need attention` : "All lines on track"} />
      </div>

      <SectionCard
        title="Credit Lines"
        description="Repayment progress, due dates, and status for each order-backed credit record."
        action={<Badge tone="info">Displayed in TZS</Badge>}
      >
        {creditLines.length ? (
          <ResponsiveTable>
            <table className="min-w-[860px] w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Counterparty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Repayment Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {creditLines.map((cl) => {
                  const isOverdue = cl.status === "OVERDUE";
                  return (
                    <tr
                      key={cl.id}
                      className={`border-b last:border-b-0 transition hover:bg-gray-50/60 ${isOverdue ? "bg-rose-50/30" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <Link href={`/orders/${cl.order.id}`} className="text-sm font-semibold text-emerald-700 hover:underline">
                          {cl.order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {role === "SUPPLIER" ? cl.borrower.businessName : cl.lender.businessName}
                      </td>
                      <td className="px-4 py-4">
                        <RepaymentBar paid={cl.paidAmount} total={cl.amountUsd} />
                      </td>
                      <td className="px-4 py-4">
                        <OverduePill dueDate={cl.dueDate} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            tone={
                              cl.status === "OVERDUE"
                                ? "danger"
                                : cl.status === "PAID"
                                  ? "success"
                                  : ["ACTIVE", "APPROVED"].includes(cl.status)
                                    ? "info"
                                    : "warning"
                            }
                          >
                            {cl.status}
                          </Badge>
                          {isOverdue && (
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ResponsiveTable>
        ) : (
          <EmptyState
            icon="🏦"
            title="No credit lines"
            description={emptyDescription}
            action={emptyAction}
          />
        )}
      </SectionCard>
    </div>
  );
}
