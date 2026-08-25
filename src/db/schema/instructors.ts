import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const instructors = pgTable('instructors', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  name: text('name').notNull(),
  title: text('title').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
