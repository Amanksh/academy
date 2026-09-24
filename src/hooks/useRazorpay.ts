/**
 * useRazorpay — opens the Razorpay payment popup and handles verification.
 *
 * Usage:
 *   const { pay, loading } = useRazorpay()
 *   await pay({ kind: 'plan', referenceId: 'plan-1' })
 */

import { useState, useCallback } from 'react'

interface PayOptions {
  kind: 'plan' | 'class' | 'event'
  referenceId: string
  /** Called when payment is fully verified on the server */
  onSuccess?: (paymentId: string) => void
  /** Called when user closes popup or payment fails */
  onFailure?: (reason: string) => void
}

// Extend Window to include Razorpay
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'razorpay-sdk'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pay = useCallback(async (opts: PayOptions) => {
    setLoading(true)
    setError(null)

    try {
      // 1. Load Razorpay script dynamically
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Failed to load Razorpay SDK')

      // 2. Create order on our backend
      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('mudra_auth_token')}`,
        },
        body: JSON.stringify({ kind: opts.kind, referenceId: opts.referenceId }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json()
        throw new Error(err.error || 'Failed to create order')
      }

      const { orderId, amount, currency, keyId, title } = await orderRes.json()

      // 3. Open Razorpay checkout popup
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          name: 'Mudra Dance Academy',
          description: title,
          order_id: orderId,
          theme: { color: '#7C3AED' }, // purple to match your brand
          handler: async (response: {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }) => {
            try {
              // 4. Verify payment on our backend
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('mudra_auth_token')}`,
                },
                body: JSON.stringify({
                  ...response,
                  kind: opts.kind,
                  referenceId: opts.referenceId,
                  amountInr: amount / 100,
                  title,
                }),
              })

              if (!verifyRes.ok) {
                const err = await verifyRes.json()
                reject(new Error(err.error || 'Verification failed'))
                return
              }

              const data = await verifyRes.json()
              opts.onSuccess?.(data.paymentId)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          modal: {
            ondismiss: () => {
              opts.onFailure?.('Payment cancelled')
              resolve() // don't reject — user just closed the modal
            },
          },
        })
        rzp.open()
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      setError(msg)
      opts.onFailure?.(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { pay, loading, error }
}
