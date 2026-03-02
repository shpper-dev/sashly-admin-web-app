
interface FilterButtonWithBadgeProps {
  label: string
  count: number
  active?: boolean
  onClick?: () => void
}

export default function FilterButtonWithBadge({
  label,
  count,
  active,
  onClick,
}: FilterButtonWithBadgeProps ) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
        active
          ? "bg-white shadow text-purple-600"
          : "text-slate-600 hover:bg-white"
      }`}
    >
      {label}
      <span
        className={`px-1.5 rounded-full text-xs ${
          active
            ? "bg-purple-100 text-purple-600"
            : "bg-slate-200"
        }`}
      >
        {count}
      </span>
    </button>
  )
}
