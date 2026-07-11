import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Facebook, Instagram, Twitter, ArrowRight, BookOpen, Sparkles, Filter } from 'lucide-react'
import { getTemplates } from '../services/api'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const platformIcons = {
  facebook: { Icon: Facebook, badge: 'badge-facebook', label: 'Facebook' },
  instagram: { Icon: Instagram, badge: 'badge-instagram', label: 'Instagram' },
  twitter: { Icon: Twitter, badge: 'badge-twitter', label: 'Twitter' },
  all: { Icon: Sparkles, badge: 'badge-all', label: 'All Platforms' },
}

const categoryColors = {
  'Product Promotion': 'bg-green-500/10 text-green-700 border-green-500/20',
  'Sustainability': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  'Customer Story': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  'Quick Tip': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  'Sale & Deals': 'bg-red-500/10 text-red-700 border-red-500/20',
  'Brand Awareness': 'bg-pink-500/10 text-pink-700 border-pink-500/20',
  'Education': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  'Seasonal': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
}

export default function Templates() {
  const navigate = useNavigate()
  const { selectedBrand, brands } = useApp()
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
    const target = selectedBrand || brands[0]
    if (!target) {
      toast.error('Add a brand first to use a template.')
      navigate('/app/dashboard?mode=addBrand')
      return
    }
    const prefill = { ...template.fields }
    if (template.platform && template.platform !== 'all') prefill.platform = template.platform
    navigate(`/app/brand/${target.id}/content`, { state: { prefill } })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(13,148,136,0.08) 100%)', border: '1px solid rgba(34,197,94,0.25)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <BookOpen size={20} className="text-green-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Content Templates</h2>
            <p className="text-slate-600 text-sm">Reusable, proven angles — pick one and we'll prefill the studio for your brand</p>
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
                  ? 'bg-green-500/20 text-green-700 border-green-500/30'
                  : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
            >
              <cfg.Icon size={14} />
              {cfg.label}
            </button>
          )
        })}
        <span className="ml-auto text-slate-500 text-sm">{filtered.length} templates</span>
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
            const catColor = categoryColors[template.category] || 'bg-slate-100 text-slate-600 border-slate-200'
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
                    <h3 className="text-slate-900 font-semibold text-sm">{template.name}</h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed">{template.description}</p>

                {/* Topic preview */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-slate-500 text-xs mb-1 font-medium uppercase tracking-wide">Topic</p>
                  <p className="text-slate-700 text-sm">{template.fields.topic}</p>
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
