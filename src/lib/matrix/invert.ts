import { identity, type Matrix } from './create'

export function invert(matrix: Matrix): number[][] {
  const size = matrix.length
  const augmented = matrix.map((row, i) => [...row, ...identity(size)[i]])

  for (let col = 0; col < size; col++) {
    let pivotRow = col
    for (let row = col + 1; row < size; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivotRow][col])) {
        pivotRow = row
      }
    }

    if (Math.abs(augmented[pivotRow][col]) < 1e-12) {
      throw new Error('La matriz es singular o mal condicionada. Revise la estructura y apoyos.')
    }

    if (pivotRow !== col) {
      ;[augmented[col], augmented[pivotRow]] = [augmented[pivotRow], augmented[col]]
    }

    const pivot = augmented[col][col]
    for (let j = 0; j < augmented[0].length; j++) augmented[col][j] /= pivot

    for (let row = 0; row < size; row++) {
      if (row === col) continue
      const factor = augmented[row][col]
      for (let j = 0; j < augmented[0].length; j++) {
        augmented[row][j] -= factor * augmented[col][j]
      }
    }
  }

  return augmented.map((row) => row.slice(size))
}
