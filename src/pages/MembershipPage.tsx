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
  const tier = user?.tier ?? 'Explorer'
  const hasActiveMembership = Boolean(dashboard?.membership)

  // ── Calculate Remaining Days & Slider Percentage ──
  const startsOnDate = dashboard?.membership?.startsOn
    ? new Date(dashboard.membership.startsOn)
    : null
  const renewsOnDate = dashboard?.membership?.renewsOn
    ? new Date(dashboard.membership.renewsOn)
    : null

  const planMonths = userPlan?.months ?? 3
  const totalDays =
    startsOnDate && renewsOnDate
      ? Math.max(
          1,
          Math.ceil(
            (renewsOnDate.getTime() - startsOnDate.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : planMonths * 30

  const daysRemaining = renewsOnDate
    ? Math.max(
        0,
        Math.ceil((renewsOnDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      )
    : hasActiveMembership
      ? 45
      : 0

  const percentRemaining = Math.min(
    100,
    Math.max(0, Math.round((daysRemaining / totalDays) * 100)),
  )

  const formattedRenewsOn = renewsOnDate
    ? renewsOnDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'No active renewal'

  return (
    <PageSection className={`py-12 lg:py-16 ${className}`}>
      {/* ─────────────────── Member Profile & Validity Slider ─────────────────── */}
      <section className="overflow-hidden rounded-2xl glass-card glow-border px-8 py-10 text-on-surface-light lg:flex lg:items-center lg:justify-between lg:px-12 lg:py-12">
        <div className="max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25d7da]/15 border border-[#25d7da]/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#25d7da]">
            <Icon name="verified" size={14} className="text-[#25d7da]" />
            {tier}
          </span>
          <h1 className="mt-3 font-expanded text-3xl sm:text-4xl lg:text-5xl font-bold">
            {memberName}
          </h1>
          <p className="mt-2 text-sm text-on-variant-light dark:text-on-variant-dark">
            {userPlan?.label ?? 'Explorer'} ·{' '}
            {hasActiveMembership ? `Active plan` : 'Select a membership plan below'}
          </p>
        </div>

        {/* Validity Slider Widget */}
        <div className="mt-8 w-full max-w-md lg:mt-0 rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 font-bold text-white">
              <Icon name="timer" filled className="text-[#25d7da]" size={18} />
              Membership Validity
            </span>
            <span className="font-expanded text-base font-extrabold text-[#25d7da]">
              {hasActiveMembership ? `${daysRemaining} Days Left` : '0 Days'}
            </span>
          </div>

          {/* Slider Progress Bar */}
          <div className="relative mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-[#ffb599] to-[#25d7da] shadow-[0_0_12px_rgba(37,215,218,0.5)] transition-all duration-500"
              style={{ width: `${hasActiveMembership ? percentRemaining : 0}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-on-variant-light">
            <span>
              {hasActiveMembership
                ? `${daysRemaining} of ${totalDays} days remaining`
                : 'No active subscription'}
            </span>
            <span className="font-semibold text-white/90">
              {hasActiveMembership ? `Renews on ${formattedRenewsOn}` : 'Pick a plan below'}
            </span>
          </div>
        </div>
      </section>

      <div className="my-12 gradient-divider" />

      {/* ─────────────────── Membership Plans ─────────────────── */}
      <h2 className="mb-6 font-expanded text-3xl font-bold">Membership Plans</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {membershipPlans.map((plan) => (
          <MembershipPlanCard
            key={plan.id}
            plan={plan as any}
            active={plan.id === (dashboard?.membership?.planId || (hasActiveMembership ? activePlanId : ''))}
            onSelect={(id) => openBooking({ kind: 'plan', id })}
          />
        ))}
      </div>

      <div className="my-12 gradient-divider" />

      {/* ─────────────────── Recent Transactions ─────────────────── */}
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
