'use client'

import type { FieldProps } from './types'

export function FieldUrl({ field, value, error, onChange }: FieldProps) {
  return (
    <div className="flex items-center rounded-lg border overflow-hidden transition-all"
      style={{ borderColor: error ? '#ef4444' : 'var(--border)' }}
    >
      <span
        className="px-3 py-3 text-sm select-none border-r"
        style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-alt)', borderColor: 'var(--border)' }}
      >
        https://
      </span>
      <input
        id={field.id}
        type="url"
        value={value ?? ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder="www.votremarque.com"
        className="flex-1 px-3 py-3 text-sm outline-none"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit' }}
      />
    </div>
  )
}
