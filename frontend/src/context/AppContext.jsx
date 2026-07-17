import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)
const LEGACY_STORAGE_KEY = 'brandcast-state'
const OLD_LEGACY_STORAGE_KEY = 'vibepost-state'
const storageKey = (userId) => `brandcast-state:${userId}`
const oldStorageKey = (userId) => `vibepost-state:${userId}`

const initialStats = {
  totalGenerated: 0,
  byPlatform: { facebook: 0, instagram: 0, twitter: 0, linkedin: 0, tiktok: 0 }
}

const emptyState = () => ({
  history: [],
  stats: initialStats,
  brands: [],
  selectedBrandId: null,
})

const loadStoredState = (userId) => {
  if (!userId) return emptyState()
  try {
    const key = storageKey(userId)
    let raw = localStorage.getItem(key)

    // One-time migration from older shared / vibepost keys.
    if (!raw) {
      const legacy =
        localStorage.getItem(LEGACY_STORAGE_KEY) ||
        localStorage.getItem(OLD_LEGACY_STORAGE_KEY) ||
        localStorage.getItem(oldStorageKey(userId))
      if (legacy) {
        localStorage.setItem(key, legacy)
        raw = legacy
      }
    }

    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    return {
      history: parsed.history || [],
      stats: parsed.stats || initialStats,
      brands: parsed.brands || [],
      selectedBrandId: parsed.selectedBrandId || null,
    }
  } catch {
    return emptyState()
  }
}

export function AppProvider({ children }) {
  const { user: authUser } = useAuth()
  const userId = authUser?.id

  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(initialStats)
  const [brands, setBrands] = useState([])
  const [selectedBrandId, setSelectedBrandId] = useState(null)
  const [ready, setReady] = useState(false)

  // Load the signed-in user's own workspace when the account changes.
  useEffect(() => {
    setReady(false)
    if (!userId) {
      const blank = emptyState()
      setHistory(blank.history)
      setStats(blank.stats)
      setBrands(blank.brands)
      setSelectedBrandId(blank.selectedBrandId)
      setReady(true)
      return
    }

    const stored = loadStoredState(userId)
    setHistory(stored.history)
    setStats(stored.stats)
    setBrands(stored.brands)
    setSelectedBrandId(stored.selectedBrandId)
    setReady(true)
  }, [userId])

  const selectedBrand = useMemo(() => {
    return brands.find((brand) => brand.id === selectedBrandId) || brands[0] || null
  }, [brands, selectedBrandId])

  useEffect(() => {
    if (!userId || !ready) return
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify({ brands, selectedBrandId, history, stats })
    )
  }, [userId, ready, brands, selectedBrandId, history, stats])

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
      setSelectedBrandId((current) => {
        if (current === id) return next[0]?.id || null
        return current
      })
      return next
    })
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
