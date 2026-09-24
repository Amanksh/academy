import { useState } from 'react'
import { useAcademy } from '../hooks/useAcademy'
import { useAuth } from '../hooks/useAuth'
import { useRazorpay } from '../hooks/useRazorpay'
import { formatInr } from '../lib/format'
import type { PendingBooking } from '../types'
import { Icon } from './Icon'

interface BookingModalProps {
  readonly pending: PendingBooking
  readonly onClose: () => void
  readonly onConfirm: () => void
  readonly className?: string
}

export function BookingModal({
  pending,
  onClose,
  onConfirm,
  className = '',
}: BookingModalProps) {
  const { classById, eventById, planById, instructorById } = useAcademy()
  const { isLoggedIn } = useAuth()
  const { pay, loading: paymentLoading } = useRazorpay()
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const danceClass = pending.kind === 'class' ? classById(pending.id) : undefined
  const event = pending.kind === 'event' ? eventById(pending.id) : undefined
  const plan = pending.kind === 'plan' ? planById(pending.id) : undefined
  const instructor = danceClass
    ? (danceClass.instructor || instructorById(danceClass.instructorId))
    : event?.instructorId
      ? (event.instructor || instructorById(event.instructorId))
      : undefined

  const title = danceClass?.name ?? event?.title ?? plan?.label ?? 'Confirm'
  const image = danceClass?.imageUrl || (danceClass as any)?.image || event?.imageUrl || (event as any)?.image
  const price = danceClass?.priceInr ?? event?.priceInr ?? plan?.priceInr ?? 0
  const subtitle =
    pending.kind === 'plan'
      ? plan?.detail
      : instructor
        ? `${instructor.name} · ${instructor.title}`
        : event?.venue

  const handleConfirm = async () => {
    setPaymentError(null)

    // If the item is free or user is not logged in, use the original flow
    if (price === 0 || !isLoggedIn) {
      onConfirm()
      return
    }

    // Trigger Razorpay payment
    await pay({
      kind: pending.kind,
      referenceId: pending.id,
      onSuccess: () => {
        onConfirm()
      },
      onFailure: (reason) => {
        if (reason !== 'Payment cancelled') {
          setPaymentError(reason)
        }
      },
    })
  }

  return (
    <div
      className={`auth-modal-backdrop fixed inset-0 z-50 grid place-items-end bg-black/70 p-4 md:place-items-center ${className}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="auth-modal-panel w-full max-w-md overflow-hidden rounded-2xl glass-strong shadow-lift"
        onClick={(eventClick) => eventClick.stopPropagation()}
      >
        {image ? (
          <img src={image} alt="" className="h-40 w-full object-cover" />
        ) : (
          <div className="glass flex h-28 items-center justify-center bg-primary-container">
            <Icon name="workspace_premium" size={40} className="text-primary" filled />
          </div>
        )}
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta dark:text-terracotta-muted">
            {pending.kind === 'plan' ? 'Membership' : 'Confirm booking'}
          </p>
          <h2 id="booking-title" className="mt-1 font-expanded text-2xl font-bold">
            {title}
          </h2>
          <p className="mt-2 text-sm text-on-variant-light dark:text-on-variant-dark">
            {subtitle}
          </p>
          <p className="mt-4 font-expanded text-3xl font-bold text-primary">
            {price === 0 ? 'Free' : formatInr(price)}
          </p>
          {paymentError && (
            <p className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              {paymentError}
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="glass rounded-xl py-2.5 text-sm font-bold"
              disabled={paymentLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={paymentLoading}
              className="btn-glow rounded-xl bg-primary py-2.5 text-sm font-bold text-on-primary disabled:opacity-60"
            >
              {paymentLoading ? 'Processing…' : price === 0 ? 'Confirm' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


interface ToastProps {
  readonly message: string
  readonly onDismiss: () => void
  readonly className?: string
}

export function Toast({ message, onDismiss, className = '' }: ToastProps) {
  return (
    <div
      className={`auth-modal-panel fixed inset-x-4 bottom-8 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl glass-strong px-4 py-3 text-sm font-semibold text-on-surface-light shadow-lift ${className}`}
      role="status"
    >
      <span className="inline-flex items-center gap-2">
        <Icon name="check_circle" filled className="text-primary" />
        {message}
      </span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss">
        <Icon name="close" size={18} />
      </button>
    </div>
  )
}
