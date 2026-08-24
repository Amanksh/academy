import { eventCategories } from '../data/mockData'
import { useAcademy } from '../hooks/useAcademy'
import { useEventFilter } from '../hooks/useEventFilter'
import { EventCard } from '../components/EventCard'
import { FilterChip } from '../components/FilterChip'
import { PageSection } from '../components/Navigation'
import { TrendingRail } from '../components/TrendingRail'
import type { EventCategory } from '../types'

interface EventsPageProps {
  readonly className?: string
}

export function EventsPage({ className = '' }: EventsPageProps) {
  const { category, setCategory, featured, visibleEvents } = useEventFilter()
  const { openBooking, bookedEventIds } = useAcademy()

  return (
    <div className={className}>
      {featured ? (
        <EventCard
          event={featured}
          featured
          booked={bookedEventIds.has(featured.id)}
          onBook={(id) => openBooking({ kind: 'event', id })}
        />
      ) : null}

      <div className="gradient-divider" />

      <PageSection className="py-12 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta dark:text-terracotta-muted">
              Calendar
            </p>
            <h2 className="mt-1 font-expanded text-3xl font-bold">Upcoming events</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {eventCategories.map((item) => (
              <FilterChip
                key={item}
                label={item}
                selected={category === item}
                onSelect={() => setCategory(item as EventCategory | 'All')}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-6">
          {visibleEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              booked={bookedEventIds.has(event.id)}
              onBook={(id) => openBooking({ kind: 'event', id })}
            />
          ))}
        </div>
      </PageSection>

      <div className="gradient-divider mx-6 sm:mx-10 lg:mx-16 xl:mx-20" />

      <PageSection className="pb-16">
        <TrendingRail onBook={(id) => openBooking({ kind: 'class', id })} />
      </PageSection>
    </div>
  )
}
