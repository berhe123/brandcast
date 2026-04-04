import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Facebook, Instagram, Twitter, Linkedin, Wand2, Copy, CheckCircle,
  RefreshCw, ChevronDown, Sparkles, AlertCircle, Hash, Smile,
  Cpu, Zap, KeyRound
} from 'lucide-react'
import { TikTokIcon } from '../components/PlatformIcons'
import toast from 'react-hot-toast'
import { generateContent, getAiStatus } from '../services/api'
import { useApp } from '../context/AppContext'
import ContentPreview from '../components/ContentPreview'

const platforms = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    activeRing: 'ring-blue-500/50',
    limit: 500
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    activeRing: 'ring-pink-500/50',
    limit: 500
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: Twitter,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    activeRing: 'ring-sky-500/50',
    limit: 280
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    activeRing: 'ring-indigo-500/50',
    limit: 600
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: TikTokIcon,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    activeRing: 'ring-teal-500/50',
    limit: 300
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToHistory } = useApp()
  const location = useLocation()

  const [form, setForm] = useState({
    platform: searchParams.get('platform') || 'facebook',
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
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aiMode, setAiMode] = useState(null) // null | 'claude' | 'demo'

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
    try {
      const res = await generateContent(form)
      setResult(res.data.content)
      addToHistory(res.data)
      toast.success('Content generated successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to generate content. Check your API key.')
    } finally {
      setLoading(false)
    }
  }, [form, addToHistory])

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

  const charLimitColor = charCount > currentPlatform?.limit
    ? 'text-red-400'
    : charCount > currentPlatform?.limit * 0.85
    ? 'text-yellow-400'
    : 'text-green-400'

  return (
    <div className="space-y-6">
      {/* AI Mode Banner */}
      {aiMode === 'claude' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/25"
        >
          <Cpu size={16} className="text-violet-400 flex-shrink-0" />
          <p className="text-violet-300 text-sm font-medium">
            Claude AI is active — generating with real intelligence
          </p>
          <span className="ml-auto badge bg-violet-500/20 text-violet-300 border-violet-500/30">
            <Zap size={10} /> Live AI
          </span>
        </motion.div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-5">
          {/* Platform Selection */}
          <div className="card p-5">
            <label className="label text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-violet-400">01</span>
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
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                    }`}
                >
                  {form.platform === id && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-current" style={{ color: 'inherit' }} />
                  )}
                  <Icon size={16} className={form.platform === id ? color : 'text-slate-500'} />
                  <span className={`text-xs font-semibold ${form.platform === id ? 'text-white' : 'text-slate-500'}`}>
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="card p-5">
            <label className="label text-base font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-violet-400">02</span>
              What's your post about?
            </label>
            <textarea
              value={form.topic}
              onChange={e => setForm(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g. 'Sell your old iPhone and get instant cash' or 'Refurbished Samsung Galaxy S24 now in stock'"
              rows={3}
              className="input-field text-sm"
              maxLength={300}
            />
            <p className="text-right text-xs text-slate-600 mt-1">{form.topic.length}/300</p>
          </div>

          {/* Tone & Type */}
          <div className="card p-5 space-y-4">
            <label className="label text-base font-semibold text-white flex items-center gap-2">
              <span className="text-violet-400">03</span>
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
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-500 hover:border-slate-600 hover:text-slate-400'
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
              <label className="label text-base font-semibold text-white flex items-center gap-2 mb-0">
                <span className="text-violet-400">04</span>
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
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-500'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form[key] ? 'bg-violet-500/20' : 'bg-slate-700'}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                  <div className={`ml-auto w-4 h-4 rounded-full border-2 ${form[key] ? 'bg-violet-500 border-violet-500' : 'border-slate-600'}`} />
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
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mt-3 transition-colors"
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
                    placeholder="Any special instructions, e.g. 'Mention the 30-day return policy' or 'Include a question to drive engagement'"
                    rows={2}
                    className="input-field text-sm mt-3"
                    maxLength={200}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={loading || !form.topic.trim()}
            className="btn-primary w-full py-4 text-base"
          >
            {loading ? (
              <>
                <div className="spinner" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Content
              </>
            )}
          </motion.button>
        </div>

        {/* RIGHT: Preview */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span className="text-violet-400 text-sm">Preview</span>
                {currentPlatform && (
                  <span className={`badge ${
                    form.platform === 'facebook' ? 'badge-facebook' :
                    form.platform === 'instagram' ? 'badge-instagram' : 'badge-twitter'
                  }`}>
                    <currentPlatform.icon size={12} />
                    {currentPlatform.label}
                  </span>
                )}
              </h3>
              {result && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${charLimitColor}`}>
                    {charCount}/{currentPlatform?.limit}
                  </span>
                  <button onClick={handleCopy} className="btn-ghost py-1.5 px-3 text-xs">
                    {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleRegenerate} className="btn-ghost py-1.5 px-3 text-xs" disabled={loading}>
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Redo
                  </button>
                </div>
              )}
            </div>

            <ContentPreview
              platform={form.platform}
              content={result}
              loading={loading}
            />

            {result && charCount > currentPlatform?.limit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs">
                  Content exceeds {currentPlatform?.label} limit ({charCount - currentPlatform?.limit} chars over).
                  Consider regenerating.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
