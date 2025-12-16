export function formatCurrency(amount: number, currency: string, locale = "zh-CN") {
  const value = amount / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

