'use client'

import type { FieldProps } from './types'

export function FieldText({ field, value, error, onChange }: FieldProps) {
  return (
    <input
      id={field.id}
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(field.id, e.target.value)}
      placeholder="Votre réponse…"
      className="w-full px-4 py-3 rounded-lg text-sm border outline-none transition-all"
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        borderColor: error ? '#ef4444' : 'var(--border)',
        fontFamily: 'inherit',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)' }}
      onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--border)' }}
    />
  )
}
