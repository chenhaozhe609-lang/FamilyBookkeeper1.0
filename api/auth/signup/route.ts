import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/auth";
import { setFamilyCookie } from "@/lib/family";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) {
    return NextResponse.json({ error: "Conflict" }, { status: 409 });
  }
  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
    },
  });
  const family = await prisma.family.create({
    data: {
      name: "My Family",
      currency: "CNY",
      ownerId: user.id,
    },
  });
  await prisma.membership.create({
    data: {
      userId: user.id,
      familyId: family.id,
      role: "OWNER",
    },
  });
  const session = await createSession(user.id);
  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  setSessionCookie(res, session.id, session.expiresAt);
  setFamilyCookie(res, family.id);
  return res;
}
