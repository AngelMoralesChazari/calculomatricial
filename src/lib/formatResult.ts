export function formatResult(value: number): string {
  if (Math.abs(value) < 1e-10) return '0'
  return value.toFixed(4)
}
