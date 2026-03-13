'use client'

import type { FieldProps } from './types'

// Couleurs d'urgence : rouge → orange → bleu → gris
const URGENCY_COLORS = [
  { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', label: 'Urgent' },
  { bg: '#FFF7ED', border: '#FCD34D', text: '#92400E', label: 'Rapide' },
  { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8', label: 'Planifié' },
  { bg: 'var(--bg-alt)', border: 'var(--border)', text: 'var(--text-muted)', label: 'Long terme' },
]

export function FieldTimelineSel({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? []
  const icons = field.icons ?? []

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((opt, i) => {
        const selected = value === opt
        const colors = URGENCY_COLORS[i] ?? URGENCY_COLORS[3]
        const icon = icons[i] ?? '📅'
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(field.id, opt)}
            className="flex flex-col items-center gap-2.5 py-6 px-2 rounded-xl border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? colors.bg : 'var(--bg-alt)',
              borderColor: selected ? colors.border : error ? '#ef4444' : 'transparent',
              color: selected ? colors.text : 'var(--text-muted)',
              boxShadow: selected ? `0 4px 14px ${colors.border}50` : '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (!selected) e.currentTarget.style.borderColor = colors.border
            }}
            onMouseLeave={(e) => {
              if (!selected) e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <span className="text-2xl leading-none">{icon}</span>
            <span className="text-xs font-bold text-center leading-tight">{opt}</span>
            <span
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: selected ? colors.border : 'var(--border)',
                color: selected ? (i === 0 ? '#fff' : colors.text) : 'var(--text-muted)',
              }}
            >
              {colors.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
