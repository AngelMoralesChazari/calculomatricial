import { useMemo, useState } from 'react'
import { AnalysisSteps } from './components/AnalysisSteps'
import { AppHeader } from './components/AppHeader'
import { BeamDiagram } from './components/BeamDiagram'
import { DownloadReport } from './components/DownloadReport'
import { StructureInput } from './components/StructureInput'
import { UnitsPanel } from './components/UnitsPanel'
import { SummaryCard, TabButton } from './components/ui/Cards'
import { continuousBeamExample, defaultStructure, oneSpanExample } from './data/examples'
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
    <div className="min-h-screen bg-[#f4f6f9] text-[#0a2540]">
      <AppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasResult={!!result}
        onLoadOneSpan={() => loadExample(oneSpanExample)}
        onLoadDefault={() => loadExample(defaultStructure)}
        onLoadContinuous={() => loadExample(continuousBeamExample)}
        onCalculate={runAnalysis}
        calculateDisabled={!!validationError}
      />

      <main className="mx-auto max-w-[96%] px-4 py-6 sm:px-6 lg:px-8">

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {validationError && activeTab === 'input' && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {validationError}
          </div>
        )}

        {activeTab === 'input' ? (
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Lado Izquierdo: Formularios de Edición */}
            <div className="lg:col-span-4 order-2 lg:order-1 space-y-5">
              <StructureInput model={model} onChange={setModel} />
              <UnitsPanel />
            </div>

            {/* Lado Derecho: Diagrama de la Viga (Fijo al hacer scroll) */}
            <div className="lg:col-span-8 order-1 lg:order-2 lg:sticky lg:top-5">
              <BeamDiagram model={model} />
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
            <BeamDiagram model={model} scale={42} heightClass="h-52" />
            <DownloadReport model={model} result={result} />
            <AnalysisSteps result={result} model={model} />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#d0d7e2] bg-white p-12 text-center text-[#5a6a7e]">
            Define la estructura y presiona <strong className="text-[#0a2540]">Calcular</strong> para ver los 7 pasos del análisis.
          </div>
        )}
      </main>
    </div>
  )
}

export default App
