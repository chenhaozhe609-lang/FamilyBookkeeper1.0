import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { FAMILY_COOKIE_NAME, getCurrentFamily } from "@/lib/family";

function isValidType(v: unknown) {
  return v === "EXPENSE" || v === "INCOME";
}

function isValidInt(n: unknown) {
  return typeof n === "number" && Number.isInteger(n);
}

function parseDate(d: unknown) {
  if (typeof d !== "string") return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

export async function POST(req: Request) {
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
  const body = await req.json().catch(() => null);
  if (
    !body ||
    !isValidType(body.type) ||
    !isValidInt(body.amount) ||
    typeof body.currency !== "string" ||
    body.currency.length === 0
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  const occurredAt = parseDate(body.occurredAt);
  if (!occurredAt) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  const description = typeof body.note === "string" && body.note.length > 0 ? body.note : undefined;
  const tx = await prisma.transaction.create({
    data: {
      familyId: ctx.family.id,
      userId: user.id,
      type: body.type,
      amount: body.amount,
      currency: body.currency,
      description,
      occurredAt,
    },
  });
  return NextResponse.json(tx, { status: 201 });
}

export async function GET() {
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
  const rows = await prisma.transaction.findMany({
    where: { familyId: ctx.family.id },
    orderBy: { occurredAt: "desc" },
  });
  return NextResponse.json({ transactions: rows }, { status: 200 });
}

