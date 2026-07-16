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
      className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition ${
        active
          ? 'bg-[#0a2540] text-white'
          : 'text-[#5a6a7e] hover:bg-[#e8eef5] hover:text-[#0a2540] disabled:cursor-not-allowed disabled:opacity-40'
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
      className={`rounded-lg border p-4 ${
        accent
          ? 'border-[#0a2540] bg-[#0a2540] text-white'
          : 'border-[#d0d7e2] bg-white text-[#0a2540]'
      }`}
    >
      <p className={`text-xs ${accent ? 'text-white/70' : 'text-[#5a6a7e]'}`}>{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className={`mt-1 truncate text-xs ${accent ? 'text-white/60' : 'text-[#5a6a7e]'}`}>{detail}</p>
    </div>
  )
}
