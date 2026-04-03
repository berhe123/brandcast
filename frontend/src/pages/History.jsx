import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Facebook, Instagram, Twitter, Linkedin, Copy, CheckCircle, Trash2, Search, Filter, Clock } from 'lucide-react'
import { TikTokIcon } from '../components/PlatformIcons'
import { useApp } from '../context/AppContext'
import { deleteHistoryItem } from '../services/api'
import toast from 'react-hot-toast'

const platformIcons = {
  facebook: { Icon: Facebook, badge: 'badge-facebook' },
  instagram: { Icon: Instagram, badge: 'badge-instagram' },
  twitter: { Icon: Twitter, badge: 'badge-twitter' },
  linkedin: { Icon: Linkedin, badge: 'badge-linkedin' },
  tiktok: { Icon: TikTokIcon, badge: 'badge-tiktok' },
}

export default function History() {
  const { history, removeFromHistory } = useApp()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const filtered = history.filter(item => {
    const matchesPlatform = filter === 'all' || item.platform === filter
    const matchesSearch = !search || 
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.topic.toLowerCase().includes(search.toLowerCase())
    return matchesPlatform && matchesSearch
  })

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleDelete = async (id) => {
    removeFromHistory(id)
    deleteHistoryItem(id).catch(() => {})
    toast.success('Removed from history')
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by topic or content..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>
          <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-slate-500" />
          {['all', 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'].map(p => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                ${filter === p
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'bg-slate-800/60 text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
            >
              {p === 'all' ? 'All' :
               p === 'facebook' ? '📘 FB' :
               p === 'instagram' ? '📷 IG' :
               p === 'twitter' ? '🐦 TW' :
               p === 'linkedin' ? '💼 LI' : '🎵 TT'}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">
          {filtered.length} post{filtered.length !== 1 ? 's' : ''}{search ? ` matching "${search}"` : ''}
        </p>
        {filtered.length > 0 && (
          <span className="text-xs text-slate-600 flex items-center gap-1">
            <Clock size={12} />
            Most recent first
          </span>
        )}
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Clock size={28} className="text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-2">No history found</p>
          <p className="text-slate-600 text-sm">
            {search ? 'Try a different search term' : 'Generate some posts to see them here'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => {
              const cfg = platformIcons[item.platform] || platformIcons.facebook
              const isExpanded = expanded === item.id
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="card p-5 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`badge ${cfg.badge}`}>
                          <cfg.Icon size={11} />
                          {item.platform}
                        </span>
                        {item.tone && (
                          <span className="badge bg-slate-700/60 text-slate-400 border border-slate-600/40 capitalize">
                            {item.tone}
                          </span>
                        )}
                        {item.contentType && (
                          <span className="badge bg-slate-700/60 text-slate-400 border border-slate-600/40 capitalize">
                            {item.contentType}
                          </span>
                        )}
                        {item.language === 'german' && (
                          <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">🇩🇪 DE</span>
                        )}
                        <span className="text-slate-600 text-xs ml-auto">{formatDate(item.createdAt)}</span>
                      </div>

                      {/* Topic */}
                      <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                        Topic: {item.topic}
                      </p>

                      {/* Content */}
                      <p className={`text-slate-200 text-sm leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {item.content}
                      </p>

                      {item.content.length > 200 && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : item.id)}
                          className="text-violet-400 text-xs mt-2 hover:text-violet-300 transition-colors"
                        >
                          {isExpanded ? 'Show less ↑' : 'Show more ↓'}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyText(item.content, item.id)}
                        className="btn-ghost p-2.5 rounded-lg"
                        title="Copy"
                      >
                        {copied === item.id
                          ? <CheckCircle size={16} className="text-green-400" />
                          : <Copy size={16} />
                        }
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-danger p-2.5 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Character count */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-xs text-slate-600">{item.content.length} characters</span>
                    <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all"
                        style={{ width: `${Math.min(100, (item.content.length / (item.platform === 'twitter' ? 280 : item.platform === 'instagram' ? 300 : 500)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
