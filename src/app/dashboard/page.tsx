export const runtime = "nodejs";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import Sidebar from "@/components/Sidebar";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

async function fetchMonthly(year: number, month: number, cookie: string) {
  const res = await fetch(`${BASE_URL}/api/stats/monthly?year=${year}&month=${month}`, {
    cache: "no-store",
    headers: { cookie },
  });
  if (!res.ok) throw new Error("monthly_failed");
  return (await res.json()) as { year: number; month: number; income: number; expense: number; balance: number };
}

async function fetchTrend(cookie: string) {
  const res = await fetch(`${BASE_URL}/api/stats/trend`, { cache: "no-store", headers: { cookie } });
  if (!res.ok) throw new Error("trend_failed");
  return (await res.json()) as Array<{ year: number; month: number; income: number; expense: number }>;
}

export default async function DashboardPage() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const cookie = (await cookies()).toString();
  const familyRes = await fetch(`${BASE_URL}/api/family/current`, { cache: "no-store", headers: { cookie } });
  if (!familyRes.ok) {
    redirect("/");
  }
  const familyData = (await familyRes.json()) as { family: { id: string; name: string; currency: string } };
  const [monthly, trend] = await Promise.all([fetchMonthly(year, month, cookie), fetchTrend(cookie)]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 py-8 flex">
        <Sidebar />
        <div className="flex-1 pl-6">
          <header>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm opacity-70">
              {familyData.family.name} · {familyData.family.currency}
            </p>
          </header>
          <section className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card title="This Month Balance">
                <div className="text-3xl font-semibold">{(monthly.balance / 100).toFixed(2)} {familyData.family.currency}</div>
              </Card>
              <Card title="This Month Income">
                <div className="text-3xl font-semibold text-green-700">{(monthly.income / 100).toFixed(2)} {familyData.family.currency}</div>
              </Card>
              <Card title="This Month Expense">
                <div className="text-3xl font-semibold text-red-700">{(monthly.expense / 100).toFixed(2)} {familyData.family.currency}</div>
              </Card>
            </div>
          </section>
          <section className="mt-8">
            <Card title="Latest 5 Records">
              <ul className="grid gap-2">
                {trend.slice(-5).map((t, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="opacity-70">{t.year}-{String(t.month).padStart(2, "0")}</span>
                    <span className="text-green-700">Income {(t.income / 100).toFixed(2)}</span>
                    <span className="text-red-700">Expense {(t.expense / 100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
