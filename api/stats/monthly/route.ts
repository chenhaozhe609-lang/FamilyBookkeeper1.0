import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { FAMILY_COOKIE_NAME, getCurrentFamily } from "@/lib/family";

function parseIntParam(value: string | null) {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isInteger(n)) return null;
  return n;
}

function monthRangeUTC(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  return { start, end };
}

export async function GET(req: Request) {
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
  const url = new URL(req.url);
  const year = parseIntParam(url.searchParams.get("year"));
  const month = parseIntParam(url.searchParams.get("month"));
  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  const { start, end } = monthRangeUTC(year, month);
  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      familyId: ctx.family.id,
      occurredAt: { gte: start, lt: end },
    },
    _sum: { amount: true },
  });
  const income = grouped.find((g: { type: "INCOME" | "EXPENSE"; _sum: { amount: number | null } }) => g.type === "INCOME")?._sum.amount ?? 0;
  const expense = grouped.find((g: { type: "INCOME" | "EXPENSE"; _sum: { amount: number | null } }) => g.type === "EXPENSE")?._sum.amount ?? 0;
  const balance = income - expense;
  return NextResponse.json({ year, month, income, expense, balance }, { status: 200 });
}

