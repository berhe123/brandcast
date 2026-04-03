import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Facebook, Instagram, Twitter, ArrowRight, BookOpen, Sparkles, Filter } from 'lucide-react'
import { getTemplates } from '../services/api'
import toast from 'react-hot-toast'

const platformIcons = {
  facebook: { Icon: Facebook, badge: 'badge-facebook', label: 'Facebook' },
  instagram: { Icon: Instagram, badge: 'badge-instagram', label: 'Instagram' },
  twitter: { Icon: Twitter, badge: 'badge-twitter', label: 'Twitter' },
  all: { Icon: Sparkles, badge: 'badge-all', label: 'All Platforms' },
}

const categoryColors = {
  'Product Promotion': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Sustainability': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Customer Story': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Quick Tip': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Sale & Deals': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Brand Awareness': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Education': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Seasonal': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

export default function Templates() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getTemplates()
      .then(res => setTemplates(res.data || []))
      .catch(() => toast.error('Failed to load templates'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? templates
    : templates.filter(t => t.platform === filter || t.platform === 'all')

  const handleUseTemplate = (template) => {
    const params = new URLSearchParams({
      platform: template.platform === 'all' ? 'facebook' : template.platform,
    })
    navigate(`/generate?${params.toString()}`, {
      state: { prefill: template.fields }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(124,58,237,0.2)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <BookOpen size={20} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Content Templates</h2>
            <p className="text-slate-400 text-sm">Pre-built templates tailored for mySWOOOP's brand voice</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={16} className="text-slate-500" />
        {['all', 'facebook', 'instagram', 'twitter'].map(p => {
          const cfg = platformIcons[p]
          return (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border capitalize
                ${filter === p
                  ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                  : 'bg-slate-800/60 text-slate-500 hover:text-slate-300 border-transparent'
                }`}
            >
              <cfg.Icon size={14} />
              {cfg.label}
            </button>
          )
        })}
        <span className="ml-auto text-slate-600 text-sm">{filtered.length} templates</span>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="shimmer h-4 w-32 rounded" />
              <div className="shimmer h-12 rounded" />
              <div className="shimmer h-8 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-500">No templates found for this platform.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((template, i) => {
            const pCfg = platformIcons[template.platform] || platformIcons.all
            const catColor = categoryColors[template.category] || 'bg-slate-700/60 text-slate-400 border-slate-600/40'
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="card-hover p-5 flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${pCfg.badge}`}>
                        <pCfg.Icon size={11} />
                        {pCfg.label}
                      </span>
                      <span className={`badge border ${catColor}`}>
                        {template.category}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm">{template.name}</h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed">{template.description}</p>

                {/* Topic preview */}
                <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/60">
                  <p className="text-slate-500 text-xs mb-1 font-medium uppercase tracking-wide">Topic</p>
                  <p className="text-slate-300 text-sm">{template.fields.topic}</p>
                </div>

                {/* Use button */}
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="btn-primary py-2.5 text-sm mt-auto"
                >
                  <Sparkles size={15} />
                  Use Template
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
