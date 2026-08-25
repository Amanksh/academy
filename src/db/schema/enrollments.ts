import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { classes } from './classes'

export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    classId: text('class_id')
      .notNull()
      .references(() => classes.id),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    status: text('status', { enum: ['active', 'dropped', 'completed'] })
      .notNull()
      .default('active'),
  },
  (t) => [unique('uq_user_class').on(t.userId, t.classId)],
)
