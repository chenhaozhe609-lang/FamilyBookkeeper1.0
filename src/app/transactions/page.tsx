export const runtime = "nodejs";
import Sidebar from "@/components/Sidebar";
import Table from "@/components/ui/Table";
import Link from "next/link";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

type Transaction = {
  id: string;
  familyId: string;
  userId: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  currency: string;
  description?: string | null;
  occurredAt: string;
};

async function fetchTransactions(cookie: string): Promise<{ transactions: Transaction[] }> {
  const res = await fetch(`${BASE_URL}/api/transactions`, { cache: "no-store", headers: { cookie } });
  if (!res.ok) return { transactions: [] };
  return (await res.json()) as { transactions: Transaction[] };
}

export default async function TransactionsPage() {
  const cookie = (await cookies()).toString();
  const data = await fetchTransactions(cookie);
  const columns = [
    { key: "date", header: "Date", className: "w-32" },
    { key: "type", header: "Type", className: "w-24" },
    { key: "amount", header: "Amount", className: "w-32" },
    { key: "note", header: "Note" },
    { key: "user", header: "Created By", className: "w-40" },
  ];
  const rows = data.transactions.map((t) => {
    const dt = new Date(t.occurredAt);
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    const dateLabel = `${yyyy}-${mm}-${dd}`;
    const typeLabel = t.type === "INCOME" ? "Income" : "Expense";
    const typeClass = t.type === "INCOME" ? "text-green-600" : "text-red-600";
    const amountLabel = (t.amount / 100).toFixed(2) + " " + t.currency;
    return {
      date: dateLabel,
      type: <span className={typeClass}>{typeLabel}</span>,
      amount: amountLabel,
      note: t.description ?? "",
      user: t.userId,
    };
  });
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 py-8 flex">
        <Sidebar />
        <div className="flex-1 pl-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Transactions</h1>
            <Link href="/transactions/new" className="px-3 py-2 rounded-md text-sm bg-green-100 border">
              Add Transaction
            </Link>
          </div>
          <div className="mt-6">
            <Table columns={columns} rows={rows} />
          </div>
        </div>
      </main>
    </div>
  );
}
