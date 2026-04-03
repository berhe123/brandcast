import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({
    totalGenerated: 0,
    byPlatform: { facebook: 0, instagram: 0, twitter: 0, linkedin: 0, tiktok: 0 }
  })

  const addToHistory = useCallback((item) => {
    setHistory(prev => [item, ...prev].slice(0, 100))
    setStats(prev => ({
      totalGenerated: prev.totalGenerated + 1,
      byPlatform: {
        ...prev.byPlatform,
        [item.platform]: (prev.byPlatform[item.platform] || 0) + 1
      }
    }))
  }, [])

  const removeFromHistory = useCallback((id) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return (
    <AppContext.Provider value={{
      history,
      setHistory,
      stats,
      addToHistory,
      removeFromHistory,
      clearHistory
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
