interface AppHeaderProps {
  onLoadDefault: () => void
  onLoadContinuous: () => void
  onCalculate: () => void
  calculateDisabled: boolean
}

export function AppHeader({
  onLoadDefault,
  onLoadContinuous,
  onCalculate,
  calculateDisabled,
}: AppHeaderProps) {
  return (
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
            onClick={onLoadDefault}
            className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300 hover:border-cyan-500 hover:text-cyan-400"
          >
            Viga 2 vanos
          </button>
          <button
            type="button"
            onClick={onLoadContinuous}
            className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300 hover:border-cyan-500 hover:text-cyan-400"
          >
            Viga continua 3 vanos
          </button>
          <button
            type="button"
            onClick={onCalculate}
            disabled={calculateDisabled}
            className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Calcular
          </button>
        </div>
      </div>
    </header>
  )
}
