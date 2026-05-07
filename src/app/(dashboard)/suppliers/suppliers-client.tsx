"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Search, ShieldCheck, Star, X } from "lucide-react";
import { Badge, EmptyState } from "@/components/dashboard-ui";

type ListingRecord = {
  id: string;
  tier: string;
  description: string | null;
  rating: number;
  reviewCount: number;
  minOrder: number | null;
  categories: string[];
  origin: string | null;
  supplier: {
    businessName: string;
    name: string;
    location: string | null;
    kycStatus: string;
    _count: { products: number };
  };
};

const TIER_TONES: Record<string, "success" | "warning" | "info" | "default"> = {
  FEATURED: "success",
  PREMIUM: "warning",
  BASIC: "info",
  FREE: "default",
};

export function SuppliersClient({ listings }: { listings: ListingRecord[] }) {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    if (!search.trim()) return listings;
    const q = search.toLowerCase();
    return listings.filter(
      (l) =>
        l.supplier.businessName.toLowerCase().includes(q) ||
        l.supplier.name.toLowerCase().includes(q) ||
        (l.supplier.location?.toLowerCase().includes(q) ?? false) ||
        l.categories.some((c) => c.toLowerCase().includes(q)) ||
        (l.description?.toLowerCase().includes(q) ?? false) ||
        (l.origin?.toLowerCase().includes(q) ?? false),
    );
  }, [listings, search]);

  return (
    <>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, location, category, origin…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        {search ? (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="🏭"
          title="No suppliers match your search"
          description="Try different keywords or clear the search to see all listings."
          action={
            <button
              onClick={() => setSearch("")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear search
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((listing) => (
            <div key={listing.id} className="surface-card flex flex-col rounded-[1.6rem] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone={TIER_TONES[listing.tier] ?? "default"}>{listing.tier}</Badge>
                  <h2 className="mt-4 font-[var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    {listing.supplier.businessName}
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{listing.supplier.name}</p>
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 p-2 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-4 min-h-[60px] flex-1 text-sm leading-7 text-[color:var(--muted)]">
                {listing.description ?? "Verified supplier listing on MaliLink with marketplace visibility and active trade readiness."}
              </p>

              <div className="mt-5 grid gap-2">
                <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-2.5">
                  <MapPin className="h-4 w-4 text-amber-700" />
                  <span className="text-sm text-slate-900">{listing.supplier.location ?? "Location not provided"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-2.5">
                  <Building2 className="h-4 w-4 text-emerald-700" />
                  <span className="text-sm text-slate-900">{listing.supplier._count.products} products listed</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-2.5">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-slate-900">{listing.rating.toFixed(1)} · {listing.reviewCount} reviews</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={listing.supplier.kycStatus === "VERIFIED" ? "success" : "warning"}>
                    {listing.supplier.kycStatus}
                  </Badge>
                  <Badge tone="default">
                    {listing.minOrder ? `Min $${listing.minOrder}` : "MOQ on request"}
                  </Badge>
                </div>
                <Link
                  href={`/suppliers/${listing.id}`}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                >
                  View Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
