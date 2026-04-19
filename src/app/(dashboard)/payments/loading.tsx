import { LoadingCard, SectionCard } from "@/components/dashboard-ui";

export default function PaymentsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <LoadingCard label="Loading payments" />
      <LoadingCard label="Preparing checkout" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <LoadingCard label="Total paid" />
            <LoadingCard label="Pending" />
            <LoadingCard label="Platform fees" />
          </div>
          <SectionCard title="Payment History" description="Loading recent payment activity.">
            <div className="space-y-3">
              <LoadingCard label="Payment row" />
              <LoadingCard label="Payment row" />
            </div>
          </SectionCard>
        </div>
        <LoadingCard label="Payment methods" />
      </div>
    </div>
  );
}
