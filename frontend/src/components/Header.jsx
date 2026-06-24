import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, ChevronDown, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const pageTitles = {
  '/app/dashboard': { title: 'Dashboard', subtitle: 'Manage your brands and channels' },
  '/app/templates': { title: 'Templates', subtitle: 'Ready-made content templates' },
  '/app/schedule': { title: 'Schedule', subtitle: 'Plan and publish across every channel' },
  '/app/analytics': { title: 'Analytics', subtitle: 'Performance and AI model insights' },
  '/app/team': { title: 'Team', subtitle: 'Manage members and access' },
  '/app/brand/:brandId/content': { title: 'Create Content', subtitle: 'Generate AI-powered posts' },
}

const initials = (u) => (u?.name || u?.email || '?').slice(0, 2).toUpperCase()

export default function Header() {
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

  let page = { title: 'AI Media Buncher', subtitle: 'Content Creator Dashboard' }
  if (pageTitles[location.pathname]) page = pageTitles[location.pathname]
  else if (location.pathname.match(/\/app\/brand\/.*\/content/)) page = pageTitles['/app/brand/:brandId/content']

  return (
    <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-white">{page.title}</h1>
        <p className="text-slate-500 text-sm">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Account menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
          >
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
              : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">{initials(user)}</div>}
            <span className="text-sm text-slate-200 max-w-[140px] truncate hidden sm:block">{user?.name || user?.email}</span>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className={`mt-2 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md ${user?.role === 'admin' ? 'bg-violet-500/15 text-violet-300' : 'bg-slate-800 text-slate-400'}`}>
                  {user?.role === 'admin' ? <ShieldCheck size={11} /> : <User size={11} />}
                  {user?.role === 'admin' ? 'Admin' : 'Member'}
                </span>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => { setOpen(false); navigate('/app/team') }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <User size={14} /> Manage team
                </button>
              )}
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/40 transition-colors flex items-center gap-2"
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
