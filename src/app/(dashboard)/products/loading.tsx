import { LoadingCard } from "@/components/dashboard-ui";

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <LoadingCard label="Loading products" />
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingCard label="Visible products" />
        <LoadingCard label="In stock now" />
        <LoadingCard label="With media" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <LoadingCard label="Catalog card" />
        <LoadingCard label="Catalog card" />
        <LoadingCard label="Catalog card" />
        <LoadingCard label="Catalog card" />
      </div>
    </div>
  );
}
