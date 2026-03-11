import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const updateProductSchema = z.object({
  name: z.string().min(2),
  nameSwahili: z.string().optional(),
  description: z.string().optional(),
  category: z.string(),
  unit: z.string(),
  priceUsd: z.number().positive(),
  priceTzs: z.number().positive(),
  moq: z.number().int().positive(),
  imageUrls: z.array(z.string()).default([]),
  inStock: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Only suppliers can update products" }, { status: 403 });
  }

  try {
    const existingProduct = await db.product.findUnique({ where: { id: params.id } });
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (existingProduct.supplierId !== session.user.id) {
      return NextResponse.json({ error: "You can only update your own products" }, { status: 403 });
    }

    const body = await req.json();
    const data = updateProductSchema.parse(body);

    const product = await db.product.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Only suppliers can delete products" }, { status: 403 });
  }

  try {
    const existingProduct = await db.product.findUnique({ where: { id: params.id } });
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (existingProduct.supplierId !== session.user.id) {
      return NextResponse.json({ error: "You can only delete your own products" }, { status: 403 });
    }

    await db.product.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
