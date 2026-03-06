import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const createProductSchema = z.object({
  name: z.string().min(2),
  nameSwahili: z.string().optional(),
  description: z.string().optional(),
  category: z.string(),
  unit: z.string(),
  priceUsd: z.number().positive(),
  priceTzs: z.number().positive(),
  moq: z.number().int().positive().default(1),
  imageUrls: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const supplierId = searchParams.get("supplierId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = { inStock: true };
  if (category) where.category = category;
  if (supplierId) where.supplierId = supplierId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nameSwahili: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        supplier: { select: { businessName: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Only suppliers can create products" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createProductSchema.parse(body);

    const product = await db.product.create({
      data: {
        ...data,
        supplierId: session.user.id,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
