function startOfDayUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function addDaysUTC(date: Date, days: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days, 0, 0, 0, 0));
}

export function lastWeekRangeUTC(now: Date = new Date()) {
  const startCurrentWeek = (() => {
    const d = startOfDayUTC(now);
    const dow = d.getUTCDay();
    const offset = (dow + 6) % 7;
    return addDaysUTC(d, -offset);
  })();
  const start = addDaysUTC(startCurrentWeek, -7);
  const end = addDaysUTC(start, 7);
  return { start, end };
}

export function buildWeeklyEmail(familyName: string, currency: string, income: number, expense: number, balance: number, count: number) {
  const title = "Your last week summary";
  const lines = [
    familyName,
    `Total expense last week: ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(expense / 100)}`,
    `Total income last week: ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(income / 100)}`,
    `Balance last week: ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(balance / 100)}`,
    `Total records: ${count}`,
    `View full ledger → https://yourproduct.com/dashboard`,
  ];
  const text = [title, "", ...lines].join("\n");
  return { subject: title, text };
}
