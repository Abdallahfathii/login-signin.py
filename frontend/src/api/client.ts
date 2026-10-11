import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? '/api'

export const api = axios.create({ baseURL })

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY)
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.access
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing: Promise<string | null> | null = null

async function refreshAccess(): Promise<string | null> {
  const refresh = tokenStore.refresh
  if (!refresh) return null
  try {
    const res = await axios.post(`${baseURL}/auth/refresh`, { refresh })
    const access: string = res.data.access
    localStorage.setItem(ACCESS_KEY, access)
    if (res.data.refresh) {
      localStorage.setItem(REFRESH_KEY, res.data.refresh)
    }
    return access
  } catch {
    tokenStore.clear()
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }
    const url = original?.url ?? ''
    const isAuthUrl = url.includes('/auth/login') || url.includes('/auth/register')
    if (error.response?.status === 401 && original && !original._retry && !isAuthUrl) {
      original._retry = true
      refreshing = refreshing ?? refreshAccess()
      const access = await refreshing
      refreshing = null
      if (access) {
        original.headers = { ...original.headers, Authorization: `Bearer ${access}` }
        return api(original)
      }
    }
    return Promise.reject(error)
  },
)

export default api
