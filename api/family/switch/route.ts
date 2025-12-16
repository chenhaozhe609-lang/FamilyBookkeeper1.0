import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { setFamilyCookie } from "@/lib/family";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body.familyId !== "string") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, familyId: body.familyId },
    select: { id: true },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true }, { status: 200 });
  setFamilyCookie(res, body.familyId);
  return res;
}

