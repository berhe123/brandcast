import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowRight, ArrowLeft, Loader2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { startEmailLogin, verifyEmailLogin, loginWithGoogle } from '../services/api'

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

export default function Login() {
  const { user, authenticate } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/app/dashboard'

  const [step, setStep] = useState('email') // 'email' | 'code'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [devCode, setDevCode] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  const finish = (data) => {
    authenticate(data)
    navigate(from, { replace: true })
  }

  const handleGoogle = async () => {
    setBusy(true)
    try {
      // Demo: backend creates/uses a Google-style account. With GOOGLE_CLIENT_ID
      // set, swap this for the real Google Identity token (credential).
      const res = await loginWithGoogle({ profile: email.trim() ? { email: email.trim() } : undefined })
      finish(res.data)
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  const handleEmailContinue = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email')
    setBusy(true)
    try {
      const res = await startEmailLogin(email.trim())
      setDevCode(res.data.devCode || '')
      setStep('code')
      toast.success(res.data.message)
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] relative">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow-purple mb-4">
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AI Media Buncher</h1>
          <p className="text-slate-500 text-sm mt-1">
            {step === 'email' ? 'Sign in to your workspace' : 'Check your email'}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur p-7 shadow-xl">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              >
                {/* Continue with Google */}
                <button
                  onClick={handleGoogle}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-slate-800 font-semibold text-sm hover:bg-slate-100 transition-colors disabled:opacity-60"
                >
                  <GoogleIcon /> Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-xs text-slate-600 font-medium">OR</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                {/* Email */}
                <form onSubmit={handleEmailContinue} className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">Enter your email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="input-field pl-10 w-full"
                    />
                  </div>
                  <button type="submit" disabled={busy} className="btn-primary w-full py-3">
                    {busy ? <Loader2 size={18} className="animate-spin" /> : <>Continue with email <ArrowRight size={16} /></>}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
              >
                <button
                  onClick={() => { setStep('email'); setCode('') }}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-4 transition-colors"
                >
                  <ArrowLeft size={14} /> Use a different email
                </button>

                <p className="text-sm text-slate-400 mb-4">
                  We sent a 6-digit code to <span className="text-slate-200 font-medium">{email}</span>.
                </p>

                {devCode && (
                  <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm">
                    <span className="text-amber-300/80">Demo code: </span>
                    <span className="font-mono font-bold text-amber-200 tracking-widest">{devCode}</span>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-3">
                  <input
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="input-field w-full text-center text-2xl tracking-[0.5em] font-mono"
                  />
                  <button type="submit" disabled={busy} className="btn-primary w-full py-3">
                    {busy ? <Loader2 size={18} className="animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
                  </button>
                </form>

                <button
                  onClick={handleEmailContinue}
                  disabled={busy}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-300 mt-4 transition-colors"
                >
                  Didn't get it? Resend code
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  )
}
