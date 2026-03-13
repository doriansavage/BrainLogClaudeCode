'use client'

import type { FieldProps } from './types'

export function FieldToggle({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? ['Oui', 'Non']

  return (
    <div className="flex gap-3">
      {options.map((opt) => {
        const selected = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(field.id, opt)}
            className="flex-1 py-4 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? 'var(--primary)' : 'var(--bg)',
              borderColor: selected ? 'var(--primary)' : error ? '#ef4444' : 'var(--border)',
              color: selected ? '#fff' : 'var(--text)',
              boxShadow: selected ? '0 2px 8px rgba(9,77,128,0.25)' : 'none',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
