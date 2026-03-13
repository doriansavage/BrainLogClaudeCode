'use client'

import type { FieldProps } from './types'

export function FieldRadioCards({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? []
  const icons = field.icons ?? []
  const cols = options.length <= 3 ? options.length : options.length <= 4 ? 2 : options.length <= 6 ? 3 : 3

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {options.map((opt, i) => {
        const selected = value === opt
        const icon = icons[i]
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(field.id, opt)}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-3.5 rounded-xl border-2 text-center transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? '#EBF4FF' : 'var(--bg)',
              borderColor: selected ? 'var(--primary)' : error ? '#ef4444' : 'var(--border)',
              color: selected ? 'var(--primary)' : 'var(--text)',
            }}
          >
            {icon && (
              <span className="text-xl leading-none">{icon}</span>
            )}
            <span className="text-xs font-semibold leading-snug">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
