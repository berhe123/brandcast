import React from 'react'
import { Facebook, Instagram, Twitter, Linkedin, BookOpen, Globe } from 'lucide-react'
import { TikTokIcon } from './PlatformIcons'

// Per-channel icon + accent used wherever a brand's links are shown.
export const CHANNEL_META = {
  website: { label: 'Website', Icon: Globe, color: 'text-green-600', bg: 'bg-green-500/10' },
  facebook: { label: 'Facebook', Icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  instagram: { label: 'Instagram', Icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-500/10' },
  twitter: { label: 'Twitter / X', Icon: Twitter, color: 'text-sky-600', bg: 'bg-sky-500/10' },
  linkedin: { label: 'LinkedIn', Icon: Linkedin, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
  tiktok: { label: 'TikTok', Icon: TikTokIcon, color: 'text-teal-600', bg: 'bg-teal-500/10' },
  blog: { label: 'Blog', Icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-500/10' },
}

const ORDER = ['website', 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'blog']

/**
 * Clickable logos for whichever channels a brand has linked. Each opens the
 * brand's real profile in a new tab. `stopPropagation` keeps clicks from
 * triggering a surrounding clickable card.
 */
export default function ChannelLinks({ brand, size = 15, emptyText = 'No channels linked yet' }) {
  const links = ORDER
    .filter((k) => brand?.[k])
    .map((k) => ({ k, url: brand[k], ...CHANNEL_META[k] }))

  if (!links.length) return <span className="text-xs text-slate-600">{emptyText}</span>

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {links.map(({ k, url, label, Icon, color, bg }) => (
        <a
          key={k}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title={`Open ${label}`}
          className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center hover:scale-110 transition-transform`}
        >
          <Icon size={size} className={color} />
        </a>
      ))}
    </div>
  )
}
