import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { sessions } from '../../db/schema'

const router = Router()

// ────────────────────── GET /api/schedule ──────────────────────
// ?date=2026-08-25  (optional, defaults to today)
router.get('/', async (req, res) => {
  try {
    const dateParam =
      (req.query.date as string) || new Date().toISOString().slice(0, 10)

    const result = await db.query.sessions.findMany({
      where: eq(sessions.date, dateParam),
      with: {
        class: {
          with: { instructor: true },
        },
      },
      orderBy: (sessions, { asc }) => [asc(sessions.startTime)],
    })

    res.json({ date: dateParam, sessions: result })
  } catch (err) {
    console.error('Schedule error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
