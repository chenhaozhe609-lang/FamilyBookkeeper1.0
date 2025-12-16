import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lastWeekRangeUTC, buildWeeklyEmail } from "@/lib/weekly";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const { start, end } = lastWeekRangeUTC(new Date());
  const families = await prisma.family.findMany({
    select: { id: true, name: true, currency: true },
  });
  let processed = 0;
  let emailsSent = 0;
  for (const fam of families) {
    const grouped = await prisma.transaction.groupBy({
      by: ["type"],
      where: { familyId: fam.id, occurredAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    const count = await prisma.transaction.count({
      where: { familyId: fam.id, occurredAt: { gte: start, lt: end } },
    });
    if (count === 0) continue;
    const income = grouped.find((g: { type: "INCOME" | "EXPENSE"; _sum: { amount: number | null } }) => g.type === "INCOME")?._sum.amount ?? 0;
    const expense = grouped.find((g: { type: "INCOME" | "EXPENSE"; _sum: { amount: number | null } }) => g.type === "EXPENSE")?._sum.amount ?? 0;
    const balance = income - expense;
    const members = await prisma.membership.findMany({
      where: { familyId: fam.id },
      include: { user: { select: { email: true } } },
    });
    const recipients = members
      .map((m: { user: { email: string } }) => m.user.email)
      .filter((e) => typeof e === "string" && e.length > 0);
    const { subject, text } = buildWeeklyEmail(fam.name, fam.currency, income, expense, balance, count);
    for (const to of recipients) {
      await sendEmail(to, subject, text);
      emailsSent += 1;
    }
    processed += 1;
  }
  return NextResponse.json(
    {
      ok: true,
      week: { start, end },
      familiesProcessed: processed,
      emailsSent,
    },
    { status: 200 },
  );
}
