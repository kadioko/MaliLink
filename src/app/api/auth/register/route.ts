import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  name: z.string().min(2),
  businessName: z.string().min(2),
  role: z.enum(["IMPORTER", "SUPPLIER"]),
  location: z.string().optional(),
  tinNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await db.user.findFirst({
      where: { OR: [{ email: data.email }, { phone: data.phone }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        name: data.name,
        businessName: data.businessName,
        role: data.role,
        location: data.location,
        tinNumber: data.tinNumber,
        whatsappId: data.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        role: true,
      },
    });

    // Auto-create supplier listing if supplier
    if (data.role === "SUPPLIER") {
      await db.supplierListing.create({
        data: { supplierId: user.id },
      });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
