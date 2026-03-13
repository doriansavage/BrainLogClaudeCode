'use client'

import type { FieldDefinition } from '@/types/questionnaire'

interface FormFieldProps {
  field: FieldDefinition
  value: string
  error?: string
  onChange: (fieldId: string, value: string) => void
}

export function FormField({ field, value, error, onChange }: FormFieldProps) {
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={field.id}
        className="text-sm font-medium"
        style={{ color: 'var(--text)' }}
      >
        {field.label}
        {field.required && (
          <span className="ml-1" style={{ color: 'var(--primary)' }}>*</span>
        )}
      </label>

      {field.type === 'radio_cards' && field.options && (
        <select
          id={field.id}
          value={value ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm border outline-none transition-colors"
          style={{
            backgroundColor: 'var(--bg)',
            color: value ? 'var(--text)' : 'var(--text-muted)',
            borderColor: hasError ? '#ef4444' : 'var(--border)',
          }}
        >
          <option value="">— Sélectionner —</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === 'text' && (
        <input
          id={field.id}
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={`Votre réponse…`}
          className="w-full px-3 py-2 rounded-md text-sm border outline-none transition-colors"
          style={{
            backgroundColor: 'var(--bg)',
            color: 'var(--text)',
            borderColor: hasError ? '#ef4444' : 'var(--border)',
          }}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          id={field.id}
          value={value ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder="Votre réponse…"
          rows={4}
          className="w-full px-3 py-2 rounded-md text-sm border outline-none transition-colors resize-none"
          style={{
            backgroundColor: 'var(--bg)',
            color: 'var(--text)',
            borderColor: hasError ? '#ef4444' : 'var(--border)',
          }}
        />
      )}

      {error && (
        <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
      )}
    </div>
  )
}
