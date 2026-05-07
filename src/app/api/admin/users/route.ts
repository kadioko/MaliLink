import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      businessName: true,
      email: true,
      phone: true,
      role: true,
      kycStatus: true,
      location: true,
      isSuspended: true,
      emailVerifiedAt: true,
      phoneVerifiedAt: true,
      createdAt: true,
      _count: {
        select: {
          importerOrders: true,
          supplierOrders: true,
          products: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, action } = await req.json();
  if (!userId || !action) return NextResponse.json({ error: "userId and action required" }, { status: 400 });

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
  }

  if (action === "suspend") {
    await db.user.update({ where: { id: userId }, data: { isSuspended: true } });
    return NextResponse.json({ message: "User suspended" });
  }

  if (action === "activate") {
    await db.user.update({ where: { id: userId }, data: { isSuspended: false } });
    return NextResponse.json({ message: "User activated" });
  }

  if (action === "verify-kyc") {
    await db.user.update({ where: { id: userId }, data: { kycStatus: "VERIFIED" } });
    return NextResponse.json({ message: "KYC verified" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
