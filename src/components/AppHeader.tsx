interface AppHeaderProps {
  activeTab: 'input' | 'results'
  setActiveTab: (tab: 'input' | 'results') => void
  hasResult: boolean
  onLoadOneSpan: () => void
  onLoadDefault: () => void
  onLoadContinuous: () => void
  onCalculate: () => void
  calculateDisabled: boolean
}

export function AppHeader({
  activeTab,
  setActiveTab,
  hasResult,
  onLoadOneSpan,
  onLoadDefault,
  onLoadContinuous,
  onCalculate,
  calculateDisabled,
}: AppHeaderProps) {
  return (
    <header className="border-b border-[#0a2540] bg-[#0a2540]">
      <div className="mx-auto flex max-w-[96%] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">VIGAMAT 2D</h1>
          <div className="flex gap-1 rounded-lg bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('input')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'input'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Definir estructura
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('results')}
              disabled={!hasResult}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                activeTab === 'results'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Resultados (7 pasos)
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onLoadOneSpan}
            className="rounded-md border border-white/40 px-3 py-2 text-xs text-white hover:bg-white/10"
          >
            Viga 1 vano
          </button>
          <button
            type="button"
            onClick={onLoadDefault}
            className="rounded-md border border-white/40 px-3 py-2 text-xs text-white hover:bg-white/10"
          >
            Viga 2 vanos
          </button>
          <button
            type="button"
            onClick={onLoadContinuous}
            className="rounded-md border border-white/40 px-3 py-2 text-xs text-white hover:bg-white/10"
          >
            Viga 3 vanos
          </button>
          <button
            type="button"
            onClick={onCalculate}
            disabled={calculateDisabled}
            className="rounded-md bg-white px-5 py-2 text-sm font-semibold text-[#0a2540] hover:bg-[#e8eef5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Calcular
          </button>
        </div>
      </div>
    </header>
  )
}
