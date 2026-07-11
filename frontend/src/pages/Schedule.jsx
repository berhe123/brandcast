import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Facebook, Instagram, Twitter, Linkedin, BookOpen, CalendarClock,
  Send, Trash2, CheckCircle2, Clock, Eye, Heart, MessageCircle, Share2, Loader2,
} from 'lucide-react'
import { TikTokIcon } from '../components/PlatformIcons'
import toast from 'react-hot-toast'
import { getScheduled, publishScheduled, deleteScheduled } from '../services/api'

const PLATFORM = {
  facebook: { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  instagram: { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-500/10' },
  twitter: { icon: Twitter, color: 'text-sky-600', bg: 'bg-sky-500/10' },
  linkedin: { icon: Linkedin, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
  tiktok: { icon: TikTokIcon, color: 'text-teal-600', bg: 'bg-teal-500/10' },
  blog: { icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-500/10' },
}

const fmt = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

const TABS = [
  { value: 'scheduled', label: 'Upcoming', icon: Clock },
  { value: 'published', label: 'Published', icon: CheckCircle2 },
  { value: 'all', label: 'All', icon: CalendarClock },
]

function Metric({ icon: Icon, value }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
      <Icon size={13} /> {value?.toLocaleString() ?? 0}
    </span>
  )
}

export default function Schedule() {
  const [tab, setTab] = useState('scheduled')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getScheduled(tab)
      setItems(res.data)
    } catch (err) {
      toast.error(err.message || 'Could not load schedule')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { load() }, [load])

  const handlePublish = async (id) => {
    setBusyId(id)
    try {
      await publishScheduled(id)
      toast.success('Published! Metrics are rolling in.')
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id) => {
    setBusyId(id)
    try {
      await deleteScheduled(id)
      toast.success('Removed')
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all
              ${tab === value
                ? 'bg-green-500/15 border-green-500/40 text-green-700'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarClock size={40} className="mx-auto text-slate-400 mb-3" />
          <p className="text-slate-700 font-medium">Nothing here yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Generate content, then hit <span className="text-green-700">Schedule</span> to queue posts across your channels.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((post) => {
            const meta = PLATFORM[post.platform] || PLATFORM.facebook
            const Icon = meta.icon
            const published = post.status === 'published'
            return (
              <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center`}>
                    <Icon size={16} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 capitalize">{post.platform}</p>
                    <p className="text-xs text-slate-500 truncate">{post.topic || post.brandName || 'Post'}</p>
                  </div>
                  <span className={`badge text-[11px] ${published ? 'bg-green-500/15 text-green-700 border-green-500/30' : post.status === 'cancelled' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-500/15 text-amber-700 border-amber-500/30'}`}>
                    {published ? 'Published' : post.status === 'cancelled' ? 'Cancelled' : 'Scheduled'}
                  </span>
                </div>

                <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4 flex-1">{post.content}</p>

                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                  <CalendarClock size={13} />
                  {published ? `Published ${fmt(post.publishedAt)}` : fmt(post.scheduledFor)}
                </div>

                {published && post.metrics && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200">
                    <Metric icon={Eye} value={post.metrics.impressions} />
                    <Metric icon={Heart} value={post.metrics.likes} />
                    <Metric icon={MessageCircle} value={post.metrics.comments} />
                    <Metric icon={Share2} value={post.metrics.shares} />
                  </div>
                )}

                {!published && post.status !== 'cancelled' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handlePublish(post.id)}
                      disabled={busyId === post.id}
                      className="btn-primary py-1.5 px-3 text-xs flex-1"
                    >
                      {busyId === post.id ? <Loader2 size={13} className="animate-spin" /> : <><Send size={13} /> Publish now</>}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={busyId === post.id}
                      className="btn-ghost py-1.5 px-3 text-xs text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
