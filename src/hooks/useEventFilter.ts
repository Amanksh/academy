import { useMemo, useState } from 'react'
import { useAcademy } from './useAcademy'
import type { ApiEvent } from '../lib/api'
import type { EventCategory } from '../types'

interface UseEventFilterResult {
  readonly category: EventCategory | 'All'
  readonly setCategory: (category: EventCategory | 'All') => void
  readonly featured: ApiEvent | undefined
  readonly visibleEvents: readonly ApiEvent[]
}

export function useEventFilter(): UseEventFilterResult {
  const { events } = useAcademy()
  const [category, setCategory] = useState<EventCategory | 'All'>('All')

  const featured = useMemo(
    () => events.find((item) => item.isFeatured),
    [events],
  )

  const visibleEvents = useMemo(() => {
    return events.filter((item) => {
      if (item.isFeatured) return false
      return category === 'All' || item.category === category
    })
  }, [category, events])

  return { category, setCategory, featured, visibleEvents }
}
