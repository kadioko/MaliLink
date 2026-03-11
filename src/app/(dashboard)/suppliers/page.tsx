import { db } from "@/lib/db";

const LISTING_TIERS = [
  { tier: "FREE", label: "Free", color: "text-gray-600", bg: "bg-gray-100" },
  { tier: "BASIC", label: "Basic", color: "text-blue-600", bg: "bg-blue-100" },
  { tier: "PREMIUM", label: "Premium", color: "text-purple-600", bg: "bg-purple-100" },
  { tier: "FEATURED", label: "Featured", color: "text-amber-600", bg: "bg-amber-100" },
];

export default async function SuppliersPage() {
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Directory</h1>
        <div className="text-sm text-gray-500">{suppliers.length} active suppliers</div>
      </div>

      {/* Tier Filter */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-300">
          All
        </button>
        {LISTING_TIERS.map((t) => (
          <button
            key={t.tier}
            className={`px-4 py-2 rounded-full text-sm font-medium ${t.bg} ${t.color} border border-transparent hover:border-gray-300 transition`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.length ? (
          suppliers.map((listing: (typeof suppliers)[number]) => (
            <div key={listing.id} className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">{listing.tier}</div>
                  <h2 className="mt-2 font-semibold text-gray-900">{listing.supplier.businessName}</h2>
                  <p className="text-sm text-gray-500">{listing.supplier.name}</p>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  {listing.supplier.kycStatus}
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600 min-h-[40px]">
                {listing.description ?? "Verified supplier listing on MaliLink."}
              </p>

              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div>Location: {listing.supplier.location ?? "Not provided"}</div>
                <div>Products: {listing.supplier._count.products}</div>
                <div>Rating: {listing.rating.toFixed(1)} ({listing.reviewCount} reviews)</div>
                <div>Minimum Order: {listing.minOrder ? `$${listing.minOrder}` : "Contact supplier"}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">🏭</div>
            <p className="font-medium text-gray-600">No suppliers listed yet</p>
            <p className="text-sm mt-1">Be the first supplier on MaliLink.</p>
          </div>
        )}
      </div>
    </div>
  );
}
