import { cookies } from "next/headers";
import { eq, gt, isNull, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { coreSession } from "@/lib/db/schema/core-session";
import { coreUser } from "@/lib/db/schema/core-user";

import {
  generateSessionToken,
  hashSessionToken,
} from "./token";

const COOKIE_NAME = "inventra_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(coreSession).values({
    UserId: userId,
    TokenHash: tokenHash,
    ExpiresAt: expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    ...cookieOptions,
    expires: expiresAt,
  });

  return {
    expiresAt,
  };
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const tokenHash = hashSessionToken(token);

  const [result] = await db
    .select({
      SessionId: coreSession.Id,
      UserId: coreUser.Id,
      Username: coreUser.Username,
      Email: coreUser.Email,
      FullName: coreUser.FullName,
      IsActive: coreUser.IsActive,
      ExpiresAt: coreSession.ExpiresAt,
    })
    .from(coreSession)
    .innerJoin(
      coreUser,
      eq(coreSession.UserId, coreUser.Id)
    )
    .where(
      and(
        eq(coreSession.TokenHash, tokenHash),
        isNull(coreSession.RevokedAt),
        gt(coreSession.ExpiresAt, new Date()),
        eq(coreUser.IsActive, true)
      )
    )
    .limit(1);

  return result ?? null;
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashSessionToken(token);

    await db
      .update(coreSession)
      .set({
        RevokedAt: new Date(),
      })
      .where(
        eq(coreSession.TokenHash, tokenHash)
      );
  }

  cookieStore.set(COOKIE_NAME, "", {
    ...cookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });
}