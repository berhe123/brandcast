import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Facebook, Instagram, Twitter, Linkedin, Copy, CheckCircle,
  RefreshCw, ChevronDown, Sparkles, AlertCircle, Hash, Smile,
  Cpu, Zap, BookOpen, CalendarClock, Send, ExternalLink, CalendarRange
} from 'lucide-react'
import { TikTokIcon } from '../components/PlatformIcons'
import toast from 'react-hot-toast'
import { generateContent, generateMonthlyPlan, getAiStatus, createScheduled } from '../services/api'
import { useApp } from '../context/AppContext'
import ContentPreview from '../components/ContentPreview'
import RoutingPanel from '../components/RoutingPanel'
import MonthlyPlanBoard from '../components/MonthlyPlanBoard'

// Build the brand context the AI uses, from the selected brand (+ MCP profile).
const brandInfoFrom = (brand) => ({
  name: brand?.name || 'the brand',
  description: brand?.description || brand?.mcp?.description || '',
  website: brand?.website || brand?.blog || '',
  voice: brand?.mcp?.voice || '',
  tagline: brand?.mcp?.tagline || '',
  values: brand?.mcp?.values || [],
  industry: brand?.mcp?.industry,
  audience: brand?.mcp?.audience,
  offerings: brand?.mcp?.offerings || [],
  keywords: brand?.mcp?.keywords || [],
  mcp: brand?.mcp || null,
})

// Default the scheduler to ~1 hour from now, formatted for <input type=datetime-local>.
const defaultScheduleTime = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const platforms = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    activeRing: 'ring-blue-500/50',
    limit: 500
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: 'text-pink-600',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    activeRing: 'ring-pink-500/50',
    limit: 500
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: Twitter,
    color: 'text-sky-600',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    activeRing: 'ring-sky-500/50',
    limit: 280
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    activeRing: 'ring-indigo-500/50',
    limit: 600
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: TikTokIcon,
    color: 'text-teal-600',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    activeRing: 'ring-teal-500/50',
    limit: 300
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: BookOpen,
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    activeRing: 'ring-orange-500/50',
    limit: 2000
  },
]

const tones = [
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'inspiring', label: 'Inspiring', emoji: '✨' },
  { value: 'exciting', label: 'Exciting', emoji: '🚀' },
  { value: 'educational', label: 'Educational', emoji: '📚' },
  { value: 'witty', label: 'Witty', emoji: '😄' },
  { value: 'urgent', label: 'Urgent', emoji: '⚡' },
  { value: 'warm', label: 'Warm', emoji: '🤗' },
]

const contentTypes = [
  { value: 'post', label: 'Regular Post' },
  { value: 'story', label: 'Story Caption' },
  { value: 'promotion', label: 'Promotion / Ad' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'engagement', label: 'Engagement Post' },
]

const audiences = [
  { value: 'general', label: 'General Audience' },
  { value: 'tech_savvy', label: 'Tech Enthusiasts' },
  { value: 'budget_conscious', label: 'Budget Shoppers' },
  { value: 'eco_conscious', label: 'Eco-Conscious' },
  { value: 'students', label: 'Students' },
  { value: 'professionals', label: 'Professionals' },
  { value: 'parents', label: 'Parents & Families' },
]

