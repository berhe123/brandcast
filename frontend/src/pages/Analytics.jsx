import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Eye, Heart, TrendingUp, GitMerge, Trophy, BarChart3, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getAnalytics } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PLATFORM_COLORS = {
  facebook: 'bg-blue-500', instagram: 'bg-pink-500', twitter: 'bg-sky-500',
  linkedin: 'bg-indigo-500', tiktok: 'bg-teal-500', blog: 'bg-orange-500',
}

function StatCard({ icon: Icon, label, value, sub, accent = 'text-violet-400' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        <Icon size={16} className={accent} />
      </div>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function Analytics() {
  const { isAdmin } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scope, setScope] = useState('me')

  useEffect(() => {
    setLoading(true)
    getAnalytics(scope === 'org' ? 'all' : undefined)
      .then((res) => setData(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [scope])

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>
  if (!data) return null

  const { summary, totals, byPlatform, modelUsage, bestModelByPlatform, timeline } = data
  const maxTimeline = Math.max(1, ...timeline.map((t) => t.count))
  const maxImpr = Math.max(1, ...Object.values(byPlatform).map((p) => p.impressions))
  const modelEntries = Object.entries(modelUsage).sort((a, b) => b[1] - a[1])
  const maxModel = Math.max(1, ...modelEntries.map(([, v]) => v))

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex items-center gap-2">
          {['me', 'org'].map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                ${scope === s ? 'bg-violet-500/15 border-violet-500/40 text-violet-300' : 'bg-slate-800/40 border-slate-700/60 text-slate-400'}`}
            >
              {s === 'me' ? 'My activity' : 'Whole team'}
            </button>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Sparkles} label="Generated" value={summary.generated} sub="AI posts created" />
        <StatCard icon={GitMerge} label="Hybrid Fusion" value={`${summary.hybridShare}%`} sub={`${summary.hybridCount} fused generations`} accent="text-fuchsia-400" />
        <StatCard icon={Eye} label="Impressions" value={totals.impressions.toLocaleString()} sub={`${summary.published} posts published`} accent="text-sky-400" />
        <StatCard icon={TrendingUp} label="Engagement" value={`${summary.engagementRate}%`} sub={`${(totals.likes + totals.comments + totals.shares).toLocaleString()} interactions`} accent="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation timeline */}
        <div className="card p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-violet-400" /> Generations (14 days)</h3>
          <div className="flex items-end gap-1 h-32">
            {timeline.map((t) => (
              <div key={t.date} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-violet-500/70 rounded-t hover:bg-violet-400 transition-colors"
                  style={{ height: `${(t.count / maxTimeline) * 100}%`, minHeight: t.count ? '4px' : '0' }}
                  title={`${t.date}: ${t.count}`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">Last 14 days</p>
        </div>

        {/* AI model usage — the moat */}
        <div className="card p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4"><Sparkles size={16} className="text-fuchsia-400" /> AI Model Usage</h3>
          {modelEntries.length === 0 ? (
            <p className="text-slate-500 text-sm">No data yet — generate some content.</p>
          ) : (
            <div className="space-y-3">
              {modelEntries.map(([model, count]) => (
                <div key={model}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{model}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxModel) * 100}%` }} className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Impressions by platform */}
        <div className="card p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4"><Eye size={16} className="text-sky-400" /> Reach by Platform</h3>
          <div className="space-y-3">
            {Object.entries(byPlatform).filter(([, v]) => v.generated || v.published).map(([platform, v]) => (
              <div key={platform}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 capitalize">{platform}</span>
                  <span className="text-slate-500">{v.impressions.toLocaleString()} impressions</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(v.impressions / maxImpr) * 100}%` }} className={`h-full ${PLATFORM_COLORS[platform] || 'bg-slate-500'}`} />
                </div>
              </div>
            ))}
            {Object.values(byPlatform).every((v) => !v.generated && !v.published) && (
              <p className="text-slate-500 text-sm">No activity yet.</p>
            )}
          </div>
        </div>

        {/* Best model per platform */}
        <div className="card p-5">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4"><Trophy size={16} className="text-amber-400" /> Best Model per Platform</h3>
          {bestModelByPlatform.length === 0 ? (
            <p className="text-slate-500 text-sm">Publish posts to see which model performs best where.</p>
          ) : (
            <div className="space-y-2">
              {bestModelByPlatform.map(({ platform, best }) => (
                <div key={platform} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <span className="text-sm text-slate-300 capitalize">{platform}</span>
                  <div className="text-right">
                    <p className="text-sm text-white">{best.model}</p>
                    <p className="text-xs text-green-400">{best.rate}% engagement · {best.posts} post{best.posts !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
