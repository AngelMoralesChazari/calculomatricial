import type { StructureModel } from '../types/structure'

interface BeamDiagramProps {
  model: StructureModel
}

export function BeamDiagram({ model }: BeamDiagramProps) {
  const sortedNodes = [...model.nodes]
  const positions = new Map<number, number>()
  let x = 40

  for (const element of model.elements) {
    if (!positions.has(element.nodeI)) {
      positions.set(element.nodeI, x)
      x += 80
    }
    if (!positions.has(element.nodeJ)) {
      const start = positions.get(element.nodeI) ?? x
      positions.set(element.nodeJ, start + element.L * 30)
    }
  }

  const maxX = Math.max(...positions.values(), 200) + 40
  const y = 80

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-300">Idealización de la estructura</h3>
      <svg viewBox={`0 0 ${maxX} 160`} className="h-40 w-full">
        {model.elements.map((element) => {
          const x1 = positions.get(element.nodeI) ?? 0
          const x2 = positions.get(element.nodeJ) ?? 0
          const mid = (x1 + x2) / 2
          const loads = model.elementLoads.filter((load) => load.elementId === element.id)

          return (
            <g key={element.id}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <text x={mid} y={y + 28} textAnchor="middle" fill="#94a3b8" fontSize="11">
                E{element.id} · L={element.L}m
              </text>
              {loads.map((load, index) => (
                <g key={load.id}>
                  {load.type === 'udl' ? (
                    <>
                      <line x1={x1 + 8} y1={y - 30 - index * 8} x2={x2 - 8} y2={y - 30 - index * 8} stroke="#f472b6" strokeWidth="1.5" />
                      {Array.from({ length: 6 }).map((_, i) => {
                        const px = x1 + 8 + ((x2 - x1 - 16) * i) / 5
                        return (
                          <line
                            key={i}
                            x1={px}
                            y1={y - 30 - index * 8}
                            x2={px}
                            y2={y - 10 - index * 8}
                            stroke="#f472b6"
                            strokeWidth="1.5"
                          />
                        )
                      })}
                      <text x={mid} y={y - 38 - index * 8} textAnchor="middle" fill="#f9a8d4" fontSize="10">
                        w={load.value} kN/m
                      </text>
                    </>
                  ) : (
                    <>
                      <line
                        x1={x1 + (load.position ?? 0) * 30}
                        y1={y - 35}
                        x2={x1 + (load.position ?? 0) * 30}
                        y2={y - 10}
                        stroke="#fb7185"
                        strokeWidth="2"
                      />
                      <polygon
                        points={`${x1 + (load.position ?? 0) * 30},${y - 8} ${x1 + (load.position ?? 0) * 30 - 5},${y - 14} ${x1 + (load.position ?? 0) * 30 + 5},${y - 14}`}
                        fill="#fb7185"
                      />
                      <text
                        x={x1 + (load.position ?? 0) * 30}
                        y={y - 42}
                        textAnchor="middle"
                        fill="#fda4af"
                        fontSize="10"
                      >
                        P={load.value} kN
                      </text>
                    </>
                  )}
                </g>
              ))}
            </g>
          )
        })}

        {sortedNodes.map((node) => {
          const px = positions.get(node.id) ?? 0
          return (
            <g key={node.id}>
              {node.restrained ? (
                <polygon points={`${px},${y + 6} ${px - 10},${y + 22} ${px + 10},${y + 22}`} fill="#22d3ee" />
              ) : (
                <circle cx={px} cy={y} r="6" fill="#0ea5e9" stroke="#e2e8f0" strokeWidth="2" />
              )}
              <text x={px} y={y - 16} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="600">
                N{node.label}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mt-2 text-xs text-slate-500">
        Triángulos = apoyos empotrados (rotación restringida). Círculos = nodos libres (θ desconocida).
      </p>
    </div>
  )
}
