const API_BASE = import.meta.env.VITE_API_URL || ''

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('mudra_auth_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', res.status)
  }

  return data as T
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// ── Auth ──

export interface ApiUser {
  id: string
  email: string
  name: string
  handle: string
  avatarUrl: string | null
  phone: string | null
  tier: string
  xp: number
  xpGoal: number
  role: string
  createdAt: string
}

interface AuthResponse {
  user: ApiUser
  token: string
}

export const api = {
  auth: {
    signup(data: { email: string; password: string; name: string; handle: string }) {
      return request<AuthResponse>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    login(data: { email: string; password: string }) {
      return request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    me() {
      return request<{ user: ApiUser }>('/api/auth/me')
    },
  },

  // ── Classes ──

  classes: {
    list() {
      return request<{ classes: ApiClass[] }>('/api/classes')
    },
    get(id: string) {
      return request<{ class: ApiClass }>(`/api/classes/${id}`)
    },
  },

  // ── Events ──

  events: {
    list() {
      return request<{ events: ApiEvent[] }>('/api/events')
    },
    get(id: string) {
      return request<{ event: ApiEvent }>(`/api/events/${id}`)
    },
  },

  // ── Instructors ──

  instructors: {
    list() {
      return request<{ instructors: ApiInstructor[] }>('/api/instructors')
    },
    get(id: string) {
      return request<{ instructor: ApiInstructor }>(`/api/instructors/${id}`)
    },
  },

  // ── Schedule ──

  schedule: {
    byDate(date: string) {
      return request<{ date: string; sessions: ApiSession[] }>(
        `/api/schedule?date=${date}`,
      )
    },
  },

  // ── Membership ──

  membership: {
    plans() {
      return request<{ plans: ApiMembershipPlan[] }>('/api/membership/plans')
    },
    me() {
      return request<ApiMembershipDashboard>('/api/membership/me')
    },
  },
} as const

// ── API response types ──

export interface ApiInstructor {
  id: string
  name: string
  title: string
  avatarUrl: string | null
  bio: string | null
  userId: string | null
  createdAt: string
  classes?: ApiClass[]
  events?: ApiEvent[]
}

export interface ApiClass {
  id: string
  name: string
  style: string
  level: string
  instructorId: string
  priceInr: number
  durationMin: number
  imageUrl: string | null
  capacity: number
  blurb: string | null
  isActive: boolean
  createdAt: string
  instructor: ApiInstructor
  weekdays: string[]
  enrolled: number
  schedules?: { id: number; classId: string; weekday: string }[]
}

export interface ApiEvent {
  id: string
  title: string
  category: string
  startDate: string
  endDate: string | null
  timeLabel: string
  venue: string
  imageUrl: string | null
  instructorId: string | null
  priceInr: number
  isFeatured: boolean
  description: string | null
  capacity: number | null
  createdAt: string
  instructor: ApiInstructor | null
}

export interface ApiSession {
  id: string
  classId: string
  date: string
  startTime: string
  endTime: string
  studio: string
  status: string
  class: ApiClass
}

export interface ApiMembershipPlan {
  id: string
  months: number
  priceInr: number
  batches: number
  label: string
  detail: string | null
  bestValue: boolean
  isActive: boolean
}

export interface ApiMembershipDashboard {
  membership: {
    id: string
    planId: string
    startsOn: string
    renewsOn: string
    status: string
    plan: ApiMembershipPlan
  } | null
  enrollments: unknown[]
  eventBookings: unknown[]
  transactions: {
    id: string
    title: string
    amountInr: number
    status: string
    createdAt: string
  }[]
}
