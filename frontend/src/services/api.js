import axios from 'axios'

const TOKEN_KEY = 'brandcast-token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY))

// Local: Vite proxies /api → localhost:5000
// Vercel: set VITE_API_URL to your Render URL (e.g. https://brandcast-api.onrender.com)
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const api = axios.create({
  baseURL: apiBase ? `${apiBase}/api` : '/api',
  timeout: 180000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      setToken(null)
      window.dispatchEvent(new Event('brandcast-unauthorized'))
    }
    const message = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const loginWithEmail = (email, name) => api.post('/auth/email/login', { email, name })
export const startEmailLogin = (email) => api.post('/auth/email/login', { email })
export const verifyEmailLogin = (email) => api.post('/auth/email/login', { email })
export const loginWithGoogle = (payload) => api.post('/auth/google', payload)
export const getMe = () => api.get('/auth/me')
export const getAuthConfig = () => api.get('/auth/config')

export const generateContent = (payload) => api.post('/content/generate', payload)
export const generateMonthlyPlan = (payload) => api.post('/content/monthly', payload)
export const researchBrandMcp = (payload) => api.post('/content/mcp/research', payload)
export const getSamplePosts = (platform) => api.get('/content/samples', { params: { platform } })
export const getTemplates = (platform) => api.get('/content/templates', { params: { platform } })
export const getHistory = () => api.get('/content/history')
export const deleteHistoryItem = (id) => api.delete(`/content/history/${id}`)
export const updateHistoryItem = (id, payload) => api.patch(`/content/history/${id}`, payload)
export const checkHealth = () => api.get('/health')
export const getAiStatus = () => api.get('/content/ai-status')
export const getModels = () => api.get('/content/models')

export const createScheduled = (payload) => api.post('/schedule', payload)
export const getScheduled = (status) => api.get('/schedule', { params: { status } })
export const updateScheduled = (id, payload) => api.patch(`/schedule/${id}`, payload)
export const publishScheduled = (id) => api.post(`/schedule/${id}/publish`)
export const deleteScheduled = (id) => api.delete(`/schedule/${id}`)

export const getAnalytics = (scope) => api.get('/analytics', { params: { scope } })

export const getUsers = () => api.get('/users')
export const updateUser = (id, payload) => api.patch(`/users/${id}`, payload)
export const deleteUser = (id) => api.delete(`/users/${id}`)

// MCP context is built-in; optional status probe
export const getMcpContext = (params) => api.get('/mcp/context', { params })

export default api
