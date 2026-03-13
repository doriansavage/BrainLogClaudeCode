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
            className="flex flex-col items-center gap-2 py-5 px-2 rounded-xl border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? colors.bg : 'var(--bg)',
              borderColor: selected ? colors.border : error ? '#ef4444' : 'var(--border)',
              color: selected ? colors.text : 'var(--text-muted)',
            }}
          >
            <span className="text-2xl leading-none">{icon}</span>
            <span className="text-xs font-bold text-center">{opt}</span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: selected ? colors.border : 'var(--border)',
                color: selected ? colors.text : 'var(--text-muted)',
                opacity: 0.8,
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
