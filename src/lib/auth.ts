import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./db";

export const SESSION_COOKIE_NAME = "familyledger_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  };
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });
  return session;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } });
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }
  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export function setSessionCookie(res: NextResponse, sessionId: string, expiresAt: Date) {
  res.cookies.set(SESSION_COOKIE_NAME, sessionId, cookieOptions(expiresAt));
}
