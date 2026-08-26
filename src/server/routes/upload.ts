import { Router } from 'express'
import multer from 'multer'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const router = Router()

// ── S3 Client — initialized lazily on first request ──
let s3Client: S3Client | null = null
let s3Initialized = false

function getS3() {
  if (s3Initialized) return s3Client

  s3Initialized = true
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const bucket = process.env.AWS_S3_BUCKET

  if (accessKeyId && secretAccessKey && bucket) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: { accessKeyId, secretAccessKey },
    })
    console.log(`  ☁️  S3 client initialized → bucket: ${bucket}`)
  } else {
    console.log('  📁 S3 credentials not found — using local uploads/ fallback')
  }

  return s3Client
}

// ── Allowed MIME types ──
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
]

const ALL_ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]

// Extensions we accept (for fallback when mime is application/octet-stream)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov']

// ── Multer config ──
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max (videos)
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()

    // Accept if MIME is recognized OR if extension is valid (handles octet-stream)
    if (ALL_ALLOWED.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`File type not allowed. Accepted: jpg, png, webp, gif, mp4, webm, mov`))
    }
  },
})

// Multer error handler wrapper — return JSON instead of HTML
function handleUpload(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      res.status(400).json({ error: message })
      return
    }
    next()
  })
}

// ── Local uploads directory (fallback) ──
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// ────────────────────── POST /api/upload ──────────────────────
router.post('/', handleUpload, async (req, res) => {
  try {
    const file = req.file
    if (!file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }

    // Enforce image size limit (10 MB for images)
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype)
    if (isImage && file.size > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'Image files must be under 10 MB' })
      return
    }

    const entity = (req.query.entity as string) || 'general'
    const ext = path.extname(file.originalname) || '.jpg'
    const uniqueName = `${crypto.randomUUID()}${ext}`
    const key = `uploads/${entity}/${uniqueName}`

    const bucket = process.env.AWS_S3_BUCKET
    const region = process.env.AWS_REGION || 'ap-south-1'
    const client = getS3()

    // ── Upload to S3 ──
    if (client && bucket) {
      console.log(`  ⬆️  Uploading to S3: ${key} (${(file.size / 1024).toFixed(1)} KB)`)

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      )

      const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
      console.log(`  ✅ S3 upload complete: ${url}`)
      res.json({ url, key, size: file.size, type: file.mimetype })
      return
    }

    // ── Fallback: save to local uploads/ directory ──
    console.log(`  📁 Saving locally: ${key} (${(file.size / 1024).toFixed(1)} KB)`)
    const entityDir = path.join(UPLOADS_DIR, entity)
    fs.mkdirSync(entityDir, { recursive: true })
    const localPath = path.join(entityDir, uniqueName)
    fs.writeFileSync(localPath, file.buffer)

    const url = `/uploads/${entity}/${uniqueName}`
    res.json({ url, key, size: file.size, type: file.mimetype })
  } catch (err: unknown) {
    console.error('❌ Upload error:', err)
    const message = err instanceof Error ? err.message : 'Upload failed'
    res.status(500).json({ error: message })
  }
})

export default router
