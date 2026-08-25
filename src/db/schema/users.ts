import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  handle: text('handle').unique().notNull(),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  tier: text('tier', { enum: ['Free', 'Member', 'Elite Member'] })
    .notNull()
    .default('Free'),
  xp: integer('xp').notNull().default(0),
  xpGoal: integer('xp_goal').notNull().default(3000),
  role: text('role', { enum: ['student', 'instructor', 'admin'] })
    .notNull()
    .default('student'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
