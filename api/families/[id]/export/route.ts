import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function formatDate(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateTime(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

function csvEscape(v: string) {
  const needsQuote = /[",\n]/.test(v);
  const s = v.replace(/"/g, '""');
  return needsQuote ? `"${s}"` : s;
}

function toCsv(headers: string[], rows: string[][]) {
  const bom = "\uFEFF";
  const lines = [headers.map(csvEscape).join(","), ...rows.map((r) => r.map(csvEscape).join(","))];
  return bom + lines.join("\n");
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
  const txs = await prisma.transaction.findMany({
    where: { familyId: id },
    orderBy: { occurredAt: "asc" },
    include: { user: { select: { name: true } } },
  });
  const headers = ["Date", "Type", "Amount", "Note", "Creator Name", "Created At"];
  const rows = txs.map((t: { type: "INCOME" | "EXPENSE"; amount: number; description?: string | null; user?: { name?: string | null }; occurredAt: Date; createdAt: Date }) => {
    const type = t.type === "INCOME" ? "income" : "expense";
    const amount = (t.amount / 100).toFixed(2);
    const note = t.description ?? "";
    const creator = t.user?.name ?? "";
    return [formatDate(t.occurredAt), type, amount, note, creator, formatDateTime(t.createdAt)];
  });
  const csv = toCsv(headers, rows);
  const filename = `family-${id}-transactions.csv`;
  const res = new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
  return res;
}
