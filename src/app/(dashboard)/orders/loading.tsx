import { LoadingCard, SectionCard } from "@/components/dashboard-ui";

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <LoadingCard label="Loading orders" />
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingCard label="Visible orders" />
        <LoadingCard label="Still moving" />
        <LoadingCard label="Visible value" />
      </div>
      <SectionCard title="Order History" description="Loading recent order activity.">
        <div className="space-y-3">
          <LoadingCard label="History row" />
          <LoadingCard label="History row" />
          <LoadingCard label="History row" />
        </div>
      </SectionCard>
    </div>
  );
}
