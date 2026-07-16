import { formatNumber } from '../lib/matrix/format'

interface MatrixDisplayProps {
  matrix: number[][]
  rowLabels?: string[]
  colLabels?: string[]
  title?: string
  highlight?: boolean
}

export function MatrixDisplay({
  matrix,
  rowLabels,
  colLabels,
  title,
  highlight = false,
}: MatrixDisplayProps) {
  if (!matrix.length) return null

  return (
    <div className={`overflow-x-auto rounded-xl border ${highlight ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-slate-700 bg-slate-900/60'}`}>
      {title && (
        <div className="border-b border-slate-700 px-4 py-2 text-sm font-medium text-slate-300">
          {title}
        </div>
      )}
      <table className="w-full min-w-max font-mono text-xs sm:text-sm">
        <thead>
          <tr>
            <th className="p-2" />
            {(colLabels ?? matrix[0].map((_, i) => `c${i + 1}`)).map((label) => (
              <th key={label} className="p-2 text-center font-medium text-cyan-400">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-800">
              <th className="p-2 text-left font-medium text-cyan-400">
                {rowLabels?.[rowIndex] ?? `f${rowIndex + 1}`}
              </th>
              {row.map((value, colIndex) => (
                <td key={colIndex} className="p-2 text-center text-slate-200">
                  {formatNumber(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface VectorDisplayProps {
  vector: number[]
  labels?: string[]
  title?: string
  highlight?: boolean
}

export function VectorDisplay({ vector, labels, title, highlight = false }: VectorDisplayProps) {
  return (
    <div className={`overflow-x-auto rounded-xl border ${highlight ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-slate-700 bg-slate-900/60'}`}>
      {title && (
        <div className="border-b border-slate-700 px-4 py-2 text-sm font-medium text-slate-300">
          {title}
        </div>
      )}
      <table className="w-full font-mono text-xs sm:text-sm">
        <thead>
          <tr>
            {vector.map((_, index) => (
              <th key={index} className="p-2 text-center font-medium text-cyan-400">
                {labels?.[index] ?? `v${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {vector.map((value, index) => (
              <td key={index} className="p-2 text-center text-slate-200">
                {formatNumber(value)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
