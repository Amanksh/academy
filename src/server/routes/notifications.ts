import { Router } from 'express'
import twilio from 'twilio'
import { db } from '../../db'
import { users, events } from '../../db/schema'
import { eq, isNotNull } from 'drizzle-orm'

const router = Router()

// ────────────────────── POST /api/notifications/whatsapp/event ──────────────────────
// Sends a WhatsApp notification about an event to all users who have a phone number
router.post('/whatsapp/event', async (req, res) => {
  try {
    const { eventId } = req.body

    if (!eventId) {
      res.status(400).json({ error: 'eventId is required' })
      return
    }

    // Validate Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM

    if (!accountSid || !authToken || !fromNumber) {
      res.status(500).json({
        error: 'Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM in .env',
      })
      return
    }

    // Fetch event details
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: { instructor: true },
    })

    if (!event) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    // Fetch all users with phone numbers
    const usersWithPhone = await db
      .select({ id: users.id, name: users.name, phone: users.phone })
      .from(users)
      .where(isNotNull(users.phone))

    if (usersWithPhone.length === 0) {
      res.json({ success: true, sent: 0, failed: 0, message: 'No users with phone numbers found' })
      return
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken)

    // Format the event date nicely
    const eventDate = new Date(event.startDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const priceStr = event.priceInr === 0 ? 'Free Entry' : `₹${event.priceInr}`
    const guruStr = event.instructor ? `\n👤 *Guru:* ${event.instructor.name}` : ''

    // Compose WhatsApp message
    const messageBody =
      `🪷 *Mudra Dance Academy*\n\n` +
      `✨ *${event.title}*\n\n` +
      `📅 *Date:* ${eventDate}\n` +
      `🕐 *Time:* ${event.timeLabel}\n` +
      `📍 *Venue:* ${event.venue}\n` +
      `💰 *Fee:* ${priceStr}` +
      guruStr +
      (event.description ? `\n\n📝 ${event.description}` : '') +
      `\n\n🎟️ Reserve your spot now at Mudra Dance Academy!`

    let sent = 0
    let failed = 0
    const errors: string[] = []

    // Send messages to all users
    const sendPromises = usersWithPhone.map(async (user) => {
      if (!user.phone) return

      // Normalize phone number — ensure it starts with +
      let phone = user.phone.trim()
      if (!phone.startsWith('+')) {
        // Assume Indian number if no country code
        phone = phone.startsWith('91') ? `+${phone}` : `+91${phone}`
      }

      try {
        await client.messages.create({
          body: messageBody,
          from: `whatsapp:${fromNumber}`,
          to: `whatsapp:${phone}`,
        })
        sent++
      } catch (err: any) {
        failed++
        errors.push(`${user.name} (${phone}): ${err.message}`)
        console.error(`WhatsApp send failed for ${user.name}:`, err.message)
      }
    })

    await Promise.all(sendPromises)

    res.json({
      success: true,
      sent,
      failed,
      total: usersWithPhone.length,
      message: `Sent ${sent}/${usersWithPhone.length} WhatsApp notifications`,
      ...(errors.length > 0 && { errors }),
    })
  } catch (err) {
    console.error('WhatsApp notification error:', err)
    res.status(500).json({ error: 'Failed to send WhatsApp notifications' })
  }
})

// ────────────────────── GET /api/notifications/whatsapp/status ──────────────────────
// Check if Twilio WhatsApp is configured
router.get('/whatsapp/status', async (_req, res) => {
  const configured = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM
  )

  // Count users with phone numbers
  const usersWithPhone = await db
    .select({ id: users.id })
    .from(users)
    .where(isNotNull(users.phone))

  res.json({
    configured,
    recipientCount: usersWithPhone.length,
  })
})

export default router
