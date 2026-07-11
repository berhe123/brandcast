import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Facebook, Instagram, Twitter, Linkedin, Sparkles, BookOpen } from 'lucide-react'
import { TikTokIcon } from './PlatformIcons'
import { socialHandle as handleFromName } from '../lib/format'

// The brand's link for this platform (falls back to its website).
const urlFor = (platform, brand) => brand?.[platform] || brand?.website || ''

function LogoLink({ url, title, className, style, children }) {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" title={title} className={className} style={style}>
        {children}
      </a>
    )
  }
  return <div className={className} style={style}>{children}</div>
}

function NameLink({ url, className, children }) {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={`${className} hover:underline inline-flex items-center gap-1`}>
        {children}
      </a>
    )
  }
  return <span className={className}>{children}</span>
}

function SkeletonLines() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="shimmer h-3.5 rounded w-full bg-slate-200/80" />
      <div className="shimmer h-3.5 rounded w-5/6 bg-slate-200/80" />
      <div className="shimmer h-3.5 rounded w-4/6 bg-slate-200/80" />
      <div className="shimmer h-3.5 rounded w-3/4 mt-4 bg-slate-200/80" />
    </div>
  )
}

function PreviewShell({ borderColor, children }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      style={borderColor ? { borderColor } : undefined}
    >
      {children}
    </div>
  )
}

