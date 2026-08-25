import { relations } from 'drizzle-orm'
import { users } from './users'
import { instructors } from './instructors'
import { classes, classSchedules } from './classes'
import { sessions } from './sessions'
import { events } from './events'
import { membershipPlans } from './membershipPlans'
import { memberships } from './memberships'
import { enrollments } from './enrollments'
import { eventBookings } from './eventBookings'
import { transactions } from './transactions'
import { attendance } from './attendance'
import { danceStyles } from './danceStyles'

// ── Users ──
export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  enrollments: many(enrollments),
  eventBookings: many(eventBookings),
  transactions: many(transactions),
  attendance: many(attendance),
}))

// ── Instructors ──
export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  user: one(users, {
    fields: [instructors.userId],
    references: [users.id],
  }),
  classes: many(classes),
  events: many(events),
}))

// ── Dance Styles ──
export const danceStylesRelations = relations(danceStyles, ({ many }) => ({
  classes: many(classes),
}))

// ── Classes ──
export const classesRelations = relations(classes, ({ one, many }) => ({
  style: one(danceStyles, {
    fields: [classes.style],
    references: [danceStyles.slug],
  }),
  instructor: one(instructors, {
    fields: [classes.instructorId],
    references: [instructors.id],
  }),
  schedules: many(classSchedules),
  sessions: many(sessions),
  enrollments: many(enrollments),
}))

export const classSchedulesRelations = relations(classSchedules, ({ one }) => ({
  class: one(classes, {
    fields: [classSchedules.classId],
    references: [classes.id],
  }),
}))

// ── Sessions ──
export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  class: one(classes, {
    fields: [sessions.classId],
    references: [classes.id],
  }),
  attendance: many(attendance),
}))

// ── Events ──
export const eventsRelations = relations(events, ({ one, many }) => ({
  instructor: one(instructors, {
    fields: [events.instructorId],
    references: [instructors.id],
  }),
  bookings: many(eventBookings),
}))

// ── Membership Plans ──
export const membershipPlansRelations = relations(membershipPlans, ({ many }) => ({
  memberships: many(memberships),
}))

// ── Memberships ──
export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  plan: one(membershipPlans, {
    fields: [memberships.planId],
    references: [membershipPlans.id],
  }),
}))

// ── Enrollments ──
export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
  }),
}))

// ── Event Bookings ──
export const eventBookingsRelations = relations(eventBookings, ({ one }) => ({
  user: one(users, {
    fields: [eventBookings.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [eventBookings.eventId],
    references: [events.id],
  }),
}))

// ── Transactions ──
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}))

// ── Attendance ──
export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
  session: one(sessions, {
    fields: [attendance.sessionId],
    references: [sessions.id],
  }),
}))
