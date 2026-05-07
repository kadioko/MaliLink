import { db } from "@/lib/db";
import { Badge, PageHeader, SectionCard, TabsRow } from "@/components/dashboard-ui";
import { SuppliersClient } from "./suppliers-client";

const LISTING_TIERS = [
  { tier: "FREE", label: "Free", tone: "default" as const },
  { tier: "BASIC", label: "Basic", tone: "info" as const },
  { tier: "PREMIUM", label: "Premium", tone: "warning" as const },
  { tier: "FEATURED", label: "Featured", tone: "success" as const },
];

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams?: { tier?: string };
}) {
  const suppliers = await db.supplierListing.findMany({
    where: { isActive: true },
    include: {
      supplier: {
        select: {
          businessName: true,
          name: true,
          location: true,
          kycStatus: true,
          _count: { select: { products: true } },
        },
      },
    },
    orderBy: [{ tier: "desc" }, { rating: "desc" }],
  });

  const activeTier = searchParams?.tier && LISTING_TIERS.some((tier) => tier.tier === searchParams.tier)
    ? searchParams.tier
    : "ALL";
  const visibleSuppliers = activeTier === "ALL"
    ? suppliers
    : suppliers.filter((listing) => listing.tier === activeTier);

  const tabs = [{ label: `All Suppliers (${suppliers.length})`, active: activeTier === "ALL", href: "/suppliers" }].concat(
    LISTING_TIERS.map((tier) => ({
      label: `${tier.label} (${suppliers.filter((listing) => listing.tier === tier.tier).length})`,
      active: activeTier === tier.tier,
      href: `/suppliers?tier=${tier.tier}`,
    })),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Supplier Directory"
        description="Browse active supplier listings, compare quality signals, and identify the right trading partners for your next order cycle."
        badge={<Badge tone="success">Verified network</Badge>}
        action={<Badge tone="info">{visibleSuppliers.length} visible suppliers</Badge>}
      />

      <TabsRow tabs={tabs} />

      <SectionCard
        title="Marketplace Listings"
        description={
          activeTier === "ALL"
            ? "Featured suppliers appear first, followed by strong ratings and active catalog presence."
            : `Showing ${activeTier.toLowerCase()} supplier listings only.`
        }
      >
        <div className="space-y-5">
          <SuppliersClient listings={visibleSuppliers} />
        </div>
      </SectionCard>
    </div>
  );
}
