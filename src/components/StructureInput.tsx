import type { BeamElement, ElementLoad, StructNode, StructureModel } from '../types/structure'
import { units } from '../data/examples'

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

export function StructureInput({ model, onChange }: StructureInputProps) {
  const addNode = () => {
    const nextId = Math.max(0, ...model.nodes.map((n) => n.id)) + 1
    onChange({
      ...model,
      nodes: [...model.nodes, { id: nextId, label: String(nextId), restrained: false }],
    })
  }

  const addElement = () => {
    const nextId = Math.max(0, ...model.elements.map((e) => e.id)) + 1
    const lastNode = model.nodes[model.nodes.length - 1]
    const newNodeId = Math.max(0, ...model.nodes.map((n) => n.id)) + 1
    onChange({
      ...model,
      nodes: [...model.nodes, { id: newNodeId, label: String(newNodeId), restrained: false }],
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
    'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Nodos</h2>
          <button
            type="button"
            onClick={addNode}
            className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500"
          >
            + Nodo
          </button>
        </div>
        <div className="space-y-3">
          {model.nodes.map((node) => (
            <div key={node.id} className="grid grid-cols-2 gap-3 rounded-xl border border-slate-700 bg-slate-900/50 p-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Etiqueta</label>
                <input
                  className={inputClass}
                  value={node.label}
                  onChange={(e) => onChange(updateNode(model, node.id, { label: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={node.restrained}
                    onChange={(e) => onChange(updateNode(model, node.id, { restrained: e.target.checked }))}
                    className="rounded border-slate-600 bg-slate-900 text-cyan-500"
                  />
                  Apoyo fijo (θ=0)
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Elementos (vigas)</h2>
          <button
            type="button"
            onClick={addElement}
            className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500"
          >
            + Elemento
          </button>
        </div>
        <div className="space-y-3">
          {model.elements.map((element) => (
            <div key={element.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
              <p className="mb-3 text-sm font-medium text-cyan-400">Elemento {element.id}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Nodo i</label>
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
                  <label className="mb-1 block text-xs text-slate-400">Nodo j</label>
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
                  <label className="mb-1 block text-xs text-slate-400">E ({units.E})</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={element.E}
                    onChange={(e) => onChange(updateElement(model, element.id, { E: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">I ({units.I})</label>
                  <input
                    type="number"
                    step="0.00001"
                    className={inputClass}
                    value={element.I}
                    onChange={(e) => onChange(updateElement(model, element.id, { I: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">L ({units.L})</label>
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

      <section className="rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Cargas en elementos</h2>
          <button
            type="button"
            onClick={addElementLoad}
            className="rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-500"
          >
            + Carga
          </button>
        </div>
        <div className="space-y-3">
          {model.elementLoads.length === 0 && (
            <p className="text-sm text-slate-500">Sin cargas en elementos.</p>
          )}
          {model.elementLoads.map((load) => (
            <ElementLoadRow key={load.id} model={model} load={load} onChange={onChange} inputClass={inputClass} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Momentos nodales</h2>
        <div className="space-y-3">
          {model.nodes.map((node) => {
            const existing = model.nodalLoads.find((l) => l.nodeId === node.id)
            const moment = existing?.moment ?? 0
            return (
              <div key={node.id} className="flex items-center gap-3">
                <span className="w-16 text-sm text-slate-400">N{node.label}</span>
                <input
                  type="number"
                  step="0.1"
                  className={inputClass}
                  value={moment}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    const nodalLoads = model.nodalLoads.filter((l) => l.nodeId !== node.id)
                    if (value !== 0) nodalLoads.push({ nodeId: node.id, moment: value })
                    onChange({ ...model, nodalLoads })
                  }}
                  placeholder={`Momento (${units.moment})`}
                />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function ElementLoadRow({
  model,
  load,
  onChange,
  inputClass,
}: {
  model: StructureModel
  load: ElementLoad
  onChange: (model: StructureModel) => void
  inputClass: string
}) {
  const update = (patch: Partial<ElementLoad>) => {
    onChange({
      ...model,
      elementLoads: model.elementLoads.map((item) => (item.id === load.id ? { ...item, ...patch } : item)),
    })
  }

  const remove = () => {
    onChange({ ...model, elementLoads: model.elementLoads.filter((item) => item.id !== load.id) })
  }

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-700 bg-slate-900/50 p-3 sm:grid-cols-5">
      <div>
        <label className="mb-1 block text-xs text-slate-400">Elemento</label>
        <select className={inputClass} value={load.elementId} onChange={(e) => update({ elementId: Number(e.target.value) })}>
          {model.elements.map((element) => (
            <option key={element.id} value={element.id}>
              E{element.id}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-400">Tipo</label>
        <select
          className={inputClass}
          value={load.type}
          onChange={(e) => update({ type: e.target.value as ElementLoad['type'] })}
        >
          <option value="udl">Carga distribuida</option>
          <option value="point">Carga puntual</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-400">
          Valor ({load.type === 'udl' ? units.udl : units.point})
        </label>
        <input
          type="number"
          className={inputClass}
          value={load.value}
          onChange={(e) => update({ value: Number(e.target.value) })}
        />
      </div>
      {load.type === 'point' && (
        <div>
          <label className="mb-1 block text-xs text-slate-400">Posición (m desde i)</label>
          <input
            type="number"
            step="0.1"
            className={inputClass}
            value={load.position ?? ''}
            onChange={(e) => update({ position: Number(e.target.value) })}
          />
        </div>
      )}
      <div className="flex items-end">
        <button type="button" onClick={remove} className="text-xs text-red-400 hover:text-red-300">
          Eliminar
        </button>
      </div>
    </div>
  )
}