export default function Generate() {
  const { brandId } = useParams()
  const navigate = useNavigate()
  const { addToHistory, brands } = useApp()
  const location = useLocation()

  const brand = brands.find((b) => b.id === brandId)

  useEffect(() => {
    if (!brand) {
      navigate('/app/dashboard')
      toast.error('Brand not found')
    }
  }, [brand, navigate])

  const [form, setForm] = useState({
    platform: 'facebook',
    topic: '',
    tone: 'friendly',
    contentType: 'post',
    targetAudience: 'general',
    language: 'english',
    includeHashtags: true,
    includeEmoji: true,
    customInstructions: ''
  })

  const [loading, setLoading] = useState(false)
  const [monthlyLoading, setMonthlyLoading] = useState(false)
  const [monthlyPlan, setMonthlyPlan] = useState(null)
  const [result, setResult] = useState(null)
  const [meta, setMeta] = useState(null) // { routing, drafts } from the AI router
  const [copied, setCopied] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aiMode, setAiMode] = useState(null) // null | 'live' | 'demo'
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleAt, setScheduleAt] = useState(defaultScheduleTime())
  const [scheduling, setScheduling] = useState(false)

  const currentPlatform = platforms.find(p => p.id === form.platform)

  // Fetch AI mode status on mount
  useEffect(() => {
    getAiStatus()
      .then(res => setAiMode(res.data?.mode || 'demo'))
      .catch(() => setAiMode('demo'))
  }, [])

  // Apply template prefill from Templates page navigation
  useEffect(() => {
    if (location.state?.prefill) {
      const prefill = location.state.prefill
      setForm(prev => ({ ...prev, ...prefill }))
    }
  }, [location.state])

  useEffect(() => {
    if (result) setCharCount(result.length)
  }, [result])

  const handlePlatformSelect = (platformId) => {
    setForm(prev => ({ ...prev, platform: platformId }))
    setResult(null)
  }

  const handleGenerate = useCallback(async () => {
    if (!form.topic.trim()) {
      toast.error('Please enter a topic for your post')
      return
    }
    setLoading(true)
    setResult(null)
    setMeta(null)
    setMonthlyPlan(null)
    try {
      // The AI router always runs in 'auto' mode: it picks the single best model
      // — or fuses two complementary models — for the best result automatically.
      const res = await generateContent({ ...form, routingMode: 'auto', brandInfo: brandInfoFrom(brand) })
      setResult(res.data.content)
      setMeta({ routing: res.data.routing, drafts: res.data.drafts })
      addToHistory(res.data)
      const routed = res.data.routing
      toast.success(
        routed?.mode === 'hybrid'
          ? `Fused ${routed.primary.label} + ${routed.partner.label}`
          : `Generated with ${routed?.primary?.label || 'AI'}`
      )
    } catch (err) {
      toast.error(err.message || 'Failed to generate content. Check your API key.')
    } finally {
      setLoading(false)
    }
  }, [form, brand, addToHistory])

  const handleMonthlyGenerate = useCallback(async () => {
    if (!form.topic.trim() || form.topic.trim().length < 8) {
      toast.error('Describe a monthly goal — e.g. “I own a coffee shop and I want more customers”')
      return
    }
    setMonthlyLoading(true)
    setMonthlyPlan(null)
    setResult(null)
    setMeta(null)
    try {
      const res = await generateMonthlyPlan({
        goal: form.topic.trim(),
        brandInfo: brandInfoFrom(brand),
        brand,
        mcp: brand?.mcp || null,
        language: form.language,
        includeHashtags: form.includeHashtags,
        includeEmoji: form.includeEmoji,
      })
      setMonthlyPlan(res.data)
      toast.success(`Monthly plan ready · ${res.data.postCount} posts`)
    } catch (err) {
      toast.error(err.message || 'Failed to build monthly plan')
    } finally {
      setMonthlyLoading(false)
    }
  }, [form, brand])

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleRegenerate = () => {
    setResult(null)
    handleGenerate()
  }

  const handleSchedule = async () => {
    if (!result) return
    setScheduling(true)
    try {
      await createScheduled({
        platform: form.platform,
        content: result,
        scheduledFor: new Date(scheduleAt).toISOString(),
        topic: form.topic.trim(),
        brandName: brand?.name || '',
        routing: meta?.routing || null,
      })
      toast.success('Scheduled! Track it on the Schedule page.')
      setShowSchedule(false)
    } catch (err) {
      toast.error(err.message || 'Could not schedule post')
    } finally {
      setScheduling(false)
    }
  }

  const charLimitColor = charCount > currentPlatform?.limit
    ? 'text-red-600'
    : charCount > currentPlatform?.limit * 0.85
    ? 'text-amber-600'
    : 'text-green-600'

  return (
    <div className="space-y-6">
      {/* AI Mode Banner */}
      {aiMode === 'live' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/25"
        >
          <Cpu size={16} className="text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">
            Multi-model AI router active — routing each task to the best model
          </p>
          <span className="ml-auto badge bg-green-500/20 text-green-700 border-green-500/30">
            <Zap size={10} /> Live AI
          </span>
        </motion.div>
      )}

      {/* Brand header — name + context */}
      {brand && (
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
            {brand.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{brand.name}</p>
            <p className="text-xs text-slate-500 truncate">
              {brand.description || 'Create AI content for this brand'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-5">
          {/* Platform Selection */}
          <div className="card p-5">
            <label className="label text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-green-600">01</span>
              Choose Platform
            </label>
            <div className="grid grid-cols-5 gap-2">
              {platforms.map(({ id, label, icon: Icon, color, bg, border, activeRing }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handlePlatformSelect(id)}
                  className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200
                    ${form.platform === id
                      ? `${bg} ${border} ring-2 ${activeRing}`
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                >
                  {form.platform === id && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-current" style={{ color: 'inherit' }} />
                  )}
                  <Icon size={16} className={form.platform === id ? color : 'text-slate-400'} />
                  <span className={`text-xs font-semibold ${form.platform === id ? 'text-slate-900' : 'text-slate-500'}`}>
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="card p-5">
            <label className="label text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-green-600">02</span>
              What's your post about?
            </label>
            <textarea
              value={form.topic}
              onChange={e => setForm(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g. 'Announce our spring menu' — or for a month: 'I own a coffee shop and I want more customers, create a month of content'"
              rows={3}
              className="input-field text-sm"
              maxLength={500}
            />
            <p className="text-right text-xs text-slate-500 mt-1">{form.topic.length}/500</p>
            <p className="mt-2 text-xs text-green-800 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              Context is automatic — Marketing Context Protocol
              {brand?.mcp ? ` · ${brand.mcp.industry} · ${brand.mcp.audience}` : ' (from your brand website)'}
              {' · '}Model Context Protocol (CRM, databases, apps) built in
            </p>
          </div>

          {/* Tone & Type */}
          <div className="card p-5 space-y-4">
            <label className="label text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-green-600">03</span>
              Tone & Style
            </label>
            <div>
              <label className="label text-xs">Tone of Voice</label>
              <div className="grid grid-cols-4 gap-2">
                {tones.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => setForm(prev => ({ ...prev, tone: value }))}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-medium transition-all duration-200
                      ${form.tone === value
                        ? 'bg-green-500/15 border-green-500/40 text-green-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-xs">Content Type</label>
                <select
                  value={form.contentType}
                  onChange={e => setForm(prev => ({ ...prev, contentType: e.target.value }))}
                  className="input-field text-sm"
                >
                  {contentTypes.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Language</label>
                <select
                  value={form.language}
                  onChange={e => setForm(prev => ({ ...prev, language: e.target.value }))}
                  className="input-field text-sm"
                >
                  <option value="english">English</option>
                  <option value="german">German (Deutsch)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Settings toggles */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <label className="label text-base font-semibold text-slate-900 flex items-center gap-2 mb-0">
                <span className="text-green-600">04</span>
                Settings
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { key: 'includeHashtags', label: 'Include Hashtags', icon: Hash },
                { key: 'includeEmoji', label: 'Include Emojis', icon: Smile },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setForm(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
                    ${form[key]
                      ? 'bg-green-500/10 border-green-500/30 text-green-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form[key] ? 'bg-green-500/20' : 'bg-slate-200'}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                  <div className={`ml-auto w-4 h-4 rounded-full border-2 ${form[key] ? 'bg-green-600 border-green-600' : 'border-slate-300'}`} />
                </button>
              ))}
            </div>

            <div>
              <label className="label text-xs">Target Audience</label>
              <select
                value={form.targetAudience}
                onChange={e => setForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="input-field text-sm"
              >
                {audiences.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Advanced */}
            <button
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mt-3 transition-colors"
            >
              <ChevronDown size={16} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              Additional Instructions
            </button>
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={form.customInstructions}
                    onChange={e => setForm(prev => ({ ...prev, customInstructions: e.target.value }))}
                    placeholder="Any special instructions, e.g. 'Mention our free shipping' or 'End with a question to drive engagement'"
                    rows={2}
                    className="input-field text-sm mt-3"
                    maxLength={200}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Generate actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={loading || monthlyLoading || !form.topic.trim()}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Content
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleMonthlyGenerate}
              disabled={loading || monthlyLoading || form.topic.trim().length < 8}
              className="w-full py-4 text-base rounded-xl font-semibold text-white shadow-lg shadow-emerald-900/20
                bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600
                hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 transition-all"
            >
              {monthlyLoading ? (
                <>
                  <div className="spinner" />
                  Building month…
                </>
              ) : (
                <>
                  <CalendarRange size={20} />
                  Generate Monthly Plan
                </>
              )}
            </motion.button>
          </div>
          <p className="text-xs text-slate-500 text-center -mt-2">
            Monthly plan creates <span className="text-slate-700 font-medium">8–15 posts</span> across 4 weeks, mixed by platform and angle.
          </p>
        </div>

        {/* RIGHT: Preview */}
        <div className="space-y-4">
          {(monthlyLoading || monthlyPlan) && (
            <MonthlyPlanBoard plan={monthlyPlan} brand={brand} loading={monthlyLoading} />
          )}

          {/* AI Router decision */}
          {meta?.routing && !monthlyPlan && <RoutingPanel routing={meta.routing} drafts={meta.drafts} />}

          {!monthlyPlan && !monthlyLoading && (
          <div className="card p-5 sticky top-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-green-600 text-sm">Preview</span>
                {currentPlatform && (() => {
                  const channelUrl = brand?.[form.platform] || brand?.website || ''
                  const cls = `badge ${
                    form.platform === 'facebook' ? 'badge-facebook' :
                    form.platform === 'instagram' ? 'badge-instagram' : 'badge-twitter'
                  }`
                  const inner = (
                    <>
                      <currentPlatform.icon size={12} />
                      {currentPlatform.label}
                      {channelUrl && <ExternalLink size={10} className="opacity-70" />}
                    </>
                  )
                  return channelUrl ? (
                    <a href={channelUrl} target="_blank" rel="noopener noreferrer"
                      title={`Open ${brand?.name || 'brand'} on ${currentPlatform.label}`}
                      className={`${cls} hover:brightness-125 transition`}>
                      {inner}
                    </a>
                  ) : <span className={cls}>{inner}</span>
                })()}
              </h3>
              {result && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${charLimitColor}`}>
                    {charCount}/{currentPlatform?.limit}
                  </span>
                  <button onClick={handleCopy} className="btn-ghost py-1.5 px-3 text-xs">
                    {copied ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleRegenerate} className="btn-ghost py-1.5 px-3 text-xs" disabled={loading}>
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Redo
                  </button>
                  <button onClick={() => setShowSchedule(v => !v)} className="btn-ghost py-1.5 px-3 text-xs text-green-700">
                    <CalendarClock size={14} />
                    Schedule
                  </button>
                </div>
              )}
            </div>

            {/* Inline scheduler */}
            <AnimatePresence>
              {result && showSchedule && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-slate-100 border border-slate-200">
                    <CalendarClock size={16} className="text-green-600 flex-shrink-0" />
                    <input
                      type="datetime-local"
                      value={scheduleAt}
                      onChange={(e) => setScheduleAt(e.target.value)}
                      className="input-field text-sm py-1.5 flex-1"
                    />
                    <button onClick={handleSchedule} disabled={scheduling} className="btn-primary py-1.5 px-3 text-xs whitespace-nowrap">
                      {scheduling ? <div className="spinner" /> : <><Send size={13} /> Queue post</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ContentPreview
              platform={form.platform}
              content={result}
              loading={loading}
              brand={brand}
            />

            {result && charCount > currentPlatform?.limit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <p className="text-red-600 text-xs">
                  Content exceeds {currentPlatform?.label} limit ({charCount - currentPlatform?.limit} chars over).
                  Consider regenerating.
                </p>
              </motion.div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
