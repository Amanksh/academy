export type DanceStyle = 'Kathak' | 'Bharatanatyam' | 'Contemporary' | 'Odissi'

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export type Weekday = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'

export type EventCategory = 'Workshops' | 'Performances' | 'Auditions'

export type SessionStatus = 'in-progress' | 'reserve' | 'booked'

export type BookingKind = 'class' | 'event' | 'plan'

export interface Instructor {
  readonly id: string
  readonly name: string
  readonly title: string
  readonly avatar: string
}

export interface DanceClass {
  readonly id: string
  readonly name: string
  readonly style: DanceStyle
  readonly level: ExperienceLevel
  readonly instructorId: string
  readonly priceInr: number
  readonly durationMin: number
  readonly weekdays: readonly Weekday[]
  readonly image: string
  readonly enrolled: number
  readonly capacity: number
  readonly blurb: string
}

export interface AcademyEvent {
  readonly id: string
  readonly title: string
  readonly category: EventCategory
  readonly dateLabel: string
  readonly timeLabel: string
  readonly venue: string
  readonly image: string
  readonly instructorId?: string
  readonly priceInr: number
  readonly featured?: boolean
  readonly description: string
}

export interface ScheduleSession {
  readonly id: string
  readonly classId: string
  readonly time: string
  readonly endTime: string
  readonly studio: string
  readonly status: SessionStatus
  readonly dateOffset: number
}

export interface MembershipPlan {
  readonly id: string
  readonly months: 1 | 3 | 6
  readonly priceInr: number
  readonly batches: number
  readonly label: string
  readonly detail: string
  readonly bestValue?: boolean
}

export interface Transaction {
  readonly id: string
  readonly title: string
  readonly dateLabel: string
  readonly amountInr: number
  readonly status: 'Paid' | 'Refunded'
}

export interface MemberProfile {
  readonly name: string
  readonly handle: string
  readonly avatar: string
  readonly tier: string
  readonly xp: number
  readonly xpGoal: number
  readonly planId: string
  readonly renewsOn: string
}

export interface PendingBooking {
  readonly kind: BookingKind
  readonly id: string
}
