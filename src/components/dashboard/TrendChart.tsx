"use client";
import { formatCurrency } from "@/lib/format";

type Point = { year: number; month: number; income: number; expense: number };
type Props = { data: Point[]; currency: string };

export default function TrendChart({ data, currency }: Props) {
  const max = Math.max(
    0,
    ...data.map((d) => Math.max(d.income, d.expense)),
  );
  const safeMax = max === 0 ? 1 : max;
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/15 p-4">
      <div className="text-sm font-medium opacity-80">Recent Trend</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs opacity-70">
        <div>Income</div>
        <div>Expense</div>
      </div>
      <div className="mt-4 grid grid-cols-12 gap-3 items-end">
        {data.map((d, idx) => {
          const incomeH = Math.round((d.income / safeMax) * 120);
          const expenseH = Math.round((d.expense / safeMax) * 120);
          const label = `${d.year}-${String(d.month).padStart(2, "0")}`;
          return (
            <div key={idx} className="flex flex-col items-center">
              <div className="flex gap-1 items-end h-[140px]">
                <div
                  className="w-3 rounded bg-green-500/80"
                  style={{ height: `${incomeH}px` }}
                  title={`Income ${formatCurrency(d.income, currency)}`}
                />
                <div
                  className="w-3 rounded bg-red-500/80"
                  style={{ height: `${expenseH}px` }}
                  title={`Expense ${formatCurrency(d.expense, currency)}`}
                />
              </div>
              <div className="mt-2 text-[10px] opacity-70">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
