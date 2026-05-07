import { SkeletonCard } from "@/components/dashboard-ui";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="h-36 animate-pulse rounded-[2rem] bg-gray-200/70" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="h-64 animate-pulse rounded-[1.75rem] bg-gray-100" />
    </div>
  );
}
