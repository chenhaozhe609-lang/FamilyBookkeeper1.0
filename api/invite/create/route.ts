import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentFamily } from "@/lib/family";
import { randomBytes } from "crypto";

export async function POST() {
  const ctx = await getCurrentFamily();
  if (!ctx) {
    return NextResponse.json({ error: "Family Not Selected" }, { status: 400 });
  }
  if (ctx.membership.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invite = await prisma.invite.create({
    data: {
      token,
      familyId: ctx.family.id,
      role: "MEMBER",
      expiresAt,
    },
  });
  return NextResponse.json(
    {
      token: invite.token,
      link: `/invite/${invite.token}`,
      expiresAt: invite.expiresAt,
      role: invite.role,
    },
    { status: 201 },
  );
}
