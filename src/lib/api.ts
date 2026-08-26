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

// Upload file via multipart/form-data (no JSON content-type)
async function uploadFile(
  file: File,
  entity: string,
  onProgress?: (percent: number) => void,
): Promise<{ url: string; key: string; size: number; type: string }> {
  const token = localStorage.getItem('mudra_auth_token')
  const formData = new FormData()
  formData.append('file', file)

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/api/upload?entity=${encodeURIComponent(entity)}`)

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data)
        } else {
          reject(new ApiError(data.error || 'Upload failed', xhr.status))
        }
      } catch {
        reject(new ApiError('Upload failed — invalid response', xhr.status))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new ApiError('Network error during upload', 0))
    })

    xhr.send(formData)
  })
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
  upload: uploadFile,
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

  // ── Admin ──

  admin: {
    login(data: { username?: string; email?: string; password: string }) {
      return request<{ success: boolean; user: ApiUser; token: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    stats() {
      return request<AdminStatsResponse>('/api/admin/stats')
    },
    instructors: {
      create(data: { name: string; title: string; avatarUrl?: string; bio?: string; id?: string }) {
        return request<{ instructor: ApiInstructor }>('/api/admin/instructors', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },
      update(id: string, data: Partial<{ name: string; title: string; avatarUrl: string; bio: string }>) {
        return request<{ instructor: ApiInstructor }>(`/api/admin/instructors/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      },
      delete(id: string) {
        return request<{ success: boolean }>(`/api/admin/instructors/${id}`, {
          method: 'DELETE',
        })
      },
    },
    classes: {
      create(data: {
        name: string
        style: string
        level: string
        instructorId: string
        priceInr: number
        durationMin: number
        capacity: number
        blurb?: string
        imageUrl?: string
        weekdays?: string[]
        id?: string
      }) {
        return request<{ class: ApiClass }>('/api/admin/classes', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },
      update(
        id: string,
        data: Partial<{
          name: string
          style: string
          level: string
          instructorId: string
          priceInr: number
          durationMin: number
          capacity: number
          blurb: string
          imageUrl: string
          weekdays: string[]
          isActive: boolean
        }>,
      ) {
        return request<{ class: ApiClass }>(`/api/admin/classes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      },
      delete(id: string) {
        return request<{ success: boolean }>(`/api/admin/classes/${id}`, {
          method: 'DELETE',
        })
      },
    },
    events: {
      create(data: {
        title: string
        category: string
        startDate: string
        endDate?: string
        timeLabel: string
        venue: string
        imageUrl?: string
        instructorId?: string
        priceInr?: number
        isFeatured?: boolean
        description?: string
        capacity?: number
        id?: string
      }) {
        return request<{ event: ApiEvent }>('/api/admin/events', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },
      update(
        id: string,
        data: Partial<{
          title: string
          category: string
          startDate: string
          endDate: string | null
          timeLabel: string
          venue: string
          imageUrl: string
          instructorId: string | null
          priceInr: number
          isFeatured: boolean
          description: string
          capacity: number | null
        }>,
      ) {
        return request<{ event: ApiEvent }>(`/api/admin/events/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      },
      delete(id: string) {
        return request<{ success: boolean }>(`/api/admin/events/${id}`, {
          method: 'DELETE',
        })
      },
    },
    schedule: {
      list() {
        return request<{ sessions: ApiSession[] }>('/api/admin/schedule')
      },
      create(data: {
        classId: string
        date: string
        startTime: string
        endTime: string
        studio: string
        status?: string
      }) {
        return request<{ session: ApiSession }>('/api/admin/schedule', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },
      update(
        id: string,
        data: Partial<{
          classId: string
          date: string
          startTime: string
          endTime: string
          studio: string
          status: string
        }>,
      ) {
        return request<{ session: ApiSession }>(`/api/admin/schedule/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      },
      delete(id: string) {
        return request<{ success: boolean }>(`/api/admin/schedule/${id}`, {
          method: 'DELETE',
        })
      },
    },
    users: {
      list() {
        return request<{ users: AdminUser[] }>('/api/admin/users')
      },
      assignMembership(data: {
        userId: string
        planId: string
        startsOn?: string
        renewsOn?: string
        amountInr?: number
      }) {
        return request<{ membership: unknown }>('/api/admin/memberships', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },
      update(id: string, data: Partial<{ tier: string; xp: number; role: string }>) {
        return request<{ user: AdminUser }>(`/api/admin/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      },
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

export interface AdminStatsResponse {
  stats: {
    activeMembers: number
    totalUsers: number
    monthlyRevenue: string
    rawRevenue: number
    upcomingEvents: number
    todayClasses: number
  }
  recentActivity: {
    id: string
    userId: string
    title: string
    amountInr: number
    status: string
    createdAt: string
    paymentMethod: string | null
  }[]
  nextSessions: ApiSession[]
}

export interface AdminUser {
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
  memberships?: {
    id: string
    planId: string
    startsOn: string
    renewsOn: string
    status: string
    plan?: ApiMembershipPlan
  }[]
}
