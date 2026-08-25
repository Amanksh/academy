import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema'
import { signToken, requireAuth, type AuthRequest } from '../middleware/auth'

const router = Router()

// ────────────────────── POST /api/auth/signup ──────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, handle, phone } = req.body

    // Validation
    if (!email || !password || !name || !handle) {
      res.status(400).json({
        error: 'email, password, name, and handle are required',
      })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }

    // Check for existing user
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    if (existing.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists' })
      return
    }

    // Check for existing handle
    const existingHandle = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.handle, handle))
      .limit(1)

    if (existingHandle.length > 0) {
      res.status(409).json({ error: 'This handle is already taken' })
      return
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12)

    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name,
        handle,
        phone: phone || null,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        handle: users.handle,
        tier: users.tier,
        xp: users.xp,
        xpGoal: users.xpGoal,
        role: users.role,
        createdAt: users.createdAt,
      })

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    })

    res.status(201).json({ user: newUser, token })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ────────────────────── POST /api/auth/login ──────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' })
      return
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Return user without passwordHash
    const { passwordHash: _, ...safeUser } = user

    res.json({ user: safeUser, token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ────────────────────── GET /api/auth/me ──────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        handle: users.handle,
        avatarUrl: users.avatarUrl,
        phone: users.phone,
        tier: users.tier,
        xp: users.xp,
        xpGoal: users.xpGoal,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, authReq.user!.userId))
      .limit(1)

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user })
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
