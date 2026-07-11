import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Loader2, Mail, ShieldCheck, X, Plus, MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { startEmailLogin, verifyEmailLogin, loginWithGoogle } from '../services/api'
import { LogoMark } from '../components/Logo'
import MarketingHeader from '../components/MarketingHeader'
import MarketingFooter from '../components/MarketingFooter'

// Inline Google "G" mark (lucide has no brand logo).
function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 36.4 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  )
}

const initialOf = (s) => (s || '?').trim().charAt(0).toUpperCase()

export default function Login() {
  const { user, authenticate } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/app/dashboard'

  const [step, setStep] = useState('email') // 'email' | 'code'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)        // true once a code request returns
  const [delivered, setDelivered] = useState(false) // true if a real email went out
  const [devCode, setDevCode] = useState('')     // demo-only fallback, hidden until revealed
  const [showDev, setShowDev] = useState(false)
  const [busy, setBusy] = useState(false)

  // Google account-chooser state (mirrors the real Google "Choose an account" UX).
  const [chooser, setChooser] = useState(false)
  const [newGoogle, setNewGoogle] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('')

  if (user) return <Navigate to={from} replace />

  // Only ever reaches the dashboard after a verified login — never on email entry alone.
  const finish = (data) => {
    authenticate(data)
    navigate(from, { replace: true })
  }

  // ── Google ────────────────────────────────────────────────────────────────
  const recentAccounts = email.trim() && /\S+@\S+\.\S+/.test(email.trim())
    ? [{ email: email.trim(), name: email.trim().split('@')[0] }]
    : []

  const chooseGoogle = async (profile) => {
    setChooser(false)
    setNewGoogle(false)
    setBusy(true)
    try {
      const res = await loginWithGoogle({ profile })
      finish(res.data)
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  const confirmNewGoogle = (e) => {
    e.preventDefault()
    const value = googleEmail.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return toast.error('Enter a valid Google email')
    chooseGoogle({ email: value, name: value.split('@')[0] })
  }

  // ── Email code ──────────────────────────────────────────────────────────────
  const handleEmailContinue = async (e) => {
    e?.preventDefault?.()
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return toast.error('Please enter a valid email address')
    setBusy(true)
    try {
      const res = await startEmailLogin(value)
      setDelivered(Boolean(res.data.delivered))
      setDevCode(res.data.devCode || '')
      setShowDev(false)
      setSent(true)
      setStep('code')
      toast.success(
        res.data.delivered
          ? `We emailed a 6-digit code to ${value}.`
          : `Code generated. Configure an email provider to receive it in your inbox.`
      )
    } catch (err) {
      toast.error(err.message || 'Could not send a code')
    } finally {
      setBusy(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (code.trim().length < 6) return toast.error('Enter the 6-digit code')
    setBusy(true)
    try {
      const res = await verifyEmailLogin(email.trim(), code.trim())
      finish(res.data)
    } catch (err) {
      toast.error(err.message || 'Invalid code')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col text-slate-900"
      style={{ background: 'linear-gradient(180deg, #e6ebec 0%, #dae1e3 45%, #cfd8da 100%)' }}
    >
      <MarketingHeader />

      <main className="relative flex-1 flex items-center justify-center px-4 py-12 sm:py-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[680px] bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-[420px]">
          <div className="flex flex-col items-center mb-7">
            <LogoMark size={52} className="mb-4" />
            <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Welcome to VibePost</h1>
            <p className="text-slate-600 text-sm mt-1 text-center">
              {step === 'email' ? 'Sign in to your content studio' : 'Check your email'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl p-6 sm:p-7 shadow-xl">
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                >
                  <button
                    onClick={() => setChooser(true)}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-slate-800 font-semibold text-sm border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-60"
                  >
                    <GoogleIcon /> Continue with Google
                  </button>

                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">OR</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <form onSubmit={handleEmailContinue} className="space-y-3">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="input-light pl-10 w-full"
                      />
                    </div>
                    <button type="submit" disabled={busy} className="btn-green w-full py-3">
                      {busy ? <Loader2 size={18} className="animate-spin" /> : <>Continue with email <ArrowRight size={16} /></>}
                    </button>
                  </form>

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck size={13} className="text-green-600" />
                    We email you a secure 6-digit code — no password needed.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                >
                  <button
                    onClick={() => { setStep('email'); setCode(''); setSent(false) }}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-4 transition-colors"
                  >
                    <ArrowLeft size={14} /> Use a different email
                  </button>

                  <div className="flex flex-col items-center text-center mb-5">
                    <span className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                      <MailCheck size={22} className="text-green-600" />
                    </span>
                    <p className="text-sm text-slate-700">
                      We sent a 6-digit code to <span className="text-slate-900 font-semibold">{email}</span>.
                      Enter it below to continue.
                    </p>
                  </div>

                  {sent && !delivered && (
                    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-700 leading-relaxed">
                      <p>
                        Email delivery isn't configured yet, so no message was sent. Add a free
                        Resend API key on the server to receive codes in your inbox.
                      </p>
                      {devCode && (
                        showDev ? (
                          <p className="mt-2 font-mono text-sm tracking-[0.3em] text-amber-900">
                            {devCode}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowDev(true)}
                            className="mt-2 underline underline-offset-2 hover:text-amber-900"
                          >
                            Reveal demo code (so you're not locked out)
                          </button>
                        )
                      )}
                    </div>
                  )}

                  <form onSubmit={handleVerify} className="space-y-3">
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="input-light w-full text-center text-2xl tracking-[0.5em] font-mono"
                    />
                    <button type="submit" disabled={busy} className="btn-green w-full py-3">
                      {busy ? <Loader2 size={18} className="animate-spin" /> : <>Verify & continue <ArrowRight size={16} /></>}
                    </button>
                  </form>

                  <button
                    onClick={handleEmailContinue}
                    disabled={busy}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 mt-4 transition-colors"
                  >
                    Didn't get it? Resend code
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            By continuing you agree to our Terms & Privacy Policy.
          </p>
        </div>

        {/* ── Google "Choose an account" dialog ─────────────────────────────── */}
        <AnimatePresence>
          {chooser && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => { setChooser(false); setNewGoogle(false) }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[400px] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <GoogleIcon size={20} />
                    <span className="text-sm font-medium text-slate-700">Sign in with Google</span>
                  </div>
                  <button
                    onClick={() => { setChooser(false); setNewGoogle(false) }}
                    className="tap-target -mr-2 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="px-5 pt-4 pb-2">
                  <p className="text-lg font-semibold text-slate-900">Choose an account</p>
                  <p className="text-sm text-slate-500 mt-0.5">to continue to VibePost</p>
                </div>

                {!newGoogle ? (
                  <div className="px-2 pb-3">
                    {recentAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        onClick={() => chooseGoogle(acc)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                          {initialOf(acc.name || acc.email)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-900 truncate">{acc.name}</span>
                          <span className="block text-xs text-slate-500 truncate">{acc.email}</span>
                        </span>
                      </button>
                    ))}

                    <button
                      onClick={() => setNewGoogle(true)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-500">
                        <Plus size={18} />
                      </span>
                      <span className="text-sm font-medium text-slate-700">Use another account</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={confirmNewGoogle} className="px-5 pb-5 pt-1 space-y-3">
                    <label htmlFor="gmail" className="block text-sm font-medium text-slate-700">Your Google email</label>
                    <input
                      id="gmail"
                      type="email"
                      autoFocus
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className="input-light w-full"
                    />
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button type="button" onClick={() => setNewGoogle(false)} className="btn-light py-2.5 px-4 text-sm">
                        Back
                      </button>
                      <button type="submit" className="btn-green py-2.5 px-5 text-sm">Continue</button>
                    </div>
                  </form>
                )}

                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    To enable the real Google account picker, set a Google OAuth Client ID on the server.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MarketingFooter />
    </div>
  )
}
