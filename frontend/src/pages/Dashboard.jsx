import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, Globe, Facebook, Instagram, Twitter, Linkedin, BookOpen,
  Sparkles, GitMerge, CalendarClock, TrendingUp, ArrowRight,
  Wand2, BarChart3, Clock, CheckCircle2, Layers, Zap, Link as LinkIcon,
  Trash2, Pencil, X
} from 'lucide-react'
import { TikTokIcon } from '../components/PlatformIcons'
import ChannelLinks from '../components/ChannelLinks'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { getAnalytics, getHistory, getScheduled, researchBrandMcp, deleteHistoryItem, updateHistoryItem } from '../services/api'
import toast from 'react-hot-toast'

const platforms = [
  { id: 'facebook', label: 'Facebook', Icon: Facebook, placeholder: 'https://facebook.com/yourbrand' },
  { id: 'instagram', label: 'Instagram', Icon: Instagram, placeholder: 'https://instagram.com/yourbrand' },
  { id: 'twitter', label: 'Twitter / X', Icon: Twitter, placeholder: 'https://twitter.com/yourbrand' },
  { id: 'linkedin', label: 'LinkedIn', Icon: Linkedin, placeholder: 'https://linkedin.com/company/yourbrand' },
  { id: 'tiktok', label: 'TikTok', Icon: TikTokIcon, placeholder: 'https://tiktok.com/@yourbrand' },
  { id: 'blog', label: 'Blog', Icon: BookOpen, placeholder: 'https://yourbrand.com/blog' }
]

