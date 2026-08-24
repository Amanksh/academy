interface IconProps {
  readonly name: string
  readonly className?: string
  readonly filled?: boolean
  readonly size?: number
}

export function Icon({
  name,
  className = '',
  filled = false,
  size = 22,
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'filled' : ''} ${className}`}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
