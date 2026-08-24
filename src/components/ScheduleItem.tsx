import { classById, instructorById } from '../data/mockData'
import type { ScheduleSession, SessionStatus } from '../types'
import { Icon } from './Icon'

interface ScheduleItemProps {
  readonly session: ScheduleSession
  readonly booked?: boolean
  readonly onReserve: (sessionId: string) => void
  readonly className?: string
}

const STATUS_LABEL: Record<SessionStatus, string> = {
  'in-progress': 'In progress',
  reserve: 'Reserve spot',
  booked: 'Booked',
}

export function ScheduleItem({
  session,
  booked = false,
  onReserve,
  className = '',
}: ScheduleItemProps) {
  const danceClass = classById(session.classId)
  const instructor = danceClass
    ? instructorById(danceClass.instructorId)
    : undefined
  const status: SessionStatus = booked ? 'booked' : session.status

  return (
    <article
      className={`card-motion glass-card group grid rounded-xl lg:grid-cols-[140px_220px_minmax(0,1fr)_auto] ${className}`}
    >
      <div className="flex items-center gap-4 border-b border-white/5 px-6 py-5 lg:border-b-0 lg:border-r">
        <div
          className={`hidden h-12 w-1 rounded-full lg:block ${
            status === 'in-progress'
              ? 'bg-primary'
              : status === 'booked'
                ? 'bg-success'
                : 'bg-spark'
          }`}
        />
        <div>
          <p className="font-expanded text-lg font-bold">{session.time}</p>
          <p className="text-sm text-on-variant-light dark:text-on-variant-dark">
            {session.endTime}
          </p>
        </div>
      </div>
      <div className="hidden overflow-hidden lg:block">
        <img
          src={danceClass?.image}
          alt=""
          className="h-full min-h-[140px] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </div>
      <div className="flex items-center gap-4 px-6 py-5">
        <img
          src={instructor?.avatar}
          alt=""
          className="size-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-expanded text-xl font-bold">{danceClass?.name}</h3>
          <p className="mt-1 text-sm text-on-variant-light dark:text-on-variant-dark">
            {instructor?.name} · {session.studio} · {danceClass?.style}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 px-6 pb-5 lg:justify-end lg:py-5 lg:pr-8">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
            status === 'in-progress'
              ? 'glass text-primary'
              : status === 'booked'
                ? 'glass text-success'
                : 'glass text-spark'
          }`}
        >
          <Icon
            name={
              status === 'in-progress'
                ? 'play_circle'
                : status === 'booked'
                  ? 'check_circle'
                  : 'event_available'
            }
            size={16}
            filled
          />
          {STATUS_LABEL[status]}
        </span>
        {status === 'reserve' ? (
          <button
            type="button"
            onClick={() => onReserve(session.id)}
            className="btn-glow rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
          >
            Reserve
          </button>
        ) : null}
      </div>
    </article>
  )
}
