import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { FAMILY_COOKIE_NAME, getCurrentFamily } from "@/lib/family";

function clampMonths(n: number | null) {
  const d = !n || n < 1 ? 6 : n;
  return Math.min(12, d);
}

function monthStartUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
}

function addMonthsUTC(date: Date, delta: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1, 0, 0, 0, 0));
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
  const monthsParam = url.searchParams.get("months");
  const months = clampMonths(monthsParam ? Number(monthsParam) : null);
  const now = new Date();
  const currentStart = monthStartUTC(now);
  const result: Array<{ year: number; month: number; income: number; expense: number }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = addMonthsUTC(currentStart, -i);
    const end = addMonthsUTC(start, 1);
    const grouped = await prisma.transaction.groupBy({
      by: ["type"],
      where: { familyId: ctx.family.id, occurredAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    const income = grouped.find((g) => g.type === "INCOME")?._sum.amount ?? 0;
    const expense = grouped.find((g) => g.type === "EXPENSE")?._sum.amount ?? 0;
    result.push({
      year: start.getUTCFullYear(),
      month: start.getUTCMonth() + 1,
      income,
      expense,
    });
  }

  return NextResponse.json(result, { status: 200 });
}