function ContentBody({ loading, content, platform, className = 'text-sm' }) {
  if (loading) return <SkeletonLines />
  if (content) {
    return (
      <AnimatePresence>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-slate-800 whitespace-pre-wrap leading-relaxed ${className}`}
        >
          {content}
        </motion.p>
      </AnimatePresence>
    )
  }
  return <EmptyState platform={platform} />
}

export default function ContentPreview({ platform, content, loading, brand }) {
  const name = brand?.name || 'Your Brand'
  const handle = handleFromName(name)
  const url = urlFor(platform, brand)
  const tagline = brand?.description || 'Sponsored'

  if (platform === 'facebook') {
    return (
      <PreviewShell borderColor="rgba(24, 119, 242, 0.35)">
        <div className="p-4 flex items-center gap-3 border-b border-slate-300/60">
          <LogoLink url={url} title={`Open ${name} on Facebook`} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#1877F2' }}>
            <Facebook size={18} className="text-white" />
          </LogoLink>
          <div className="flex-1">
            <NameLink url={url} className="text-slate-900 font-semibold text-sm">{name}</NameLink>
            <p className="text-slate-500 text-xs">Just now · 🌐</p>
          </div>
          <div className="text-slate-400 hover:text-slate-600 cursor-pointer">···</div>
        </div>
        <div className="px-4 py-4">
          <ContentBody loading={loading} content={content} platform="Facebook" />
        </div>
      </PreviewShell>
    )
  }

  if (platform === 'instagram') {
    return (
      <PreviewShell borderColor="rgba(221, 42, 123, 0.35)">
        <div className="p-3.5 flex items-center gap-3 border-b border-slate-300/60">
          <LogoLink url={url} title={`Open ${name} on Instagram`} className="w-9 h-9 rounded-full p-0.5" style={{ background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)' }}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <Instagram size={14} className="text-pink-600" />
            </div>
          </LogoLink>
          <div className="flex-1">
            <NameLink url={url} className="text-slate-900 font-semibold text-sm">{handle.replace('@', '')}</NameLink>
            <p className="text-slate-500 text-xs">{name}</p>
          </div>
          <button type="button" className="text-green-700 font-semibold text-xs px-3 py-1 rounded-md bg-green-500/10 border border-green-500/30">Follow</button>
        </div>
        <div className="px-3.5 py-4">
          {loading ? (
            <SkeletonLines />
          ) : content ? (
            <AnimatePresence>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                <span className="font-semibold text-slate-900">{handle.replace('@', '')} </span>{content}
              </motion.p>
            </AnimatePresence>
          ) : (
            <EmptyState platform="Instagram" />
          )}
        </div>
      </PreviewShell>
    )
  }

  if (platform === 'twitter') {
    return (
      <PreviewShell borderColor="rgba(29, 161, 242, 0.35)">
        <div className="p-4 flex gap-3">
          <LogoLink url={url} title={`Open ${name} on X`} className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: '#1DA1F2' }}>
            <Twitter size={16} className="text-white" />
          </LogoLink>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <NameLink url={url} className="text-slate-900 font-bold text-sm">{name}</NameLink>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-600 fill-current"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.27-3.9-.81-.67-1.31-1.91-2.19-3.34-2.19s-2.67.89-3.33 2.19c-1.4-.46-2.91-.19-3.92.81-1 1.01-1.26 2.52-.8 3.91C1.88 9.33 1 10.57 1 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.8 3.91 1.01 1 2.52 1.26 3.91.81C8.58 21.11 9.82 22 11.25 22s2.67-.89 3.33-2.19c1.4.45 2.91.19 3.92-.81 1-1.01 1.26-2.52.8-3.91C21.37 14.67 22.25 13.43 22.25 12z"/></svg>
              <span className="text-slate-500 text-sm">{handle} · now</span>
            </div>
            <ContentBody loading={loading} content={content} platform="Twitter / X" />
          </div>
        </div>
      </PreviewShell>
    )
  }

  if (platform === 'linkedin') {
    return (
      <PreviewShell borderColor="rgba(10, 102, 194, 0.35)">
        <div className="p-4 flex items-start gap-3 border-b border-slate-300/60">
          <LogoLink url={url} title={`Open ${name} on LinkedIn`} className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#0A66C2' }}>
            <Linkedin size={20} className="text-white" />
          </LogoLink>
          <div className="flex-1">
            <NameLink url={url} className="text-slate-900 font-bold text-sm">{name}</NameLink>
            <p className="text-slate-600 text-xs">{tagline}</p>
            <p className="text-slate-500 text-xs">Just now · 🌐</p>
          </div>
          <button type="button" className="text-indigo-700 font-semibold text-xs px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10">+ Follow</button>
        </div>
        <div className="px-4 py-4">
          <ContentBody loading={loading} content={content} platform="LinkedIn" />
        </div>
      </PreviewShell>
    )
  }

  if (platform === 'tiktok') {
    return (
      <PreviewShell borderColor="rgba(20, 184, 166, 0.35)">
        <div className="p-4 flex items-center gap-3 border-b border-slate-300/60">
          <LogoLink url={url} title={`Open ${name} on TikTok`} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #69C9D0, #EE1D52)' }}>
            <TikTokIcon size={16} className="text-white" />
          </LogoLink>
          <div className="flex-1">
            <NameLink url={url} className="text-slate-900 font-bold text-sm">{handle}</NameLink>
            <p className="text-slate-500 text-xs">{name}</p>
          </div>
          <button type="button" className="text-teal-700 font-semibold text-xs px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10">+ Follow</button>
        </div>
        <div className="px-4 py-4">
          <ContentBody loading={loading} content={content} platform="TikTok" />
        </div>
      </PreviewShell>
    )
  }

  if (platform === 'blog') {
    return (
      <PreviewShell borderColor="rgba(249, 115, 22, 0.35)">
        <div className="p-4 flex items-center gap-3 border-b border-slate-300/60">
          <LogoLink url={url} title={`Open ${name}'s blog`} className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-500/15">
            <BookOpen size={18} className="text-orange-600" />
          </LogoLink>
          <div className="flex-1">
            <NameLink url={url} className="text-slate-900 font-bold text-sm">{name} Blog</NameLink>
            <p className="text-slate-500 text-xs">Article · {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
          </div>
        </div>
        <div className="px-4 py-4">
          {loading ? (
            <SkeletonLines />
          ) : content ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto"
              >
                {content}
              </motion.div>
            </AnimatePresence>
          ) : (
            <EmptyState platform="Blog" />
          )}
        </div>
      </PreviewShell>
    )
  }

  return null
}

function EmptyState({ platform }) {
  return (
    <div className="py-8 text-center">
      <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3">
        <Sparkles size={18} className="text-green-600" />
      </div>
      <p className="text-slate-700 text-sm font-medium">Your {platform} post will appear here</p>
      <p className="text-slate-500 text-xs mt-1">Fill in the form and click Generate</p>
    </div>
  )
}
