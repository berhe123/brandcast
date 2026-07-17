import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
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
  X,
} from 'lucide-react'
import Logo from './Logo'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/schedule', label: 'Schedule', icon: CalendarClock },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/templates', label: 'Templates', icon: LayoutTemplate },
]

export default function Sidebar({ onNavigate }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { brands, selectBrand, selectedBrand, removeBrand } = useApp()
  const { isAdmin, user } = useAuth()
  const [openMenuId, setOpenMenuId] = useState(null)

  return (
    <aside className="w-[17rem] max-w-[85vw] flex-shrink-0 bg-white/70 backdrop-blur-md border-r border-slate-200 flex flex-col h-full safe-top safe-bottom">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <Logo size={34} />
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="lg:hidden tap-target -mr-2 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/25 text-xs text-green-800 font-medium">
          Signed in as Admin · {user?.email}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Menu</p>

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
            to="/app/users"
            className={({ isActive }) => (isActive || location.pathname === '/app/team' ? 'nav-item-active group' : 'nav-item group')}
          >
            <Users size={18} className="flex-shrink-0" />
            <span className="flex-1">Users</span>
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
                      onNavigate?.()
                    }}
                    className={`w-full text-left px-3 py-2 rounded-2xl transition-all text-sm font-medium flex items-center justify-between ${
                      selectedBrand?.id === brand.id
                        ? 'bg-green-500/15 border border-green-500/40 text-green-800'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{brand.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === brand.id ? null : brand.id)
                      }}
                      className="flex-shrink-0 p-1 hover:bg-slate-200/70 rounded transition-all"
                    >
                      <MoreVertical size={16} className="text-slate-400 hover:text-slate-700" />
                    </button>
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === brand.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          setOpenMenuId(null)
                          navigate(`/app/brand/${brand.id}/edit`)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-all text-sm text-slate-700 hover:text-slate-900 flex items-center gap-2 first:rounded-t-lg"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuId(null)
                          removeBrand(brand.id)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 transition-all text-sm text-red-600 hover:text-red-700 flex items-center gap-2 last:rounded-b-lg"
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
    </aside>
  )
}
