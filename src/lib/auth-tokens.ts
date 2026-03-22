import { AuthTokenType } from "@prisma/client";
import { createHash, randomBytes } from "crypto";
import { db } from "./db";

const TOKEN_TTLS: Record<AuthTokenType, number> = {
  PASSWORD_RESET: 1000 * 60 * 60,
  EMAIL_VERIFICATION: 1000 * 60 * 60 * 24,
  PHONE_VERIFICATION: 1000 * 60 * 60 * 24,
};

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAuthToken(userId: string, type: AuthTokenType) {
  await db.authToken.updateMany({
    where: {
      userId,
      type,
      consumedAt: null,
    },
    data: {
      consumedAt: new Date(),
    },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTLS[type]);

  await db.authToken.create({
    data: {
      userId,
      type,
      tokenHash: hashAuthToken(token),
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function getValidAuthToken(token: string, type: AuthTokenType) {
  return db.authToken.findFirst({
    where: {
      type,
      tokenHash: hashAuthToken(token),
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
}

export async function consumeAuthToken(id: string) {
  return db.authToken.update({
    where: { id },
    data: {
      consumedAt: new Date(),
    },
  });
}

export async function consumeAuthTokensForUser(userId: string, type: AuthTokenType) {
  return db.authToken.updateMany({
    where: {
      userId,
      type,
      consumedAt: null,
    },
    data: {
      consumedAt: new Date(),
    },
  });
}
