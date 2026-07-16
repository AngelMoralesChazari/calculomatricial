import { useMemo, useState } from 'react'
import { AnalysisSteps } from './components/AnalysisSteps'
import { AppHeader } from './components/AppHeader'
import { BeamDiagram } from './components/BeamDiagram'
import { StructureInput } from './components/StructureInput'
import { UnitsPanel } from './components/UnitsPanel'
import { SummaryCard, TabButton } from './components/ui/Cards'
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
      <AppHeader
        onLoadDefault={() => loadExample(defaultStructure)}
        onLoadContinuous={() => loadExample(continuousBeamExample)}
        onCalculate={runAnalysis}
        calculateDisabled={!!validationError}
      />

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
              <UnitsPanel />
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
              <SummaryCard label="Estado" value="✓" detail="Sistema resuelto" accent />
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

export default App
