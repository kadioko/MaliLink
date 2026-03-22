import bcrypt from "bcryptjs";
import { AuthTokenType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { consumeAuthToken, consumeAuthTokensForUser, getValidAuthToken } from "@/lib/auth-tokens";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = resetPasswordSchema.parse(body);

    const authToken = await getValidAuthToken(data.token, AuthTokenType.PASSWORD_RESET);

    if (!authToken) {
      return NextResponse.json({ error: "This password reset link is invalid or has expired." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await db.user.update({
      where: { id: authToken.userId },
      data: { passwordHash },
    });

    await consumeAuthToken(authToken.id);
    await consumeAuthTokensForUser(authToken.userId, AuthTokenType.PASSWORD_RESET);

    return NextResponse.json({ message: "Your password has been reset successfully. You can now sign in." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to reset your password." }, { status: 500 });
  }
}
