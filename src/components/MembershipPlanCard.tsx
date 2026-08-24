import { formatInr } from '../lib/format'
import type { MembershipPlan } from '../types'
import { Icon } from './Icon'

interface MembershipPlanCardProps {
  readonly plan: MembershipPlan
  readonly active?: boolean
  readonly onSelect: (planId: string) => void
  readonly className?: string
}

export function MembershipPlanCard({
  plan,
  active = false,
  onSelect,
  className = '',
}: MembershipPlanCardProps) {
  return (
    <article
      className={`card-motion relative flex min-h-[420px] flex-col rounded-xl p-8 ${
        plan.bestValue
          ? 'glow-border-animated bg-primary text-on-primary shadow-lift'
          : 'glass-card text-on-surface-light'
      } ${className}`}
    >
      {plan.bestValue ? (
        <span className="absolute right-6 top-6 rounded-full bg-spark px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-background-light">
          Best value
        </span>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-muted">
        {plan.months} month{plan.months > 1 ? 's' : ''}
      </p>
      <h3 className="mt-3 font-expanded text-3xl font-bold">{plan.label}</h3>
      <p className="mt-6 font-expanded text-5xl font-bold text-spark">
        {formatInr(plan.priceInr)}
      </p>
      <p
        className={`mt-4 text-base ${
          plan.bestValue
            ? 'text-on-primary/85'
            : 'text-on-variant-light'
        }`}
      >
        {plan.detail}
      </p>
      <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm">
        <li className="flex items-center gap-2">
          <Icon name="check_circle" size={20} className="text-spark" filled />
          Any {plan.batches} batch{plan.batches > 1 ? 'es' : ''}
        </li>
        <li className="flex items-center gap-2">
          <Icon name="check_circle" size={20} className="text-spark" filled />
          Studio + event access
        </li>
        <li className="flex items-center gap-2">
          <Icon name="check_circle" size={20} className="text-spark" filled />
          XP towards Elite
        </li>
      </ul>
      <button
        type="button"
        onClick={() => onSelect(plan.id)}
        disabled={active}
        className={`btn-glow mt-8 w-full rounded-xl py-3 text-sm font-bold disabled:opacity-70 ${
          plan.bestValue
            ? 'bg-background-light text-on-surface-light'
            : 'bg-primary text-on-primary'
        }`}
      >
        {active ? 'Current plan' : 'Choose plan'}
      </button>
    </article>
  )
}
