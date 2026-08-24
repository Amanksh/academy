import type {
  AcademyEvent,
  DanceClass,
  Instructor,
  MemberProfile,
  MembershipPlan,
  ScheduleSession,
  Transaction,
} from '../types'

export const academy = {
  name: 'Mudra Dance Academy',
  shortName: 'Mudra',
  tagline: 'Rhythm, lineage, and motion.',
  location: {
    label: 'Lucknow Studio',
    address: 'Vinayak Complex, 3/1, near amity school',
    city: 'Vinamra Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010',
    mapsUrl: 'https://maps.app.goo.gl/MtCFe5mc9M3CvBgFA',
  },
  socials: [
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://www.instagram.com/',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: 'https://www.facebook.com/',
    },
    {
      id: 'youtube',
      label: 'YouTube',
      href: 'https://www.youtube.com/',
    },
    {
      id: 'x',
      label: 'X',
      href: 'https://x.com/',
    },
  ],
} as const

export const currentMember: MemberProfile = {
  name: 'Ananya Patel',
  handle: '@ananya.mudra',
  avatar:
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
  tier: 'Elite Member',
  xp: 2450,
  xpGoal: 3000,
  planId: 'plan-3',
  renewsOn: '21 Nov 2026',
}

export const instructors: readonly Instructor[] = [
  {
    id: 'priya',
    name: 'Priya Sharma',
    title: 'Kathak Guru',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'meera',
    name: 'Meera Iyer',
    title: 'Bharatanatyam Faculty',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'arjun',
    name: 'Arjun Rao',
    title: 'Contemporary Director',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'leela',
    name: 'Leela Das',
    title: 'Odissi Mentor',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'vikram',
    name: 'Vikram Sen',
    title: 'Kathak Repertoire',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
]

export const danceClasses: readonly DanceClass[] = [
  {
    id: 'kathak-foundations',
    name: 'Kathak Foundations',
    style: 'Kathak',
    level: 'Beginner',
    instructorId: 'priya',
    priceInr: 2000,
    durationMin: 60,
    weekdays: ['Mon', 'Wed', 'Fri'],
    image:
      'https://images.unsplash.com/photo-1547153760-18fcfa26afdc?auto=format&fit=crop&w=1200&q=80',
    enrolled: 18,
    capacity: 22,
    blurb: 'Tatkar, hasta, and the Lucknow school’s lyrical grammar.',
  },
  {
    id: 'bharatanatyam-technique',
    name: 'Bharatanatyam Technique',
    style: 'Bharatanatyam',
    level: 'Intermediate',
    instructorId: 'meera',
    priceInr: 2500,
    durationMin: 75,
    weekdays: ['Tue', 'Thu'],
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    enrolled: 14,
    capacity: 18,
    blurb: 'Adavus, araimandi, and nritta phrasing for recital stamina.',
  },
  {
    id: 'contemporary-flow',
    name: 'Contemporary Flow',
    style: 'Contemporary',
    level: 'Beginner',
    instructorId: 'arjun',
    priceInr: 2200,
    durationMin: 60,
    weekdays: ['Mon', 'Wed'],
    image:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    enrolled: 20,
    capacity: 24,
    blurb: 'Floorwork, release, and musicality for mixed-level movers.',
  },
  {
    id: 'odissi-abhinaya',
    name: 'Odissi Abhinaya',
    style: 'Odissi',
    level: 'Advanced',
    instructorId: 'leela',
    priceInr: 3000,
    durationMin: 90,
    weekdays: ['Sat'],
    image:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    enrolled: 9,
    capacity: 12,
    blurb: 'Tribhangi, chowka, and expressive ashtapadi work.',
  },
  {
    id: 'kathak-footwork',
    name: 'Kathak Footwork Lab',
    style: 'Kathak',
    level: 'Intermediate',
    instructorId: 'vikram',
    priceInr: 2400,
    durationMin: 60,
    weekdays: ['Tue', 'Thu', 'Sat'],
    image:
      'https://images.unsplash.com/photo-1535525153412-5a0c2079c5c1?auto=format&fit=crop&w=1200&q=80',
    enrolled: 16,
    capacity: 20,
    blurb: 'Chakkars, tihai, and speed with live tabla cues.',
  },
  {
    id: 'bharatanatyam-adavus',
    name: 'Bharatanatyam Adavus',
    style: 'Bharatanatyam',
    level: 'Beginner',
    instructorId: 'meera',
    priceInr: 2000,
    durationMin: 60,
    weekdays: ['Wed', 'Fri'],
    image:
      'https://images.unsplash.com/photo-1518834107812-67b0b2c63848?auto=format&fit=crop&w=1200&q=80',
    enrolled: 21,
    capacity: 24,
    blurb: 'Foundational lines, tala, and classroom etiquette.',
  },
]

export const events: readonly AcademyEvent[] = [
  {
    id: 'rhythms-lucknow',
    title: 'Rhythms of Lucknow',
    category: 'Workshops',
    dateLabel: '29 Aug 2026',
    timeLabel: '10:00 AM',
    venue: 'Studio A · Bandra',
    image:
      'https://images.unsplash.com/photo-1547153760-18fcfa26afdc?auto=format&fit=crop&w=1600&q=80',
    instructorId: 'priya',
    priceInr: 1800,
    featured: true,
    description:
      'A featured Kathak masterclass on the Lucknow gharana’s abhinaya and rhythmic play, with live tabla.',
  },
  {
    id: 'bharatanatyam-weekend',
    title: 'Bharatanatyam Intensive Weekend',
    category: 'Workshops',
    dateLabel: '5–6 Sep 2026',
    timeLabel: '9:30 AM',
    venue: 'Main Hall',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    instructorId: 'meera',
    priceInr: 3200,
    description: 'Two days of adavu refinement, jathi composition, and stage presence.',
  },
  {
    id: 'fusion-night',
    title: 'Contemporary Fusion Night',
    category: 'Performances',
    dateLabel: '12 Sep 2026',
    timeLabel: '7:00 PM',
    venue: 'Mudra Theatre',
    image:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    instructorId: 'arjun',
    priceInr: 800,
    description: 'Student and faculty works crossing Kathak, contemporary, and live electronics.',
  },
  {
    id: 'odissi-auditions',
    title: 'Odissi Company Auditions',
    category: 'Auditions',
    dateLabel: '19 Sep 2026',
    timeLabel: '11:00 AM',
    venue: 'Studio C',
    image:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    instructorId: 'leela',
    priceInr: 0,
    description: 'Open call for the 2026 repertory season. Intermediate technique required.',
  },
  {
    id: 'navratri-series',
    title: 'Navratri Workshop Series',
    category: 'Workshops',
    dateLabel: '22–30 Sep 2026',
    timeLabel: '6:30 PM',
    venue: 'Courtyard',
    image:
      'https://images.unsplash.com/photo-1535525153412-5a0c2079c5c1?auto=format&fit=crop&w=1200&q=80',
    instructorId: 'vikram',
    priceInr: 2500,
    description: 'Nine evenings of garba-informed Kathak phrasing and festive repertoire.',
  },
  {
    id: 'annual-arangetram',
    title: 'Annual Student Showcase',
    category: 'Performances',
    dateLabel: '18 Oct 2026',
    timeLabel: '5:00 PM',
    venue: 'NCPA Experimental',
    image:
      'https://images.unsplash.com/photo-1518834107812-67b0b2c63848?auto=format&fit=crop&w=1200&q=80',
    priceInr: 500,
    description: 'A full-house recital spanning all four styles and guest musicians.',
  },
]

export const schedule: readonly ScheduleSession[] = [
  {
    id: 's1',
    classId: 'kathak-foundations',
    time: '08:30 AM',
    endTime: '09:30 AM',
    studio: 'Studio A',
    status: 'in-progress',
    dateOffset: 0,
  },
  {
    id: 's2',
    classId: 'contemporary-flow',
    time: '10:00 AM',
    endTime: '11:00 AM',
    studio: 'Studio B',
    status: 'reserve',
    dateOffset: 0,
  },
  {
    id: 's3',
    classId: 'bharatanatyam-technique',
    time: '04:00 PM',
    endTime: '05:15 PM',
    studio: 'Studio A',
    status: 'booked',
    dateOffset: 0,
  },
  {
    id: 's4',
    classId: 'odissi-abhinaya',
    time: '06:30 PM',
    endTime: '08:00 PM',
    studio: 'Studio C',
    status: 'reserve',
    dateOffset: 0,
  },
  {
    id: 's5',
    classId: 'kathak-footwork',
    time: '07:45 PM',
    endTime: '08:45 PM',
    studio: 'Studio B',
    status: 'reserve',
    dateOffset: 1,
  },
  {
    id: 's6',
    classId: 'bharatanatyam-adavus',
    time: '09:00 AM',
    endTime: '10:00 AM',
    studio: 'Studio A',
    status: 'reserve',
    dateOffset: 1,
  },
  {
    id: 's7',
    classId: 'kathak-foundations',
    time: '06:00 PM',
    endTime: '07:00 PM',
    studio: 'Studio A',
    status: 'reserve',
    dateOffset: 2,
  },
  {
    id: 's8',
    classId: 'contemporary-flow',
    time: '07:15 PM',
    endTime: '08:15 PM',
    studio: 'Studio B',
    status: 'booked',
    dateOffset: 2,
  },
]

export const membershipPlans: readonly MembershipPlan[] = [
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
]

export const transactions: readonly Transaction[] = [
  {
    id: 'tx-1',
    title: '3-Month Membership',
    dateLabel: '21 Aug 2026',
    amountInr: 5000,
    status: 'Paid',
  },
  {
    id: 'tx-2',
    title: 'Rhythms of Lucknow deposit',
    dateLabel: '14 Aug 2026',
    amountInr: 900,
    status: 'Paid',
  },
  {
    id: 'tx-3',
    title: 'Costume workshop',
    dateLabel: '2 Aug 2026',
    amountInr: 1200,
    status: 'Paid',
  },
]

export const eventCategories = ['All', 'Workshops', 'Performances', 'Auditions'] as const

export const danceStyles = ['All', 'Kathak', 'Bharatanatyam', 'Contemporary', 'Odissi'] as const

export const experienceLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const

export function instructorById(id: string): Instructor | undefined {
  return instructors.find((person) => person.id === id)
}

export function classById(id: string): DanceClass | undefined {
  return danceClasses.find((item) => item.id === id)
}

export function eventById(id: string): AcademyEvent | undefined {
  return events.find((item) => item.id === id)
}

export function planById(id: string): MembershipPlan | undefined {
  return membershipPlans.find((item) => item.id === id)
}

export const trendingClassIds = [
  'kathak-foundations',
  'contemporary-flow',
  'odissi-abhinaya',
] as const
