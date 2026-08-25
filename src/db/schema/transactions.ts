import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  kind: text('kind', { enum: ['class', 'event', 'plan'] }).notNull(),
  referenceId: text('reference_id').notNull(),
  title: text('title').notNull(),
  amountInr: integer('amount_inr').notNull(),
  status: text('status', { enum: ['Paid', 'Refunded', 'Pending', 'Failed'] })
    .notNull()
    .default('Paid'),
  paymentMethod: text('payment_method'),
  gatewayRef: text('gateway_ref'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
