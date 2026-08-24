import { useMemo, useState } from 'react'
import { schedule } from '../data/mockData'
import type { ScheduleSession } from '../types'

interface UseScheduleDateResult {
  readonly dates: readonly Date[]
  readonly selectedOffset: number
  readonly setSelectedOffset: (offset: number) => void
  readonly sessions: readonly ScheduleSession[]
}

function startOfToday(): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export function useScheduleDate(): UseScheduleDateResult {
  const [selectedOffset, setSelectedOffset] = useState(0)

  const dates = useMemo(() => {
    const today = startOfToday()
    return Array.from({ length: 14 }, (_, index) => {
      const next = new Date(today)
      next.setDate(today.getDate() + index)
      return next
    })
  }, [])

  const sessions = useMemo(
    () => schedule.filter((item) => item.dateOffset === selectedOffset),
    [selectedOffset],
  )

  return { dates, selectedOffset, setSelectedOffset, sessions }
}
