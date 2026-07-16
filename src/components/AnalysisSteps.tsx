import type { AnalysisResult } from '../types/structure'
import { MatrixDisplay, VectorDisplay } from './MatrixDisplay'
import { units } from '../data/examples'

interface AnalysisStepsProps {
  result: AnalysisResult
}

const steps = [
  {
    title: '1. Idealización de la estructura',
    description:
      'Se numeran nodos y elementos. Cada nodo tiene un grado de libertad rotacional (θ). Los apoyos empotrados restringen esa rotación.',
  },
  {
    title: '2. Matrices de rigidez de cada elemento',
    description: 'Para cada viga: k = (EI/L) · [[4, 2], [2, 4]]',
  },
  {
    title: '3. Ensamblaje de la matriz de rigidez global',
    description: 'Se superponen las contribuciones de cada elemento según sus nodos de conexión.',
  },
  {
    title: '4. Matriz de cargas del sistema',
    description: 'F = cargas nodales − fuerzas de empotramiento perfecto (FEMP).',
  },
  {
    title: '5. Inversión de la submatriz Kdd',
    description: 'Se invierte la submatriz asociada a los grados de libertad libres.',
  },
  {
    title: '6. Desplazamientos nodales',
    description: '[Dd] = [Kdd]⁻¹ · [Fd]',
  },
  {
    title: '7. Reacciones en apoyos',
    description: '[FR] = [Krd] · [Dd] + [Frd]',
  },
  {
    title: '8. Fuerzas internas en elementos',
    description: '[Pi] = [ki] · [Di] + [Pemp] para cada elemento.',
  },
]

export function AnalysisSteps({ result }: AnalysisStepsProps) {
  const freeLabels = result.freeDofIndices.map((i) => result.dofLabels[i])
  const restrainedLabels = result.restrainedDofIndices.map((i) => result.dofLabels[i])

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <section
          key={step.title}
          className="rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-sm font-bold text-cyan-400">
              {index + 1}
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{step.description}</p>
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
                  <div key={item.elementId} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                    <p className="mb-2 text-xs text-slate-400">Elemento {item.elementId}</p>
                    <p className="font-mono text-sm text-pink-300">
                      [{format(item.forces[0])}, {format(item.forces[1])}] {units.moment}
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
                <p className="text-sm text-slate-400">No hay grados de libertad restringidos.</p>
              )}
            </div>
          )}

          {index === 7 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-slate-400">
                    <th className="p-2">Elemento</th>
                    <th className="p-2">Mi ({units.moment})</th>
                    <th className="p-2">Mj ({units.moment})</th>
                    <th className="p-2">Cortante ({units.shear})</th>
                  </tr>
                </thead>
                <tbody>
                  {result.elementForces.map((item) => (
                    <tr key={item.elementId} className="border-b border-slate-800 font-mono text-slate-200">
                      <td className="p-2 text-cyan-400">E{item.elementId}</td>
                      <td className="p-2">{format(item.momentI)}</td>
                      <td className="p-2">{format(item.momentJ)}</td>
                      <td className="p-2">{format(item.shear)}</td>
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

function format(value: number) {
  if (Math.abs(value) < 1e-10) return '0'
  return value.toFixed(4)
}
