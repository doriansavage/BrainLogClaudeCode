'use client'

import type { FieldProps } from './types'

export function FieldIconGrid({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? []
  const icons = field.icons ?? []

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {options.map((opt, i) => {
        const selected = value === opt
        const icon = icons[i] ?? '📦'
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(field.id, opt)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? '#EBF4FF' : 'var(--bg-alt)',
              borderColor: selected ? 'var(--primary)' : error ? '#ef4444' : 'transparent',
              color: selected ? 'var(--primary)' : 'var(--text)',
            }}
          >
            <span className="text-2xl leading-none">{icon}</span>
            <span className="text-xs font-medium text-center leading-tight">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
