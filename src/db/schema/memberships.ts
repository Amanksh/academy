import { pgTable, uuid, text, date, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { membershipPlans } from './membershipPlans'

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  planId: text('plan_id')
    .notNull()
    .references(() => membershipPlans.id),
  startsOn: date('starts_on').notNull(),
  renewsOn: date('renews_on').notNull(),
  status: text('status', { enum: ['active', 'expired', 'cancelled'] })
    .notNull()
    .default('active'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
