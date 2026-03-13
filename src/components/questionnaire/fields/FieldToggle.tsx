'use client'

import type { FieldProps } from './types'

export function FieldToggle({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? ['Oui', 'Non']

  return (
    <div
      className="flex gap-0 p-1 rounded-xl"
      style={{ backgroundColor: 'var(--bg-alt)', border: `2px solid ${error ? '#ef4444' : 'transparent'}` }}
    >
      {options.map((opt) => {
        const selected = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(field.id, opt)}
            className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? 'var(--primary)' : 'transparent',
              color: selected ? '#fff' : 'var(--text-muted)',
              boxShadow: selected ? '0 2px 8px rgba(9,77,128,0.28)' : 'none',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
