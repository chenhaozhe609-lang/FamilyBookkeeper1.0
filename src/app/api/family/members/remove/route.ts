import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFamily } from "@/lib/family";
import { requireOwner } from "@/lib/permission";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ctx = await getCurrentFamily();
  if (!ctx) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const perm = requireOwner(ctx.membership);
  if (perm) return perm;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.userId !== "string") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  if (body.userId === user.id) {
    return NextResponse.json({ error: "Cannot remove self" }, { status: 400 });
  }
  const target = await prisma.membership.findFirst({
    where: { userId: body.userId, familyId: ctx.family.id },
  });
  if (!target) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  if (target.role !== "MEMBER") {
    return NextResponse.json({ error: "Cannot remove owner" }, { status: 400 });
  }
  await prisma.membership.delete({
    where: { userId_familyId: { userId: body.userId, familyId: ctx.family.id } },
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}

