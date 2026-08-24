import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  classById,
  eventById,
  planById,
} from '../data/mockData'
import type { PendingBooking } from '../types'

export interface AcademyContextValue {
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
}

export const AcademyContext = createContext<AcademyContextValue | null>(null)

interface AcademyProviderProps {
  readonly children: ReactNode
}

export function AcademyProvider({ children }: AcademyProviderProps) {
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
  }, [pending])

  const reserveSession = useCallback((sessionId: string) => {
    setBookedSessionIds((current) => new Set(current).add(sessionId))
    setToast('Spot reserved')
  }, [])

  const value = useMemo<AcademyContextValue>(
    () => ({
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
    }),
    [
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
    ],
  )

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>
}
