import { classById, instructorById, trendingClassIds } from '../data/mockData'
import { formatInr } from '../lib/format'
import { Icon } from './Icon'

interface TrendingRailProps {
  readonly className?: string
  readonly onBook: (classId: string) => void
}

export function TrendingRail({ className = '', onBook }: TrendingRailProps) {
  return (
    <section className={className}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta dark:text-terracotta-muted">
            Popular this week
          </p>
          <h2 className="mt-1 font-expanded text-3xl font-bold bg-gradient-to-r from-on-surface-light to-primary-container bg-clip-text text-transparent">
            Trending classes
          </h2>
        </div>
        <Icon name="local_fire_department" className="text-primary" filled size={28} />
      </div>
      <ul className="grid gap-6 md:grid-cols-3">
        {trendingClassIds.map((id, index) => {
          const item = classById(id)
          const instructor = item ? instructorById(item.instructorId) : undefined
          if (!item) return null
          return (
            <li
              key={item.id}
              className="card-motion glass-card group rounded-xl"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={item.image}
                  alt=""
                  className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                <span className="absolute left-4 top-4 grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary to-spark text-sm font-bold text-on-primary">
                  {index + 1}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-expanded text-xl font-bold">{item.name}</h3>
                <p className="mt-1 text-sm text-on-variant-light dark:text-on-variant-dark">
                  {instructor?.name} · {item.style}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-bold text-primary">{formatInr(item.priceInr)}</span>
                  <button
                    type="button"
                    onClick={() => onBook(item.id)}
                    className="btn-glow rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
                  >
                    Book now
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
