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
    <header className="border-b border-[#0a2540] bg-[#0a2540]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            Ingeniería Civil · Análisis Estructural
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Calculo Matricial</h1>
          <p className="mt-1 text-sm text-white/70">
            Método de rigidez matricial para vigas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
            Viga continua 3 vanos
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
