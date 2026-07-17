import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Facebook, Instagram, Twitter, Linkedin, BookOpen, Copy, CheckCircle2,
  CalendarDays, Sparkles, Layers
} from 'lucide-react'
import { TikTokIcon } from './PlatformIcons'
import toast from 'react-hot-toast'
import { createScheduled } from '../services/api'

const ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: TikTokIcon,
  blog: BookOpen,
}

const ACCENT = {
  facebook: 'from-blue-500/20 to-blue-600/5 border-blue-500/25',
  instagram: 'from-pink-500/20 to-fuchsia-600/5 border-pink-500/25',
  twitter: 'from-sky-500/20 to-sky-600/5 border-sky-500/25',
  linkedin: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/25',
  tiktok: 'from-teal-500/20 to-teal-600/5 border-teal-500/25',
  blog: 'from-orange-500/20 to-amber-600/5 border-orange-500/25',
}

function PostCard({ post, brand, onSchedule }) {
  const [copied, setCopied] = useState(false)
  const Icon = ICONS[post.platform] || Sparkles
  const accent = ACCENT[post.platform] || ACCENT.facebook

  const copy = () => {
    if (!post.content) return
    navigator.clipboard.writeText(post.content).then(() => {
      setCopied(true)
      toast.success(`Post ${post.index} copied`)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-gradient-to-br ${accent} p-4 flex flex-col gap-3 min-h-[220px]`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-white/80 border border-slate-200 flex items-center justify-center text-slate-700">
            <Icon size={15} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate capitalize">{post.platform}</p>
            <p className="text-[11px] text-slate-500">Week {post.week} · {post.day}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-white/70 text-slate-600 border border-slate-200">
          #{post.index}
        </span>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-green-700 mb-1">{post.angleLabel}</p>
        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap line-clamp-6">
          {post.content || post.error || '…'}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-1">
        <button type="button" onClick={copy} className="btn-ghost py-1.5 px-2.5 text-xs flex-1 justify-center">
          {copied ? <CheckCircle2 size={13} className="text-green-600" /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={() => onSchedule(post)}
          className="btn-ghost py-1.5 px-2.5 text-xs flex-1 justify-center text-green-700"
          disabled={!post.content}
        >
          <CalendarDays size={13} />
          Queue
        </button>
      </div>
      {brand?.name && (
        <p className="text-[10px] text-slate-400 truncate">For {brand.name}</p>
      )}
    </motion.article>
  )
}

export default function MonthlyPlanBoard({ plan, brand, loading }) {
  const weeks = useMemo(() => [1, 2, 3, 4].map((w) => ({
    week: w,
    posts: plan?.weeks?.[w] || [],
  })), [plan])

  const scheduleOne = async (post) => {
    try {
      const base = new Date()
      base.setDate(base.getDate() + (post.week - 1) * 7 + (post.index % 7))
      base.setHours(10 + (post.index % 5), 0, 0, 0)
      await createScheduled({
        platform: post.platform,
        content: post.content,
        scheduledFor: base.toISOString(),
        topic: post.angleLabel,
        brandName: brand?.name || plan?.brandName || '',
        routing: post.routing || null,
      })
      toast.success(`Queued post #${post.index}`)
    } catch (err) {
      toast.error(err.message || 'Could not schedule')
    }
  }

  if (loading) {
    return (
      <div className="card p-8 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-green-500/15 flex items-center justify-center">
          <div className="spinner" />
        </div>
        <p className="font-semibold text-slate-900">Building your monthly calendar…</p>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Brandcast is mixing platforms, angles, and weeks into a balanced content plan.
        </p>
      </div>
    )
  }

  if (!plan) return null

  return (
    <div className="space-y-5">
      <div className="card p-5 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1 flex items-center gap-1.5">
              <Layers size={12} /> Monthly content plan
            </p>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {plan.postCount} posts · 4-week calendar
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Goal: <span className="text-slate-700">{plan.goal}</span>
            </p>
            {plan.mcpSummary && (
              <p className="text-xs text-slate-500 mt-2 max-w-2xl">
                <span className="font-semibold text-green-700">MCP</span> · {plan.mcpSummary}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(plan.mix?.platforms || {}).map(([p, n]) => (
              <span key={p} className="badge bg-white/80 text-slate-700 border-slate-200 capitalize">
                {p} · {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {weeks.map(({ week, posts }) => (
        <section key={week} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <h4 className="text-sm font-bold text-slate-700 whitespace-nowrap">Week {week}</h4>
            <span className="text-xs text-slate-400">{posts.length} posts</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} brand={brand} onSchedule={scheduleOne} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
