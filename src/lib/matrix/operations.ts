import { createMatrix, type Matrix } from './create'

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

export function extractSubmatrix(matrix: Matrix, rowIndices: number[], colIndices: number[]): Matrix {
  return rowIndices.map((row) => colIndices.map((col) => matrix[row][col]))
}
