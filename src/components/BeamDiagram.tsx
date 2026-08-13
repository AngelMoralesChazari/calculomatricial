import type { StructureModel, SupportType } from '../types/structure'
import { units } from '../data/units'

interface BeamDiagramProps {
  model: StructureModel
  /** Píxeles de dibujo por metro de viga */
  scale?: number
  /** Alto del lienzo dentro del contenedor */
  heightClass?: string
}

const NAVY = '#0a2540'
const NAVY_LIGHT = '#1a3a5c'
const NAVY_MUTED = '#3d5a80'
const MUTED = '#5a6a7e'

export function BeamDiagram({ model, scale = 55, heightClass = 'h-72 sm:h-80' }: BeamDiagramProps) {
  const margin = 56
  const positions = new Map<number, number>()
  let cursor = margin

  for (const element of model.elements) {
    if (!positions.has(element.nodeI)) positions.set(element.nodeI, cursor)
    const start = positions.get(element.nodeI) ?? cursor
    if (!positions.has(element.nodeJ)) positions.set(element.nodeJ, start + element.L * scale)
    cursor = positions.get(element.nodeJ) ?? start
  }

  // Nodos sin elementos asociados: se alinean al final para que sigan visibles
  for (const node of model.nodes) {
    if (!positions.has(node.id)) {
      cursor += scale
      positions.set(node.id, cursor)
    }
  }

  const maxX = Math.max(...positions.values(), 320) + margin
  const y = 108
  const viewHeight = 200
  const restrainedCount = model.nodes.filter((node) => node.restrained).length

  return (
    <section className="rounded-lg border border-[#d0d7e2] bg-white p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#0a2540] sm:text-xl">Diagrama de la Viga</h2>
          <p className="mt-0.5 text-xs text-[#5a6a7e]">
            Numeración de nodos, elementos y cargas · 1 G.L. rotacional (θ) por nodo
          </p>
        </div>
        <div className="flex gap-2 text-[11px]">
          <span className="rounded-md border border-[#d0d7e2] bg-[#f4f6f9] px-2.5 py-1 text-[#0a2540]">
            {model.nodes.length} nodos
          </span>
          <span className="rounded-md border border-[#d0d7e2] bg-[#f4f6f9] px-2.5 py-1 text-[#0a2540]">
            {model.elements.length} elementos
          </span>
          <span className="rounded-md border border-[#d0d7e2] bg-[#f4f6f9] px-2.5 py-1 text-[#0a2540]">
            {restrainedCount} apoyos
          </span>
        </div>
      </div>

      <div className="rounded-md border border-[#e2e8f0] bg-[#fbfcfe] px-2 py-3">
        <svg viewBox={`0 0 ${maxX} ${viewHeight}`} className={`w-full ${heightClass}`} role="img">
          {/* Nivel de referencia */}
          <line
            x1={margin - 24}
            y1={y}
            x2={maxX - margin + 24}
            y2={y}
            stroke="#d0d7e2"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {model.elements.map((element) => {
            const x1 = positions.get(element.nodeI) ?? 0
            const x2 = positions.get(element.nodeJ) ?? 0
            const mid = (x1 + x2) / 2
            const loads = model.elementLoads.filter((load) => load.elementId === element.id)

            return (
              <g key={element.id}>
                <line x1={x1} y1={y} x2={x2} y2={y} stroke={NAVY} strokeWidth="7" strokeLinecap="round" />

                {/* Línea de cota del tramo */}
                <line x1={x1} y1={y + 68} x2={x2} y2={y + 68} stroke="#c3ccd9" strokeWidth="1" />
                <line x1={x1} y1={y + 63} x2={x1} y2={y + 73} stroke="#c3ccd9" strokeWidth="1" />
                <line x1={x2} y1={y + 63} x2={x2} y2={y + 73} stroke="#c3ccd9" strokeWidth="1" />
                <text x={mid} y={y + 64} textAnchor="middle" fill={MUTED} fontSize="12">
                  L = {element.L} {units.L}
                </text>
                <text x={mid} y={y + 88} textAnchor="middle" fill={NAVY_LIGHT} fontSize="13" fontWeight="600">
                  E{element.id}
                </text>

                {loads.map((load, index) => {
                  const offset = index * 26

                  if (load.type === 'udl') {
                    const top = y - 34 - offset
                    return (
                      <g key={load.id}>
                        <line x1={x1} y1={top} x2={x2} y2={top} stroke={NAVY_MUTED} strokeWidth="2" />
                        {Array.from({ length: 9 }).map((_, i) => {
                          const px = x1 + ((x2 - x1) * i) / 8
                          return (
                            <g key={i}>
                              <line x1={px} y1={top} x2={px} y2={y - 10} stroke={NAVY_MUTED} strokeWidth="1.5" />
                              <polygon
                                points={`${px},${y - 5} ${px - 3.5},${y - 13} ${px + 3.5},${y - 13}`}
                                fill={NAVY_MUTED}
                              />
                            </g>
                          )
                        })}
                        <text x={mid} y={top - 8} textAnchor="middle" fill={NAVY_LIGHT} fontSize="12" fontWeight="600">
                          w = {load.value} {units.udl}
                        </text>
                      </g>
                    )
                  }

                  const px = x1 + (load.position ?? element.L / 2) * scale
                  const top = y - 46 - offset
                  return (
                    <g key={load.id}>
                      <line x1={px} y1={top} x2={px} y2={y - 10} stroke={NAVY_LIGHT} strokeWidth="2.5" />
                      <polygon points={`${px},${y - 4} ${px - 5},${y - 14} ${px + 5},${y - 14}`} fill={NAVY_LIGHT} />
                      <text x={px} y={top - 8} textAnchor="middle" fill={NAVY_LIGHT} fontSize="12" fontWeight="600">
                        P = {load.value} {units.point}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}

          {model.nodes.map((node) => {
            const px = positions.get(node.id) ?? 0
            const support = (node.supportType ?? (node.restrained ? 'fixed' : 'none')) as SupportType

            return (
              <g key={node.id}>
                {/* Articulación circular para apoyos que no sean empotrados ni deslizantes */}
                {support !== 'fixed' && support !== 'slider' && (
                  <circle
                    cx={px}
                    cy={y}
                    r={support === 'hinge' ? '7.5' : '4.5'}
                    fill="#ffffff"
                    stroke={NAVY}
                    strokeWidth={support === 'hinge' ? '3' : '2'}
                  />
                )}

                {/* Símbolo de Empotramiento */}
                {support === 'fixed' && (
                  <g>
                    <line x1={px} y1={y - 20} x2={px} y2={y + 20} stroke={NAVY} strokeWidth="3.5" />
                    {Array.from({ length: 7 }).map((_, i) => {
                      const hy = y - 18 + i * 6
                      const allPx = Array.from(positions.values())
                      const maxPx = Math.max(...allPx)
                      const isLeft = px !== maxPx
                      return (
                        <line
                          key={i}
                          x1={px}
                          y1={hy}
                          x2={isLeft ? px - 7 : px + 7}
                          y2={hy - 6}
                          stroke={NAVY_MUTED}
                          strokeWidth="1.5"
                        />
                      )
                    })}
                  </g>
                )}

                {/* Símbolo de Apoyo Fijo (Articulado) */}
                {support === 'pinned' && (
                  <g>
                    <polygon points={`${px},${y + 4.5} ${px - 13},${y + 27} ${px + 13},${y + 27}`} fill={NAVY} />
                    <line x1={px - 17} y1={y + 27} x2={px + 17} y2={y + 27} stroke={NAVY} strokeWidth="2" />
                    {Array.from({ length: 5 }).map((_, i) => {
                      const hx = px - 14 + i * 7
                      return (
                        <line
                          key={i}
                          x1={hx}
                          y1={y + 27}
                          x2={hx - 5}
                          y2={y + 35}
                          stroke={NAVY_MUTED}
                          strokeWidth="1.5"
                        />
                      )
                    })}
                  </g>
                )}

                {/* Símbolo de Apoyo Móvil (Rodillo) */}
                {support === 'roller' && (
                  <g>
                    {/* Triángulo */}
                    <polygon points={`${px},${y + 4.5} ${px - 13},${y + 20} ${px + 13},${y + 20}`} fill={NAVY} />
                    {/* Tres ruedas */}
                    <circle cx={px - 8} cy={y + 23} r="2.5" fill="#ffffff" stroke={NAVY} strokeWidth="1.5" />
                    <circle cx={px} cy={y + 23} r="2.5" fill="#ffffff" stroke={NAVY} strokeWidth="1.5" />
                    <circle cx={px + 8} cy={y + 23} r="2.5" fill="#ffffff" stroke={NAVY} strokeWidth="1.5" />
                    {/* Línea inferior fija */}
                    <line x1={px - 17} y1={y + 26} x2={px + 17} y2={y + 26} stroke={NAVY} strokeWidth="2" />
                  </g>
                )}

                {/* Símbolo de Apoyo Deslizante (Guía) */}
                {support === 'slider' && (
                  <g>
                    {/* Placa unida al nodo */}
                    <rect x={px - 12} y={y - 8} width="24" height="16" fill={NAVY} rx="1" />
                    <circle cx={px} cy={y} r="3" fill="#ffffff" />
                    {/* Rodillos */}
                    <circle cx={px - 7} cy={y + 12.5} r="2" fill="#ffffff" stroke={NAVY} strokeWidth="1.5" />
                    <circle cx={px + 7} cy={y + 12.5} r="2" fill="#ffffff" stroke={NAVY} strokeWidth="1.5" />
                    {/* Placa inferior fija */}
                    <line x1={px - 15} y1={y + 16} x2={px + 15} y2={y + 16} stroke={NAVY} strokeWidth="2" />
                    {/* Achurado fijo */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const hx = px - 12 + i * 6
                      return (
                        <line
                          key={i}
                          x1={hx}
                          y1={y + 16}
                          x2={hx - 4}
                          y2={y + 23}
                          stroke={NAVY_MUTED}
                          strokeWidth="1.5"
                        />
                      )
                    })}
                  </g>
                )}

                {/* Símbolo de Apoyo Elástico (Resorte) */}
                {support === 'spring' && (
                  <g>
                    <path
                      d={`M ${px} ${y + 4.5} L ${px + 6} ${y + 9} L ${px - 6} ${y + 13.5} L ${px + 6} ${y + 18} L ${px - 6} ${y + 22.5} L ${px} ${y + 27}`}
                      fill="none"
                      stroke={NAVY}
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <line x1={px - 12} y1={y + 27} x2={px + 12} y2={y + 27} stroke={NAVY} strokeWidth="2" />
                    {Array.from({ length: 4 }).map((_, i) => {
                      const hx = px - 9 + i * 6
                      return (
                        <line
                          key={i}
                          x1={hx}
                          y1={y + 27}
                          x2={hx - 3}
                          y2={y + 33}
                          stroke={NAVY_MUTED}
                          strokeWidth="1.5"
                        />
                      )
                    })}
                  </g>
                )}

                <text x={px} y={y + 50} textAnchor="middle" fill={NAVY} fontSize="14" fontWeight="700">
                  N{node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#5a6a7e]">
        <span className="flex items-center gap-2">
          <svg width="16" height="12" className="overflow-visible" aria-hidden>
            <polygon points="8,1 3,7 13,7" fill={NAVY} />
            <circle cx="5.5" cy="9.5" r="1" fill="#fff" stroke={NAVY} strokeWidth="0.8" />
            <circle cx="8" cy="9.5" r="1" fill="#fff" stroke={NAVY} strokeWidth="0.8" />
            <circle cx="10.5" cy="9.5" r="1" fill="#fff" stroke={NAVY} strokeWidth="0.8" />
            <line x1="1" y1="11" x2="15" y2="11" stroke={NAVY} strokeWidth="1" />
          </svg>
          Apoyo móvil
        </span>
        <span className="flex items-center gap-2">
          <svg width="16" height="12" className="overflow-visible" aria-hidden>
            <polygon points="8,1 2,9 14,9" fill={NAVY} />
            <line x1="0" y1="9" x2="16" y2="9" stroke={NAVY} strokeWidth="1.5" />
          </svg>
          Apoyo articulado
        </span>
        <span className="flex items-center gap-2">
          <svg width="16" height="12" className="overflow-visible" aria-hidden>
            <line x1="5" y1="0" x2="5" y2="12" stroke={NAVY} strokeWidth="2" />
            <line x1="5" y1="2" x2="1" y2="0" stroke={NAVY_MUTED} strokeWidth="1" />
            <line x1="5" y1="6" x2="1" y2="4" stroke={NAVY_MUTED} strokeWidth="1" />
            <line x1="5" y1="10" x2="1" y2="8" stroke={NAVY_MUTED} strokeWidth="1" />
          </svg>
          Empotramiento
        </span>
        <span className="flex items-center gap-2">
          <svg width="16" height="12" className="overflow-visible" aria-hidden>
            <rect x="2" y="1" width="12" height="3" fill={NAVY} />
            <circle cx="5" cy="6.5" r="1.5" fill="#fff" stroke={NAVY} strokeWidth="1" />
            <circle cx="11" cy="6.5" r="1.5" fill="#fff" stroke={NAVY} strokeWidth="1" />
            <line x1="0" y1="9" x2="16" y2="9" stroke={NAVY} strokeWidth="1.5" />
          </svg>
          Apoyo deslizante
        </span>
        <span className="flex items-center gap-2">
          <svg width="16" height="12" className="overflow-visible" aria-hidden>
            <circle cx="8" cy="6" r="4.5" fill="#fff" stroke={NAVY} strokeWidth="2" />
          </svg>
          Rótula interna
        </span>
        <span className="flex items-center gap-2">
          <svg width="16" height="12" className="overflow-visible" aria-hidden>
            <path d="M 8,0 L 11,3 L 5,6 L 11,9 L 8,11" fill="none" stroke={NAVY} strokeWidth="1.5" />
            <line x1="2" y1="11" x2="14" y2="11" stroke={NAVY} strokeWidth="1.5" />
          </svg>
          Apoyo elástico
        </span>
        <span className="flex items-center gap-2">
          <svg width="16" height="12" aria-hidden>
            <circle cx="8" cy="6" r="4" fill="#fff" stroke={NAVY} strokeWidth="1.5" />
          </svg>
          Nodo libre
        </span>
        <span>Escala aproximada: {scale} px = 1 {units.L}</span>
      </div>
    </section>
  )
}
