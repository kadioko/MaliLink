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
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedPhone = data.phone.trim();
    const normalizedName = data.name.trim();
    const normalizedBusinessName = data.businessName.trim();
    const normalizedLocation = data.location?.trim() || undefined;
    const normalizedTinNumber = data.tinNumber?.trim() || undefined;

    const existing = await db.user.findFirst({
      where: { OR: [{ email: normalizedEmail }, { phone: normalizedPhone }] },
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
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        name: normalizedName,
        businessName: normalizedBusinessName,
        role: data.role,
        location: normalizedLocation,
        tinNumber: normalizedTinNumber,
        whatsappId: normalizedPhone,
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
        data: { supplierId: user.id, categories: [] },
      });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration failed", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
