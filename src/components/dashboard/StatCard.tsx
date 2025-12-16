"use client";
import { formatCurrency } from "@/lib/format";

type Props = {
  title: string;
  amount: number;
  currency: string;
  variant: "income" | "expense" | "balance";
};

export default function StatCard({ title, amount, currency, variant }: Props) {
  const color =
    variant === "income"
      ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-green-800"
      : variant === "expense"
        ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800"
        : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  return (
    <div className={`rounded-xl border ${color} p-4`}>
      <div className="text-sm opacity-80">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{formatCurrency(amount, currency)}</div>
    </div>
  );
}

