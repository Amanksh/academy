import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, type ApiUser, ApiError } from '../lib/api'

export interface AuthUser {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly handle: string
  readonly avatar: string
  readonly tier: string
  readonly xp: number
  readonly xpGoal: number
  readonly role: string
}

export interface AuthContextValue {
  readonly isLoggedIn: boolean
  readonly user: AuthUser | null
  readonly loading: boolean
  readonly login: (email: string, password: string) => Promise<string | null>
  readonly signup: (name: string, email: string, password: string) => Promise<string | null>
  readonly logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'mudra_auth_token'
const USER_KEY = 'mudra_auth_user'

function avatarUrl(name: string, avatarUrl: string | null): string {
  if (avatarUrl) return avatarUrl
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3d8bff&color=fff&size=200&bold=true&format=svg`
}

function toAuthUser(u: ApiUser): AuthUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    handle: u.handle,
    avatar: avatarUrl(u.name, u.avatarUrl),
    tier: u.tier,
    xp: u.xp,
    xpGoal: u.xpGoal,
    role: u.role,
  }
}

interface AuthProviderProps {
  readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? (JSON.parse(stored) as AuthUser) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  // On mount, if we have a token, validate it
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    api.auth
      .me()
      .then(({ user: u }) => {
        const authUser = toAuthUser(u)
        setUser(authUser)
        localStorage.setItem(USER_KEY, JSON.stringify(authUser))
      })
      .catch(() => {
        // Token is invalid/expired — clear everything
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
      })
  }, [])

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [user])

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    setLoading(true)
    try {
      const { user: u, token } = await api.auth.login({ email, password })
      localStorage.setItem(TOKEN_KEY, token)
      setUser(toAuthUser(u))
      return null // no error
    } catch (err) {
      if (err instanceof ApiError) return err.message
      return 'Something went wrong'
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    setLoading(true)
    try {
      // Generate a handle from the name
      const handle = `@${name.toLowerCase().replace(/\s+/g, '.')}`
      const { user: u, token } = await api.auth.signup({ email, password, name, handle })
      localStorage.setItem(TOKEN_KEY, token)
      setUser(toAuthUser(u))
      return null // no error
    } catch (err) {
      if (err instanceof ApiError) return err.message
      return 'Something went wrong'
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const isLoggedIn = user !== null

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn,
      user,
      loading,
      login,
      signup,
      logout,
    }),
    [isLoggedIn, user, loading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
