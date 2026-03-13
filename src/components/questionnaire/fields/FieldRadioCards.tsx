'use client'

import type { FieldProps } from './types'

export function FieldRadioCards({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? []
  const icons = field.icons ?? []
  const cols = options.length <= 3 ? options.length : options.length <= 4 ? 2 : options.length <= 6 ? 3 : 3

  return (
    <div
      className="grid gap-2.5"
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
            className="flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border-2 text-center transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? 'var(--primary-light)' : 'var(--bg-alt)',
              borderColor: selected ? 'var(--primary)' : error ? '#ef4444' : 'transparent',
              color: selected ? 'var(--primary)' : 'var(--text)',
              boxShadow: selected ? '0 2px 12px rgba(9,77,128,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (!selected) {
                e.currentTarget.style.borderColor = 'var(--primary-200, #AECFEB)'
                e.currentTarget.style.backgroundColor = '#F5F9FF'
              }
            }}
            onMouseLeave={(e) => {
              if (!selected) {
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
              }
            }}
          >
            {icon && (
              <span className="text-2xl leading-none">{icon}</span>
            )}
            <span className="text-xs font-semibold leading-snug">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
