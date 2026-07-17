import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import Logo from './Logo'

const NAV = [
  { label: 'Features', href: '/#features' },
  { label: 'How it works', href: '/#how' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
]

/**
 * Shared marketing top-bar used on the landing page and the login page.
 * Light theme. Fully responsive: inline nav on desktop, slide-down sheet on mobile.
 */
export default function MarketingHeader() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const go = () => { setOpen(false); navigate('/login') }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-300/70 bg-[#dae1e3]/85 backdrop-blur-xl safe-top">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="shrink-0" aria-label="Brandcast home">
          <Logo size={34} subtitle={null} />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-700">
          {NAV.map((item) => (
            <a key={item.label} href={item.href} className="hover:text-green-700 transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={go} className="btn-ghost-light py-2 px-4 text-sm hidden sm:flex">Sign in</button>
          <button onClick={go} className="btn-green py-2 px-4 text-sm hidden xs:flex">
            Start free <ArrowRight size={15} />
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden tap-target inline-flex items-center justify-center rounded-xl border border-slate-300 text-slate-700 hover:bg-black/5 transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-t border-slate-300/70 bg-[#dae1e3]/95 backdrop-blur-xl"
          >
            <nav className="px-5 py-4 flex flex-col gap-1 safe-x">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-xl text-slate-700 hover:bg-black/5 transition-colors font-medium"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={go} className="btn-light py-3">Sign in</button>
                <button onClick={go} className="btn-green py-3">Start free</button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