// Per-platform icon + accent for content/schedule rows.
const PLATFORM_META = {
  facebook: { Icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  instagram: { Icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-500/10' },
  twitter: { Icon: Twitter, color: 'text-sky-600', bg: 'bg-sky-500/10' },
  linkedin: { Icon: Linkedin, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
  tiktok: { Icon: TikTokIcon, color: 'text-teal-600', bg: 'bg-teal-500/10' },
  blog: { Icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-500/10' },
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const initialForm = { name: '', website: '', description: '', facebook: '', instagram: '', twitter: '', linkedin: '', tiktok: '', blog: '' }

// Ensure a user-entered URL is absolute so links open correctly.
const normalizeUrl = (url) => {
  if (!url) return ''
  const t = url.trim()
  if (!t) return ''
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}

const fmtRelative = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}
const fmtWhen = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const modelLabel = (routing) =>
  routing?.mode === 'hybrid'
    ? `${routing.primary?.label} + ${routing.partner?.label}`
    : (routing?.primary?.label || 'AI')

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent.bg}`}>
          <Icon size={15} className={accent.text} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-3">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { brands, selectedBrand, addBrand, selectBrand } = useApp()
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const showRightAddForm = searchParams.get('mode') === 'addBrand'

  const [data, setData] = useState(null)
  const [recent, setRecent] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingBrand, setSavingBrand] = useState(false)
  const [mcpPreview, setMcpPreview] = useState(null)
  const [editing, setEditing] = useState(null) // history item being edited
  const [editDraft, setEditDraft] = useState({ topic: '', content: '' })
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    if (showRightAddForm) return
    let active = true
    Promise.all([getAnalytics().catch(() => null), getHistory().catch(() => null), getScheduled('scheduled').catch(() => null)])
      .then(([a, h, s]) => {
        if (!active) return
        setData(a?.data || null)
        setRecent((h?.data || []).slice(0, 5))
        setUpcoming((s?.data || []).slice(0, 4))
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [showRightAddForm])

  const handleAddBrand = async () => {
    if (!form.name.trim()) {
      toast.error('Please enter a brand name.')
      return
    }
    setSavingBrand(true)
    let mcp = null
    const website = normalizeUrl(form.website)
    try {
      if (website) {
        toast.loading('Marketing Context Protocol researching your website…', { id: 'mcp' })
        const res = await researchBrandMcp({
          website,
          name: form.name.trim(),
          description: form.description.trim(),
        })
        mcp = res.data?.mcp || null
        setMcpPreview(mcp)
        toast.success(mcp?.source === 'website' ? 'Brand studied from website' : 'Brand profile ready (fallback)', { id: 'mcp' })
      }
      const newBrand = {
        id: createId(),
        name: form.name.trim(),
        website,
        description: form.description.trim() || mcp?.description || '',
        facebook: normalizeUrl(form.facebook), instagram: normalizeUrl(form.instagram), twitter: normalizeUrl(form.twitter),
        linkedin: normalizeUrl(form.linkedin), tiktok: normalizeUrl(form.tiktok), blog: normalizeUrl(form.blog),
        mcp,
        createdAt: Date.now(), updatedAt: Date.now()
      }
      addBrand(newBrand)
      setForm(initialForm)
      toast.success('Brand added successfully.')
      navigate(`/app/brand/${newBrand.id}/content`)
    } catch (err) {
      toast.error(err.message || 'Could not research brand', { id: 'mcp' })
      // Still allow save without MCP if research fails
      const newBrand = {
        id: createId(),
        name: form.name.trim(),
        website,
        description: form.description.trim(),
        facebook: normalizeUrl(form.facebook), instagram: normalizeUrl(form.instagram), twitter: normalizeUrl(form.twitter),
        linkedin: normalizeUrl(form.linkedin), tiktok: normalizeUrl(form.tiktok), blog: normalizeUrl(form.blog),
        mcp: null,
        createdAt: Date.now(), updatedAt: Date.now()
      }
      addBrand(newBrand)
      setForm(initialForm)
      navigate(`/app/brand/${newBrand.id}/content`)
    } finally {
      setSavingBrand(false)
    }
  }

  const goCreate = () => {
    const target = selectedBrand || brands[0]
    if (target) navigate(`/app/brand/${target.id}/content`)
    else navigate('/app/dashboard?mode=addBrand')
  }

  // ─── Add Brand (a normal page, like the others) ───────────────────────────
  if (showRightAddForm) {
    return (
      <div className="page-enter space-y-6">
        {/* Page heading */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Add a brand</h2>
          <p className="text-slate-500 text-sm mt-1">
            Add your website — Marketing Context Protocol studies the company automatically. CRM, databases, and apps are built into generation (Model Context Protocol). No separate integrations setup.
          </p>
        </div>

        {/* Brand basics */}
        <div className="card p-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label flex items-center gap-1.5"><Globe size={14} className="text-green-600" /> Brand name</label>
              <input
                type="text" autoFocus value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Harbor Roast Coffee" className="input-field w-full"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><LinkIcon size={14} className="text-slate-400" /> Website <span className="text-green-600 font-normal">· Marketing Context</span></label>
              <input
                type="url" value={form.website}
                onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://yourbrand.com" className="input-field w-full"
              />
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Sparkles size={14} className="text-slate-400" /> What does this brand do? <span className="text-slate-400 font-normal">· optional</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="e.g. A neighborhood coffee shop. Warm, local, quality-obsessed voice."
              className="input-field w-full text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Marketing Context Protocol merges this with website research.</p>
          </div>
          {mcpPreview && (
            <div className="rounded-xl border border-green-500/25 bg-green-500/10 p-4 text-sm text-slate-700">
              <p className="font-semibold text-green-800 mb-1">Marketing Context snapshot</p>
              <p className="text-xs">{mcpPreview.summary}</p>
            </div>
          )}
        </div>

        {/* Channels */}
        <div className="card p-6">
          <p className="text-sm font-semibold text-slate-900 mb-1">Channels</p>
          <p className="text-xs text-slate-500 mb-4">Add the brand's profile links — optional, you can do this later.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform) => (
              <div key={platform.id}>
                <label className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                  <platform.Icon size={13} className="text-slate-400" /> {platform.label}
                </label>
                <input
                  type="url" value={form[platform.id]}
                  onChange={(e) => setForm((p) => ({ ...p, [platform.id]: e.target.value }))}
                  placeholder={platform.placeholder}
                  className="input-field w-full py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Centered action */}
        <div className="flex justify-center">
          <button onClick={handleAddBrand} disabled={savingBrand} className="btn-primary py-3 px-12 text-base">
            {savingBrand ? <><div className="spinner" /> Studying brand…</> : <><Plus size={18} /> Add brand</>}
          </button>
        </div>
      </div>
    )
  }

  // ─── Overview / command center ────────────────────────────────────────────
  const s = data?.summary
  const totals = data?.totals
  const modelUsage = data ? Object.entries(data.modelUsage || {}).sort((a, b) => b[1] - a[1]).slice(0, 5) : []
  const maxModel = Math.max(1, ...modelUsage.map(([, v]) => v))
  const channelsOf = (b) => [b.facebook, b.instagram, b.twitter, b.linkedin, b.tiktok, b.blog].filter(Boolean).length

  return (
    <div className="page-enter space-y-6">
      {/* Welcome / hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-br from-green-500/[0.10] to-transparent border-green-500/25"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-green-700/80 font-semibold mb-1">Dashboard</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Welcome, {user?.name?.split(' ')[0] || 'there'} 👋
            </h2>
            <p className="text-slate-600 mt-1 max-w-xl">
              Your AI marketing command center — route each post to the best model, fuse two for higher quality, then schedule across every channel.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={goCreate} className="btn-primary py-2.5 px-5">
              <Wand2 size={16} /> Create content
            </button>
            <button onClick={() => navigate('/app/analytics')} className="btn-ghost py-2.5 px-5">
              <BarChart3 size={16} /> Analytics
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Sparkles} label="Content Created" value={loading ? '—' : (s?.generated ?? 0)}
          sub="AI generations" accent={{ bg: 'bg-green-500/15', text: 'text-green-600' }} />
        <StatCard icon={GitMerge} label="Hybrid Fusion" value={loading ? '—' : `${s?.hybridShare ?? 0}%`}
          sub={`${s?.hybridCount ?? 0} fused posts`} accent={{ bg: 'bg-emerald-500/15', text: 'text-emerald-600' }} />
        <StatCard icon={CalendarClock} label="Scheduled" value={loading ? '—' : upcoming.length}
          sub="upcoming posts" accent={{ bg: 'bg-amber-500/15', text: 'text-amber-600' }} />
        <StatCard icon={TrendingUp} label="Engagement" value={loading ? '—' : `${s?.engagementRate ?? 0}%`}
          sub={totals ? `${(totals.likes + totals.comments + totals.shares).toLocaleString()} interactions` : '—'}
          accent={{ bg: 'bg-teal-500/15', text: 'text-teal-600' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent content */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Layers size={16} className="text-green-600" /> Recent content</h3>
            <button onClick={goCreate} className="text-xs text-green-700 hover:text-green-600 flex items-center gap-1">
              New post <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><div className="spinner" /></div>
          ) : recent.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <Wand2 size={22} className="text-green-600" />
              </div>
              <p className="text-slate-700 font-medium">No content yet</p>
              <p className="text-slate-500 text-sm mt-1">Generate your first AI post to see it here.</p>
              <button onClick={goCreate} className="btn-primary py-2 px-4 text-sm mt-4 mx-auto">
                <Sparkles size={14} /> Create content
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recent.map((item) => {
                const meta = PLATFORM_META[item.platform] || PLATFORM_META.facebook
                const Icon = meta.Icon
                const hybrid = item.routing?.mode === 'hybrid'
                return (
                  <div key={item.id} className="flex items-start gap-3 py-3 group">
                    <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} className={meta.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-900 truncate">{item.topic || 'Untitled post'}</p>
                        {hybrid && (
                          <span className="badge text-[10px] bg-emerald-500/15 text-emerald-700 border-emerald-500/30 flex-shrink-0">
                            <GitMerge size={9} /> Fused
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{modelLabel(item.routing)} · {fmtRelative(item.createdAt)}</p>
                      {item.content && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.content}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        title="Edit"
                        className="btn-ghost py-1.5 px-2 text-xs"
                        onClick={() => {
                          setEditing(item)
                          setEditDraft({ topic: item.topic || '', content: item.content || '' })
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        className="btn-ghost py-1.5 px-2 text-xs text-red-600"
                        onClick={async () => {
                          if (!window.confirm('Delete this content?')) return
                          try {
                            await deleteHistoryItem(item.id)
                            setRecent((prev) => prev.filter((r) => r.id !== item.id))
                            toast.success('Content deleted')
                          } catch (err) {
                            toast.error(err.message || 'Could not delete')
                          }
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="card w-full max-w-lg p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Edit content</h3>
                <button type="button" className="btn-ghost py-1.5 px-2" onClick={() => setEditing(null)}>
                  <X size={16} />
                </button>
              </div>
              <div>
                <label className="label text-xs">Topic</label>
                <input
                  className="input-field w-full text-sm"
                  value={editDraft.topic}
                  onChange={(e) => setEditDraft((p) => ({ ...p, topic: e.target.value }))}
                />
              </div>
              <div>
                <label className="label text-xs">Post text</label>
                <textarea
                  className="input-field w-full text-sm min-h-[160px]"
                  value={editDraft.content}
                  onChange={(e) => setEditDraft((p) => ({ ...p, content: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-ghost py-2 px-4" onClick={() => setEditing(null)}>Cancel</button>
                <button
                  type="button"
                  className="btn-primary py-2 px-4"
                  disabled={savingEdit}
                  onClick={async () => {
                    setSavingEdit(true)
                    try {
                      const res = await updateHistoryItem(editing.id, {
                        topic: editDraft.topic,
                        content: editDraft.content,
                      })
                      setRecent((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...res.data } : r)))
                      toast.success('Content updated')
                      setEditing(null)
                    } catch (err) {
                      toast.error(err.message || 'Could not save')
                    } finally {
                      setSavingEdit(false)
                    }
                  }}
                >
                  {savingEdit ? <div className="spinner" /> : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI model usage — the moat */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-1"><Zap size={16} className="text-emerald-600" /> AI Router</h3>
          <p className="text-xs text-slate-500 mb-4">Models powering your content</p>
          {modelUsage.length === 0 ? (
            <p className="text-slate-500 text-sm py-6 text-center">Generate content to see which models the router picks.</p>
          ) : (
            <div className="space-y-3">
              {modelUsage.map(([model, count]) => (
                <div key={model}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 truncate">{model}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxModel) * 100}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming schedule */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><CalendarClock size={16} className="text-amber-600" /> Upcoming schedule</h3>
            <button onClick={() => navigate('/app/schedule')} className="text-xs text-green-700 hover:text-green-600 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="spinner" /></div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={28} className="mx-auto text-slate-400 mb-2" />
              <p className="text-slate-600 text-sm">No scheduled posts.</p>
              <p className="text-slate-500 text-xs mt-1">Generate content, then hit Schedule to queue it.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((post) => {
                const meta = PLATFORM_META[post.platform] || PLATFORM_META.facebook
                const Icon = meta.Icon
                return (
                  <div key={post.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                    <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={14} className={meta.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-800 truncate">{post.topic || post.content?.slice(0, 40)}</p>
                      <p className="text-xs text-slate-500">{fmtWhen(post.scheduledFor)}</p>
                    </div>
                    <CheckCircle2 size={14} className="text-amber-500/70 flex-shrink-0" />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Brands */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Globe size={16} className="text-sky-600" /> Your brands</h3>
            <span className="text-xs text-slate-500">{brands.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {brands.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-green-500/40 transition-colors"
              >
                <button
                  onClick={() => { selectBrand(b.id); navigate(`/app/brand/${b.id}/content`) }}
                  className="text-left w-full"
                >
                  <p className="text-sm font-medium text-slate-900 truncate">{b.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{channelsOf(b)} channel{channelsOf(b) !== 1 ? 's' : ''} connected</p>
                </button>
                <div className="mt-2.5"><ChannelLinks brand={b} /></div>
              </div>
            ))}
            <button
              onClick={() => navigate('/app/dashboard?mode=addBrand')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-green-500/40 hover:text-green-700 transition-colors text-sm"
            >
              <Plus size={15} /> Add brand
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
