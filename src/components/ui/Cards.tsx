export function TabButton({
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

export function SummaryCard({
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
