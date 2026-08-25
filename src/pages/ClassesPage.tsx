import type { ReactNode } from 'react'
import { useAcademy } from '../hooks/useAcademy'
import { useClassFilters } from '../hooks/useClassFilters'
import { ClassCard } from '../components/ClassCard'
import { FilterChip } from '../components/FilterChip'
import { PageSection } from '../components/Navigation'
import type { DanceStyle } from '../types'

const DANCE_STYLE_FILTERS = ['All', 'Kathak', 'Bharatanatyam', 'Contemporary', 'Odissi'] as const

interface ClassesPageProps {
  readonly className?: string
}

export function ClassesPage({ className = '' }: ClassesPageProps) {
  const {
    filters,
    setStyle,
    setInstructorId,
    reset,
    filteredClasses,
  } = useClassFilters()
  const { openBooking, bookedClassIds, instructors } = useAcademy()

  return (
    <PageSection className={`py-12 lg:py-16 ${className}`}>
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#25d7da]">
            Catalogue
          </p>
          <h1 className="mt-1 font-expanded text-4xl font-bold">Classes</h1>
          <p className="mt-2 text-on-variant-light dark:text-on-variant-dark">
            {filteredClasses.length} batch{filteredClasses.length === 1 ? '' : 'es'} this season
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="self-start text-sm font-bold uppercase tracking-wider text-primary"
        >
          Reset filters
        </button>
      </div>

      <div className="mb-10 rounded-2xl glass-card p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <FilterGroup label="Dance style">
            {DANCE_STYLE_FILTERS.map((style) => (
              <FilterChip
                key={style}
                label={style}
                selected={filters.style === style}
                onSelect={() => setStyle(style as DanceStyle | 'All')}
              />
            ))}
          </FilterGroup>
          <FilterGroup label="Instructor">
            <FilterChip
              label="All"
              selected={filters.instructorId === 'All'}
              onSelect={() => setInstructorId('All')}
            />
            {instructors.map((person) => (
              <FilterChip
                key={person.id}
                label={person.name.split(' ')[0] ?? person.name}
                selected={filters.instructorId === person.id}
                onSelect={() => setInstructorId(person.id)}
              />
            ))}
          </FilterGroup>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredClasses.map((item) => (
          <ClassCard
            key={item.id}
            danceClass={item}
            booked={bookedClassIds.has(item.id)}
            onBook={(id) => openBooking({ kind: 'class', id })}
          />
        ))}
      </div>
      {filteredClasses.length === 0 ? (
        <p className="rounded-xl glass-card p-10 text-center">
          No classes match those filters. Reset to see the full catalogue.
        </p>
      ) : null}
    </PageSection>
  )
}

interface FilterGroupProps {
  readonly label: string
  readonly children: ReactNode
}

function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-terracotta dark:text-terracotta-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
