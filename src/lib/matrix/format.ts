export function formatNumber(value: number, decimals = 4): string {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 1e-10) return '0'
  return value.toFixed(decimals)
}
