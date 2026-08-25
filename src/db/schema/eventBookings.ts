import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { events } from './events'

export const eventBookings = pgTable(
  'event_bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id),
    bookedAt: timestamp('booked_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    status: text('status', { enum: ['confirmed', 'cancelled', 'waitlisted'] })
      .notNull()
      .default('confirmed'),
  },
  (t) => [unique('uq_user_event').on(t.userId, t.eventId)],
)
