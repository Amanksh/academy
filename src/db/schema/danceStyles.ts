import { pgTable, text } from 'drizzle-orm/pg-core'

export const danceStyles = pgTable('dance_styles', {
  slug: text('slug').primaryKey(),
  label: text('label').notNull(),
})
