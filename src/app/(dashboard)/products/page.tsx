import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTzsFromUsd, getUsdToTzsRate } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, TabsRow } from "@/components/dashboard-ui";
import { ProductManagementPanel } from "./product-management-panel";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  const products = await db.product.findMany({
    include: {
      supplier: { select: { businessName: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const uniqueCategories: string[] = Array.from(
    new Set(products.map((product: (typeof products)[number]) => product.category))
  );
  const categories: string[] = ["All", ...uniqueCategories];
  const supplierProducts = session?.user.role === "SUPPLIER"
    ? await db.product.findMany({
        where: { supplierId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const exchangeRate = getUsdToTzsRate();
  const categoryTabs = categories.map((category, index) => ({ label: category, active: index === 0 }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Product Catalog"
        description={session?.user.role === "SUPPLIER" ? `${products.length} products available with TZS-first pricing. Manage your catalog while monitoring what buyers can see.` : `${products.length} products available with TZS-first pricing and supplier inventory visibility.`}
        badge={<Badge tone={session?.user.role === "SUPPLIER" ? "info" : "success"}>{session?.user.role === "SUPPLIER" ? "Supplier Catalog" : "Live Supplier Listings"}</Badge>}
      />

      {session?.user.role === "SUPPLIER" ? (
        <ProductManagementPanel initialProducts={supplierProducts} exchangeRate={exchangeRate} />
      ) : null}

      <TabsRow tabs={categoryTabs} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {products.length ? (
          products.map((product: (typeof products)[number]) => (
            <div key={product.id} className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-sm text-gray-400">
                {product.imageUrls[0] ? "Image available" : "No image"}
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">{product.category}</div>
                <h2 className="mt-2 font-semibold text-gray-900">{product.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{product.supplier.businessName}</p>
                <p className="text-sm text-gray-500">{product.supplier.location ?? "Location not set"}</p>
                <div className="mt-3 text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                  {product.description ?? "No description provided."}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{formatTzsFromUsd(product.priceUsd)}</div>
                    <div className="text-xs text-gray-500">MOQ {product.moq} • {product.unit}</div>
                  </div>
                  <Badge tone={product.inStock ? "success" : "danger"}>{product.inStock ? "In Stock" : "Out of Stock"}</Badge>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full"><EmptyState icon="🏪" title="No products listed yet" description={session?.user.role === "SUPPLIER" ? "Add your first product from the supplier management panel above to start receiving orders." : "Suppliers have not published products yet. Check back later or onboard supplier accounts to populate the catalog."} /></div>
        )}
      </div>
    </div>
  );
}
