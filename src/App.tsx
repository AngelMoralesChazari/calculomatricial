import { useMemo, useState } from 'react'
import { AnalysisSteps } from './components/AnalysisSteps'
import { BeamDiagram } from './components/BeamDiagram'
import { StructureInput } from './components/StructureInput'
import { continuousBeamExample, defaultStructure } from './data/examples'
import { analyzeStructure, validateStructure } from './lib/structuralAnalysis'
import type { AnalysisResult, StructureModel } from './types/structure'

type Tab = 'input' | 'results'

function App() {
  const [model, setModel] = useState<StructureModel>(defaultStructure)
  const [activeTab, setActiveTab] = useState<Tab>('input')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const validationError = useMemo(() => validateStructure(model), [model])

  const runAnalysis = () => {
    const validation = validateStructure(model)
    if (validation) {
      setError(validation)
      setResult(null)
      return
    }

    try {
      const analysis = analyzeStructure(model)
      setResult(analysis)
      setError(null)
      setActiveTab('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido en el análisis.')
      setResult(null)
    }
  }

  const loadExample = (example: StructureModel) => {
    setModel(example)
    setError(null)
    setResult(null)
    setActiveTab('input')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Ingeniería Civil · Análisis Estructural
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Calculomatricial</h1>
            <p className="mt-1 text-sm text-slate-400">
              Método de rigidez matricial para vigas — cálculo paso a paso
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadExample(defaultStructure)}
              className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300 hover:border-cyan-500 hover:text-cyan-400"
            >
              Viga 2 vanos
            </button>
            <button
              type="button"
              onClick={() => loadExample(continuousBeamExample)}
              className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300 hover:border-cyan-500 hover:text-cyan-400"
            >
              Viga continua 3 vanos
            </button>
            <button
              type="button"
              onClick={runAnalysis}
              disabled={!!validationError}
              className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Calcular
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex gap-2 rounded-xl border border-slate-700 bg-slate-800/50 p-1">
          <TabButton active={activeTab === 'input'} onClick={() => setActiveTab('input')}>
            Definir estructura
          </TabButton>
          <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} disabled={!result}>
            Resultados (8 pasos)
          </TabButton>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {validationError && activeTab === 'input' && (
          <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {validationError}
          </div>
        )}

        {activeTab === 'input' ? (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <StructureInput model={model} onChange={setModel} />
            </div>
            <div className="lg:col-span-2">
              <BeamDiagram model={model} />
              <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-300">Unidades del sistema</h3>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>E: MPa (N/mm²)</li>
                  <li>I: m⁴</li>
                  <li>L: m</li>
                  <li>Cargas: kN, kN/m</li>
                  <li>Momentos: kN·m</li>
                  <li>Rotaciones: rad</li>
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  Modelo de viga Euler-Bernoulli con un grado de libertad rotacional (θ) por nodo.
                  Ideal para vigas continuas e hiperestáticas en flexión.
                </p>
              </div>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="G.L. libres"
                value={result.freeDofIndices.length}
                detail={result.freeDofIndices.map((i) => result.dofLabels[i]).join(', ')}
              />
              <SummaryCard
                label="G.L. restringidos"
                value={result.restrainedDofIndices.length}
                detail={result.restrainedDofIndices.map((i) => result.dofLabels[i]).join(', ') || '—'}
              />
              <SummaryCard label="Elementos" value={result.elementForces.length} detail="Vigas analizadas" />
              <SummaryCard
                label="Estado"
                value="✓"
                detail="Sistema resuelto"
                accent
              />
            </div>
            <BeamDiagram model={model} />
            <AnalysisSteps result={result} />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-500">
            Define la estructura y presiona <strong className="text-cyan-400">Calcular</strong> para ver los 8 pasos del análisis.
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        Calculomatricial — Método de rigidez matricial · React + Tailwind
      </footer>
    </div>
  )
}

function TabButton({
  children,
  active,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
        active
          ? 'bg-cyan-500 text-slate-950'
          : 'text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'
      }`}
    >
      {children}
    </button>
  )
}

function SummaryCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: string | number
  detail: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-slate-700 bg-slate-800/40'
      }`}
    >
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 truncate text-xs text-slate-500">{detail}</p>
    </div>
  )
}

export default App
