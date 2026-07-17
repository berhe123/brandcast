import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Sparkles, GitMerge, Cpu, CalendarClock, BarChart3, Globe,
  Check, Facebook, Instagram, Twitter, Linkedin, BookOpen, Wand2, Layers,
  ShieldCheck, Rocket, Star, Zap, PenLine, Send, Quote, ChevronRight,
} from 'lucide-react'
import { TikTokIcon } from '../components/PlatformIcons'
import { LogoMark } from '../components/Logo'
import MarketingHeader from '../components/MarketingHeader'
import MarketingFooter from '../components/MarketingFooter'

// Small in-view reveal wrapper for tasteful section entrances.
function Reveal({ children, delay = 0, y = 24, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const PLATFORMS = [
  { Icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
  { Icon: Instagram, label: 'Instagram', color: 'text-pink-600' },
  { Icon: Twitter, label: 'X / Twitter', color: 'text-sky-600' },
  { Icon: Linkedin, label: 'LinkedIn', color: 'text-indigo-600' },
  { Icon: TikTokIcon, label: 'TikTok', color: 'text-teal-600' },
  { Icon: BookOpen, label: 'Blog', color: 'text-orange-600' },
]

const FEATURES = [
  {
    icon: GitMerge,
    title: 'Multi-model AI Router',
    body: 'Every brief is scored against each model\'s real strengths, then routed to the best one — or the best pair, fused into one superior post. No other tool does this.',
    accent: 'from-green-500/20 to-emerald-500/10 text-green-700',
    badge: 'The Brandcast edge',
  },
  {
    icon: Globe,
    title: 'Every platform, one voice',
    body: 'Facebook, Instagram, X, LinkedIn, TikTok and your blog — each post is shaped to the platform while staying perfectly on-brand.',
    accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-700',
  },
  {
    icon: Layers,
    title: 'Unlimited brands',
    body: 'Run every client or product line from a single workspace, each with its own voice, channels and history.',
    accent: 'from-teal-500/20 to-green-500/10 text-teal-700',
  },
  {
    icon: CalendarClock,
    title: 'Plan & schedule',
    body: 'Queue posts to publish automatically, see your whole week at a glance, and never stare at a blank calendar again.',
    accent: 'from-lime-500/20 to-green-500/10 text-lime-700',
  },
  {
    icon: BarChart3,
    title: 'Analytics that explain',
    body: 'Track engagement and see exactly which models the router chose and why — quality you can measure, not guess.',
    accent: 'from-green-600/20 to-emerald-600/10 text-green-800',
  },
  {
    icon: ShieldCheck,
    title: 'Works on day one',
    body: 'A realistic offline demo engine means Brandcast runs fully without any API keys. Add provider keys to go live in seconds.',
    accent: 'from-emerald-500/20 to-green-500/10 text-emerald-700',
  },
]

const STEPS = [
  { icon: Globe, title: 'Add your brand', body: 'Drop in your name, a one-line voice and your channels. Takes under a minute.' },
  { icon: PenLine, title: 'Describe the post', body: 'Pick a platform and tone, type a topic — or start from a proven template.' },
  { icon: Cpu, title: 'AI routes & writes', body: 'The router selects the best model (or fuses two) and drafts platform-perfect copy.' },
  { icon: Send, title: 'Schedule & publish', body: 'Refine, queue it to your calendar, and let Brandcast ship it automatically.' },
]

const STATS = [
  { value: '7', label: 'AI models, 4 providers' },
  { value: '6', label: 'Channels covered' },
  { value: '10×', label: 'Faster than writing solo' },
  { value: '0', label: 'API keys required to start' },
]

const TESTIMONIALS = [
  { quote: 'The fusion mode genuinely writes better captions than I do — and I do this for a living.', name: 'Maya R.', role: 'Social Lead, DTC brand' },
  { quote: 'We run nine client brands from one place now. Brandcast paid for itself in the first week.', name: 'Daniel K.', role: 'Founder, content agency' },
  { quote: 'It feels like having a senior copywriter and a media planner on the team, on call 24/7.', name: 'Priya S.', role: 'Marketing Manager' },
]

const PLANS = [
  {
    name: 'Starter', price: 'Free', tagline: 'Everything to launch your first brand.',
    features: ['1 brand workspace', 'All 6 channels', 'Smart single-model routing', 'Offline demo AI engine', 'Schedule up to 10 posts'],
    cta: 'Start free', highlight: false,
  },
  {
    name: 'Studio', price: '$29', suffix: '/mo', tagline: 'For creators and growing brands.',
    features: ['Unlimited brands', 'Hybrid AI fusion mode', 'Bring your own API keys', 'Unlimited scheduling', 'Analytics & model insights', 'Priority generation'],
    cta: 'Start free trial', highlight: true,
  },
  {
    name: 'Agency', price: 'Custom', tagline: 'For teams managing many clients.',
    features: ['Everything in Studio', 'Team roles & permissions', 'Client workspaces', 'Shared template library', 'Dedicated support'],
    cta: 'Talk to us', highlight: false,
  },
]

const FAQS = [
  { q: 'Do I need an OpenAI or Anthropic key to use Brandcast?', a: 'No. Brandcast ships with a realistic offline engine so everything works out of the box. Add any provider key (Anthropic, OpenAI, Gemini, DeepSeek) and the matching models instantly switch to live generation.' },
  { q: 'What makes the AI Router different from other tools?', a: 'Most tools pipe every request to one model. Brandcast scores each model on the skills your specific task needs — hooks, brand voice, long-form, multilingual — then routes to the best one, or fuses two complementary models into a single best-of-both post.' },
  { q: 'Can I manage more than one brand?', a: 'Yes. Create as many brands as you like, each with its own voice, connected channels and content history. Switch between them instantly from the sidebar.' },
  { q: 'Which platforms are supported?', a: 'Facebook, Instagram, X (Twitter), LinkedIn, TikTok and long-form blog content — each with platform-aware length limits and tone.' },
  { q: 'Is my content saved?', a: 'Your generated posts and schedule live in your workspace so you can revisit, reuse and plan ahead.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const go = () => navigate('/login')

  return (
    <div
      className="min-h-screen text-slate-900 overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, #e6ebec 0%, #dae1e3 45%, #cfd8da 100%)' }}
    >
      <MarketingHeader />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative">
        {/* Ambient background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-grid" />
          <div className="aurora-blob" style={{ width: 520, height: 520, top: -120, left: '8%', background: 'radial-gradient(circle, rgba(34,197,94,0.30), transparent 70%)' }} />
          <div className="aurora-blob" style={{ width: 480, height: 480, top: -60, right: '6%', background: 'radial-gradient(circle, rgba(13,148,136,0.22), transparent 70%)' }} />
          <div className="aurora-blob" style={{ width: 420, height: 420, top: 220, left: '38%', background: 'radial-gradient(circle, rgba(22,163,74,0.18), transparent 70%)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-slate-900">
                The content studio that picks{' '}
                <span className="shine-green">the best AI</span>{' '}
                for every post.
              </h1>
              <p className="mt-6 text-lg text-slate-700 leading-relaxed max-w-xl">
                Brandcast routes each marketing task to the model that does it best — and fuses two when
                two are better than one. Then it helps you create, schedule and publish on-brand across
                every channel, all from one calm dashboard.
              </p>
              <p className="mt-3 text-sm font-semibold tracking-wide text-green-700">
                One account. Every platform. Zero chaos.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={go} className="btn-green px-7 py-3.5 text-base"
                >
                  Start creating free <ArrowRight size={18} />
                </motion.button>
                <a href="#how" className="btn-light px-6 py-3.5 text-base">
                  See how it works
                </a>
              </div>

              <div className="mt-7 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                </div>
                <span>No credit card · works without API keys</span>
              </div>
            </motion.div>

            {/* Visual: live "routing decision" mock */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative"
            >
              <div className="animate-float">
                <HeroRouterCard />
              </div>
              {/* floating mini stat */}
              <div className="absolute -bottom-5 -left-3 sm:-left-6 card-light rounded-2xl px-4 py-3 shadow-lg hidden sm:flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Zap size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-sm font-bold leading-none">Best-of-both</p>
                  <p className="text-slate-500 text-xs mt-1">fused in ~2s</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Platform marquee */}
        <div className="border-y border-slate-300/70 bg-white/40">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-5 overflow-hidden">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-slate-500 mb-4">Publishes everywhere you do</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {PLATFORMS.map(({ Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 text-slate-700">
                  <Icon size={18} className={color} />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Example goals (display only) ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-24">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <span className="pill-green mb-4"><Quote size={13} /> Just say it like this</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            A single sentence. A full month of content.
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            Brandcast turns plain business wishes into a ready content calendar.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5">
          <Reveal delay={0.05}>
            <div className="card-light p-7 md:p-8 h-full relative overflow-hidden">
              <Quote size={36} className="absolute top-5 right-5 text-green-500/15" />
              <p className="font-display text-xl md:text-2xl font-semibold leading-snug tracking-tight text-slate-900">
                I own a local{' '}
                <span className="shine-green">café</span>
                {' '}and want{' '}
                <span className="text-green-700">more customers</span>
                {' '}— then create{' '}
                <span className="shine-green">a month&apos;s content</span>.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="card-light p-7 md:p-8 h-full relative overflow-hidden ring-1 ring-green-500/30">
              <Quote size={36} className="absolute top-5 right-5 text-green-500/15" />
              <p className="font-display text-xl md:text-2xl font-semibold leading-snug tracking-tight text-slate-900">
                I own a{' '}
                <span className="shine-green">small business</span>
                {' '}and want to grow my customer base{' '}
                <span className="text-green-700">within my city</span>.
                {' '}Create a{' '}
                <span className="shine-green">month-long content strategy</span>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Problem / promise ───────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-24">
        <Reveal className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Great marketing shouldn't mean ten tabs and a blank page.
          </h2>
          <p className="mt-5 text-lg text-slate-700 leading-relaxed">
            Switching between AI chatbots, schedulers, and a notes app is exhausting — and you still
            second-guess which model wrote it better. Brandcast collapses the whole workflow into one
            place, and makes the model choice for you, every single time.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-5 mt-14">
          {[
            { icon: Cpu, title: 'Stop guessing models', body: 'The router benchmarks every model on your task and picks the winner — automatically.' },
            { icon: GitMerge, title: 'Fuse for higher quality', body: 'Two complementary models, merged into one best-of-both draft you can actually ship.' },
            { icon: Rocket, title: 'Go from idea to posted', body: 'Write, refine, schedule and publish without ever leaving the dashboard.' },
          ].map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="card-light p-6 h-full">
                <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-green-700" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-5 sm:px-6 py-12 md:py-16 scroll-mt-20">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <span className="pill-green mb-4"><Layers size={13} /> Everything in one studio</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Built to make you look brilliant
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            A complete content engine — not a chat box. Here's what's under the hood.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, body, accent, badge }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08}>
              <div className={`card-light p-6 h-full ${badge ? 'ring-1 ring-green-500/40' : ''}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-4`}>
                  <Icon size={22} />
                </div>
                {badge && <span className="pill-green mb-3 !text-[11px]">{badge}</span>}
                <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────────── */}
      <section id="how" className="relative py-20 md:py-24 scroll-mt-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-green-500/[0.06] via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="pill-green mb-4"><Wand2 size={13} /> From idea to posted in minutes</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900">How Brandcast works</h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="card-light p-6 h-full relative">
                  <span className="absolute top-5 right-5 font-display text-3xl font-bold text-slate-200">0{i + 1}</span>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-green-600/25">
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats band ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-10">
        <div className="card-light ring-1 ring-green-500/30 p-8 md:p-10 bg-gradient-to-br from-green-500/[0.08] to-white/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }, i) => (
              <Reveal key={label} delay={i * 0.06}>
                <p className="font-display text-4xl md:text-5xl font-bold gradient-text-green">{value}</p>
                <p className="text-slate-600 text-sm mt-2">{label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-24">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <span className="pill-green mb-4"><Star size={13} /> Loved by busy marketers</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Teams ship more, stress less
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, name, role }, i) => (
            <Reveal key={name} delay={i * 0.08}>
              <div className="card-light p-6 h-full flex flex-col">
                <Quote size={22} className="text-green-600/70 mb-3" />
                <p className="text-slate-800 leading-relaxed flex-1">"{quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                    {name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-semibold">{name}</p>
                    <p className="text-slate-500 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="max-w-6xl mx-auto px-5 sm:px-6 py-12 md:py-16 scroll-mt-20">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <span className="pill-green mb-4"><ShieldCheck size={13} /> Start free, upgrade when ready</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Simple, honest pricing</h2>
          <p className="mt-4 text-slate-600 text-lg">Begin on the free plan — no card, no keys, no catch.</p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08} className="h-full">
              <div className={`relative h-full rounded-2xl p-7 flex flex-col ${
                plan.highlight
                  ? 'ring-2 ring-green-500/50 bg-gradient-to-b from-green-500/[0.12] to-white/60 border border-green-500/30'
                  : 'card-light'
              }`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 pill-green !bg-green-600 !text-white !border-green-500">
                    Most popular
                  </span>
                )}
                <h3 className="font-semibold text-slate-900 text-lg">{plan.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-4xl font-bold text-slate-900">{plan.price}</span>
                  {plan.suffix && <span className="text-slate-500 mb-1.5 text-sm">{plan.suffix}</span>}
                </div>
                <p className="text-slate-600 text-sm mt-2">{plan.tagline}</p>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={go}
                  className={`mt-6 ${plan.highlight ? 'btn-green' : 'btn-light'} w-full py-3`}
                >
                  {plan.cta}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="max-w-3xl mx-auto px-5 sm:px-6 py-20 md:py-24 scroll-mt-20">
        <Reveal className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Questions, answered</h2>
        </Reveal>
        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <Reveal key={q} delay={i * 0.04}>
              <details className="group card-light p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium text-slate-900 pr-4">{q}</span>
                  <ChevronRight size={18} className="text-slate-500 transition-transform group-open:rotate-90 flex-shrink-0" />
                </summary>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-green-500/40 p-10 md:p-16 text-center">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-500/20 via-emerald-400/10 to-teal-500/15" />
            <div className="aurora-blob" style={{ width: 380, height: 380, top: -120, left: '30%', background: 'radial-gradient(circle, rgba(34,197,94,0.35), transparent 70%)' }} />
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight max-w-2xl mx-auto leading-tight text-slate-900">
              Your next great post is one click away.
            </h2>
            <p className="mt-5 text-slate-700 text-lg max-w-xl mx-auto">
              Join the marketers letting the best AI — not the loudest one — write their content.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={go} className="btn-green mx-auto mt-8 px-8 py-4 text-base"
            >
              Start creating free <ArrowRight size={18} />
            </motion.button>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <MarketingFooter />
    </div>
  )
}

// ─── Hero visual: a stylised AI routing decision ──────────────────────────────
function HeroRouterCard() {
  return (
    <div className="card-light ring-1 ring-green-500/30 p-5 sm:p-6 max-w-md mx-auto lg:mx-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LogoMark size={28} />
          <span className="text-sm font-semibold text-slate-900">Brandcast Studio</span>
        </div>
        <span className="badge bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
          <GitMerge size={10} /> Hybrid Fusion
        </span>
      </div>

      {/* Brief */}
      <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 mb-4">
        <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Your goal</p>
        <p className="text-sm text-slate-800">Reveal our newest solution with a powerful story that highlights innovation, value, and transformation—capturing attention and driving meaningful engagement from the first day.</p>
      </div>

      {/* Routing chips */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Claude · lead
        </span>
        <Sparkles size={12} className="text-slate-400" />
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> GPT-4o · boost
        </span>
        <GitMerge size={12} className="text-green-600" />
        <span className="text-[11px] text-slate-500 font-mono ml-auto">fit 9.4/10</span>
      </div>

      {/* Result */}
      <div className="rounded-xl bg-white border border-green-500/20 p-4">
        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
          Some things are worth the wait. ✨{'\n\n'}Months of obsessing over every detail — finally ready
          for you. Be one of the first to experience it. 💫
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Check size={13} className="text-green-600" /> On-brand voice · publish-ready · tuned for every channel
        </div>
      </div>
    </div>
  )
}
