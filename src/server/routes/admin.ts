import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { eq, sql, count, desc, and } from 'drizzle-orm'
import { db } from '../../db'
import {
  users,
  instructors,
  classes,
  classSchedules,
  sessions,
  events,
  membershipPlans,
  memberships,
  transactions,
} from '../../db/schema'
import { signToken } from '../middleware/auth'

const router = Router()

// ────────────────────── POST /api/admin/login ──────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const inputIdentifier = (username || email || '').trim().toLowerCase()

    const isDefaultAdmin = inputIdentifier === 'admin@mudra' && password === 'Harsh@0404'

    // Look for user in DB
    let [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, inputIdentifier))
      .limit(1)

    if (isDefaultAdmin && !adminUser) {
      const passwordHash = await bcrypt.hash('Harsh@0404', 10)
      const inserted = await db
        .insert(users)
        .values({
          email: 'admin@mudra',
          passwordHash,
          name: 'Academy Administrator',
          handle: '@admin.mudra',
          role: 'admin',
          tier: 'Elite Member',
        })
        .onConflictDoNothing()
        .returning()

      adminUser = inserted[0]

      if (!adminUser) {
        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, 'admin@mudra'))
          .limit(1)
        adminUser = found[0]
      }
    }

    if (!adminUser) {
      res.status(401).json({ error: 'Invalid admin username or password' })
      return
    }

    const passwordMatches =
      isDefaultAdmin ||
      (await bcrypt.compare(password, adminUser.passwordHash))

    if (passwordMatches) {
      const token = signToken({
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role || 'admin',
      })
      const { passwordHash: _, ...safeUser } = adminUser
      res.json({ success: true, user: safeUser, token })
      return
    }

    res.status(401).json({ error: 'Invalid admin username or password' })
  } catch (err) {
    console.error('Admin login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ────────────────────── GET /api/admin/stats ──────────────────────
router.get('/stats', async (_req, res) => {
  try {
    const [{ totalUsers }] = await db
      .select({ totalUsers: count() })
      .from(users)

    const [{ totalMemberships }] = await db
      .select({ totalMemberships: count() })
      .from(memberships)
      .where(eq(memberships.status, 'active'))

    const [{ totalRevenue }] = await db
      .select({ totalRevenue: sql<number>`coalesce(sum(${transactions.amountInr}), 0)` })
      .from(transactions)
      .where(eq(transactions.status, 'Paid'))

    const [{ totalEvents }] = await db
      .select({ totalEvents: count() })
      .from(events)

    const [{ totalClasses }] = await db
      .select({ totalClasses: count() })
      .from(classes)
      .where(eq(classes.isActive, true))

    const recentTransactions = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(6)

    const nextSessions = await db.query.sessions.findMany({
      with: {
        class: {
          with: { instructor: true },
        },
      },
      orderBy: (sessions, { asc }) => [asc(sessions.date), asc(sessions.startTime)],
      limit: 4,
    })

    res.json({
      stats: {
        activeMembers: totalMemberships || totalUsers || 1,
        totalUsers,
        monthlyRevenue: totalRevenue ? `₹${(totalRevenue / 1000).toFixed(1)}k` : '₹4.2L',
        rawRevenue: totalRevenue,
        upcomingEvents: totalEvents,
        todayClasses: totalClasses,
      },
      recentActivity: recentTransactions,
      nextSessions,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ────────────────────── INSTRUCTORS CRUD ──────────────────────
router.post('/instructors', async (req, res) => {
  try {
    const { id, name, title, avatarUrl, bio } = req.body
    if (!name || !title) {
      res.status(400).json({ error: 'name and title are required' })
      return
    }

    const instructorId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '-')

    const [created] = await db
      .insert(instructors)
      .values({
        id: instructorId,
        name,
        title,
        avatarUrl:
          avatarUrl ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
        bio: bio || null,
      })
      .returning()

    res.status(201).json({ instructor: created })
  } catch (err) {
    console.error('Create instructor error:', err)
    res.status(500).json({ error: 'Failed to create instructor' })
  }
})

router.put('/instructors/:id', async (req, res) => {
  try {
    const { name, title, avatarUrl, bio } = req.body
    const [updated] = await db
      .update(instructors)
      .set({
        ...(name && { name }),
        ...(title && { title }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bio !== undefined && { bio }),
      })
      .where(eq(instructors.id, req.params.id))
      .returning()

    if (!updated) {
      res.status(404).json({ error: 'Instructor not found' })
      return
    }

    res.json({ instructor: updated })
  } catch (err) {
    console.error('Update instructor error:', err)
    res.status(500).json({ error: 'Failed to update instructor' })
  }
})

router.delete('/instructors/:id', async (req, res) => {
  try {
    await db.delete(instructors).where(eq(instructors.id, req.params.id))
    res.json({ success: true })
  } catch (err) {
    console.error('Delete instructor error:', err)
    res.status(500).json({ error: 'Failed to delete instructor. Make sure no classes depend on them.' })
  }
})

// ────────────────────── CLASSES CRUD ──────────────────────
router.post('/classes', async (req, res) => {
  try {
    const {
      id,
      name,
      style,
      level,
      instructorId,
      priceInr,
      durationMin,
      imageUrl,
      capacity,
      blurb,
      weekdays = ['Mon', 'Wed'],
    } = req.body

    if (!name || !style || !level || !instructorId || !priceInr || !durationMin || !capacity) {
      res.status(400).json({ error: 'Missing required class fields' })
      return
    }

    const classId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '-')

    const [created] = await db
      .insert(classes)
      .values({
        id: classId,
        name,
        style: style.toLowerCase(),
        level,
        instructorId,
        priceInr: Number(priceInr),
        durationMin: Number(durationMin),
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1547153760-18fcfa26afdc?auto=format&fit=crop&w=1200&q=80',
        capacity: Number(capacity),
        blurb: blurb || null,
        isActive: true,
      })
      .returning()

    if (Array.isArray(weekdays) && weekdays.length > 0) {
      const scheduleRows = weekdays.map((weekday: string) => ({
        classId: created.id,
        weekday: weekday as any,
      }))
      await db.insert(classSchedules).values(scheduleRows).onConflictDoNothing()
    }

    res.status(201).json({ class: created })
  } catch (err) {
    console.error('Create class error:', err)
    res.status(500).json({ error: 'Failed to create class' })
  }
})

router.put('/classes/:id', async (req, res) => {
  try {
    const {
      name,
      style,
      level,
      instructorId,
      priceInr,
      durationMin,
      imageUrl,
      capacity,
      blurb,
      weekdays,
      isActive,
    } = req.body

    const [updated] = await db
      .update(classes)
      .set({
        ...(name && { name }),
        ...(style && { style: style.toLowerCase() }),
        ...(level && { level }),
        ...(instructorId && { instructorId }),
        ...(priceInr !== undefined && { priceInr: Number(priceInr) }),
        ...(durationMin !== undefined && { durationMin: Number(durationMin) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(blurb !== undefined && { blurb }),
        ...(isActive !== undefined && { isActive }),
      })
      .where(eq(classes.id, req.params.id))
      .returning()

    if (!updated) {
      res.status(404).json({ error: 'Class not found' })
      return
    }

    if (Array.isArray(weekdays)) {
      await db.delete(classSchedules).where(eq(classSchedules.classId, req.params.id))
      if (weekdays.length > 0) {
        const scheduleRows = weekdays.map((weekday: string) => ({
          classId: req.params.id,
          weekday: weekday as any,
        }))
        await db.insert(classSchedules).values(scheduleRows).onConflictDoNothing()
      }
    }

    res.json({ class: updated })
  } catch (err) {
    console.error('Update class error:', err)
    res.status(500).json({ error: 'Failed to update class' })
  }
})

router.delete('/classes/:id', async (req, res) => {
  try {
    await db.delete(classes).where(eq(classes.id, req.params.id))
    res.json({ success: true })
  } catch (err) {
    console.error('Delete class error:', err)
    res.status(500).json({ error: 'Failed to delete class' })
  }
})

// ────────────────────── EVENTS CRUD ──────────────────────
router.post('/events', async (req, res) => {
  try {
    const {
      id,
      title,
      category,
      startDate,
      endDate,
      timeLabel,
      venue,
      imageUrl,
      instructorId,
      priceInr = 0,
      isFeatured = false,
      description,
      capacity,
    } = req.body

    if (!title || !category || !startDate || !timeLabel || !venue) {
      res.status(400).json({ error: 'Missing required event fields' })
      return
    }

    const eventId = id || title.toLowerCase().replace(/[^a-z0-9]/g, '-')

    const [created] = await db
      .insert(events)
      .values({
        id: eventId,
        title,
        category,
        startDate,
        endDate: endDate || null,
        timeLabel,
        venue,
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
        instructorId: instructorId || null,
        priceInr: Number(priceInr),
        isFeatured: Boolean(isFeatured),
        description: description || null,
        capacity: capacity ? Number(capacity) : null,
      })
      .returning()

    res.status(201).json({ event: created })
  } catch (err) {
    console.error('Create event error:', err)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

router.put('/events/:id', async (req, res) => {
  try {
    const {
      title,
      category,
      startDate,
      endDate,
      timeLabel,
      venue,
      imageUrl,
      instructorId,
      priceInr,
      isFeatured,
      description,
      capacity,
    } = req.body

    const [updated] = await db
      .update(events)
      .set({
        ...(title && { title }),
        ...(category && { category }),
        ...(startDate && { startDate }),
        ...(endDate !== undefined && { endDate: endDate || null }),
        ...(timeLabel && { timeLabel }),
        ...(venue && { venue }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(instructorId !== undefined && { instructorId: instructorId || null }),
        ...(priceInr !== undefined && { priceInr: Number(priceInr) }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(description !== undefined && { description }),
        ...(capacity !== undefined && { capacity: capacity ? Number(capacity) : null }),
      })
      .where(eq(events.id, req.params.id))
      .returning()

    if (!updated) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    res.json({ event: updated })
  } catch (err) {
    console.error('Update event error:', err)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

router.delete('/events/:id', async (req, res) => {
  try {
    await db.delete(events).where(eq(events.id, req.params.id))
    res.json({ success: true })
  } catch (err) {
    console.error('Delete event error:', err)
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

// ────────────────────── SCHEDULE CRUD ──────────────────────
router.get('/schedule', async (_req, res) => {
  try {
    const result = await db.query.sessions.findMany({
      with: {
        class: {
          with: { instructor: true },
        },
      },
      orderBy: (sessions, { desc, asc }) => [desc(sessions.date), asc(sessions.startTime)],
    })
    res.json({ sessions: result })
  } catch (err) {
    console.error('Admin schedule list error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/schedule', async (req, res) => {
  try {
    const { classId, date, startTime, endTime, studio, status = 'scheduled' } = req.body

    if (!classId || !date || !startTime || !endTime || !studio) {
      res.status(400).json({ error: 'Missing required session fields' })
      return
    }

    const [created] = await db
      .insert(sessions)
      .values({
        classId,
        date,
        startTime,
        endTime,
        studio,
        status: status as any,
      })
      .returning()

    res.status(201).json({ session: created })
  } catch (err) {
    console.error('Create session error:', err)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

router.put('/schedule/:id', async (req, res) => {
  try {
    const { classId, date, startTime, endTime, studio, status } = req.body

    const [updated] = await db
      .update(sessions)
      .set({
        ...(classId && { classId }),
        ...(date && { date }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(studio && { studio }),
        ...(status && { status }),
      })
      .where(eq(sessions.id, req.params.id))
      .returning()

    if (!updated) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    res.json({ session: updated })
  } catch (err) {
    console.error('Update session error:', err)
    res.status(500).json({ error: 'Failed to update session' })
  }
})

router.delete('/schedule/:id', async (req, res) => {
  try {
    await db.delete(sessions).where(eq(sessions.id, req.params.id))
    res.json({ success: true })
  } catch (err) {
    console.error('Delete session error:', err)
    res.status(500).json({ error: 'Failed to delete session' })
  }
})

// ────────────────────── MEMBERSHIPS & USERS ──────────────────────
router.get('/users', async (_req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      with: {
        memberships: {
          with: { plan: true },
          orderBy: (m, { desc }) => [desc(m.createdAt)],
        },
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    })

    const safeUsers = allUsers.map((u) => {
      const { passwordHash: _, ...rest } = u
      return rest
    })

    res.json({ users: safeUsers })
  } catch (err) {
    console.error('Admin users error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/memberships', async (req, res) => {
  try {
    const { userId, planId, startsOn, renewsOn, amountInr } = req.body

    if (!userId || !planId) {
      res.status(400).json({ error: 'userId and planId are required' })
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 3)
    const renewal = renewsOn || futureDate.toISOString().slice(0, 10)

    // Deactivate previous active memberships for this user
    await db
      .update(memberships)
      .set({ status: 'expired' })
      .where(and(eq(memberships.userId, userId), eq(memberships.status, 'active')))

    const [createdMembership] = await db
      .insert(memberships)
      .values({
        userId,
        planId,
        startsOn: startsOn || today,
        renewsOn: renewal,
        status: 'active',
      })
      .returning()

    // Upgrade user tier to Member/Elite
    const plan = await db.query.membershipPlans.findFirst({ where: eq(membershipPlans.id, planId) })
    const tier = planId === 'plan-6' ? 'Elite Member' : 'Member'
    await db.update(users).set({ tier, xp: sql`${users.xp} + 500` }).where(eq(users.id, userId))

    // Record transaction
    if (plan || amountInr) {
      await db.insert(transactions).values({
        userId,
        kind: 'plan',
        referenceId: planId,
        title: `${plan?.label || 'Membership'} Subscription`,
        amountInr: Number(amountInr || plan?.priceInr || 2000),
        status: 'Paid',
        paymentMethod: 'Admin Grant',
      })
    }

    res.status(201).json({ membership: createdMembership })
  } catch (err) {
    console.error('Create membership error:', err)
    res.status(500).json({ error: 'Failed to assign membership' })
  }
})

router.put('/users/:id', async (req, res) => {
  try {
    const { tier, xp, role } = req.body

    const [updated] = await db
      .update(users)
      .set({
        ...(tier && { tier }),
        ...(xp !== undefined && { xp: Number(xp) }),
        ...(role && { role }),
      })
      .where(eq(users.id, req.params.id))
      .returning()

    if (!updated) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const { passwordHash: _, ...safeUser } = updated
    res.json({ user: safeUser })
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

export default router
