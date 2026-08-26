import { useAcademy } from '../hooks/useAcademy'
import { formatInr } from '../lib/format'
import type { ApiEvent } from '../lib/api'
import { Icon } from './Icon'

interface EventCardProps {
  readonly event: ApiEvent
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
  if (!event) return null

  const { instructorById } = useAcademy()
  const instructor = event.instructor || (event.instructorId ? instructorById(event.instructorId) : undefined)

  // Compat: support both API shape (startDate) and mock shape (dateLabel)
  const dateLabel = (event as any).dateLabel || event.startDate
  const image = event.imageUrl || (event as any).image
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(image || '')

  if (featured) {
    return (
      <article className={`w-full overflow-hidden rounded-[28px] sm:rounded-[36px] border border-white/10 bg-black ${className}`}>
        <div className="grid lg:grid-cols-2">
          {/* Left — Media (50%) */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-[520px] overflow-hidden">
            {isVideo ? (
              <video
                src={image}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <img
                src={image}
                alt={event.title}
                className="hero-pan absolute inset-0 size-full object-cover"
              />
            )}
          </div>

          {/* Right — Info (50%) */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14 text-white bg-gradient-to-br from-black via-[#0a0a0a] to-[#111]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#25d7da]/30 bg-[#25d7da]/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#25d7da] w-fit">
              Featured Masterclass
            </span>
            <h2 className="mt-4 font-expanded text-3xl sm:text-4xl lg:text-5xl font-bold uppercase text-white tracking-wide">
              {event.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70">
              {event.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-white/90">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md">
                <Icon name="calendar_month" size={18} className="text-[#25d7da]" />
                {dateLabel}
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
              className="mt-8 w-fit rounded-full bg-[#25d7da] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-70 shadow-lg"
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
      className={`card-motion glass-card group overflow-hidden rounded-xl ${className}`}
    >
      <div className="grid lg:grid-cols-2">
        {/* Left — Media (50%) */}
        <div className="relative h-56 lg:h-[320px] overflow-hidden">
          {isVideo ? (
            <video
              src={image}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <img
              src={image}
              alt=""
              className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          )}
          <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-on-primary">
            {event.category}
          </span>
        </div>

        {/* Right — Info (50%) */}
        <div className="flex flex-col justify-center p-6 lg:p-8">
          <h3 className="font-expanded text-2xl font-bold">{event.title}</h3>
          <p className="mt-2 text-sm text-on-variant-light dark:text-on-variant-dark">
            {event.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-terracotta dark:text-terracotta-muted">
            <span className="inline-flex items-center gap-1">
              <Icon name="calendar_month" size={14} />
              {dateLabel}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="schedule" size={14} />
              {event.timeLabel}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="location_on" size={14} />
              {instructor?.name ?? event.venue}
            </span>
          </div>
          <div className="mt-5 flex items-center gap-4">
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
      </div>
    </article>
  )
}
