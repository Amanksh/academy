import { useEffect, useState } from 'react'
import { useAcademy } from '../hooks/useAcademy'
import { useAuth } from '../hooks/useAuth'
import { formatInr } from '../lib/format'
import { api, type ApiMembershipDashboard } from '../lib/api'
import { MembershipPlanCard } from '../components/MembershipPlanCard'
import { Icon } from '../components/Icon'
import { PageSection } from '../components/Navigation'

interface MembershipPageProps {
  readonly className?: string
}

export function MembershipPage({ className = '' }: MembershipPageProps) {
  const { activePlanId, openBooking, membershipPlans, planById } = useAcademy()
  const { user, isLoggedIn } = useAuth()
  const [dashboard, setDashboard] = useState<ApiMembershipDashboard | null>(null)

  useEffect(() => {
    if (isLoggedIn) {
      api.membership
        .me()
        .then((data) => setDashboard(data))
        .catch((err) => console.error('Failed to fetch user membership details:', err))
    } else {
      setDashboard(null)
    }
  }, [isLoggedIn])

  const userPlan = dashboard?.membership?.plan || planById(activePlanId)
  const memberName = user?.name ?? 'Guest Dancer'
  const xp = user?.xp ?? 0
  const xpGoal = user?.xpGoal ?? 3000
  const tier = user?.tier ?? 'Explorer'
  const xpPercent = Math.min(100, Math.round((xp / xpGoal) * 100))
  const renewsOn = dashboard?.membership?.renewsOn ?? 'Active Trial'

  return (
    <PageSection className={`py-12 lg:py-16 ${className}`}>
      <section className="overflow-hidden rounded-xl glass-card glow-border px-8 py-10 text-on-surface-light lg:flex lg:items-center lg:justify-between lg:px-12 lg:py-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-terracotta-muted">
            {tier}
          </p>
          <h1 className="mt-3 font-expanded text-4xl font-bold lg:text-5xl">
            {memberName}
          </h1>
          <p className="mt-3 text-base text-primary-container">
            {userPlan?.label ?? 'Explorer'} · {dashboard?.membership ? `Renews on ${renewsOn}` : 'Select a pass below to start'}
          </p>
        </div>
        <div className="mt-8 w-full max-w-md lg:mt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Icon name="bolt" filled className="text-primary" />
              XP balance
            </span>
            <span className="font-bold">
              {xp.toLocaleString('en-IN')} / {xpGoal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-primary shadow-[0_0_8px_rgb(61_139_255/0.5)]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-primary-container">
            {Math.max(0, xpGoal - xp)} XP to the next studio rank
          </p>
        </div>
      </section>

      <div className="my-12 gradient-divider" />

      <h2 className="mb-6 font-expanded text-3xl font-bold">Membership Plans</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {membershipPlans.map((plan) => (
          <MembershipPlanCard
            key={plan.id}
            plan={plan as any}
            active={plan.id === (dashboard?.membership?.planId || activePlanId)}
            onSelect={(id) => openBooking({ kind: 'plan', id })}
          />
        ))}
      </div>

      <div className="my-12 gradient-divider" />

      <h2 className="mb-6 font-expanded text-3xl font-bold">Recent payments</h2>
      {isLoggedIn && dashboard?.transactions && dashboard.transactions.length > 0 ? (
        <ul className="overflow-hidden rounded-xl glass-card">
          {dashboard.transactions.map((item, index) => (
            <li
              key={item.id}
              className={`grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 lg:grid-cols-[auto_1fr_auto_auto] lg:px-8 ${
                index < dashboard.transactions.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <span className="grid size-12 place-items-center rounded-full glass text-primary">
                <Icon name="payments" size={22} />
              </span>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-on-variant-light dark:text-on-variant-dark">
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <p className="hidden text-sm font-semibold text-success lg:block">{item.status}</p>
              <p className="font-expanded text-lg font-bold">{formatInr(item.amountInr)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-xl glass-card p-8 text-center">
          <p className="text-sm text-on-variant-light dark:text-on-variant-dark">
            {isLoggedIn ? 'No payment history yet.' : 'Sign in to view your payment and booking history.'}
          </p>
        </div>
      )}
    </PageSection>
  )
}
