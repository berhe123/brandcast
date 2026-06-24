import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, GitMerge, Sparkles, ChevronDown, Zap, FlaskConical } from 'lucide-react'

// Brand-ish colours per provider so each model badge is instantly recognisable.
const PROVIDER_STYLE = {
  anthropic: { dot: 'bg-orange-400', text: 'text-orange-300', ring: 'border-orange-500/30 bg-orange-500/10' },
  openai: { dot: 'bg-emerald-400', text: 'text-emerald-300', ring: 'border-emerald-500/30 bg-emerald-500/10' },
  gemini: { dot: 'bg-blue-400', text: 'text-blue-300', ring: 'border-blue-500/30 bg-blue-500/10' },
  deepseek: { dot: 'bg-indigo-400', text: 'text-indigo-300', ring: 'border-indigo-500/30 bg-indigo-500/10' },
}

function ModelChip({ model, role }) {
  const s = PROVIDER_STYLE[model.provider] || PROVIDER_STYLE.anthropic
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${s.ring} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {model.label}
      {role && <span className="text-[10px] uppercase tracking-wide opacity-60">· {role}</span>}
      {model.live === false && <span className="text-[9px] uppercase tracking-wide opacity-50">demo</span>}
      {model.live === true && <Zap size={9} className="opacity-80" />}
    </span>
  )
}

/**
 * Visualises a routing decision returned by the backend.
 * For hybrid runs it shows the two source drafts fusing into the final result.
 */
export default function RoutingPanel({ routing, drafts }) {
  const [open, setOpen] = useState(false)
  if (!routing) return null

  const isHybrid = routing.mode === 'hybrid'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 border-violet-500/20 bg-gradient-to-br from-violet-500/[0.06] to-transparent"
    >
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-200 text-xs font-bold">
          {isHybrid ? <GitMerge size={12} /> : <Cpu size={12} />}
          {isHybrid ? 'Hybrid Fusion' : 'Smart Route'}
        </span>

        {isHybrid ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <ModelChip model={routing.primary} role="lead" />
            <Sparkles size={12} className="text-slate-500" />
            <ModelChip model={routing.partner} role="boost" />
            <GitMerge size={12} className="text-violet-400" />
            <ModelChip model={routing.synthesizer} role="merge" />
          </div>
        ) : (
          <ModelChip model={routing.primary} />
        )}

        {typeof routing.score === 'number' && !isHybrid && (
          <span className="ml-auto text-[11px] text-slate-500 font-mono">fit {routing.score.toFixed(1)}/10</span>
        )}
        {isHybrid && typeof routing.complementarity === 'number' && (
          <span className="ml-auto text-[11px] text-slate-500 font-mono">+{routing.complementarity.toFixed(1)} complement</span>
        )}
      </div>

      {/* Rationale */}
      <p className="text-sm text-slate-300 mt-3 leading-relaxed">{routing.rationale}</p>

      {/* Task skill tags */}
      {routing.topSkills?.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <span className="text-[11px] text-slate-500">Optimised for:</span>
          {routing.topSkills.map((s) => (
            <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/60 text-slate-400">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Hybrid: reveal the two source drafts */}
      {isHybrid && drafts?.length === 2 && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 text-xs text-violet-300/80 hover:text-violet-200 mt-3 transition-colors"
          >
            <FlaskConical size={13} />
            {open ? 'Hide' : 'Show'} the two drafts we fused
            <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {drafts.map((d, i) => (
                    <div key={i} className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-3">
                      <div className="mb-2"><ModelChip model={d.model} role={d.role} /></div>
                      <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed line-clamp-[12]">{d.text}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                  <GitMerge size={11} className="text-violet-400" />
                  {routing.synthesizer.label} merged the best of both into the final post above.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  )
}
