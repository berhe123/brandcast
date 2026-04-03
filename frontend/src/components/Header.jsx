import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Wand2, ExternalLink } from 'lucide-react'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your AI marketing activity' },
  '/generate': { title: 'Generate Content', subtitle: 'Create AI-powered social media posts' },
  '/history': { title: 'Content History', subtitle: 'All your previously generated content' },
  '/templates': { title: 'Templates', subtitle: 'Ready-made content templates for mySWOOOP' },
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const page = pageTitles[location.pathname] || { title: 'mySWOOOP', subtitle: 'AI Marketing Studio' }

  return (
    <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-white">{page.title}</h1>
        <p className="text-slate-500 text-sm">{page.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="https://www.myswooop.de"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-xs"
        >
          <ExternalLink size={14} />
          myswooop.de
        </a>
        <button
          onClick={() => navigate('/generate')}
          className="btn-primary py-2 px-4 text-sm"
        >
          <Wand2 size={15} />
          New Post
        </button>
      </div>
    </header>
  )
}
