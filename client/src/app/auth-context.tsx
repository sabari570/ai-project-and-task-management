import { getAccessToken, login as apiLogin, logout as apiLogout } from '@/api'
import { getCurrentUser } from '@/api/users'
import type { UserResponse } from '@/types'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface AuthContextValue {
  user: UserResponse | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      return
    }
    const u = await getCurrentUser()
    setUser(u)
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        if (getAccessToken()) await refreshUser()
      } finally {
        setLoading(false)
      }
    })()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email, password })
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user && !!getAccessToken(),
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}