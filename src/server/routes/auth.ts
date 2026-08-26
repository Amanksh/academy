import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { eq, or } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema'
import { signToken, requireAuth, type AuthRequest } from '../middleware/auth'

const router = Router()

// ────────────────────── POST /api/auth/signup ──────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, handle, phone } = req.body

    // Validation
    if (!email || !password || !name) {
      res.status(400).json({
        error: 'Email or phone number, password, and name are required',
      })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }

    const rawInput = email.trim()
    const isEmail = rawInput.includes('@')

    let userEmail: string
    let userPhone: string | null = phone?.trim() || null

    if (isEmail) {
      userEmail = rawInput.toLowerCase()
    } else {
      userPhone = rawInput
      const cleanPhone = rawInput.replace(/[^a-zA-Z0-9]/g, '')
      userEmail = `${cleanPhone}@phone.mudra.in`
    }

    const userHandle =
      handle?.trim() || `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${Math.floor(100 + Math.random() * 900)}`

    // Check for existing user by email or phone
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(
        userPhone
          ? or(eq(users.email, userEmail), eq(users.phone, userPhone))
          : eq(users.email, userEmail),
      )
      .limit(1)

    if (existing.length > 0) {
      res.status(409).json({ error: 'An account with this email or phone number already exists' })
      return
    }

    // Check for existing handle
    const existingHandle = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.handle, userHandle))
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
        email: userEmail,
        passwordHash,
        name,
        handle: userHandle,
        phone: userPhone,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        handle: users.handle,
        phone: users.phone,
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
      res.status(400).json({ error: 'Email or phone number and password are required' })
      return
    }

    const rawInput = email.trim().toLowerCase()
    const cleanPhone = rawInput.replace(/[^a-zA-Z0-9]/g, '')
    const phoneEmail = `${cleanPhone}@phone.mudra.in`

    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, rawInput),
          eq(users.phone, email.trim()),
          eq(users.email, phoneEmail),
        ),
      )
      .limit(1)

    if (!user) {
      res.status(401).json({ error: 'Invalid email/phone number or password' })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: 'Invalid email/phone number or password' })
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
