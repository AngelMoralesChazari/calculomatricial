import type { AnalysisResult } from '../types/structure'
import { MatrixDisplay, VectorDisplay } from './MatrixDisplay'
import { units } from '../data/units'
import { analysisSteps } from '../data/analysisSteps'
import { formatResult } from '../lib/formatResult'

interface AnalysisStepsProps {
  result: AnalysisResult
}

export function AnalysisSteps({ result }: AnalysisStepsProps) {
  const freeLabels = result.freeDofIndices.map((i) => result.dofLabels[i])
  const restrainedLabels = result.restrainedDofIndices.map((i) => result.dofLabels[i])

  return (
    <div className="space-y-6">
      {analysisSteps.map((step, index) => (
        <section key={step.title} className="rounded-lg border border-[#d0d7e2] bg-white p-5">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0a2540] text-sm font-bold text-white">
              {index + 1}
            </span>
            <div>
              <h3 className="text-base font-semibold text-[#0a2540]">{step.title}</h3>
              <p className="mt-1 text-sm text-[#5a6a7e]">{step.description}</p>
            </div>
          </div>

          {index === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              {result.elementStiffness.map((item) => (
                <MatrixDisplay
                  key={item.elementId}
                  title={`k${item.elementId} (elemento ${item.elementId})`}
                  matrix={item.matrix}
                  rowLabels={['θi', 'θj']}
                  colLabels={['θi', 'θj']}
                />
              ))}
            </div>
          )}

          {index === 2 && (
            <MatrixDisplay
              title="KTG — Matriz de rigidez global"
              matrix={result.globalStiffness}
              rowLabels={result.dofLabels}
              colLabels={result.dofLabels}
              highlight
            />
          )}

          {index === 3 && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.fixedEndForces.map((item) => (
                  <div key={item.elementId} className="rounded-md border border-[#d0d7e2] bg-[#f4f6f9] p-3">
                    <p className="mb-2 text-xs text-[#5a6a7e]">Elemento {item.elementId}</p>
                    <p className="font-mono text-sm text-[#0a2540]">
                      [{formatResult(item.forces[0])}, {formatResult(item.forces[1])}] {units.moment}
                    </p>
                  </div>
                ))}
              </div>
              <VectorDisplay
                title="F — Vector de cargas global"
                vector={result.loadVector}
                labels={result.dofLabels}
              />
            </div>
          )}

          {index === 4 && (
            <div className="space-y-4">
              <MatrixDisplay
                title="Kdd (libres × libres)"
                matrix={result.partitioned.Kdd}
                rowLabels={freeLabels}
                colLabels={freeLabels}
                highlight
              />
              <MatrixDisplay
                title="[Kdd]⁻¹"
                matrix={result.KddInverse}
                rowLabels={freeLabels}
                colLabels={freeLabels}
              />
            </div>
          )}

          {index === 5 && (
            <div className="space-y-3">
              <VectorDisplay title="[Fd]" vector={result.partitioned.Fd} labels={freeLabels} />
              <VectorDisplay
                title={`[Dd] — Rotaciones (${units.rotation})`}
                vector={result.freeDisplacements}
                labels={freeLabels}
                highlight
              />
            </div>
          )}

          {index === 6 && (
            <div className="space-y-3">
              {result.restrainedDofIndices.length > 0 ? (
                <VectorDisplay
                  title={`[FR] — Momentos de reacción (${units.moment})`}
                  vector={result.reactions}
                  labels={restrainedLabels}
                  highlight
                />
              ) : (
                <p className="text-sm text-[#5a6a7e]">No hay grados de libertad restringidos.</p>
              )}
            </div>
          )}

          {index === 7 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-[#d0d7e2] text-left text-[#5a6a7e]">
                    <th className="p-2">Elemento</th>
                    <th className="p-2">Mi ({units.moment})</th>
                    <th className="p-2">Mj ({units.moment})</th>
                    <th className="p-2">Cortante ({units.shear})</th>
                  </tr>
                </thead>
                <tbody>
                  {result.elementForces.map((item) => (
                    <tr key={item.elementId} className="border-b border-[#e2e8f0] font-mono text-[#0a2540]">
                      <td className="p-2 font-semibold text-[#1a3a5c]">E{item.elementId}</td>
                      <td className="p-2">{formatResult(item.momentI)}</td>
                      <td className="p-2">{formatResult(item.momentJ)}</td>
                      <td className="p-2">{formatResult(item.shear)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
