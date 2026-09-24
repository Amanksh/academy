import { Router } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import {
  transactions,
  memberships,
  enrollments,
  eventBookings,
  membershipPlans,
  classes,
  events,
} from '../../db/schema'
import { requireAuth, type AuthRequest } from '../middleware/auth'

const router = Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/order
// Creates a Razorpay order. Called before showing the payment popup.
//
// Body: { kind: 'plan'|'class'|'event', referenceId: string }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/order', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user!.userId
    const { kind, referenceId } = req.body as {
      kind: 'plan' | 'class' | 'event'
      referenceId: string
    }

    if (!kind || !referenceId) {
      res.status(400).json({ error: 'kind and referenceId are required' })
      return
    }

    // ── Resolve amount & title based on kind ──
    let amountInr = 0
    let title = ''

    if (kind === 'plan') {
      const [plan] = await db
        .select()
        .from(membershipPlans)
        .where(eq(membershipPlans.id, referenceId))
      if (!plan) { res.status(404).json({ error: 'Plan not found' }); return }
      amountInr = plan.priceInr
      title = `Membership – ${plan.label}`
    } else if (kind === 'class') {
      const [cls] = await db
        .select()
        .from(classes)
        .where(eq(classes.id, referenceId))
      if (!cls) { res.status(404).json({ error: 'Class not found' }); return }
      amountInr = cls.priceInr ?? 0
      title = `Class – ${cls.name}`
    } else if (kind === 'event') {
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, referenceId))
      if (!event) { res.status(404).json({ error: 'Event not found' }); return }
      amountInr = event.priceInr ?? 0
      title = `Event – ${event.title}`
    }

    // ── Create Razorpay order (amount in paise) ──
    const order = await razorpay.orders.create({
      amount: amountInr * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `rcpt_${userId.slice(0, 8)}_${Date.now()}`,
      notes: { userId, kind, referenceId },
    })

    res.json({
      orderId: order.id,
      amount: amountInr * 100,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      title,
    })
  } catch (err) {
    console.error('Payment order error:', err)
    res.status(500).json({ error: 'Failed to create payment order' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/verify
// Verifies Razorpay signature, records transaction, and fulfils the purchase.
//
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature,
//         kind, referenceId, amountInr, title }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user!.userId

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      kind,
      referenceId,
      amountInr,
      title,
    } = req.body as {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
      kind: 'plan' | 'class' | 'event'
      amountInr: number
      title: string
      referenceId: string
    }

    // ── Verify HMAC signature ──
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ error: 'Payment verification failed' })
      return
    }

    // ── Record transaction ──
    await db.insert(transactions).values({
      userId,
      kind,
      referenceId,
      title,
      amountInr,
      status: 'Paid',
      paymentMethod: 'razorpay',
      gatewayRef: razorpay_payment_id,
    })

    // ── Fulfil the purchase ──
    if (kind === 'plan') {
      const [plan] = await db
        .select()
        .from(membershipPlans)
        .where(eq(membershipPlans.id, referenceId))

      if (plan) {
        const startsOn = new Date()
        const renewsOn = new Date(startsOn)
        renewsOn.setMonth(renewsOn.getMonth() + plan.months)

        await db.insert(memberships).values({
          userId,
          planId: referenceId,
          startsOn: startsOn.toISOString().split('T')[0],
          renewsOn: renewsOn.toISOString().split('T')[0],
          status: 'active',
        })
      }
    } else if (kind === 'class') {
      await db
        .insert(enrollments)
        .values({ userId, classId: referenceId, status: 'active' })
        .onConflictDoNothing()
    } else if (kind === 'event') {
      await db
        .insert(eventBookings)
        .values({ userId, eventId: referenceId, status: 'confirmed' })
        .onConflictDoNothing()
    }

    res.json({ success: true, paymentId: razorpay_payment_id })
  } catch (err) {
    console.error('Payment verify error:', err)
    res.status(500).json({ error: 'Failed to verify payment' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/webhook
// Razorpay webhook (optional but recommended for production reliability).
// Add this URL in Razorpay dashboard → Webhooks.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (secret) {
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex')

      if (expectedSig !== signature) {
        res.status(400).json({ error: 'Invalid webhook signature' })
        return
      }
    }

    const { event, payload } = req.body
    console.log('Razorpay webhook:', event)

    // Handle payment failures — mark as Failed
    if (event === 'payment.failed') {
      const paymentId = payload?.payment?.entity?.id
      if (paymentId) {
        await db
          .update(transactions)
          .set({ status: 'Failed' })
          .where(eq(transactions.gatewayRef, paymentId))
      }
    }

    res.json({ status: 'ok' })
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router
