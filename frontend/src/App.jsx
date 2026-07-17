import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import Templates from './pages/Templates'
import Schedule from './pages/Schedule'
import Analytics from './pages/Analytics'
import Team from './pages/Team'

// Gate a route to admins only.
function AdminOnly({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/app/dashboard" replace />
}

function App() {
  return (
    <AppProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'go-to-toast',
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#7c3aed', secondary: '#f1f5f9' }
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' }
          }
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="brand/:brandId/content" element={<Generate />} />
          <Route path="brand/:brandId/edit" element={<Dashboard />} />
          <Route path="templates" element={<Templates />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="team" element={<AdminOnly><Team /></AdminOnly>} />
          <Route path="users" element={<AdminOnly><Team /></AdminOnly>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  )
}

export default App
