import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFamily } from "@/lib/family";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ctx = await getCurrentFamily();
  if (!ctx) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await prisma.membership.findMany({
    where: { familyId: ctx.family.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });
  const data = rows.map((m: { userId: string; role: "OWNER" | "MEMBER"; joinedAt: Date; user: { id: string; name: string; email: string } }) => ({
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
  return NextResponse.json({ members: data }, { status: 200 });
}
