import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, type ApiClass, type ApiEvent, type ApiInstructor, type ApiMembershipPlan } from '../lib/api'
import type { PendingBooking } from '../types'

export interface AcademyContextValue {
  // Data from API
  readonly classes: ApiClass[]
  readonly events: ApiEvent[]
  readonly instructors: ApiInstructor[]
  readonly membershipPlans: ApiMembershipPlan[]
  readonly dataLoading: boolean

  // Booking state (client-side)
  readonly bookedClassIds: ReadonlySet<string>
  readonly bookedEventIds: ReadonlySet<string>
  readonly bookedSessionIds: ReadonlySet<string>
  readonly activePlanId: string
  readonly pending: PendingBooking | null
  readonly toast: string | null
  readonly openBooking: (booking: PendingBooking) => void
  readonly closeBooking: () => void
  readonly confirmBooking: () => void
  readonly reserveSession: (sessionId: string) => void
  readonly dismissToast: () => void

  // Lookup helpers (work on fetched data)
  readonly classById: (id: string) => ApiClass | undefined
  readonly eventById: (id: string) => ApiEvent | undefined
  readonly instructorById: (id: string) => ApiInstructor | undefined
  readonly planById: (id: string) => ApiMembershipPlan | undefined
}

export const AcademyContext = createContext<AcademyContextValue | null>(null)

interface AcademyProviderProps {
  readonly children: ReactNode
}

export function AcademyProvider({ children }: AcademyProviderProps) {
  // ── API data ──
  const [classes, setClasses] = useState<ApiClass[]>([])
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [instructors, setInstructors] = useState<ApiInstructor[]>([])
  const [membershipPlans, setMembershipPlans] = useState<ApiMembershipPlan[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  // Fetch all catalog data on mount
  useEffect(() => {
    async function fetchAll() {
      try {
        const [classesRes, eventsRes, instructorsRes, plansRes] = await Promise.all([
          api.classes.list(),
          api.events.list(),
          api.instructors.list(),
          api.membership.plans(),
        ])
        setClasses(classesRes.classes)
        setEvents(eventsRes.events)
        setInstructors(instructorsRes.instructors)
        setMembershipPlans(plansRes.plans)
      } catch (err) {
        console.error('Failed to fetch academy data:', err)
      } finally {
        setDataLoading(false)
      }
    }
    fetchAll()
  }, [])

  // ── Lookup maps ──
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes])
  const eventMap = useMemo(() => new Map(events.map((e) => [e.id, e])), [events])
  const instructorMap = useMemo(() => new Map(instructors.map((i) => [i.id, i])), [instructors])
  const planMap = useMemo(() => new Map(membershipPlans.map((p) => [p.id, p])), [membershipPlans])

  const classById = useCallback((id: string) => classMap.get(id), [classMap])
  const eventById = useCallback((id: string) => eventMap.get(id), [eventMap])
  const instructorById = useCallback((id: string) => instructorMap.get(id), [instructorMap])
  const planById = useCallback((id: string) => planMap.get(id), [planMap])

  // ── Booking state (client-side) ──
  const [bookedClassIds, setBookedClassIds] = useState<Set<string>>(
    () => new Set(['bharatanatyam-technique']),
  )
  const [bookedEventIds, setBookedEventIds] = useState<Set<string>>(() => new Set())
  const [bookedSessionIds, setBookedSessionIds] = useState<Set<string>>(
    () => new Set(['s3', 's8']),
  )
  const [activePlanId, setActivePlanId] = useState('plan-3')
  const [pending, setPending] = useState<PendingBooking | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const openBooking = useCallback((booking: PendingBooking) => {
    setPending(booking)
  }, [])

  const closeBooking = useCallback(() => {
    setPending(null)
  }, [])

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  const confirmBooking = useCallback(() => {
    if (!pending) return

    if (pending.kind === 'class') {
      const danceClass = classById(pending.id)
      setBookedClassIds((current) => new Set(current).add(pending.id))
      setToast(`${danceClass?.name ?? 'Class'} is booked`)
    }

    if (pending.kind === 'event') {
      const event = eventById(pending.id)
      setBookedEventIds((current) => new Set(current).add(pending.id))
      setToast(`${event?.title ?? 'Event'} reserved`)
    }

    if (pending.kind === 'plan') {
      const plan = planById(pending.id)
      setActivePlanId(pending.id)
      setToast(`${plan?.label ?? 'Plan'} membership is active`)
    }

    setPending(null)
  }, [pending, classById, eventById, planById])

  const reserveSession = useCallback((sessionId: string) => {
    setBookedSessionIds((current) => new Set(current).add(sessionId))
    setToast('Spot reserved')
  }, [])

  const value = useMemo<AcademyContextValue>(
    () => ({
      classes,
      events,
      instructors,
      membershipPlans,
      dataLoading,
      bookedClassIds,
      bookedEventIds,
      bookedSessionIds,
      activePlanId,
      pending,
      toast,
      openBooking,
      closeBooking,
      confirmBooking,
      reserveSession,
      dismissToast,
      classById,
      eventById,
      instructorById,
      planById,
    }),
    [
      classes,
      events,
      instructors,
      membershipPlans,
      dataLoading,
      bookedClassIds,
      bookedEventIds,
      bookedSessionIds,
      activePlanId,
      pending,
      toast,
      openBooking,
      closeBooking,
      confirmBooking,
      reserveSession,
      dismissToast,
      classById,
      eventById,
      instructorById,
      planById,
    ],
  )

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>
}
