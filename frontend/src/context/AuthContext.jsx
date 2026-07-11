import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, setToken, getToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Validate any stored token on boot.
  useEffect(() => {
    let active = true
    const token = getToken()
    if (!token) { setLoading(false); return }
    getMe()
      .then((res) => { if (active) setUser(res.data.user) })
      .catch(() => { if (active) { setToken(null); setUser(null) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  // React to a 401 from anywhere in the app.
  useEffect(() => {
    const onUnauth = () => setUser(null)
    window.addEventListener('vibepost-unauthorized', onUnauth)
    return () => window.removeEventListener('vibepost-unauthorized', onUnauth)
  }, [])

  // Called after a successful login (email-code or Google).
  const authenticate = useCallback(({ token, user: u }) => {
    setToken(token)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, setUser, loading, authenticate, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
