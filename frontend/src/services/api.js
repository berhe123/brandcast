import axios from 'axios'

const TOKEN_KEY = 'amb-token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY))

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach the bearer token (if any) to every request.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    // A 401 means our session is gone — drop the token so guards can redirect.
    if (err.response?.status === 401) {
      setToken(null)
      window.dispatchEvent(new Event('amb-unauthorized'))
    }
    const message = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────
export const startEmailLogin = (email) => api.post('/auth/email/start', { email })
export const verifyEmailLogin = (email, code) => api.post('/auth/email/verify', { email, code })
export const loginWithGoogle = (payload) => api.post('/auth/google', payload)
export const getMe = () => api.get('/auth/me')

// ─── Content ──────────────────────────────────────────────────────────────
export const generateContent = (payload) => api.post('/content/generate', payload)
export const getSamplePosts = (platform) => api.get('/content/samples', { params: { platform } })
export const getTemplates = (platform) => api.get('/content/templates', { params: { platform } })
export const getHistory = () => api.get('/content/history')
export const deleteHistoryItem = (id) => api.delete(`/content/history/${id}`)
export const checkHealth = () => api.get('/health')
export const getAiStatus = () => api.get('/content/ai-status')
export const getModels = () => api.get('/content/models')

// ─── Scheduling ─────────────────────────────────────────────────────────────
export const createScheduled = (payload) => api.post('/schedule', payload)
export const getScheduled = (status) => api.get('/schedule', { params: { status } })
export const updateScheduled = (id, payload) => api.patch(`/schedule/${id}`, payload)
export const publishScheduled = (id) => api.post(`/schedule/${id}/publish`)
export const deleteScheduled = (id) => api.delete(`/schedule/${id}`)

// ─── Analytics ──────────────────────────────────────────────────────────────
export const getAnalytics = (scope) => api.get('/analytics', { params: { scope } })

// ─── Users (admin) ──────────────────────────────────────────────────────────
export const getUsers = () => api.get('/users')
export const updateUser = (id, payload) => api.patch(`/users/${id}`, payload)
export const deleteUser = (id) => api.delete(`/users/${id}`)

export default api
