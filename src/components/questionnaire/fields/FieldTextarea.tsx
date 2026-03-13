'use client'

import type { FieldProps } from './types'

export function FieldTextarea({ field, value, error, onChange }: FieldProps) {
  return (
    <textarea
      id={field.id}
      value={value ?? ''}
      onChange={(e) => onChange(field.id, e.target.value)}
      placeholder="Décrivez votre besoin…"
      rows={5}
      className="w-full px-4 py-3.5 rounded-xl text-sm border-2 outline-none transition-all resize-none leading-relaxed"
      style={{
        backgroundColor: error ? '#FFF5F5' : 'var(--bg-alt)',
        color: 'var(--text)',
        borderColor: error ? '#ef4444' : 'var(--border)',
        fontFamily: 'inherit',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--primary)'
        e.currentTarget.style.backgroundColor = error ? '#FFF5F5' : '#FAFCFF'
        e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 3px rgba(9,77,128,0.08)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--border)'
        e.currentTarget.style.backgroundColor = error ? '#FFF5F5' : 'var(--bg-alt)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}
