import { useEffect, useMemo, useState } from 'react'
import { api, type ApiSession } from '../lib/api'

interface UseScheduleDateResult {
  readonly dates: readonly Date[]
  readonly selectedOffset: number
  readonly setSelectedOffset: (offset: number) => void
  readonly sessions: readonly ApiSession[]
  readonly loading: boolean
}

function startOfToday(): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function useScheduleDate(): UseScheduleDateResult {
  const [selectedOffset, setSelectedOffset] = useState(0)
  const [sessions, setSessions] = useState<ApiSession[]>([])
  const [loading, setLoading] = useState(false)

  const dates = useMemo(() => {
    const today = startOfToday()
    return Array.from({ length: 14 }, (_, index) => {
      const next = new Date(today)
      next.setDate(today.getDate() + index)
      return next
    })
  }, [])

  // Fetch sessions for the selected date
  useEffect(() => {
    const date = dates[selectedOffset]
    if (!date) return

    setLoading(true)
    api.schedule
      .byDate(formatDateISO(date))
      .then((res) => setSessions(res.sessions))
      .catch((err) => {
        console.error('Schedule fetch error:', err)
        setSessions([])
      })
      .finally(() => setLoading(false))
  }, [selectedOffset, dates])

  return { dates, selectedOffset, setSelectedOffset, sessions, loading }
}
