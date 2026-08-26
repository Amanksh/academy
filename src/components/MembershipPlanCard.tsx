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
  const isBestValue = Boolean(plan.bestValue)

  return (
    <article
      className={`card-motion relative flex min-h-[420px] flex-col rounded-2xl p-8 transition-all ${
        isBestValue
          ? 'border-2 border-[#25d7da] bg-gradient-to-b from-[#141d24] via-[#0d141b] to-[#080c10] text-white shadow-[0_0_35px_rgba(37,215,218,0.25)]'
          : 'glass-card text-on-surface-light border border-white/10'
      } ${className}`}
    >
      {isBestValue ? (
        <span className="absolute right-6 top-6 rounded-full bg-[#25d7da] px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-black shadow-md">
          Best value
        </span>
      ) : null}
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#fed5b0]">
        {plan.months} month{plan.months > 1 ? 's' : ''}
      </p>
      <h3 className="mt-3 font-expanded text-3xl font-bold text-white">{plan.label}</h3>
      <p className="mt-6 font-expanded text-5xl font-black text-[#25d7da] drop-shadow-sm">
        {formatInr(plan.priceInr)}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-white/70">
        {plan.detail}
      </p>
      <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm">
        <li className="flex items-center gap-2.5 font-medium text-white/90">
          <Icon name="check_circle" size={20} className="text-[#25d7da]" filled />
          Any {plan.batches} batch{plan.batches > 1 ? 'es' : ''}
        </li>
        <li className="flex items-center gap-2.5 font-medium text-white/90">
          <Icon name="check_circle" size={20} className="text-[#25d7da]" filled />
          Studio + event access
        </li>
        <li className="flex items-center gap-2.5 font-medium text-white/90">
          <Icon name="check_circle" size={20} className="text-[#25d7da]" filled />
          Priority batch allocation
        </li>
      </ul>
      <button
        type="button"
        onClick={() => onSelect(plan.id)}
        disabled={active}
        className={`mt-8 w-full rounded-xl py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all shadow-lg disabled:opacity-60 ${
          isBestValue
            ? 'bg-[#25d7da] text-black hover:bg-white hover:scale-[1.02]'
            : 'bg-white/10 text-white hover:bg-[#25d7da] hover:text-black'
        }`}
      >
        {active ? 'Current plan' : 'Choose plan'}
      </button>
    </article>
  )
}
