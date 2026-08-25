import {
  pgTable,
  text,
  date,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { instructors } from './instructors'

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category', {
    enum: ['Workshops', 'Performances', 'Auditions'],
  }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  timeLabel: text('time_label').notNull(),
  venue: text('venue').notNull(),
  imageUrl: text('image_url'),
  instructorId: text('instructor_id').references(() => instructors.id),
  priceInr: integer('price_inr').notNull().default(0),
  isFeatured: boolean('is_featured').notNull().default(false),
  description: text('description'),
  capacity: integer('capacity'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
