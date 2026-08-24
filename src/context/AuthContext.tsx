import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface AuthUser {
  readonly name: string
  readonly email: string
  readonly avatar: string
}

export interface AuthContextValue {
  readonly isLoggedIn: boolean
  readonly user: AuthUser | null
  readonly login: (email: string, password: string) => void
  readonly signup: (name: string, email: string, password: string) => void
  readonly logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'mudra_auth_user'

function generateAvatar(name: string): string {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  // Use a deterministic avatar based on name
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3d8bff&color=fff&size=200&bold=true&format=svg`
}

interface AuthProviderProps {
  readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as AuthUser) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = useCallback((email: string, _password: string) => {
    // Mock login – in a real app this would call an API
    const name = email.split('@')[0] ?? 'User'
    const displayName = name.charAt(0).toUpperCase() + name.slice(1)
    setUser({
      name: displayName,
      email,
      avatar: generateAvatar(displayName),
    })
  }, [])

  const signup = useCallback((name: string, email: string, _password: string) => {
    // Mock signup – in a real app this would call an API
    setUser({
      name,
      email,
      avatar: generateAvatar(name),
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const isLoggedIn = user !== null

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn,
      user,
      login,
      signup,
      logout,
    }),
    [isLoggedIn, user, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
