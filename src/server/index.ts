import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'

import authRoutes from './routes/auth'
import classesRoutes from './routes/classes'
import eventsRoutes from './routes/events'
import instructorsRoutes from './routes/instructors'
import scheduleRoutes from './routes/schedule'
import membershipRoutes from './routes/membership'
import adminRoutes from './routes/admin'
import uploadRoutes from './routes/upload'

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.netlify.app')
      ) {
        return callback(null, true)
      }
      return callback(null, true) // permissive fallback in production
    },
    credentials: true,
  }),
)
app.use(express.json())

// ── Serve local uploads (fallback when S3 is not configured) ──
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

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
app.use('/api/upload', uploadRoutes)

// ── 404 fallback ──
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n🪷  Mudra API running at http://localhost:${PORT}`)
  console.log(`   Health check:  http://localhost:${PORT}/api/health\n`)
})
