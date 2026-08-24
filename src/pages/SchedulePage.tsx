import { useAcademy } from '../hooks/useAcademy'
import { useScheduleDate } from '../hooks/useScheduleDate'
import { formatChipDate } from '../lib/format'
import { ScheduleItem } from '../components/ScheduleItem'
import { Icon } from '../components/Icon'
import { PageSection } from '../components/Navigation'

interface SchedulePageProps {
  readonly className?: string
}

export function SchedulePage({ className = '' }: SchedulePageProps) {
  const { dates, selectedOffset, setSelectedOffset, sessions } = useScheduleDate()
  const { bookedSessionIds, reserveSession } = useAcademy()
  const selected = dates[selectedOffset]

  return (
    <PageSection className={`py-12 lg:py-16 ${className}`}>
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta dark:text-terracotta-muted">
            Studio diary
          </p>
          <h1 className="mt-1 font-expanded text-4xl font-bold">Schedule</h1>
          <p className="mt-2 text-on-variant-light dark:text-on-variant-dark">
            {selected?.toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}{' '}
            · {sessions.length} live {sessions.length === 1 ? 'batch' : 'batches'}
          </p>
        </div>
        <ul className="flex flex-wrap gap-4 text-sm">
          <Legend color="bg-primary" label="In progress" />
          <Legend color="bg-terracotta-muted" label="Reserve spot" />
          <Legend color="bg-success" label="Booked" />
        </ul>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-1 lg:overflow-visible">
        {dates.map((date, index) => {
          const chip = formatChipDate(date)
          const selectedChip = index === selectedOffset
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setSelectedOffset(index)}
              className={`flex min-w-[72px] flex-1 flex-col items-center rounded-xl px-2 py-3 ${
                selectedChip
                  ? 'bg-primary text-on-primary'
                  : 'glass text-on-variant-light'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {chip.weekday}
              </span>
              <span className="font-expanded text-xl font-bold">{chip.day}</span>
            </button>
          )
        })}
      </div>

      {sessions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {sessions.map((session) => (
            <ScheduleItem
              key={session.id}
              session={session}
              booked={bookedSessionIds.has(session.id)}
              onReserve={reserveSession}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl glass-card p-12 text-center">
          <Icon name="event_busy" size={36} className="text-terracotta" />
          <p className="mt-3">No sessions on this date. Studio rest day.</p>
        </div>
      )}
    </PageSection>
  )
}

interface LegendProps {
  readonly color: string
  readonly label: string
}

function Legend({ color, label }: LegendProps) {
  return (
    <li className="flex items-center gap-2">
      <span className={`size-2.5 rounded-full ${color}`} />
      {label}
    </li>
  )
}
