import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rate } = await req.json();
  if (!rate || typeof rate !== "number" || rate <= 0) {
    return NextResponse.json({ error: "Invalid rate" }, { status: 400 });
  }

  return NextResponse.json({ rate, message: "Rate updated in session. Restart server to persist via env." });
}
