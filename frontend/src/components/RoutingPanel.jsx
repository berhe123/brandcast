import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, GitMerge, Sparkles, ChevronDown, Zap, FlaskConical } from 'lucide-react'

// Brand-ish colours per provider so each model badge is instantly recognisable.
const PROVIDER_STYLE = {
  anthropic: { dot: 'bg-orange-500', text: 'text-orange-700', ring: 'border-orange-500/30 bg-orange-500/10' },
  openai: { dot: 'bg-emerald-500', text: 'text-emerald-700', ring: 'border-emerald-500/30 bg-emerald-500/10' },
  gemini: { dot: 'bg-blue-500', text: 'text-blue-700', ring: 'border-blue-500/30 bg-blue-500/10' },
  deepseek: { dot: 'bg-indigo-500', text: 'text-indigo-700', ring: 'border-indigo-500/30 bg-indigo-500/10' },
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
      className="card p-4 border-green-500/25 bg-gradient-to-br from-green-500/[0.08] to-transparent"
    >
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/30 text-green-700 text-xs font-bold">
          {isHybrid ? <GitMerge size={12} /> : <Cpu size={12} />}
          {isHybrid ? 'Hybrid Fusion' : 'Smart Route'}
        </span>

        {isHybrid ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <ModelChip model={routing.primary} role="lead" />
            <Sparkles size={12} className="text-slate-400" />
            <ModelChip model={routing.partner} role="boost" />
            <GitMerge size={12} className="text-green-600" />
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
      <p className="text-sm text-slate-700 mt-3 leading-relaxed">{routing.rationale}</p>

      {/* Task skill tags */}
      {routing.topSkills?.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <span className="text-[11px] text-slate-500">Optimised for:</span>
          {routing.topSkills.map((s) => (
            <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
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
            className="flex items-center gap-2 text-xs text-green-700/90 hover:text-green-600 mt-3 transition-colors"
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
                    <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2"><ModelChip model={d.model} role={d.role} /></div>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed line-clamp-[12]">{d.text}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                  <GitMerge size={11} className="text-green-600" />
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
