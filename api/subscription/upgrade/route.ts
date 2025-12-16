import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sub = await prisma.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, plan: "PRO", status: "ACTIVE" },
    update: { plan: "PRO", status: "ACTIVE" },
  });
  return NextResponse.json(
    {
      ok: true,
      subscription: { plan: sub.plan, status: sub.status },
      message: "升级成功，成员限制已解除",
    },
    { status: 200 },
  );
}
