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
