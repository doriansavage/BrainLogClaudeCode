'use client'

import type { FieldProps } from './types'

export function FieldLogoPicker({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? []
  const icons = field.icons ?? []

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {options.map((opt, i) => {
        const selected = value === opt
        const icon = icons[i] ?? '🔷'
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(field.id, opt)}
            className="flex flex-col items-center gap-2 py-5 px-2 rounded-xl border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? 'var(--primary-light)' : 'var(--bg-alt)',
              borderColor: selected ? 'var(--primary)' : error ? '#ef4444' : 'transparent',
              boxShadow: selected ? '0 2px 12px rgba(9,77,128,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (!selected) e.currentTarget.style.borderColor = 'var(--primary)'
            }}
            onMouseLeave={(e) => {
              if (!selected) e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <span className="text-2xl leading-none">{icon}</span>
            <span
              className="text-xs font-bold text-center leading-tight"
              style={{ color: selected ? 'var(--primary)' : 'var(--text)' }}
            >
              {opt}
            </span>
          </button>
        )
      })}
    </div>
  )
}
