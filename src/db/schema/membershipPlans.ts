import { pgTable, text, integer, boolean } from 'drizzle-orm/pg-core'

export const membershipPlans = pgTable('membership_plans', {
  id: text('id').primaryKey(),
  months: integer('months').notNull(),
  priceInr: integer('price_inr').notNull(),
  batches: integer('batches').notNull(),
  label: text('label').notNull(),
  detail: text('detail'),
  bestValue: boolean('best_value').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
})
