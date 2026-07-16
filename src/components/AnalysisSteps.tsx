import type { AnalysisResult, StructureModel } from '../types/structure'
import { MatrixDisplay, VectorDisplay } from './MatrixDisplay'
import { units } from '../data/units'
import { analysisSteps } from '../data/analysisSteps'
import { formatResult } from '../lib/formatResult'

interface AnalysisStepsProps {
  result: AnalysisResult
  model: StructureModel
}

export function AnalysisSteps({ result, model }: AnalysisStepsProps) {
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
              <h3 className="text-base font-semibold text-[#0a2540]">
                Paso {index + 1}: {step.title}
              </h3>
              <p className="mt-1 text-sm text-[#5a6a7e]">{step.description}</p>
            </div>
          </div>

          {/* Paso 1 — Datos de entrada */}
          {index === 0 && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5a6a7e]">
                  Conectividad (conn) y propiedades
                </p>
                <table className="w-full min-w-max text-sm">
                  <thead>
                    <tr className="border-b border-[#d0d7e2] text-left text-[#5a6a7e]">
                      <th className="p-2">Elem.</th>
                      <th className="p-2">Nodo i</th>
                      <th className="p-2">Nodo j</th>
                      <th className="p-2">E ({units.E})</th>
                      <th className="p-2">I ({units.I})</th>
                      <th className="p-2">L ({units.L})</th>
                      <th className="p-2">G.L. locales → globales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.elements.map((el) => {
                      const ni = model.nodes.find((n) => n.id === el.nodeI)
                      const nj = model.nodes.find((n) => n.id === el.nodeJ)
                      return (
                        <tr key={el.id} className="border-b border-[#e2e8f0] font-mono text-[#0a2540]">
                          <td className="p-2 font-semibold">E{el.id}</td>
                          <td className="p-2">{ni?.label ?? el.nodeI}</td>
                          <td className="p-2">{nj?.label ?? el.nodeJ}</td>
                          <td className="p-2">{el.E}</td>
                          <td className="p-2">{el.I}</td>
                          <td className="p-2">{el.L}</td>
                          <td className="p-2 text-xs">
                            θ{ni?.label} , θ{nj?.label}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="rounded-md border border-[#d0d7e2] bg-[#f4f6f9] p-3 text-sm text-[#5a6a7e]">
                <p>
                  <strong className="text-[#0a2540]">G.L. libres:</strong>{' '}
                  {freeLabels.join(', ') || '—'}
                </p>
                <p className="mt-1">
                  <strong className="text-[#0a2540]">G.L. restringidos (apoyos):</strong>{' '}
                  {restrainedLabels.join(', ') || '—'}
                </p>
                <p className="mt-1">
                  <strong className="text-[#0a2540]">Cargas en barras:</strong>{' '}
                  {model.elementLoads.length === 0
                    ? 'ninguna'
                    : model.elementLoads
                        .map((l) =>
                          l.type === 'udl'
                            ? `E${l.elementId}: w=${l.value} ${units.udl}`
                            : `E${l.elementId}: P=${l.value} ${units.point}`,
                        )
                        .join(' · ')}
                </p>
              </div>
            </div>
          )}

          {/* Paso 2 — Matrices locales */}
          {index === 1 && (
            <div className="space-y-4">
              <p className="font-mono text-sm text-[#5a6a7e]">
                k<sub>i</sub> = (EI/L) · [[4, 2], [2, 4]]
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                {result.elementStiffness.map((item) => {
                  const labelI = result.dofLabels[item.dofI]
                  const labelJ = result.dofLabels[item.dofJ]
                  return (
                    <div key={item.elementId} className="space-y-2">
                      <p className="text-xs text-[#5a6a7e]">
                        Elemento {item.elementId}: nodos {item.nodeI}→{item.nodeJ} · mapeo [{labelI}, {labelJ}] ·
                        EI/L = {formatResult((item.E * item.I) / item.L)}
                      </p>
                      <MatrixDisplay
                        name={`k${item.elementId}`}
                        equation={`→ G.L. ${labelI}, ${labelJ}`}
                        matrix={item.matrix}
                        rowLabels={[labelI, labelJ]}
                        colLabels={[labelI, labelJ]}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Paso 3 — Fki (FEMP) */}
          {index === 2 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.fixedEndForces.map((item) => {
                const el = result.elementStiffness.find((e) => e.elementId === item.elementId)
                const labelI = el ? result.dofLabels[el.dofI] : 'θi'
                const labelJ = el ? result.dofLabels[el.dofJ] : 'θj'
                return (
                  <VectorDisplay
                    key={item.elementId}
                    name={`Fki⁽${item.elementId}⁾`}
                    equation="empotramiento perfecto"
                    vector={[...item.forces]}
                    labels={[labelI, labelJ]}
                    unit={units.moment}
                  />
                )
              })}
            </div>
          )}

          {/* Paso 4 — Vector Fk */}
          {index === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[#5a6a7e]">
                F<sub>k</sub> = cargas nodales − F<sub>ki</sub> (solo G.L. libres alimentan el sistema)
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <VectorDisplay
                  name="Fk (global)"
                  equation="todos los G.L."
                  vector={result.loadVector}
                  labels={result.dofLabels}
                  unit={units.moment}
                />
                <VectorDisplay
                  name="Fk"
                  equation="G.L. libres"
                  vector={result.partitioned.Fd}
                  labels={freeLabels}
                  unit={units.moment}
                  highlight
                />
              </div>
            </div>
          )}

          {/* Paso 5 — Ensamble K11 + inversa (matriz global aquí) */}
          {index === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-[#5a6a7e]">
                Se crea una matriz vacía N×N y se suman las contribuciones de cada k<sub>i</sub> en las posiciones
                de sus G.L. globales. Luego se particiona: K<sub>11</sub> = K<sub>dd</sub> (libres).
              </p>
              <MatrixDisplay
                name="KTG"
                equation="matriz de rigidez global ensamblada (N×N)"
                matrix={result.globalStiffness}
                rowLabels={result.dofLabels}
                colLabels={result.dofLabels}
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <MatrixDisplay
                  name="K₁₁"
                  equation="= Kdd (G.L. libres)"
                  matrix={result.partitioned.Kdd}
                  rowLabels={freeLabels}
                  colLabels={freeLabels}
                  highlight
                />
                <MatrixDisplay
                  name="K₁₁⁻¹"
                  equation="inversa de K₁₁"
                  matrix={result.KddInverse}
                  rowLabels={freeLabels}
                  colLabels={freeLabels}
                  highlight
                />
              </div>
              {(result.partitioned.Krd.length > 0 || result.partitioned.Krr.length > 0) && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {result.partitioned.Krd.length > 0 && (
                    <MatrixDisplay
                      name="Krd"
                      equation="reacciones ↔ desplazamientos libres"
                      matrix={result.partitioned.Krd}
                      rowLabels={restrainedLabels}
                      colLabels={freeLabels}
                    />
                  )}
                  {result.partitioned.Krr.length > 0 && (
                    <MatrixDisplay
                      name="Krr"
                      equation="submatriz de apoyos"
                      matrix={result.partitioned.Krr}
                      rowLabels={restrainedLabels}
                      colLabels={restrainedLabels}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Paso 6 — Desplazamientos */}
          {index === 5 && (
            <div className="space-y-4">
              <p className="font-mono text-sm text-[#5a6a7e]">D = K₁₁⁻¹ · Fk</p>
              <div className="grid gap-4 md:grid-cols-2">
                <VectorDisplay
                  name="Fk"
                  vector={result.partitioned.Fd}
                  labels={freeLabels}
                  unit={units.moment}
                />
                <VectorDisplay
                  name="D"
                  equation="giros nodales"
                  vector={result.freeDisplacements}
                  labels={freeLabels}
                  unit={units.rotation}
                  highlight
                />
              </div>
            </div>
          )}

          {/* Paso 7 — Fuerzas internas + reacciones */}
          {index === 6 && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 font-mono text-sm text-[#5a6a7e]">
                  Fi = ki · Di + Fki
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {result.elementForces.map((item) => {
                    const el = result.elementStiffness.find((e) => e.elementId === item.elementId)
                    const labelI = el ? result.dofLabels[el.dofI] : 'θi'
                    const labelJ = el ? result.dofLabels[el.dofJ] : 'θj'
                    return (
                      <div key={item.elementId} className="space-y-2">
                        <VectorDisplay
                          name={`F${item.elementId}`}
                          equation={`elemento ${item.elementId}`}
                          vector={[item.momentI, item.momentJ]}
                          labels={[`M (${labelI})`, `M (${labelJ})`]}
                          unit={units.moment}
                          highlight
                        />
                        <p className="text-center font-mono text-xs text-[#5a6a7e]">
                          V = (Mi + Mj)/L = {formatResult(item.shear)} {units.shear}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {result.restrainedDofIndices.length > 0 && (
                <div>
                  <p className="mb-3 font-mono text-sm text-[#5a6a7e]">
                    FR = Krd · Dd + Frd
                  </p>
                  <VectorDisplay
                    name="FR"
                    equation="momentos de reacción en apoyos"
                    vector={result.reactions}
                    labels={restrainedLabels}
                    unit={units.moment}
                    highlight
                  />
                </div>
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
