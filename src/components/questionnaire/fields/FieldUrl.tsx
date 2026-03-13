'use client'

import type { FieldProps } from './types'

export function FieldUrl({ field, value, error, onChange }: FieldProps) {
  return (
    <div
      className="flex items-center rounded-xl border-2 overflow-hidden transition-all"
      style={{ borderColor: error ? '#ef4444' : 'var(--border)', backgroundColor: 'var(--bg-alt)' }}
      onFocusCapture={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = error ? '#ef4444' : 'var(--primary)'
        el.style.backgroundColor = '#FAFCFF'
        el.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 3px rgba(9,77,128,0.08)'
      }}
      onBlurCapture={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = error ? '#ef4444' : 'var(--border)'
        el.style.backgroundColor = 'var(--bg-alt)'
        el.style.boxShadow = 'none'
      }}
    >
      <span
        className="px-3.5 py-3.5 text-xs font-semibold select-none border-r"
        style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', borderColor: 'var(--border)', whiteSpace: 'nowrap' }}
      >
        https://
      </span>
      <input
        id={field.id}
        type="url"
        value={value ?? ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder="www.votremarque.com"
        className="flex-1 px-3 py-3.5 text-sm outline-none bg-transparent"
        style={{ color: 'var(--text)', fontFamily: 'inherit' }}
      />
    </div>
  )
}
