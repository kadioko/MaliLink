import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const updateListingSchema = z.object({
  description: z.string().optional(),
  categories: z.array(z.string()).optional(),
  origin: z.string().optional(),
  minOrder: z.number().positive().optional(),
  leadTimeDays: z.number().int().positive().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listing = await db.supplierListing.findUnique({
    where: { supplierId: session.user.id },
  });

  return NextResponse.json({ listing });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = updateListingSchema.parse(body);

    const listing = await db.supplierListing.upsert({
      where: { supplierId: session.user.id },
      create: { supplierId: session.user.id, categories: [], ...data },
      update: data,
    });

    return NextResponse.json({ listing });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
