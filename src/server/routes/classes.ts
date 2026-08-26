import { Router } from 'express'
import { eq, count } from 'drizzle-orm'
import { db } from '../../db'
import { classes, enrollments } from '../../db/schema'

const router = Router()

// ────────────────────── GET /api/classes ──────────────────────
router.get('/', async (_req, res) => {
  try {
    const result = await db.query.classes.findMany({
      where: eq(classes.isActive, true),
      with: {
        instructor: true,
        schedules: true,
      },
    })

    // Attach enrolled count via a single batch group-by query
    const enrollmentCounts = await db
      .select({
        classId: enrollments.classId,
        count: count(),
      })
      .from(enrollments)
      .groupBy(enrollments.classId)

    const countMap = new Map(enrollmentCounts.map((e) => [e.classId, e.count]))

    const enriched = result.map((cls) => ({
      ...cls,
      enrolled: countMap.get(cls.id) || 0,
      weekdays: cls.schedules.map((s) => s.weekday),
    }))

    res.json({ classes: enriched })
  } catch (err) {
    console.error('Classes list error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ────────────────────── GET /api/classes/:id ──────────────────────
router.get('/:id', async (req, res) => {
  try {
    const cls = await db.query.classes.findFirst({
      where: eq(classes.id, req.params.id),
      with: {
        instructor: true,
        schedules: true,
      },
    })

    if (!cls) {
      res.status(404).json({ error: 'Class not found' })
      return
    }

    const [{ value }] = await db
      .select({ value: count() })
      .from(enrollments)
      .where(eq(enrollments.classId, cls.id))

    res.json({
      class: {
        ...cls,
        enrolled: value,
        weekdays: cls.schedules.map((s) => s.weekday),
      },
    })
  } catch (err) {
    console.error('Class detail error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
