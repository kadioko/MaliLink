import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Building2, MapPin, Package, ShieldCheck, Star, Tag, Truck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTzsFromUsd } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, SectionCard, StatCard } from "@/components/dashboard-ui";

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const listing = await db.supplierListing.findUnique({
    where: { id: params.id },
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          businessName: true,
          location: true,
          kycStatus: true,
          email: true,
          phone: true,
          avatarUrl: true,
          createdAt: true,
          products: {
            where: { inStock: true },
            orderBy: { createdAt: "desc" },
            take: 12,
          },
          _count: {
            select: {
              products: true,
              supplierOrders: true,
            },
          },
        },
      },
    },
  });

  if (!listing || !listing.isActive) notFound();

  const supplier = listing.supplier;
  const categorySet = new Set(supplier.products.map((p) => p.category));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link
          href="/suppliers"
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Supplier Directory
        </Link>
      </div>

      <PageHeader
        title={supplier.businessName}
        description={listing.description ?? "Verified supplier on MaliLink with active catalog presence and trade-ready status."}
        badge={
          <div className="flex flex-wrap gap-2">
            <Badge tone={supplier.kycStatus === "VERIFIED" ? "success" : "warning"}>
              {supplier.kycStatus === "VERIFIED" ? "Verified" : "Pending KYC"}
            </Badge>
            <Badge tone={listing.tier === "FEATURED" ? "success" : listing.tier === "PREMIUM" ? "warning" : "default"}>
              {listing.tier}
            </Badge>
          </div>
        }
        action={
          session.user.role === "IMPORTER" ? (
            <Link
              href={`/orders?new=1&supplierId=${supplier.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Truck className="h-4 w-4" />
              Place Order
            </Link>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Products Listed" value={String(supplier._count.products)} tone="info" />
        <StatCard label="Orders Fulfilled" value={String(supplier._count.supplierOrders)} tone="success" />
        <StatCard label="Rating" value={`${listing.rating.toFixed(1)} / 5`} tone="default" delta={`${listing.reviewCount} reviews`} />
        <StatCard label="Lead Time" value={listing.leadTimeDays ? `${listing.leadTimeDays} days` : "On request"} tone="default" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <SectionCard
            title="Product Catalog"
            description={`${supplier._count.products} products listed — showing in-stock items`}
            action={
              supplier.products.length < supplier._count.products ? (
                <Link href={`/products?supplier=${supplier.id}`} className="text-xs font-medium text-emerald-600 hover:underline">
                  View all →
                </Link>
              ) : null
            }
          >
            {supplier.products.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {supplier.products.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                      📦
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category} · {product.unit}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatTzsFromUsd(product.priceUsd)}</p>
                      <p className="text-xs text-gray-400">/{product.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📦"
                title="No products in stock"
                description="This supplier's catalog will appear here once they list products."
              />
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Supplier Info" description="Key details about this trading partner.">
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Contact name</p>
                  <p className="text-sm font-medium text-gray-800">{supplier.name}</p>
                </div>
              </div>
              {supplier.location ? (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-800">{supplier.location}</p>
                  </div>
                </div>
              ) : null}
              {listing.origin ? (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <Tag className="h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Product origin</p>
                    <p className="text-sm font-medium text-gray-800">{listing.origin}</p>
                  </div>
                </div>
              ) : null}
              {listing.minOrder ? (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <Package className="h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Minimum order</p>
                    <p className="text-sm font-medium text-gray-800">{formatTzsFromUsd(listing.minOrder)}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">KYC status</p>
                  <p className="text-sm font-medium text-gray-800">{supplier.kycStatus}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                <Star className="h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <p className="text-xs text-gray-400">Marketplace rating</p>
                  <p className="text-sm font-medium text-gray-800">{listing.rating.toFixed(1)} from {listing.reviewCount} reviews</p>
                </div>
              </div>
            </div>
          </SectionCard>

          {listing.categories.length ? (
            <SectionCard title="Categories" description="Product categories this supplier covers.">
              <div className="flex flex-wrap gap-2">
                {listing.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Member Since" description="Joined the MaliLink marketplace.">
            <p className="text-sm font-medium text-gray-800">
              {new Date(supplier.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </SectionCard>

          {session.user.role === "IMPORTER" ? (
            <Link
              href={`/orders?new=1&supplierId=${supplier.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Truck className="h-4 w-4" />
              Place an Order
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
