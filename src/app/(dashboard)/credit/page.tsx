import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTzsFromUsd } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, ResponsiveTable, SectionCard, StatCard } from "@/components/dashboard-ui";

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
      order: { select: { orderNumber: true } },
      lender: { select: { businessName: true } },
      borrower: { select: { businessName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let totalOutstanding = 0;
  let totalRepaid = 0;
  let overdueAmount = 0;
  let activeCount = 0;

  for (const creditLine of creditLines) {
    totalRepaid += creditLine.paidAmount;
    const outstanding = creditLine.amountUsd - creditLine.paidAmount;
    if (["ACTIVE", "APPROVED", "REQUESTED", "OVERDUE"].includes(creditLine.status)) {
      totalOutstanding += outstanding;
      activeCount += 1;
    }
    if (creditLine.status === "OVERDUE") {
      overdueAmount += outstanding;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Credit Management"
        description={session?.user.role === "IMPORTER" ? "Track outstanding balances, repayments, and overdue exposure for supplier credit in Tanzanian shillings." : session?.user.role === "SUPPLIER" ? "Track lending exposure, repayments, and overdue buyer balances in Tanzanian shillings." : "Monitor marketplace-wide credit exposure, repayments, and overdue balances in Tanzanian shillings."}
        badge={<Badge tone="warning">Credit Monitoring</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Credit Lines" value={String(activeCount)} delta="Currently open relationships" />
        <StatCard label="Total Outstanding" value={formatTzsFromUsd(totalOutstanding)} tone="warning" delta="Still to be recovered" />
        <StatCard label="Total Repaid" value={formatTzsFromUsd(totalRepaid)} tone="success" delta="Settled to date" />
        <StatCard label="Overdue" value={formatTzsFromUsd(overdueAmount)} tone="danger" delta="Requires immediate attention" />
      </div>

      <SectionCard title="Credit Lines" description="Outstanding, repaid, due-date, and status visibility for each order-backed credit record." action={<Badge tone="info">Displayed in TZS</Badge>}>
        <ResponsiveTable>
        <table className="min-w-[820px] w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Counterparty</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Paid</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Due Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {creditLines.length ? (
              creditLines.map((creditLine: (typeof creditLines)[number]) => (
                <tr key={creditLine.id} className="border-b last:border-b-0 hover:bg-gray-50/70">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{creditLine.order.orderNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {session?.user.role === "SUPPLIER" ? creditLine.borrower.businessName : creditLine.lender.businessName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatTzsFromUsd(creditLine.amountUsd)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatTzsFromUsd(creditLine.paidAmount)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {creditLine.dueDate ? new Date(creditLine.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600"><Badge tone={creditLine.status === "OVERDUE" ? "danger" : ["ACTIVE", "APPROVED"].includes(creditLine.status) ? "success" : "warning"}>{creditLine.status}</Badge></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}><EmptyState icon="🏦" title="No credit lines" description={session?.user.role === "IMPORTER" ? "Credit becomes available when you place orders with qualifying suppliers offering financing terms." : session?.user.role === "SUPPLIER" ? "Credit lines will appear here once you extend financing to importer orders." : "Platform credit records will appear here once financing activity begins."} /></td>
              </tr>
            )}
          </tbody>
        </table>
        </ResponsiveTable>
      </SectionCard>
    </div>
  );
}
