import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { family: true },
  });
  if (!invite || !invite.family) {
    return NextResponse.json({ valid: false }, { status: 200 });
  }
  const valid = !invite.usedAt && invite.expiresAt.getTime() > Date.now();
  return NextResponse.json(
    {
      valid,
      familyName: invite.family.name,
      role: invite.role,
      expiresAt: invite.expiresAt,
    },
    { status: 200 },
  );
}
