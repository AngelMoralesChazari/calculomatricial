import type { ElementLoad, StructureModel } from '../types/structure'
import { units } from '../data/units'

interface ElementLoadRowProps {
  model: StructureModel
  load: ElementLoad
  onChange: (model: StructureModel) => void
  inputClass: string
}

export function ElementLoadRow({ model, load, onChange, inputClass }: ElementLoadRowProps) {
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
