import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { instructors } from './instructors'
import { danceStyles } from './danceStyles'

export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  style: text('style')
    .notNull()
    .references(() => danceStyles.slug),
  level: text('level', { enum: ['Beginner', 'Intermediate', 'Advanced'] }).notNull(),
  instructorId: text('instructor_id')
    .notNull()
    .references(() => instructors.id),
  priceInr: integer('price_inr').notNull(),
  durationMin: integer('duration_min').notNull(),
  imageUrl: text('image_url'),
  capacity: integer('capacity').notNull(),
  blurb: text('blurb'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const classSchedules = pgTable(
  'class_schedules',
  {
    id: serial('id').primaryKey(),
    classId: text('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    weekday: text('weekday', {
      enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    }).notNull(),
  },
  (t) => [unique('uq_class_weekday').on(t.classId, t.weekday)],
)
