import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wand2,
  History,
  BookTemplate,
  Zap,
  ChevronRight,
  Linkedin
} from 'lucide-react'
import { TikTokIcon } from './PlatformIcons'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generate', icon: Wand2, label: 'Generate Content' },
  { to: '/templates', icon: BookTemplate, label: 'Templates' },
  { to: '/history', icon: History, label: 'History' },
]

export default function Sidebar() {
  const location = useLocation()
  const { stats } = useApp()

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950/90 border-r border-slate-800/60 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow-purple">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">mySWOOOP</p>
            <p className="text-slate-500 text-xs">AI Marketing Studio</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? 'nav-item-active group' : 'nav-item group'
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight size={14} className="opacity-60" />}
            </NavLink>
          )
        })}
      </nav>

      {/* Stats mini */}
      <div className="px-4 py-4 border-t border-slate-800/60">
        <div className="card p-4">
          <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wide">Session Stats</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total', value: stats.totalGenerated, color: 'text-violet-400' },
              { label: 'FB', value: stats.byPlatform.facebook || 0, color: 'text-blue-400' },
              { label: 'IG', value: stats.byPlatform.instagram || 0, color: 'text-pink-400' },
              { label: 'TW', value: stats.byPlatform.twitter || 0, color: 'text-sky-400' },
              { label: 'LI', value: stats.byPlatform.linkedin || 0, color: 'text-indigo-400' },
              { label: 'TT', value: stats.byPlatform.tiktok || 0, color: 'text-teal-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-base font-bold ${color}`}>{value}</p>
                <p className="text-slate-600 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
