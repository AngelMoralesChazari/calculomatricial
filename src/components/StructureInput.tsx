import type { BeamElement, StructNode, StructureModel, SupportType } from '../types/structure'
import { units } from '../data/units'
import { ElementLoadRow } from './ElementLoadRow'

interface StructureInputProps {
  model: StructureModel
  onChange: (model: StructureModel) => void
}

function updateNode(model: StructureModel, id: number, patch: Partial<StructNode>) {
  return {
    ...model,
    nodes: model.nodes.map((node) => (node.id === id ? { ...node, ...patch } : node)),
  }
}

function updateElement(model: StructureModel, id: number, patch: Partial<BeamElement>) {
  return {
    ...model,
    elements: model.elements.map((element) => (element.id === id ? { ...element, ...patch } : element)),
  }
}

const sectionClass = 'rounded-lg border border-[#d0d7e2] bg-white p-4'
const headingClass = 'text-sm font-semibold uppercase tracking-wide text-[#0a2540]'
const addButtonClass =
  'rounded-md bg-[#0a2540] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#1a3a5c]'

export function StructureInput({ model, onChange }: StructureInputProps) {
  const addNode = () => {
    const nextId = Math.max(0, ...model.nodes.map((n) => n.id)) + 1
    onChange({
      ...model,
      nodes: [...model.nodes, { id: nextId, label: String(nextId), restrained: false, supportType: 'none' }],
    })
  }

  const addElement = () => {
    const nextId = Math.max(0, ...model.elements.map((e) => e.id)) + 1
    const lastNode = model.nodes[model.nodes.length - 1]
    const newNodeId = Math.max(0, ...model.nodes.map((n) => n.id)) + 1
    onChange({
      ...model,
      nodes: [...model.nodes, { id: newNodeId, label: String(newNodeId), restrained: false, supportType: 'none' }],
      elements: [
        ...model.elements,
        {
          id: nextId,
          nodeI: lastNode?.id ?? 1,
          nodeJ: newNodeId,
          E: 210000,
          I: 0.0001,
          L: 3,
        },
      ],
    })
  }

  const addElementLoad = () => {
    const elementId = model.elements[0]?.id ?? 1
    const nextId = Math.max(0, ...model.elementLoads.map((l) => l.id)) + 1
    onChange({
      ...model,
      elementLoads: [...model.elementLoads, { id: nextId, elementId, type: 'udl', value: 5 }],
    })
  }

  const inputClass =
    'w-full rounded-md border border-[#d0d7e2] bg-white px-2.5 py-1.5 text-sm text-[#0a2540] outline-none focus:border-[#0a2540] focus:ring-1 focus:ring-[#0a2540]'

  return (
    <div className="space-y-4">
        <section className={sectionClass}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className={headingClass}>
              Nodos <span className="ml-1 font-normal text-[#5a6a7e]">({model.nodes.length})</span>
            </h2>
            <button type="button" onClick={addNode} className={addButtonClass}>
              + Nodo
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {model.nodes.map((node) => (
              <div
                key={node.id}
                className="flex items-center gap-2 rounded-md border border-[#d0d7e2] bg-[#f4f6f9] px-2 py-1.5"
              >
                <span className="font-mono text-xs text-[#5a6a7e]">N</span>
                <input
                  aria-label={`Etiqueta del nodo ${node.label}`}
                  className="w-12 rounded border border-[#d0d7e2] bg-white px-1.5 py-1 text-center font-mono text-sm text-[#0a2540] outline-none focus:border-[#0a2540]"
                  value={node.label}
                  onChange={(e) => onChange(updateNode(model, node.id, { label: e.target.value }))}
                />
                <select
                  aria-label={`Tipo de apoyo del nodo ${node.label}`}
                  value={node.supportType ?? (node.restrained ? 'fixed' : 'none')}
                  onChange={(e) => {
                    const val = e.target.value as SupportType
                    onChange(updateNode(model, node.id, {
                      supportType: val,
                      restrained: val === 'fixed' || val === 'slider'
                    }))
                  }}
                  className="ml-auto min-w-0 flex-1 rounded border border-[#d0d7e2] bg-white px-1 py-0.5 text-[11px] text-[#0a2540] outline-none focus:border-[#0a2540]"
                >
                  <option value="none">Libre (Conexión)</option>
                  <option value="roller">Apoyo móvil</option>
                  <option value="pinned">Apoyo articulado</option>
                  <option value="fixed">Empotramiento</option>
                  <option value="slider">Apoyo deslizante</option>
                  <option value="hinge">Rótula interna</option>
                  <option value="spring">Apoyo elástico</option>
                </select>
                {model.nodes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      const deletedElementIds = model.elements
                        .filter((el) => el.nodeI === node.id || el.nodeJ === node.id)
                        .map((el) => el.id)
                      const updatedModel = {
                        ...model,
                        nodes: model.nodes.filter((n) => n.id !== node.id),
                        elements: model.elements.filter((el) => el.nodeI !== node.id && el.nodeJ !== node.id),
                        elementLoads: model.elementLoads.filter((load) => !deletedElementIds.includes(load.elementId)),
                        nodalLoads: model.nodalLoads.filter((load) => load.nodeId !== node.id),
                      }
                      onChange(updatedModel)
                    }}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition flex-shrink-0"
                    title="Eliminar nodo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={`${headingClass} mb-3`}>
            Momentos nodales <span className="ml-1 font-normal text-[#5a6a7e]">({units.moment})</span>
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {model.nodes.map((node) => {
              const existing = model.nodalLoads.find((l) => l.nodeId === node.id)
              const moment = existing?.moment ?? 0
              return (
                <div
                  key={node.id}
                  className="flex items-center gap-2 rounded-md border border-[#d0d7e2] bg-[#f4f6f9] px-2 py-1.5"
                >
                  <span className="w-8 font-mono text-xs text-[#5a6a7e]">N{node.label}</span>
                  <input
                    type="number"
                    step="0.1"
                    aria-label={`Momento en nodo ${node.label}`}
                    className="w-full rounded border border-[#d0d7e2] bg-white px-2 py-1 text-sm text-[#0a2540] outline-none focus:border-[#0a2540]"
                    value={moment}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      const nodalLoads = model.nodalLoads.filter((l) => l.nodeId !== node.id)
                      if (value !== 0) nodalLoads.push({ nodeId: node.id, moment: value })
                      onChange({ ...model, nodalLoads })
                    }}
                  />
                </div>
              )
            })}
          </div>
        </section>

      <section className={sectionClass}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={headingClass}>
            Elementos (vigas) <span className="ml-1 font-normal text-[#5a6a7e]">({model.elements.length})</span>
          </h2>
          <button type="button" onClick={addElement} className={addButtonClass}>
            + Elemento
          </button>
        </div>
        <div className="space-y-2">
          {model.elements.map((element) => (
            <div
              key={element.id}
              className="rounded-md border border-[#d0d7e2] bg-[#f4f6f9] p-2.5"
            >
              <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <div className="flex items-center">
                  <span className="rounded bg-[#0a2540] px-2 py-1 text-xs font-semibold text-white">
                    E{element.id}
                  </span>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[#5a6a7e]">Nodo i</label>
                  <select
                    className={inputClass}
                    value={element.nodeI}
                    onChange={(e) => onChange(updateElement(model, element.id, { nodeI: Number(e.target.value) }))}
                  >
                    {model.nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[#5a6a7e]">Nodo j</label>
                  <select
                    className={inputClass}
                    value={element.nodeJ}
                    onChange={(e) => onChange(updateElement(model, element.id, { nodeJ: Number(e.target.value) }))}
                  >
                    {model.nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[#5a6a7e]">E ({units.E})</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={element.E}
                    onChange={(e) => onChange(updateElement(model, element.id, { E: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[#5a6a7e]">I ({units.I})</label>
                  <input
                    type="number"
                    step="0.00001"
                    className={inputClass}
                    value={element.I}
                    onChange={(e) => onChange(updateElement(model, element.id, { I: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[#5a6a7e]">L ({units.L})</label>
                  <input
                    type="number"
                    step="0.1"
                    className={inputClass}
                    value={element.L}
                    onChange={(e) => onChange(updateElement(model, element.id, { L: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={headingClass}>
            Cargas en elementos{' '}
            <span className="ml-1 font-normal text-[#5a6a7e]">({model.elementLoads.length})</span>
          </h2>
          <button type="button" onClick={addElementLoad} className={addButtonClass}>
            + Carga
          </button>
        </div>
        <div className="space-y-2">
          {model.elementLoads.length === 0 && (
            <p className="text-sm text-[#5a6a7e]">Sin cargas en elementos.</p>
          )}
          {model.elementLoads.map((load) => (
            <ElementLoadRow key={load.id} model={model} load={load} onChange={onChange} inputClass={inputClass} />
          ))}
        </div>
      </section>
    </div>
  )
}
