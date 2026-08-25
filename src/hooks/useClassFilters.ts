import { useMemo, useState } from 'react'
import { useAcademy } from './useAcademy'
import type { ApiClass } from '../lib/api'
import type { DanceStyle, ExperienceLevel } from '../types'

interface ClassFilters {
  readonly style: DanceStyle | 'All'
  readonly level: ExperienceLevel | 'All'
  readonly instructorId: string
}

interface UseClassFiltersResult {
  readonly filters: ClassFilters
  readonly setStyle: (style: DanceStyle | 'All') => void
  readonly setLevel: (level: ExperienceLevel | 'All') => void
  readonly setInstructorId: (instructorId: string) => void
  readonly reset: () => void
  readonly filteredClasses: readonly ApiClass[]
}

const INITIAL: ClassFilters = {
  style: 'All',
  level: 'All',
  instructorId: 'All',
}

export function useClassFilters(): UseClassFiltersResult {
  const { classes } = useAcademy()
  const [filters, setFilters] = useState<ClassFilters>(INITIAL)

  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      const styleOk = filters.style === 'All' || item.style === filters.style.toLowerCase()
      const levelOk = filters.level === 'All' || item.level === filters.level
      const instructorOk =
        filters.instructorId === 'All' || item.instructorId === filters.instructorId
      return styleOk && levelOk && instructorOk
    })
  }, [filters, classes])

  return {
    filters,
    setStyle: (style) => setFilters((current) => ({ ...current, style })),
    setLevel: (level) => setFilters((current) => ({ ...current, level })),
    setInstructorId: (instructorId) =>
      setFilters((current) => ({ ...current, instructorId })),
    reset: () => setFilters(INITIAL),
    filteredClasses,
  }
}
