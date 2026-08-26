import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth'
import classesRoutes from './routes/classes'
import eventsRoutes from './routes/events'
import instructorsRoutes from './routes/instructors'
import scheduleRoutes from './routes/schedule'
import membershipRoutes from './routes/membership'
import adminRoutes from './routes/admin'

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ──
app.use('/api/auth', authRoutes)
app.use('/api/classes', classesRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/instructors', instructorsRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/membership', membershipRoutes)
app.use('/api/admin', adminRoutes)

// ── 404 fallback ──
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n🪷  Mudra API running at http://localhost:${PORT}`)
  console.log(`   Health check:  http://localhost:${PORT}/api/health\n`)
})
