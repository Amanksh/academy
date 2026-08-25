import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import {
  membershipPlans,
  memberships,
  enrollments,
  eventBookings,
  transactions,
} from '../../db/schema'
import { requireAuth, type AuthRequest } from '../middleware/auth'

const router = Router()

// ────────────────────── GET /api/membership/plans ──────────────────────
router.get('/plans', async (_req, res) => {
  try {
    const plans = await db.query.membershipPlans.findMany({
      where: eq(membershipPlans.isActive, true),
    })

    res.json({ plans })
  } catch (err) {
    console.error('Plans error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ────────────────────── GET /api/membership/me ──────────────────────
// Returns the current user's active membership, enrollments, bookings & transactions
router.get('/me', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user!.userId

    const [membership] = await db.query.memberships.findMany({
      where: eq(memberships.userId, userId),
      with: { plan: true },
      orderBy: (memberships, { desc }) => [desc(memberships.createdAt)],
      limit: 1,
    })

    const userEnrollments = await db.query.enrollments.findMany({
      where: eq(enrollments.userId, userId),
      with: {
        class: {
          with: { instructor: true },
        },
      },
    })

    const userBookings = await db.query.eventBookings.findMany({
      where: eq(eventBookings.userId, userId),
      with: { event: true },
    })

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt)

    res.json({
      membership: membership || null,
      enrollments: userEnrollments,
      eventBookings: userBookings,
      transactions: userTransactions,
    })
  } catch (err) {
    console.error('Membership me error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
