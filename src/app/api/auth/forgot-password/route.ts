import { AuthTokenType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { deliverAuthLink } from "@/lib/auth-delivery";
import { createAuthToken } from "@/lib/auth-tokens";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const genericResponse = {
  message: "If an account exists for that email, a password reset link has been prepared.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = forgotPasswordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json(genericResponse);
    }

    const { token } = await createAuthToken(user.id, AuthTokenType.PASSWORD_RESET);
    const delivery = await deliverAuthLink(user, AuthTokenType.PASSWORD_RESET, token);

    return NextResponse.json({
      ...genericResponse,
      channels: delivery.channels,
      ...(delivery.previewUrl ? { previewUrl: delivery.previewUrl } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to process password reset request." }, { status: 500 });
  }
}
