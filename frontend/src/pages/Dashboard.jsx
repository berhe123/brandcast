import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Wand2, Zap, Facebook, Instagram, Twitter, Linkedin, ExternalLink,
  ArrowRight, Copy, CheckCircle
} from 'lucide-react'
import { TikTokIcon } from '../components/PlatformIcons'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const platformIcons = {
  facebook: { Icon: Facebook, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  instagram: { Icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  twitter: { Icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  linkedin: { Icon: Linkedin, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  tiktok: { Icon: TikTokIcon, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { stats, history } = useApp()
  const [copied, setCopied] = useState(null)

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const quickActions = [
    { label: 'Facebook Post', platform: 'facebook', icon: Facebook, color: 'from-blue-600 to-blue-700' },
    { label: 'Instagram Post', platform: 'instagram', icon: Instagram, color: 'from-pink-600 to-purple-700' },
    { label: 'Twitter Post', platform: 'twitter', icon: Twitter, color: 'from-sky-500 to-sky-700' },
    { label: 'LinkedIn Post', platform: 'linkedin', icon: Linkedin, color: 'from-indigo-600 to-indigo-800' },
    { label: 'TikTok Post', platform: 'tiktok', icon: TikTokIcon, color: 'from-teal-500 to-cyan-700' },
  ]

  return (
    <div className="space-y-8 page-enter">
      {/* Welcome Hero */}
      <motion.div
        {...fadeInUp}
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.2)'
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-400 to-cyan-400" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-violet-400 text-sm font-semibold tracking-wide uppercase mb-2">Welcome to</p>
            <h2 className="text-3xl font-black text-white mb-1">
              mySWOOOP <span className="gradient-text">AI Studio</span>
            </h2>
            <p className="text-slate-400 max-w-md">
              Create engaging social media content for Facebook, Instagram, Twitter, LinkedIn & TikTok in seconds — powered by AI.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/generate')}
            className="btn-primary px-8 py-4 text-base hidden md:flex"
          >
            <Wand2 size={20} />
            Start Generating
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Generated', value: stats.totalGenerated, icon: Zap, color: 'text-violet-400', glow: 'shadow-violet-500/10' },
          { label: 'Facebook', value: stats.byPlatform.facebook || 0, icon: Facebook, color: 'text-blue-400', glow: 'shadow-blue-500/10' },
          { label: 'Instagram', value: stats.byPlatform.instagram || 0, icon: Instagram, color: 'text-pink-400', glow: 'shadow-pink-500/10' },
          { label: 'Twitter / X', value: stats.byPlatform.twitter || 0, icon: Twitter, color: 'text-sky-400', glow: 'shadow-sky-500/10' },
          { label: 'LinkedIn', value: stats.byPlatform.linkedin || 0, icon: Linkedin, color: 'text-indigo-400', glow: 'shadow-indigo-500/10' },
          { label: 'TikTok', value: stats.byPlatform.tiktok || 0, icon: TikTokIcon, color: 'text-teal-400', glow: 'shadow-teal-500/10' },
        ].map(({ label, value, icon: Icon, color, glow }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`card p-5 shadow-lg ${glow}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-500 text-sm font-medium">{label}</p>
              <Icon size={18} className={color} />
            </div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h3 className="section-title mb-4">Quick Generate</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {quickActions.map(({ label, platform, icon: Icon, color }) => (
            <motion.button
              key={platform}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/generate?platform=${platform}`)}
              className={`card-hover p-4 text-left bg-gradient-to-br ${color} bg-opacity-10 flex items-center gap-3`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{label}</p>
                <p className="text-white/60 text-xs">Generate →</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* mySWOOOP Social Profiles */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <h3 className="section-title mb-4">mySWOOOP Social Profiles</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Facebook', icon: Facebook, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', url: 'https://de-de.facebook.com/myswooop/' },
            { label: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', url: 'https://www.instagram.com/myswooop/' },
            { label: 'Twitter / X', icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', url: 'https://twitter.com/myswooop' },
            { label: 'LinkedIn', icon: Linkedin, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', url: 'https://www.linkedin.com/company/myswooop' },
            { label: 'TikTok', icon: TikTokIcon, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', url: 'https://www.tiktok.com/@myswooop' },
          ].map(({ label, icon: Icon, color, bg, border, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`card p-3.5 flex items-center gap-3 ${bg} ${border} hover:border-opacity-50 transition-all duration-200 hover:-translate-y-0.5 group`}
            >
              <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${color}`}>{label}</p>
                <p className="text-slate-500 text-xs truncate">@myswooop</p>
              </div>
              <ExternalLink size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>
      </motion.div>

      {/* Recent Generations */}
      <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Generations</h3>
            {history.length > 0 && (
              <button onClick={() => navigate('/history')} className="text-violet-400 text-sm hover:text-violet-300 transition-colors">
                View all →
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <Wand2 size={24} className="text-violet-400" />
              </div>
              <p className="text-slate-400 mb-4">No content generated yet</p>
              <button onClick={() => navigate('/generate')} className="btn-primary py-2 px-5 text-sm mx-auto">
                Generate Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 3).map((item) => {
                const cfg = platformIcons[item.platform] || platformIcons.facebook
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card p-4 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg ${cfg.bg} ${cfg.border} border flex items-center justify-center`}>
                          <cfg.Icon size={14} className={cfg.color} />
                        </div>
                        <span className="text-xs text-slate-500">{item.platform}</span>
                        <span className="text-slate-700">·</span>
                        <span className="text-xs text-slate-600">{new Date(item.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <button
                        onClick={() => copyText(item.content, item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-800 rounded-lg"
                      >
                        {copied === item.id
                          ? <CheckCircle size={14} className="text-green-400" />
                          : <Copy size={14} className="text-slate-400" />
                        }
                      </button>
                    </div>
                    <p className="text-slate-300 text-sm line-clamp-2">{item.content}</p>
                  </motion.div>
                )
              })}
            </div>
          )}
      </div>
    </div>
  )
}
