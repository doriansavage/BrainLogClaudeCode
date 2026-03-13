'use client'

import type { FieldProps } from './types'

export function FieldPriceRange({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? []

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const selected = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(field.id, opt)}
            className="flex-1 min-w-[80px] flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: selected ? '#EBF4FF' : 'var(--bg-alt)',
              borderColor: selected ? 'var(--primary)' : error ? '#ef4444' : 'transparent',
              color: selected ? 'var(--primary)' : 'var(--text)',
            }}
          >
            <span
              className="text-lg font-extrabold leading-none"
              style={{ color: selected ? 'var(--primary)' : 'var(--dark-navy)' }}
            >
              €
            </span>
            <span className="text-xs font-semibold mt-1 text-center">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
