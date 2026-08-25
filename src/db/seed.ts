import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(
  process.env.DATABASE_URL ||
    'postgresql://postgres:8580@localhost:5432/mudra',
)
const db = drizzle(client, { schema })

async function seed() {
  console.log('🌱 Seeding Mudra database…')

  // 1 — Dance styles
  await db
    .insert(schema.danceStyles)
    .values([
      { slug: 'kathak', label: 'Kathak' },
      { slug: 'bharatanatyam', label: 'Bharatanatyam' },
      { slug: 'contemporary', label: 'Contemporary' },
      { slug: 'odissi', label: 'Odissi' },
    ])
    .onConflictDoNothing()
  console.log('  ✓ dance_styles')

  // 2 — Instructors
  await db
    .insert(schema.instructors)
    .values([
      {
        id: 'priya',
        name: 'Priya Sharma',
        title: 'Kathak Guru',
        avatarUrl:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'meera',
        name: 'Meera Iyer',
        title: 'Bharatanatyam Faculty',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'arjun',
        name: 'Arjun Rao',
        title: 'Contemporary Director',
        avatarUrl:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'leela',
        name: 'Leela Das',
        title: 'Odissi Mentor',
        avatarUrl:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'vikram',
        name: 'Vikram Sen',
        title: 'Kathak Repertoire',
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
    ])
    .onConflictDoNothing()
  console.log('  ✓ instructors')

  // 3 — Classes
  await db
    .insert(schema.classes)
    .values([
      {
        id: 'kathak-foundations',
        name: 'Kathak Foundations',
        style: 'kathak',
        level: 'Beginner',
        instructorId: 'priya',
        priceInr: 2000,
        durationMin: 60,
        imageUrl:
          'https://images.unsplash.com/photo-1547153760-18fcfa26afdc?auto=format&fit=crop&w=1200&q=80',
        capacity: 22,
        blurb: 'Tatkar, hasta, and the Lucknow school\'s lyrical grammar.',
      },
      {
        id: 'bharatanatyam-technique',
        name: 'Bharatanatyam Technique',
        style: 'bharatanatyam',
        level: 'Intermediate',
        instructorId: 'meera',
        priceInr: 2500,
        durationMin: 75,
        imageUrl:
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
        capacity: 18,
        blurb: 'Adavus, araimandi, and nritta phrasing for recital stamina.',
      },
      {
        id: 'contemporary-flow',
        name: 'Contemporary Flow',
        style: 'contemporary',
        level: 'Beginner',
        instructorId: 'arjun',
        priceInr: 2200,
        durationMin: 60,
        imageUrl:
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
        capacity: 24,
        blurb: 'Floorwork, release, and musicality for mixed-level movers.',
      },
      {
        id: 'odissi-abhinaya',
        name: 'Odissi Abhinaya',
        style: 'odissi',
        level: 'Advanced',
        instructorId: 'leela',
        priceInr: 3000,
        durationMin: 90,
        imageUrl:
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        capacity: 12,
        blurb: 'Tribhangi, chowka, and expressive ashtapadi work.',
      },
      {
        id: 'kathak-footwork',
        name: 'Kathak Footwork Lab',
        style: 'kathak',
        level: 'Intermediate',
        instructorId: 'vikram',
        priceInr: 2400,
        durationMin: 60,
        imageUrl:
          'https://images.unsplash.com/photo-1535525153412-5a0c2079c5c1?auto=format&fit=crop&w=1200&q=80',
        capacity: 20,
        blurb: 'Chakkars, tihai, and speed with live tabla cues.',
      },
      {
        id: 'bharatanatyam-adavus',
        name: 'Bharatanatyam Adavus',
        style: 'bharatanatyam',
        level: 'Beginner',
        instructorId: 'meera',
        priceInr: 2000,
        durationMin: 60,
        imageUrl:
          'https://images.unsplash.com/photo-1518834107812-67b0b2c63848?auto=format&fit=crop&w=1200&q=80',
        capacity: 24,
        blurb: 'Foundational lines, tala, and classroom etiquette.',
      },
    ])
    .onConflictDoNothing()
  console.log('  ✓ classes')

  // 4 — Class schedules (weekdays)
  const weekdayMap: Record<string, string[]> = {
    'kathak-foundations': ['Mon', 'Wed', 'Fri'],
    'bharatanatyam-technique': ['Tue', 'Thu'],
    'contemporary-flow': ['Mon', 'Wed'],
    'odissi-abhinaya': ['Sat'],
    'kathak-footwork': ['Tue', 'Thu', 'Sat'],
    'bharatanatyam-adavus': ['Wed', 'Fri'],
  }

  const scheduleRows = Object.entries(weekdayMap).flatMap(
    ([classId, days]) =>
      days.map((weekday) => ({ classId, weekday })),
  )

  await db
    .insert(schema.classSchedules)
    .values(scheduleRows as any)
    .onConflictDoNothing()
  console.log('  ✓ class_schedules')

  // 5 — Events
  await db
    .insert(schema.events)
    .values([
      {
        id: 'rhythms-lucknow',
        title: 'Rhythms of Lucknow',
        category: 'Workshops',
        startDate: '2026-08-29',
        timeLabel: '10:00 AM',
        venue: 'Studio A · Bandra',
        imageUrl:
          'https://images.unsplash.com/photo-1547153760-18fcfa26afdc?auto=format&fit=crop&w=1600&q=80',
        instructorId: 'priya',
        priceInr: 1800,
        isFeatured: true,
        description:
          'A featured Kathak masterclass on the Lucknow gharana\'s abhinaya and rhythmic play, with live tabla.',
      },
      {
        id: 'bharatanatyam-weekend',
        title: 'Bharatanatyam Intensive Weekend',
        category: 'Workshops',
        startDate: '2026-09-05',
        endDate: '2026-09-06',
        timeLabel: '9:30 AM',
        venue: 'Main Hall',
        imageUrl:
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
        instructorId: 'meera',
        priceInr: 3200,
        description:
          'Two days of adavu refinement, jathi composition, and stage presence.',
      },
      {
        id: 'fusion-night',
        title: 'Contemporary Fusion Night',
        category: 'Performances',
        startDate: '2026-09-12',
        timeLabel: '7:00 PM',
        venue: 'Mudra Theatre',
        imageUrl:
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
        instructorId: 'arjun',
        priceInr: 800,
        description:
          'Student and faculty works crossing Kathak, contemporary, and live electronics.',
      },
      {
        id: 'odissi-auditions',
        title: 'Odissi Company Auditions',
        category: 'Auditions',
        startDate: '2026-09-19',
        timeLabel: '11:00 AM',
        venue: 'Studio C',
        imageUrl:
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        instructorId: 'leela',
        priceInr: 0,
        description:
          'Open call for the 2026 repertory season. Intermediate technique required.',
      },
      {
        id: 'navratri-series',
        title: 'Navratri Workshop Series',
        category: 'Workshops',
        startDate: '2026-09-22',
        endDate: '2026-09-30',
        timeLabel: '6:30 PM',
        venue: 'Courtyard',
        imageUrl:
          'https://images.unsplash.com/photo-1535525153412-5a0c2079c5c1?auto=format&fit=crop&w=1200&q=80',
        instructorId: 'vikram',
        priceInr: 2500,
        description:
          'Nine evenings of garba-informed Kathak phrasing and festive repertoire.',
      },
      {
        id: 'annual-arangetram',
        title: 'Annual Student Showcase',
        category: 'Performances',
        startDate: '2026-10-18',
        timeLabel: '5:00 PM',
        venue: 'NCPA Experimental',
        imageUrl:
          'https://images.unsplash.com/photo-1518834107812-67b0b2c63848?auto=format&fit=crop&w=1200&q=80',
        priceInr: 500,
        description:
          'A full-house recital spanning all four styles and guest musicians.',
      },
    ])
    .onConflictDoNothing()
  console.log('  ✓ events')

  // 6 — Membership plans
  await db
    .insert(schema.membershipPlans)
    .values([
      {
        id: 'plan-1',
        months: 1,
        priceInr: 2000,
        batches: 1,
        label: '1 Month',
        detail: 'Access to any 1 batch. Start whenever you are ready.',
      },
      {
        id: 'plan-3',
        months: 3,
        priceInr: 5000,
        batches: 1,
        label: '3 Months',
        detail: 'Access to any 1 batch at a discounted seasonal rate.',
      },
      {
        id: 'plan-6',
        months: 6,
        priceInr: 9000,
        batches: 2,
        label: '6 Months',
        detail: 'Access to any 2 batches. Best value for committed dancers.',
        bestValue: true,
      },
    ])
    .onConflictDoNothing()
  console.log('  ✓ membership_plans')

  console.log('\n✅ Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
