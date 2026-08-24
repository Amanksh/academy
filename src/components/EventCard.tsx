import { instructorById } from '../data/mockData'
import { formatInr } from '../lib/format'
import type { AcademyEvent } from '../types'
import { Icon } from './Icon'

interface EventCardProps {
  readonly event: AcademyEvent
  readonly featured?: boolean
  readonly booked?: boolean
  readonly onBook: (eventId: string) => void
  readonly className?: string
}

export function EventCard({
  event,
  featured = false,
  booked = false,
  onBook,
  className = '',
}: EventCardProps) {
  const instructor = event.instructorId
    ? instructorById(event.instructorId)
    : undefined

  if (featured) {
    return (
      <article className={`relative min-h-[480px] w-full overflow-hidden rounded-[28px] sm:rounded-[36px] border border-white/10 lg:min-h-[560px] ${className}`}>
        <img
          src={event.image}
          alt={event.title}
          className="hero-pan absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
        <div className="relative flex min-h-[480px] items-end p-8 sm:p-12 lg:min-h-[560px] lg:items-center text-white">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#25d7da]/30 bg-[#25d7da]/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#25d7da]">
              Featured Masterclass
            </span>
            <h2 className="mt-3 font-expanded text-3xl sm:text-5xl lg:text-6xl font-bold uppercase text-white tracking-wide">
              {event.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-white/80">
              {event.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-xs sm:text-sm font-semibold text-white/90">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md">
                <Icon name="calendar_month" size={18} className="text-[#25d7da]" />
                {event.dateLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md">
                <Icon name="schedule" size={18} className="text-[#25d7da]" />
                {event.timeLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md">
                <Icon name="location_on" size={18} className="text-[#25d7da]" />
                {event.venue}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onBook(event.id)}
              disabled={booked}
              className="mt-8 rounded-full bg-[#25d7da] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-70 shadow-lg"
            >
              {booked ? 'Reserved' : 'Reserve Seat'}
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className={`card-motion glass-card group grid rounded-xl lg:grid-cols-[280px_minmax(0,1fr)] ${className}`}
    >
      <div className="relative h-56 overflow-hidden lg:h-full">
        <img
          src={event.image}
          alt=""
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-on-primary">
          {event.category}
        </span>
      </div>
      <div className="flex flex-col justify-between gap-6 p-6 lg:flex-row lg:items-center lg:p-8">
        <div className="min-w-0">
          <h3 className="font-expanded text-2xl font-bold">{event.title}</h3>
          <p className="mt-2 text-sm text-on-variant-light dark:text-on-variant-dark">
            {event.description}
          </p>
          <p className="mt-3 text-sm font-semibold text-terracotta dark:text-terracotta-muted">
            {event.dateLabel} · {event.timeLabel} · {instructor?.name ?? event.venue}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-6 lg:flex-col lg:items-end">
          <span className="font-expanded text-xl font-bold">
            {event.priceInr === 0 ? 'Free' : formatInr(event.priceInr)}
          </span>
          <button
            type="button"
            onClick={() => onBook(event.id)}
            disabled={booked}
            className="btn-glow rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-70"
          >
            {booked ? 'Reserved' : 'Book now'}
          </button>
        </div>
      </div>
    </article>
  )
}
