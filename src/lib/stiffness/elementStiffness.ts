export function elementStiffnessMatrix(E: number, I: number, L: number): number[][] {
  const factor = (E * I) / L
  return [
    [4 * factor, 2 * factor],
    [2 * factor, 4 * factor],
  ]
}
