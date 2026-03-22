import { AuthTokenType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { consumeAuthToken, getValidAuthToken } from "@/lib/auth-tokens";

const verifySchema = z.object({
  token: z.string().min(1),
  type: z.enum(["email", "phone"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = verifySchema.parse(body);
    const tokenType = data.type === "email" ? AuthTokenType.EMAIL_VERIFICATION : AuthTokenType.PHONE_VERIFICATION;
    const authToken = await getValidAuthToken(data.token, tokenType);

    if (!authToken) {
      return NextResponse.json({ error: "This verification link is invalid or has expired." }, { status: 400 });
    }

    await db.user.update({
      where: { id: authToken.userId },
      data: data.type === "email" ? { emailVerifiedAt: new Date() } : { phoneVerifiedAt: new Date() },
    });

    await consumeAuthToken(authToken.id);

    return NextResponse.json({
      message: data.type === "email" ? "Your email has been verified." : "Your phone number has been verified.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to verify this link." }, { status: 500 });
  }
}
