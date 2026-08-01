import { units } from '../data/units'

const rows: [string, string][] = [
  ['E', `${units.E} (N/mm²)`],
  ['I', units.I],
  ['L', units.L],
  ['Cargas', `${units.point}, ${units.udl}`],
  ['Momentos', units.moment],
  ['Rotaciones', units.rotation],
]

export function UnitsPanel() {
  return (
    <div className="rounded-lg border border-[#d0d7e2] bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#0a2540]">
        Unidades del sistema
      </h2>
      <dl className="space-y-1.5 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-2 border-b border-[#eef1f6] pb-1.5">
            <dt className="text-[#5a6a7e]">{label}</dt>
            <dd className="font-mono text-[#0a2540]">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-[#5a6a7e]">
        Viga Euler-Bernoulli con un grado de libertad rotacional (θ) por nodo. Ideal para vigas continuas e
        hiperestáticas en flexión.
      </p>
    </div>
  )
}
