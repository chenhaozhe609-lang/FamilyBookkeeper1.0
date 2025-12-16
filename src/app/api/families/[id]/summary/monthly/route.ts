import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function monthRangeUTC(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start, end };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, familyId: id },
    select: { id: true },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { start, end } = monthRangeUTC(new Date());
  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: { familyId: id, occurredAt: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  const income = grouped.find((g: { type: "INCOME" | "EXPENSE"; _sum: { amount: number | null } }) => g.type === "INCOME")?._sum.amount ?? 0;
  const expense = grouped.find((g: { type: "INCOME" | "EXPENSE"; _sum: { amount: number | null } }) => g.type === "EXPENSE")?._sum.amount ?? 0;
  const balance = income - expense;
  const count = await prisma.transaction.count({
    where: { familyId: id, occurredAt: { gte: start, lt: end } },
  });
  return NextResponse.json(
    { month: { start, end }, income, expense, balance, count },
    { status: 200 },
  );
}
