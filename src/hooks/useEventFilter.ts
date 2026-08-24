import { useMemo, useState } from 'react'
import { events } from '../data/mockData'
import type { AcademyEvent, EventCategory } from '../types'

interface UseEventFilterResult {
  readonly category: EventCategory | 'All'
  readonly setCategory: (category: EventCategory | 'All') => void
  readonly featured: AcademyEvent | undefined
  readonly visibleEvents: readonly AcademyEvent[]
}

export function useEventFilter(): UseEventFilterResult {
  const [category, setCategory] = useState<EventCategory | 'All'>('All')

  const featured = useMemo(
    () => events.find((item) => item.featured),
    [],
  )

  const visibleEvents = useMemo(() => {
    return events.filter((item) => {
      if (item.featured) return false
      return category === 'All' || item.category === category
    })
  }, [category])

  return { category, setCategory, featured, visibleEvents }
}
