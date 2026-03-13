'use client'

import type { FieldProps } from './types'

export function FieldPriceRange({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? []

  return (
    <div className="flex gap-2.5 flex-wrap">
      {options.map((opt, i) => {
        const selected = value === opt
        // Plus de € = fourchette plus haute
        const euroCount = Math.min(i + 1, 4)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(field.id, opt)}
            className="flex-1 min-w-[80px] flex flex-col items-center justify-center py-5 px-3 rounded-xl border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? 'var(--primary-light)' : 'var(--bg-alt)',
              borderColor: selected ? 'var(--primary)' : error ? '#ef4444' : 'transparent',
              boxShadow: selected ? '0 4px 14px rgba(9,77,128,0.18)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => {
              if (!selected) e.currentTarget.style.borderColor = 'var(--primary)'
            }}
            onMouseLeave={(e) => {
              if (!selected) e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <span
              className="text-base font-extrabold leading-none tracking-wide"
              style={{ color: selected ? 'var(--primary)' : 'var(--dark-navy)' }}
            >
              {'€'.repeat(euroCount)}
            </span>
            <span
              className="text-xs font-semibold mt-1.5 text-center leading-snug"
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
