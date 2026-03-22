import { AuthTokenType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { deliverAuthLink } from "@/lib/auth-delivery";
import { createAuthToken } from "@/lib/auth-tokens";
import { db } from "@/lib/db";

const requestVerificationSchema = z.object({
  channel: z.enum(["email", "phone"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = requestVerificationSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const type = data.channel === "email" ? AuthTokenType.EMAIL_VERIFICATION : AuthTokenType.PHONE_VERIFICATION;
    const alreadyVerified = data.channel === "email" ? Boolean(user.emailVerifiedAt) : Boolean(user.phoneVerifiedAt);

    if (alreadyVerified) {
      return NextResponse.json({ message: `Your ${data.channel} is already verified.` });
    }

    const { token } = await createAuthToken(user.id, type);
    const delivery = await deliverAuthLink(user, type, token);

    return NextResponse.json({
      message: `We prepared a ${data.channel} verification link for your account.`,
      channels: delivery.channels,
      ...(delivery.previewUrl ? { previewUrl: delivery.previewUrl } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to prepare verification right now." }, { status: 500 });
  }
}
