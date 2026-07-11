import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'How it works', href: '/#how' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#features' },
      { label: 'Blog', href: '/#how' },
      { label: 'Careers', href: '/#pricing' },
      { label: 'Contact', href: '/#faq' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Start free', to: '/login' },
    ],
  },
]

/** Shared marketing footer (light theme) used on the landing and login pages. */
export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-300/70 bg-[#cfd8da]/70 backdrop-blur-sm safe-bottom">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo size={34} />
            <p className="text-slate-600 text-sm mt-4 leading-relaxed">
              The AI content studio that picks — and fuses — the best AI model for every post.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-slate-900 text-sm font-semibold mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to} className="text-slate-600 text-sm hover:text-green-700 transition-colors">
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} className="text-slate-600 text-sm hover:text-green-700 transition-colors">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-300/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} VibePost. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm">One account. Every platform. Zero chaos.</p>
        </div>
      </div>
    </footer>
  )
}
