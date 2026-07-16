export type Matrix = number[][]

export function createMatrix(rows: number, cols: number, value = 0): Matrix {
  return Array.from({ length: rows }, () => Array(cols).fill(value))
}

export function identity(size: number): Matrix {
  const matrix = createMatrix(size, size)
  for (let i = 0; i < size; i++) matrix[i][i] = 1
  return matrix
}

export function cloneMatrix(matrix: Matrix): Matrix {
  return matrix.map((row) => [...row])
}

export function addMatrices(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((value, j) => value + b[i][j]))
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix {
  const result = createMatrix(a.length, b[0].length)
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0
      for (let k = 0; k < b.length; k++) sum += a[i][k] * b[k][j]
      result[i][j] = sum
    }
  }
  return result
}

export function multiplyMatrixVector(matrix: Matrix, vector: number[]): number[] {
  return matrix.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0))
}

export function transpose(matrix: Matrix): Matrix {
  return matrix[0].map((_, col) => matrix.map((row) => row[col]))
}

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

export function extractSubmatrix(matrix: Matrix, rowIndices: number[], colIndices: number[]): Matrix {
  return rowIndices.map((row) => colIndices.map((col) => matrix[row][col]))
}

export function formatNumber(value: number, decimals = 4): string {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 1e-10) return '0'
  return value.toFixed(decimals)
}
