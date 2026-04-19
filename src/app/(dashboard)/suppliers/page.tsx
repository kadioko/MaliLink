import { Building2, MapPin, ShieldCheck, Star } from "lucide-react";
import { db } from "@/lib/db";
import { Badge, EmptyState, PageHeader, SectionCard, TabsRow } from "@/components/dashboard-ui";

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleSuppliers.length ? (
            visibleSuppliers.map((listing) => {
              const listingTone = LISTING_TIERS.find((tier) => tier.tier === listing.tier)?.tone ?? "default";

              return (
                <div key={listing.id} className="surface-card rounded-[1.6rem] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge tone={listingTone}>{listing.tier}</Badge>
                      <h2 className="mt-4 font-[var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                        {listing.supplier.businessName}
                      </h2>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">{listing.supplier.name}</p>
                    </div>
                    <div className="rounded-full border border-emerald-200 bg-emerald-50 p-2 text-emerald-700">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>

                  <p className="mt-4 min-h-[72px] text-sm leading-7 text-[color:var(--muted)]">
                    {listing.description ?? "Verified supplier listing on MaliLink with marketplace visibility and active trade readiness."}
                  </p>

                  <div className="mt-5 grid gap-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3">
                      <MapPin className="h-4 w-4 text-amber-700" />
                      <span className="text-sm text-slate-900">
                        {listing.supplier.location ?? "Location not provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3">
                      <Building2 className="h-4 w-4 text-emerald-700" />
                      <span className="text-sm text-slate-900">
                        {listing.supplier._count.products} products listed
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-slate-900">
                        {listing.rating.toFixed(1)} rating from {listing.reviewCount} reviews
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Badge tone={listing.supplier.kycStatus === "VERIFIED" ? "success" : "warning"}>
                      {listing.supplier.kycStatus}
                    </Badge>
                    <Badge tone="default">
                      {listing.minOrder ? `Min order $${listing.minOrder}` : "Min order on request"}
                    </Badge>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full">
              <EmptyState
                icon="🏭"
                title={activeTier === "ALL" ? "No suppliers listed yet" : `No ${activeTier.toLowerCase()} suppliers`}
                description={
                  activeTier === "ALL"
                    ? "Supplier listings will appear here once accounts publish active marketplace profiles."
                    : "Try another tier to inspect more marketplace listings."
                }
              />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
