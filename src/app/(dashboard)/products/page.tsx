import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUsdToTzsRate } from "@/lib/utils";
import { ProductsClientPage } from "./products-client-page";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const session = await getServerSession(authOptions);
  const products = await db.product.findMany({
    include: {
      supplier: { select: { businessName: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const uniqueCategories: string[] = Array.from(new Set(products.map((product) => product.category)));
  const categories: string[] = ["All", ...uniqueCategories];
  const activeCategory = searchParams?.category && categories.includes(searchParams.category) ? searchParams.category : "All";

  const supplierProducts =
    session?.user.role === "SUPPLIER"
      ? await db.product.findMany({
          where: { supplierId: session.user.id },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const currentSupplier =
    session?.user.role === "SUPPLIER"
      ? await db.user.findUnique({
          where: { id: session.user.id },
          select: { businessName: true, location: true },
        })
      : null;

  return (
    <ProductsClientPage
      role={session?.user.role ?? "IMPORTER"}
      initialProducts={products}
      initialSupplierProducts={supplierProducts}
      exchangeRate={getUsdToTzsRate()}
      activeCategory={activeCategory}
      currentSupplier={currentSupplier ?? undefined}
    />
  );
}
