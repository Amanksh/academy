import { Link } from 'react-router-dom'

interface BrandMarkProps {
  readonly compact?: boolean
  readonly className?: string
}

export function BrandMark({ compact = false, className = '' }: BrandMarkProps) {
  return (
    <Link to="/" className={`flex items-center gap-3 no-underline group ${className}`}>
      <div className={`${compact ? 'size-14' : 'size-16 sm:size-18 lg:size-20'} rounded-2xl overflow-hidden bg-white p-1.5 shadow-xl border border-white/20 transition-all duration-300 group-hover:scale-105 flex items-center justify-center`}>
        <img
          src="/logo.png"
          alt="Mudra Dance Academy"
          className="size-full object-contain"
        />
      </div>
    </Link>
  )
}
