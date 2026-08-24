import { Outlet } from 'react-router-dom'
import { useAcademy } from '../hooks/useAcademy'
import { BookingModal, Toast } from './BookingModal'
import { SiteFooter } from './Footer'
import { SiteHeader } from './Navigation'

interface LayoutProps {
  readonly className?: string
}

export function Layout({ className = '' }: LayoutProps) {
  const { pending, toast, closeBooking, confirmBooking, dismissToast } =
    useAcademy()

  return (
    <div
      className={`flex min-h-dvh w-full flex-col bg-background-light text-on-surface-light ${className}`}
    >
      <SiteHeader />
      <main className="w-full flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      {pending ? (
        <BookingModal
          pending={pending}
          onClose={closeBooking}
          onConfirm={confirmBooking}
        />
      ) : null}
      {toast ? <Toast message={toast} onDismiss={dismissToast} /> : null}
    </div>
  )
}
