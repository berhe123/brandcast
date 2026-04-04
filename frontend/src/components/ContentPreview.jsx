import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Facebook, Instagram, Twitter, Linkedin, Sparkles } from 'lucide-react'
import { TikTokIcon } from './PlatformIcons'

const profileAvatar = {
  facebook: { name: 'mySWOOOP', handle: 'mySWOOOP', color: '#1877F2' },
  instagram: { name: 'myswooop', handle: '@myswooop', color: '#E1306C' },
  twitter: { name: 'mySWOOOP', handle: '@myswooop', color: '#1DA1F2' },
  linkedin: { name: 'mySWOOOP GmbH', handle: 'Refurbished Electronics · Germany', color: '#0A66C2' },
  tiktok: { name: 'mySWOOOP', handle: '@myswooop', color: '#010101' },
}

function SkeletonLines() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="shimmer h-3.5 rounded w-full" />
      <div className="shimmer h-3.5 rounded w-5/6" />
      <div className="shimmer h-3.5 rounded w-4/6" />
      <div className="shimmer h-3.5 rounded w-3/4 mt-4" />
    </div>
  )
}

export default function ContentPreview({ platform, content, loading }) {
  const profile = profileAvatar[platform] || profileAvatar.facebook

  if (platform === 'facebook') {
    return (
      <div className="platform-preview-fb overflow-hidden">
        {/* FB Header */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#1877F2' }}>
            <Facebook size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{profile.name}</p>
            <p className="text-gray-400 text-xs">Just now · 🌐</p>
          </div>
          <div className="text-gray-400 hover:text-gray-300 cursor-pointer">···</div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {loading ? (
            <SkeletonLines />
          ) : content ? (
            <AnimatePresence>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed"
              >
                {content}
              </motion.p>
            </AnimatePresence>
          ) : (
            <EmptyState platform="Facebook" />
          )}
        </div>


      </div>
    )
  }

  if (platform === 'instagram') {
    return (
      <div className="platform-preview-ig overflow-hidden">
        {/* IG Header */}
        <div className="p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full p-0.5" style={{ background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)' }}>
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <Instagram size={14} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{profile.handle}</p>
            <p className="text-gray-500 text-xs">mySWOOOP GmbH · Germany</p>
          </div>
          <button className="text-white font-semibold text-xs px-3 py-1 rounded-md bg-transparent border border-gray-600">Follow</button>
        </div>

        {/* Image placeholder */}
        <div className="w-full h-48 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' }}>
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles size={20} className="text-white/60" />
            </div>
            <p className="text-white/30 text-xs">Image will appear here</p>
          </div>
        </div>

        {/* IG Actions */}
        <div className="px-3.5 py-2 flex items-center gap-4">
          <span className="text-xl cursor-pointer hover:scale-110 transition-transform">❤️</span>
          <span className="text-xl cursor-pointer hover:scale-110 transition-transform">💬</span>
          <span className="text-xl cursor-pointer hover:scale-110 transition-transform">📤</span>
          <span className="ml-auto text-xl cursor-pointer hover:scale-110 transition-transform">🔖</span>
        </div>

        {/* Caption */}
        <div className="px-3.5 pb-4">
          <p className="text-gray-400 text-xs mb-1.5">2,481 likes</p>
          {loading ? (
            <SkeletonLines />
          ) : content ? (
            <AnimatePresence>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/90 text-xs whitespace-pre-wrap leading-relaxed"
              >
                <span className="font-semibold text-white">myswooop </span>
                {content}
              </motion.p>
            </AnimatePresence>
          ) : (
            <EmptyState platform="Instagram" />
          )}
        </div>
      </div>
    )
  }

  if (platform === 'twitter') {
    return (
      <div className="platform-preview-tw overflow-hidden">
        <div className="p-4 flex gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: '#1DA1F2' }}>
            <Twitter size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            {/* User info */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-white font-bold text-sm">{profile.name}</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-400 fill-current"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.27-3.9-.81-.67-1.31-1.91-2.19-3.34-2.19s-2.67.89-3.33 2.19c-1.4-.46-2.91-.19-3.92.81-1 1.01-1.26 2.52-.8 3.91C1.88 9.33 1 10.57 1 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.8 3.91 1.01 1 2.52 1.26 3.91.81C8.58 21.11 9.82 22 11.25 22s2.67-.89 3.33-2.19c1.4.45 2.91.19 3.92-.81 1-1.01 1.26-2.52.8-3.91C21.37 14.67 22.25 13.43 22.25 12z"/></svg>
              <span className="text-gray-500 text-sm">@myswooop · now</span>
            </div>
            {/* Tweet content */}
            {loading ? (
              <SkeletonLines />
            ) : content ? (
              <AnimatePresence>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white text-sm whitespace-pre-wrap leading-relaxed"
                >
                  {content}
                </motion.p>
              </AnimatePresence>
            ) : (
              <EmptyState platform="Twitter / X" />
            )}

          </div>
        </div>
      </div>
    )
  }

  if (platform === 'linkedin') {
    return (
      <div className="overflow-hidden rounded-2xl" style={{ background: '#1B1F23', border: '1px solid rgba(99,102,241,0.25)' }}>
        {/* LI Header */}
        <div className="p-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#0A66C2' }}>
            <Linkedin size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">{profile.name}</p>
            <p className="text-gray-400 text-xs">{profile.handle}</p>
            <p className="text-gray-500 text-xs">Just now · 🌐</p>
          </div>
          <button className="text-indigo-400 font-semibold text-xs px-3 py-1 rounded-full border border-indigo-500/40 hover:bg-indigo-500/10 transition-colors">+ Follow</button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {loading ? (
            <SkeletonLines />
          ) : content ? (
            <AnimatePresence>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed"
              >
                {content}
              </motion.p>
            </AnimatePresence>
          ) : (
            <EmptyState platform="LinkedIn" />
          )}
        </div>


      </div>
    )
  }

  if (platform === 'tiktok') {
    return (
      <div className="overflow-hidden rounded-2xl" style={{ background: '#010101', border: '1px solid rgba(20,184,166,0.25)' }}>
        {/* TT Header */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #69C9D0, #EE1D52)' }}>
            <TikTokIcon size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">{profile.handle}</p>
            <p className="text-gray-400 text-xs">mySWOOOP · Refurbished Tech</p>
          </div>
          <button className="text-teal-400 font-semibold text-xs px-3 py-1 rounded-full border border-teal-500/40 hover:bg-teal-500/10 transition-colors">+ Follow</button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {loading ? (
            <SkeletonLines />
          ) : content ? (
            <AnimatePresence>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed"
              >
                {content}
              </motion.p>
            </AnimatePresence>
          ) : (
            <EmptyState platform="TikTok" />
          )}
        </div>


      </div>
    )
  }

  return null
}

function EmptyState({ platform }) {
  return (
    <div className="py-8 text-center">
      <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
        <Sparkles size={18} className="text-slate-500" />
      </div>
      <p className="text-slate-500 text-sm">Your {platform} post will appear here</p>
      <p className="text-slate-600 text-xs mt-1">Fill in the form and click Generate</p>
    </div>
  )
}
