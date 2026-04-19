"use client";

import { useMemo, useState } from "react";
import { Boxes, ImageIcon, MapPin, PackageOpen } from "lucide-react";
import { formatTzsFromUsd, getInitials } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, TabsRow } from "@/components/dashboard-ui";
import { ProductManagementPanel } from "./product-management-panel";

type ProductRecord = {
  id: string;
  name: string;
  nameSwahili: string | null;
  description: string | null;
  category: string;
  unit: string;
  priceUsd: number;
  priceTzs: number;
  moq: number;
  inStock: boolean;
  imageUrls: string[];
  createdAt: Date | string;
  supplier?: { businessName: string; location: string | null };
  optimisticState?: "pending" | "failed";
  optimisticMessage?: string;
};

type ProductsClientPageProps = {
  role: "IMPORTER" | "SUPPLIER" | "ADMIN";
  initialProducts: ProductRecord[];
  initialSupplierProducts: ProductRecord[];
  exchangeRate: number;
  activeCategory: string;
  currentSupplier?: { businessName: string; location: string | null };
};

export function ProductsClientPage({
  role,
  initialProducts,
  initialSupplierProducts,
  exchangeRate,
  activeCategory,
  currentSupplier,
}: ProductsClientPageProps) {
  const [products, setProducts] = useState(initialProducts);
  const [supplierProducts, setSupplierProducts] = useState(initialSupplierProducts);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((product) => product.category)))], [products]);
  const categoryTabs = categories.map((category) => ({
    label: `${category} (${category === "All" ? products.length : products.filter((product) => product.category === category).length})`,
    active: activeCategory === category,
    href: category === "All" ? "/products" : `/products?category=${encodeURIComponent(category)}`,
  }));

  const visibleProducts = activeCategory === "All"
    ? products
    : products.filter((product) => product.category === activeCategory);
  const inStockCount = visibleProducts.filter((product) => product.inStock).length;
  const withImagesCount = visibleProducts.filter((product) => Boolean(product.imageUrls[0])).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Product Catalog"
        description={
          role === "SUPPLIER"
            ? `${products.length} products available with TZS-first pricing. Manage your catalog while monitoring what buyers can see.`
            : `${products.length} products available with TZS-first pricing and supplier inventory visibility.`
        }
        badge={<Badge tone={role === "SUPPLIER" ? "info" : "success"}>{role === "SUPPLIER" ? "Supplier Catalog" : "Live Supplier Listings"}</Badge>}
      />

      {role === "SUPPLIER" ? (
        <ProductManagementPanel
          initialProducts={supplierProducts}
          exchangeRate={exchangeRate}
          onOptimisticProductCreated={(product) => {
            const normalized = {
              ...product,
              optimisticState: "pending" as const,
              supplier: currentSupplier ?? { businessName: "Your business", location: null },
            };
            setSupplierProducts((current) => [{ ...product, optimisticState: "pending" }, ...current]);
            setProducts((current) => [normalized, ...current]);
          }}
          onOptimisticProductUpdated={(product, previousProduct) => {
            setSupplierProducts((current) => current.map((entry) => (entry.id === product.id ? { ...product, optimisticState: "pending" } : entry)));
            setProducts((current) =>
              current.map((entry) =>
                entry.id === product.id ? { ...product, optimisticState: "pending", supplier: entry.supplier ?? currentSupplier ?? { businessName: "Your business", location: null } } : entry,
              ),
            );
          }}
          onOptimisticProductDeleted={(product) => {
            setSupplierProducts((current) => current.filter((entry) => entry.id !== product.id));
            setProducts((current) => current.filter((entry) => entry.id !== product.id));
          }}
          onOptimisticProductCommitted={(tempId, product) => {
            setSupplierProducts((current) => current.map((entry) => (entry.id === tempId || entry.id === product.id ? product : entry)));
            setProducts((current) =>
              current.map((entry) =>
                entry.id === tempId || entry.id === product.id
                  ? { ...product, supplier: entry.supplier ?? currentSupplier ?? { businessName: "Your business", location: null } }
                  : entry,
              ),
            );
          }}
          onOptimisticProductFailed={(context) => {
            if (context.type === "create") {
              setSupplierProducts((current) => current.filter((entry) => entry.id !== context.tempId));
              setProducts((current) => current.filter((entry) => entry.id !== context.tempId));
            }
            if (context.type === "update") {
              setSupplierProducts((current) => current.map((entry) => (entry.id === context.previous.id ? { ...context.previous, optimisticState: "failed", optimisticMessage: context.message } : entry)));
              setProducts((current) =>
                current.map((entry) =>
                  entry.id === context.previous.id
                    ? { ...context.previous, optimisticState: "failed", optimisticMessage: context.message, supplier: entry.supplier ?? currentSupplier ?? { businessName: "Your business", location: null } }
                    : entry,
                ),
              );
            }
            if (context.type === "delete") {
              setSupplierProducts((current) => [{ ...context.previous, optimisticState: "failed", optimisticMessage: context.message }, ...current]);
              setProducts((current) => [{ ...context.previous, optimisticState: "failed", optimisticMessage: context.message, supplier: currentSupplier ?? { businessName: "Your business", location: null } }, ...current]);
            }
          }}
        />
      ) : null}

      <TabsRow tabs={categoryTabs} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card rounded-[1.6rem] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <PackageOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">Visible products</div>
              <div className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.05em] text-slate-950">{visibleProducts.length}</div>
            </div>
          </div>
        </div>
        <div className="surface-card rounded-[1.6rem] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">In stock now</div>
              <div className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.05em] text-slate-950">{inStockCount}</div>
            </div>
          </div>
        </div>
        <div className="surface-card rounded-[1.6rem] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">With media</div>
              <div className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.05em] text-slate-950">{withImagesCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibleProducts.length ? (
          visibleProducts.map((product) => (
            <div key={product.id} className={`surface-card overflow-hidden rounded-[1.75rem] transition hover:-translate-y-1 hover:shadow-md ${product.optimisticState === "pending" ? "ring-1 ring-amber-300 opacity-80" : ""} ${product.optimisticState === "failed" ? "ring-1 ring-rose-300" : ""}`}>
              <div className="relative aspect-[1.05/1] overflow-hidden bg-gradient-to-br from-emerald-100 via-white to-amber-100">
                {product.imageUrls[0] ? (
                  <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-xl font-semibold text-white">
                      {getInitials(product.name)}
                    </div>
                    <div className="text-sm font-medium text-slate-600">{product.category}</div>
                  </div>
                )}
                <div className="absolute left-4 top-4">
                  <Badge tone={product.inStock ? "success" : "danger"}>{product.inStock ? "In Stock" : "Out of Stock"}</Badge>
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">{product.category}</div>
                <h2 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-slate-950">{product.name}</h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-[color:var(--muted)]">
                  <span className="font-medium text-slate-800">{product.supplier?.businessName ?? "Supplier"}</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {product.supplier?.location ?? "Location not set"}
                  </span>
                </div>
                <div className="mt-4 min-h-[72px] line-clamp-3 text-sm text-[color:var(--muted)]">
                  {product.description ?? "No description provided yet. Add details to make this listing easier to buy from."}
                </div>
                {product.optimisticMessage ? <div className="mt-2 text-xs text-rose-600">{product.optimisticMessage}</div> : null}
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="font-[var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-slate-950">{formatTzsFromUsd(product.priceUsd)}</div>
                    <div className="text-xs text-[color:var(--muted)]">MOQ {product.moq} • {product.unit}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge tone="default">{product.imageUrls[0] ? "Photo ready" : "Needs media"}</Badge>
                    {product.optimisticState === "pending" ? <Badge tone="warning">Syncing</Badge> : null}
                    {product.optimisticState === "failed" ? <Badge tone="danger">Rolled Back</Badge> : null}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon="🏪"
              title={activeCategory === "All" ? "No products listed yet" : `No products in ${activeCategory}`}
              description={
                activeCategory === "All"
                  ? role === "SUPPLIER"
                    ? "Add your first product from the supplier management panel above to start receiving orders."
                    : "Suppliers have not published products yet. Check back later or onboard supplier accounts to populate the catalog."
                  : "Try a different category to explore more listings."
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
