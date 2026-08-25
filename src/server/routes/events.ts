import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { events } from '../../db/schema'

const router = Router()

// ────────────────────── GET /api/events ──────────────────────
router.get('/', async (_req, res) => {
  try {
    const result = await db.query.events.findMany({
      with: { instructor: true },
      orderBy: (events, { asc }) => [asc(events.startDate)],
    })

    res.json({ events: result })
  } catch (err) {
    console.error('Events list error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ────────────────────── GET /api/events/:id ──────────────────────
router.get('/:id', async (req, res) => {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, req.params.id),
      with: { instructor: true },
    })

    if (!event) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    res.json({ event })
  } catch (err) {
    console.error('Event detail error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
