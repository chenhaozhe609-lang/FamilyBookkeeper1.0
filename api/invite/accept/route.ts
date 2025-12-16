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
  if (!body || typeof body.token !== "string") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  const invite = await prisma.invite.findUnique({
    where: { token: body.token },
  });
  if (!invite) {
    return NextResponse.json({ error: "Invalid Invite" }, { status: 400 });
  }
  if (invite.usedAt) {
    return NextResponse.json({ error: "Invite Used" }, { status: 400 });
  }
  if (invite.expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Invite Expired" }, { status: 400 });
  }
  const isMember = await prisma.membership.findFirst({
    where: { userId: user.id, familyId: invite.familyId },
    select: { id: true },
  });
  if (isMember) {
    return NextResponse.json({ error: "Conflict" }, { status: 409 });
  }
  await prisma.$transaction(async (tx) => {
    await tx.membership.create({
      data: {
        userId: user.id,
        familyId: invite.familyId,
        role: invite.role,
      },
    });
    await tx.invite.update({
      where: { token: invite.token },
      data: { usedAt: new Date() },
    });
  });
  const res = NextResponse.json({ ok: true, familyId: invite.familyId }, { status: 200 });
  setFamilyCookie(res, invite.familyId);
  return res;
}
