'use client'

import type { FieldProps } from './types'

// La valeur est stockée comme chaîne séparée par des virgules : "Amazon,Bol.com"
function parseMulti(value: string): string[] {
  return value ? value.split(',').filter(Boolean) : []
}
function serializeMulti(arr: string[]): string {
  return arr.join(',')
}

export function FieldMultiSelect({ field, value, error, onChange }: FieldProps) {
  const options = field.options ?? []
  const icons = field.icons ?? []
  const selected = parseMulti(value)

  function toggle(opt: string) {
    // "Aucune" est exclusif : si on le sélectionne, on vide le reste
    if (opt === 'Aucun' || opt === 'Aucune') {
      onChange(field.id, serializeMulti([opt]))
      return
    }
    const withoutNone = selected.filter((s) => s !== 'Aucun' && s !== 'Aucune')
    const next = withoutNone.includes(opt)
      ? withoutNone.filter((s) => s !== opt)
      : [...withoutNone, opt]
    onChange(field.id, serializeMulti(next))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt, i) => {
        const isSelected = selected.includes(opt)
        const icon = icons[i]
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-alt)',
              borderColor: isSelected ? 'var(--primary)' : error ? '#ef4444' : 'transparent',
              color: isSelected ? '#fff' : 'var(--text)',
              boxShadow: isSelected ? '0 2px 8px rgba(9,77,128,0.22)' : '0 1px 2px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = 'var(--primary)'
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            {icon && <span className="text-sm leading-none">{icon}</span>}
            {opt}
          </button>
        )
      })}
    </div>
  )
}
