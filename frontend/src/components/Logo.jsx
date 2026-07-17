import React from 'react'

/**
 * Brandcast mark — green tile with a bold "B".
 */
export function LogoMark({ size = 36, className = '' }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0 rounded-[28%] blur-[6px] opacity-60"
        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a 55%, #0d9488)' }}
      />
      <span
        className="relative inline-flex items-center justify-center rounded-[28%] ring-1 ring-white/30 shadow-lg"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(140deg, #22c55e 0%, #16a34a 55%, #15803d 100%)',
        }}
      >
        <span
          className="font-display font-extrabold text-white leading-none"
          style={{ fontSize: size * 0.58, marginTop: -size * 0.02 }}
        >
          B
        </span>
      </span>
    </span>
  )
}

export default function Logo({ size = 36, subtitle = 'AI Marketing Studio', className = '', onLight = true }) {
  const titleColor = onLight ? 'text-slate-900' : 'text-white'
  const subColor = onLight ? 'text-slate-500' : 'text-slate-400'
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <div className="leading-tight">
        <p className={`font-display font-bold tracking-tight ${titleColor}`} style={{ fontSize: size * 0.42 }}>
          Brandcast
        </p>
        {subtitle && <p className={`${subColor} text-xs`}>{subtitle}</p>}
      </div>
    </div>
  )
}
