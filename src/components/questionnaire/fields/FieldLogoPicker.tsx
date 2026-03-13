'use client'

import type { FieldProps } from './types'

export function FieldLogoPicker({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? []
  const icons = field.icons ?? []

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {options.map((opt, i) => {
        const selected = value === opt
        const icon = icons[i] ?? '🔷'
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(field.id, opt)}
            className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? '#EBF4FF' : 'var(--bg)',
              borderColor: selected ? 'var(--primary)' : error ? '#ef4444' : 'var(--border)',
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
