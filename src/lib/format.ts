import type { Weekday } from '../types'

const WEEKDAY_INITIAL: Record<Weekday, string> = {
  Sun: 'Su',
  Mon: 'M',
  Tue: 'T',
  Wed: 'W',
  Thu: 'Th',
  Fri: 'F',
  Sat: 'S',
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function weekdayInitials(days: readonly Weekday[]): string {
  return days.map((day) => WEEKDAY_INITIAL[day]).join(' · ')
}

export function formatChipDate(date: Date): { weekday: string; day: string } {
  return {
    weekday: date.toLocaleDateString('en-IN', { weekday: 'short' }),
    day: date.toLocaleDateString('en-IN', { day: '2-digit' }),
  }
}
