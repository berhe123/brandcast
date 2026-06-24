import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const AppContext = createContext(null)
const STORAGE_KEY = 'ai-media-buncher-state'

const initialStats = {
  totalGenerated: 0,
  byPlatform: { facebook: 0, instagram: 0, twitter: 0, linkedin: 0, tiktok: 0 }
}

const loadStoredState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    return null
  }
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function AppProvider({ children }) {
  const stored = loadStoredState()

  const [history, setHistory] = useState(stored?.history || [])
  const [stats, setStats] = useState(stored?.stats || initialStats)
  const [user, setUser] = useState(stored?.user || null)
  const [brands, setBrands] = useState(stored?.brands || [])
  const [selectedBrandId, setSelectedBrandId] = useState(stored?.selectedBrandId || null)

  const selectedBrand = useMemo(() => {
    return brands.find((brand) => brand.id === selectedBrandId) || brands[0] || null
  }, [brands, selectedBrandId])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, brands, selectedBrandId, history, stats })
    )
  }, [user, brands, selectedBrandId, history, stats])

  const addToHistory = useCallback((item) => {
    setHistory((prev) => [item, ...prev].slice(0, 100))
    setStats((prev) => ({
      totalGenerated: prev.totalGenerated + 1,
      byPlatform: {
        ...prev.byPlatform,
        [item.platform]: (prev.byPlatform[item.platform] || 0) + 1
      }
    }))
  }, [])

  const removeFromHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const login = useCallback((email) => {
    const trimmed = email?.trim().toLowerCase()
    if (!trimmed) return false
    setUser({ email: trimmed })
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const addBrand = useCallback((brand) => {
    setBrands((prev) => [brand, ...prev])
    setSelectedBrandId(brand.id)
  }, [])

  const updateBrand = useCallback((id, updates) => {
    setBrands((prev) => prev.map((brand) =>
      brand.id === id ? { ...brand, ...updates, updatedAt: Date.now() } : brand
    ))
  }, [])

  const removeBrand = useCallback((id) => {
    setBrands((prev) => {
      const next = prev.filter((brand) => brand.id !== id)
      if (next.length === 0) {
        setSelectedBrandId(null)
      }
      return next
    })
    setSelectedBrandId((current) => (current === id ? null : current))
  }, [])

  const selectBrand = useCallback((id) => {
    setSelectedBrandId(id)
  }, [])

  return (
    <AppContext.Provider value={{
      history,
      setHistory,
      stats,
      addToHistory,
      removeFromHistory,
      clearHistory,
      user,
      login,
      logout,
      brands,
      selectedBrand,
      selectedBrandId,
      addBrand,
      updateBrand,
      removeBrand,
      selectBrand
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
