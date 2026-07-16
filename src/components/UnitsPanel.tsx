import { units } from '../data/units'

export function UnitsPanel() {
  return (
    <div className="mt-4 rounded-lg border border-[#d0d7e2] bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-[#0a2540]">Unidades del sistema</h3>
      <ul className="space-y-1 text-xs text-[#5a6a7e]">
        <li>E: MPa (N/mm²)</li>
        <li>I: m⁴</li>
        <li>L: m</li>
        <li>Cargas: kN, kN/m</li>
        <li>Momentos: {units.moment}</li>
        <li>Rotaciones: {units.rotation}</li>
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-[#5a6a7e]">
        Modelo de viga Euler-Bernoulli con un grado de libertad rotacional (θ) por nodo.
        Ideal para vigas continuas e hiperestáticas en flexión.
      </p>
    </div>
  )
}
