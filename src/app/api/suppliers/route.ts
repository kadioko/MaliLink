import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const tier = searchParams.get("tier");

  const where: any = { isActive: true };
  if (category) where.categories = { has: category };
  if (tier) where.tier = tier;

  const orderBy: any[] = [
    { tier: "desc" }, // FEATURED first
    { rating: "desc" },
  ];

  const listings = await db.supplierListing.findMany({
    where,
    include: {
      supplier: {
        select: {
          id: true,
          businessName: true,
          name: true,
          location: true,
          kycStatus: true,
          _count: { select: { products: true } },
        },
      },
    },
    orderBy,
  });

  // Filter by search on supplier name if needed
  let results = listings;
  if (search) {
    const q = search.toLowerCase();
    results = listings.filter(
      (l) =>
        l.supplier.businessName.toLowerCase().includes(q) ||
        l.supplier.name.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ suppliers: results });
}
