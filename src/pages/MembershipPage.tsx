import { currentMember, membershipPlans, planById, transactions } from '../data/mockData'
import { useAcademy } from '../hooks/useAcademy'
import { useAuth } from '../hooks/useAuth'
import { formatInr } from '../lib/format'
import { MembershipPlanCard } from '../components/MembershipPlanCard'
import { Icon } from '../components/Icon'
import { PageSection } from '../components/Navigation'

interface MembershipPageProps {
  readonly className?: string
}

export function MembershipPage({ className = '' }: MembershipPageProps) {
  const { activePlanId, openBooking } = useAcademy()
  const { user } = useAuth()
  const activePlan = planById(activePlanId)
  const memberName = user?.name ?? currentMember.name
  const xpPercent = Math.min(100, Math.round((currentMember.xp / currentMember.xpGoal) * 100))

  return (
    <PageSection className={`py-12 lg:py-16 ${className}`}>
      <section className="overflow-hidden rounded-xl glass-card glow-border px-8 py-10 text-on-surface-light lg:flex lg:items-center lg:justify-between lg:px-12 lg:py-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-terracotta-muted">
            {currentMember.tier}
          </p>
          <h1 className="mt-3 font-expanded text-4xl font-bold lg:text-5xl">
            {memberName}
          </h1>
          <p className="mt-3 text-base text-primary-container">
            {activePlan?.label} · renews {currentMember.renewsOn}
          </p>
        </div>
        <div className="mt-8 w-full max-w-md lg:mt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Icon name="bolt" filled className="text-primary" />
              XP balance
            </span>
            <span className="font-bold">
              {currentMember.xp.toLocaleString('en-IN')} / {currentMember.xpGoal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-primary shadow-[0_0_8px_rgb(61_139_255/0.5)]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-primary-container">
            {currentMember.xpGoal - currentMember.xp} XP to the next studio rite
          </p>
        </div>
      </section>

      <div className="my-12 gradient-divider" />

      <h2 className="mb-6 font-expanded text-3xl font-bold">Plans</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {membershipPlans.map((plan) => (
          <MembershipPlanCard
            key={plan.id}
            plan={plan}
            active={plan.id === activePlanId}
            onSelect={(id) => openBooking({ kind: 'plan', id })}
          />
        ))}
      </div>

      <div className="my-12 gradient-divider" />

      <h2 className="mb-6 font-expanded text-3xl font-bold">Recent payments</h2>
      <ul className="overflow-hidden rounded-xl glass-card">
        {transactions.map((item, index) => (
          <li
            key={item.id}
            className={`grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 lg:grid-cols-[auto_1fr_auto_auto] lg:px-8 ${
              index < transactions.length - 1
                ? 'border-b border-white/5'
                : ''
            }`}
          >
            <span className="grid size-12 place-items-center rounded-full glass text-primary">
              <Icon name="payments" size={22} />
            </span>
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-on-variant-light dark:text-on-variant-dark">
                {item.dateLabel}
              </p>
            </div>
            <p className="hidden text-sm font-semibold text-success lg:block">{item.status}</p>
            <p className="font-expanded text-lg font-bold">{formatInr(item.amountInr)}</p>
          </li>
        ))}
      </ul>
    </PageSection>
  )
}
