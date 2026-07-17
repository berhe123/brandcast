import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, ChevronDown, ShieldCheck, User, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { initials } from '../lib/format'

const pageTitles = {
  '/app/dashboard': { title: 'Dashboard', subtitle: 'Manage your brands and channels' },
  '/app/templates': { title: 'Templates', subtitle: 'Ready-made content templates' },
  '/app/schedule': { title: 'Schedule', subtitle: 'Plan and publish across every channel' },
  '/app/analytics': { title: 'Analytics', subtitle: 'Performance and AI model insights' },
  '/app/team': { title: 'Users', subtitle: 'Control who signed in to Brandcast' },
  '/app/users': { title: 'Users', subtitle: 'Control who signed in to Brandcast' },
  '/app/brand/:brandId/content': { title: 'Create Content', subtitle: 'Generate AI-powered posts' },
}

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  let page = { title: 'Brandcast', subtitle: 'AI Content Studio' }
  if (pageTitles[location.pathname]) page = pageTitles[location.pathname]
  else if (location.pathname.match(/\/app\/brand\/.*\/content/)) page = pageTitles['/app/brand/:brandId/content']

  return (
    <header className="relative z-30 border-b border-slate-200 bg-white/70 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 safe-top">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden tap-target -ml-2 inline-flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-black/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{page.title}</h1>
          <p className="text-slate-500 text-xs sm:text-sm truncate">{page.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Account menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-black/5 transition-colors"
          >
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
              : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">{initials(user)}</div>}
            <span className="text-sm text-slate-700 max-w-[140px] truncate hidden sm:block">{user?.name || user?.email}</span>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className={`mt-2 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md ${user?.role === 'admin' ? 'bg-green-500/15 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {user?.role === 'admin' ? <ShieldCheck size={11} /> : <User size={11} />}
                  {user?.role === 'admin' ? 'Admin' : 'Member'}
                </span>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => { setOpen(false); navigate('/app/users') }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <ShieldCheck size={14} className="text-green-600" /> Manage users
                </button>
              )}
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
