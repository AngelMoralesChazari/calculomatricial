import { formatNumber } from '../lib/matrix/format'

interface MatrixDisplayProps {
  matrix: number[][]
  rowLabels?: string[]
  colLabels?: string[]
  name?: string
  equation?: string
  highlight?: boolean
}

/** Matriz estilo notación matemática: nombre = [ ... ] */
export function MatrixDisplay({
  matrix,
  rowLabels,
  colLabels,
  name,
  equation,
  highlight = false,
}: MatrixDisplayProps) {
  if (!matrix.length) return null

  return (
    <div
      className={`overflow-x-auto rounded-lg border p-4 ${
        highlight ? 'border-[#0a2540] bg-[#e8eef5]' : 'border-[#d0d7e2] bg-white'
      }`}
    >
      {equation && (
        <p className="mb-3 text-xs text-[#5a6a7e]">{equation}</p>
      )}

      {colLabels && (
        <div className="mb-1 flex items-center justify-center">
          {name && <span className="w-16 shrink-0 sm:w-20" />}
          <div className="flex">
            {rowLabels && <span className="w-8 shrink-0 sm:w-10" />}
            <div className="flex gap-0 px-1 sm:px-2">
              {colLabels.map((label) => (
                <span
                  key={label}
                  className="min-w-[4.5rem] text-center font-mono text-[10px] font-medium text-[#5a6a7e] sm:min-w-[5.5rem] sm:text-xs"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        {name && (
          <span className="w-16 shrink-0 text-right font-serif text-base italic text-[#0a2540] sm:w-20 sm:text-lg">
            {name}
            <span className="mx-1.5 not-italic font-sans">=</span>
          </span>
        )}

        <div className="flex items-stretch">
          <div className="w-2 shrink-0 border-y-2 border-l-2 border-[#0a2540] sm:w-2.5" aria-hidden />

          <div className="px-1 py-0.5 sm:px-2">
            {matrix.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center">
                {rowLabels && (
                  <span className="mr-1 w-8 shrink-0 text-right font-mono text-[10px] text-[#5a6a7e] sm:w-10 sm:text-xs">
                    {rowLabels[rowIndex]}
                  </span>
                )}
                {row.map((value, colIndex) => (
                  <span
                    key={colIndex}
                    className="min-w-[4.5rem] px-1 py-1.5 text-center font-mono text-xs tabular-nums text-[#0a2540] sm:min-w-[5.5rem] sm:text-sm"
                  >
                    {formatNumber(value)}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="w-2 shrink-0 border-y-2 border-r-2 border-[#0a2540] sm:w-2.5" aria-hidden />
        </div>
      </div>
    </div>
  )
}

interface VectorDisplayProps {
  vector: number[]
  labels?: string[]
  name?: string
  equation?: string
  highlight?: boolean
  unit?: string
}

/** Vector columna estilo notación matemática */
export function VectorDisplay({
  vector,
  labels,
  name,
  equation,
  highlight = false,
  unit,
}: VectorDisplayProps) {
  if (!vector.length) return null

  return (
    <div
      className={`overflow-x-auto rounded-lg border p-4 ${
        highlight ? 'border-[#0a2540] bg-[#e8eef5]' : 'border-[#d0d7e2] bg-white'
      }`}
    >
      {(equation || unit) && (
        <p className="mb-3 text-xs text-[#5a6a7e]">
          {equation}
          {unit && <span className="ml-1">[{unit}]</span>}
        </p>
      )}

      <div className="flex items-center justify-center gap-2">
        {name && (
          <span className="shrink-0 font-serif text-base italic text-[#0a2540] sm:text-lg">
            {name}
            <span className="mx-1.5 not-italic font-sans">=</span>
          </span>
        )}

        <div className="flex items-stretch">
          <div className="w-2 shrink-0 border-y-2 border-l-2 border-[#0a2540] sm:w-2.5" aria-hidden />

          <div className="px-2 py-0.5">
            {vector.map((value, index) => (
              <div key={index} className="flex items-center justify-end gap-3 py-1.5">
                {labels && (
                  <span className="w-12 text-right font-mono text-[10px] text-[#5a6a7e] sm:w-14 sm:text-xs">
                    {labels[index]}
                  </span>
                )}
                <span className="min-w-[5rem] text-right font-mono text-xs tabular-nums text-[#0a2540] sm:text-sm">
                  {formatNumber(value)}
                </span>
              </div>
            ))}
          </div>

          <div className="w-2 shrink-0 border-y-2 border-r-2 border-[#0a2540] sm:w-2.5" aria-hidden />
        </div>
      </div>
    </div>
  )
}
