import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Globe, BarChart3, Sparkles } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Zap,
      title: 'One Account',
      description: 'Manage all your brands from a single account'
    },
    {
      icon: Globe,
      title: 'Every Platform',
      description: 'Facebook, Instagram, Twitter, LinkedIn, TikTok, and Blog'
    },
    {
      icon: BarChart3,
      title: 'Zero Chaos',
      description: 'Organize content, schedule posts, and track performance'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'A multi-model router fuses the best AIs for higher-quality content'
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Navigation */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow-purple">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base">AI Media Buncher</p>
              <p className="text-slate-500 text-xs">Content Creator Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn-ghost py-2 px-4 text-sm"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
              AI Media Buncher
            </h1>
            <p className="text-2xl md:text-3xl font-bold gradient-text">
              The platform that picks — and fuses — the best AI for every post.
            </p>
            <p className="text-base md:text-lg font-semibold text-slate-300 tracking-wide">
              One Account. Every Platform. Zero Chaos.
            </p>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            AI Media Buncher routes every marketing task to the best AI model — and blends two for
            higher-quality content — then helps you create, schedule, and publish on-brand posts
            across Facebook, Instagram, Twitter, LinkedIn, TikTok, and your blog, all from one dashboard.
          </p>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="btn-primary px-10 py-4 text-lg flex items-center gap-3 mx-auto"
          >
            Start Now
            <ArrowRight size={20} />
          </motion.button>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-12"
          >
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="card p-6 text-left hover:border-violet-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-sm">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2026 AI Media Buncher. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
