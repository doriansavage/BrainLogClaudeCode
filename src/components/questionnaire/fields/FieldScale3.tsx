'use client'

import type { FieldProps } from './types'

const LEVEL_COLORS = [
  { bg: '#F0FDF4', border: '#86EFAC', text: '#166534' },  // low — vert
  { bg: '#FFF7ED', border: '#FCD34D', text: '#92400E' },  // mid — orange
  { bg: '#EFF6FF', border: 'var(--primary)', text: 'var(--primary)' }, // high — bleu
]

export function FieldScale3({ field, value, error, onChange }: FieldProps) {
  const scale = field.scale
  if (!scale) return null

  const levels = [
    { key: scale.low,  label: scale.low,  icon: scale.lowIcon  ?? '○', colors: LEVEL_COLORS[0] },
    { key: scale.mid,  label: scale.mid,  icon: scale.midIcon  ?? '◑', colors: LEVEL_COLORS[1] },
    { key: scale.high, label: scale.high, icon: scale.highIcon ?? '●', colors: LEVEL_COLORS[2] },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {levels.map((level, i) => {
        const selected = value === level.key
        return (
          <button
            key={level.key}
            type="button"
            onClick={() => onChange(field.id, level.key)}
            className="flex flex-col items-center gap-2 py-5 px-2 rounded-xl border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? level.colors.bg : 'var(--bg-alt)',
              borderColor: selected ? level.colors.border : error ? '#ef4444' : 'var(--border)',
              color: selected ? level.colors.text : 'var(--text-muted)',
            }}
          >
            <span className="text-2xl leading-none">{level.icon}</span>
            <span className="text-xs font-semibold text-center leading-tight">{level.label}</span>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((dot) => (
                <div
                  key={dot}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: dot <= i && selected ? level.colors.border : 'var(--border)',
                  }}
                />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
