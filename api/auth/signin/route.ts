import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/auth";
import { FAMILY_COOKIE_NAME, getDefaultFamilyId, setFamilyCookie } from "@/lib/family";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = await createSession(user.id);
  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 200 });
  setSessionCookie(res, session.id, session.expiresAt);
  const store = await cookies();
  const existingFamilyId = store.get(FAMILY_COOKIE_NAME)?.value;
  let keepExisting = false;
  if (existingFamilyId) {
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id, familyId: existingFamilyId },
      select: { id: true },
    });
    keepExisting = !!membership;
  }
  if (!keepExisting) {
    const defaultFamilyId = await getDefaultFamilyId(user.id);
    if (defaultFamilyId) {
      setFamilyCookie(res, defaultFamilyId);
    }
  }
  return res;
}
