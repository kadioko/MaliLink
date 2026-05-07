import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  businessName: z.string().min(2).optional(),
  location: z.string().optional(),
  phone: z.string().min(10).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      businessName: true,
      phone: true,
      location: true,
      role: true,
      kycStatus: true,
      tinNumber: true,
      businessLicense: true,
      avatarUrl: true,
      emailVerifiedAt: true,
      phoneVerifiedAt: true,
      createdAt: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (body.action === "change-password") {
      const { currentPassword, newPassword } = changePasswordSchema.parse(body);
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await db.user.update({ where: { id: session.user.id }, data: { passwordHash } });
      return NextResponse.json({ message: "Password updated successfully" });
    }

    const data = updateProfileSchema.parse(body);
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.businessName && { businessName: data.businessName.trim() }),
        ...(data.location !== undefined && { location: data.location?.trim() || null }),
        ...(data.phone && { phone: data.phone.trim() }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        phone: true,
        location: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Profile update failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
