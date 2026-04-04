import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const generateContent = (payload) => api.post('/content/generate', payload)
export const getSamplePosts = (platform) => api.get('/content/samples', { params: { platform } })
export const getTemplates = (platform) => api.get('/content/templates', { params: { platform } })
export const getHistory = () => api.get('/content/history')
export const deleteHistoryItem = (id) => api.delete(`/content/history/${id}`)
export const checkHealth = () => api.get('/health')
export const getAiStatus = () => api.get('/content/ai-status')

export default api
