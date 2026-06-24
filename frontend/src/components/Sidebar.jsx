import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Zap,
  ChevronRight,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  LayoutDashboard,
  CalendarClock,
  BarChart3,
  LayoutTemplate,
  Users,
} from 'lucide-react'
import { TikTokIcon } from './PlatformIcons'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/schedule', label: 'Schedule', icon: CalendarClock },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/templates', label: 'Templates', icon: LayoutTemplate },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { stats, brands, selectBrand, selectedBrand, removeBrand } = useApp()
  const { isAdmin } = useAuth()
  const [openMenuId, setOpenMenuId] = useState(null)

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950/90 border-r border-slate-800/60 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow-purple">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">AI Media Buncher</p>
            <p className="text-slate-500 text-xs">Content Creator Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Menu</p>

        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? 'nav-item-active group' : 'nav-item group')}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/app/team"
            className={({ isActive }) => (isActive ? 'nav-item-active group' : 'nav-item group')}
          >
            <Users size={18} className="flex-shrink-0" />
            <span className="flex-1">Team</span>
          </NavLink>
        )}

        <NavLink
          to="/app/dashboard?mode=addBrand"
          className="nav-item group mt-2"
        >
          <Plus size={18} className="flex-shrink-0" />
          <span className="flex-1">Add Brand</span>
          {location.pathname === '/app/dashboard' && <ChevronRight size={14} className="opacity-60" />}
        </NavLink>

        <div className="mt-6 px-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Brands</p>
            <span className="text-xs text-slate-500">{brands.length}</span>
          </div>
          <div className="space-y-2">
            {brands.length === 0 ? (
              <p className="text-slate-500 text-sm">No brands yet</p>
            ) : (
              brands.map((brand) => (
                <div key={brand.id} className="relative">
                  <button
                    onClick={() => {
                      selectBrand(brand.id)
                      navigate(`/app/brand/${brand.id}/content`)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-2xl transition-all text-sm font-medium flex items-center justify-between ${
                      selectedBrand?.id === brand.id
                        ? 'bg-violet-500/15 border border-violet-500/40 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{brand.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === brand.id ? null : brand.id)
                      }}
                      className="flex-shrink-0 p-1 hover:bg-slate-700/50 rounded transition-all"
                    >
                      <MoreVertical size={16} className="text-slate-400 hover:text-slate-200" />
                    </button>
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === brand.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          setOpenMenuId(null)
                          navigate(`/app/brand/${brand.id}/edit`)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-800 transition-all text-sm text-slate-300 hover:text-white flex items-center gap-2 first:rounded-t-lg"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuId(null)
                          removeBrand(brand.id)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-950/50 transition-all text-sm text-red-400 hover:text-red-300 flex items-center gap-2 last:rounded-b-lg"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
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
