export function formatPercent(p: number) {
  if (p >= 10) return `${Math.round(p)}%`;
  return `${Math.round(p * 10) / 10}%`;
}

export function formatCents(c: number) {
  const v = Math.round(c * 10) / 10;
  return v % 1 === 0 ? `${v.toFixed(0)}¢` : `${v.toFixed(1)}¢`;
}

export function formatVolume(usd: number) {
  if (usd >= 1_000_000)
    return `${Math.round((usd / 1_000_000) * 10) / 10}m Vol.`;
  if (usd >= 1_000) return `${Math.round(usd / 100) / 10}k Vol.`;
  return `${Math.round(usd)} Vol.`;
}

export function formatDateRange(a: Date, b?: Date) {
  const m = a.toLocaleString("en-US", { month: "long" });
  if (!b || a.getDate() === b.getDate()) return `${m} ${a.getDate()}`;
  return `${m} ${a.getDate()}–${b.getDate()}`;
}
