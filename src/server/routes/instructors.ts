import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { instructors } from '../../db/schema'

const router = Router()

// ────────────────────── GET /api/instructors ──────────────────────
router.get('/', async (_req, res) => {
  try {
    const result = await db.query.instructors.findMany({
      with: { classes: true },
    })

    res.json({ instructors: result })
  } catch (err) {
    console.error('Instructors list error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ────────────────────── GET /api/instructors/:id ──────────────────────
router.get('/:id', async (req, res) => {
  try {
    const instructor = await db.query.instructors.findFirst({
      where: eq(instructors.id, req.params.id),
      with: { classes: true, events: true },
    })

    if (!instructor) {
      res.status(404).json({ error: 'Instructor not found' })
      return
    }

    res.json({ instructor })
  } catch (err) {
    console.error('Instructor detail error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
