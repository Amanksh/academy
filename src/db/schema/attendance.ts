import {
  pgTable,
  uuid,
  integer,
  boolean,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { sessions } from './sessions'

export const attendance = pgTable(
  'attendance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id),
    checkedIn: boolean('checked_in').notNull().default(false),
    xpEarned: integer('xp_earned').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique('uq_user_session').on(t.userId, t.sessionId)],
)
