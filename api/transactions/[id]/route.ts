import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { FAMILY_COOKIE_NAME, getCurrentFamily } from "@/lib/family";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await cookies();
  const cookieFamilyId = store.get(FAMILY_COOKIE_NAME)?.value;
  if (!cookieFamilyId) {
    return NextResponse.json({ error: "Family Not Selected" }, { status: 400 });
  }
  const ctx = await getCurrentFamily();
  if (!ctx) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  const tx = await prisma.transaction.findFirst({
    where: { id, familyId: ctx.family.id },
  });
  if (!tx) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  const canDelete = tx.userId === user.id || ctx.membership.role === "OWNER";
  if (!canDelete) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.transaction.delete({ where: { id: tx.id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
