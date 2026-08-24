interface FilterChipProps {
  readonly label: string
  readonly selected?: boolean
  readonly onSelect: () => void
  readonly className?: string
}

export function FilterChip({
  label,
  selected = false,
  onSelect,
  className = '',
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-transform duration-200 hover:-translate-y-0.5 ${
        selected
          ? 'bg-primary text-on-primary ring-1 ring-primary/30 shadow-[0_0_12px_-4px_rgb(61_139_255/0.4)]'
          : 'glass text-on-variant-light dark:text-on-variant-dark'
      } ${className}`}
    >
      {label}
    </button>
  )
}
