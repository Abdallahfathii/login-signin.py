import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import api, { tokenStore } from '../api/client'

export interface User {
  id: number
  username: string
  email: string
  name: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    username: string
    email: string
    name: string
    password: string
  }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface TokenPayload {
  access: string
  refresh: string
  user: User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      if (!tokenStore.access && !tokenStore.refresh) {
        setLoading(false)
        return
      }
      try {
        const res = await api.get<User>('/auth/me')
        if (!cancelled) setUser(res.data)
      } catch {
        tokenStore.clear()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<TokenPayload>('/auth/login', { email, password })
    tokenStore.set(res.data.access, res.data.refresh)
    setUser(res.data.user)
  }, [])

  const register = useCallback(
    async (data: { username: string; email: string; name: string; password: string }) => {
      const res = await api.post<TokenPayload>('/auth/register', data)
      tokenStore.set(res.data.access, res.data.refresh)
      setUser(res.data.user)
    },
    [],
  )

  const logout = useCallback(async () => {
    const refresh = tokenStore.refresh
    try {
      await api.post('/auth/logout', { refresh })
    } catch {
      // token may already be invalid; clear locally regardless
    }
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
