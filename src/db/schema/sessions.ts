import { pgTable, uuid, text, date, time, timestamp } from 'drizzle-orm/pg-core'
import { classes } from './classes'

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  classId: text('class_id')
    .notNull()
    .references(() => classes.id),
  date: date('date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  studio: text('studio').notNull(),
  status: text('status', {
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
  })
    .notNull()
    .default('scheduled'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
