import { useAcademy } from '../hooks/useAcademy'
import { formatInr, weekdayInitials } from '../lib/format'
import type { ApiClass } from '../lib/api'
import { Icon } from './Icon'

interface ClassCardProps {
  readonly danceClass: ApiClass
  readonly booked?: boolean
  readonly onBook: (classId: string) => void
  readonly className?: string
}

export function ClassCard({
  danceClass,
  booked = false,
  onBook,
  className = '',
}: ClassCardProps) {
  const { instructorById } = useAcademy()
  const instructor = danceClass.instructor || instructorById(danceClass.instructorId)

  return (
    <article
      className={`card-motion glass-card group grid rounded-xl lg:grid-cols-[300px_minmax(0,1fr)] ${className}`}
    >
      <div className="relative h-56 min-h-[220px] overflow-hidden lg:h-full">
        <img
          src={danceClass.imageUrl || (danceClass as any).image || ''}
          alt=""
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="glass rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-on-primary">
            {danceClass.style}
          </span>
          <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-on-primary ring-1 ring-primary/20">
            {danceClass.level}
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-6 p-6 lg:flex-row lg:items-center lg:p-8">
        <div className="min-w-0 flex-1">
          <h3 className="font-expanded text-2xl font-bold">{danceClass.name}</h3>
          <p className="mt-2 max-w-2xl text-sm text-on-variant-light dark:text-on-variant-dark">
            {danceClass.blurb}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <img
              src={instructor?.avatarUrl || (instructor as any)?.avatar || ''}
              alt=""
              className="size-12 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <p className="font-semibold">{instructor?.name}</p>
              <p className="text-sm text-on-variant-light dark:text-on-variant-dark">
                {instructor?.title}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm font-semibold text-on-variant-light dark:text-on-variant-dark">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="schedule" size={18} />
              {danceClass.durationMin} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar_view_week" size={18} />
              {weekdayInitials((danceClass.weekdays || []) as any)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="group" size={18} />
              {danceClass.enrolled}/{danceClass.capacity} enrolled
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-6 lg:w-44 lg:flex-col lg:items-stretch">
          <p className="font-expanded text-2xl font-bold text-primary">
            {formatInr(danceClass.priceInr)}
            <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-on-variant-light dark:text-on-variant-dark">
              per month
            </span>
          </p>
          <button
            type="button"
            onClick={() => onBook(danceClass.id)}
            disabled={booked}
            className="btn-glow rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary disabled:opacity-70"
          >
            {booked ? 'Booked' : 'Book now'}
          </button>
        </div>
      </div>
    </article>
  )
}
