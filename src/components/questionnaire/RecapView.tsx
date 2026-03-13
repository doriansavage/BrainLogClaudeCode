'use client'

import type { AnswersBySection } from '@/types/questionnaire'
import { buildSummary } from '@/lib/questionnaire'

interface RecapViewProps {
  answers: AnswersBySection
  onSubmit: () => void
  onEdit: (sectionIndex: number) => void
  isSubmitting?: boolean
}

export function RecapView({ answers, onSubmit, onEdit, isSubmitting }: RecapViewProps) {
  const summary = buildSummary(answers)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--dark-navy)' }}>
          Récapitulatif de vos réponses
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Vérifiez vos informations avant d'envoyer le questionnaire.
        </p>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {summary.map((sec, idx) => (
          <div
            key={sec.sectionId}
            className="rounded-lg border p-4"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
          >
            {/* Header section */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full mr-2"
                  style={{ backgroundColor: 'var(--bg-alt)', color: 'var(--primary)' }}>
                  {sec.sectionId}
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {sec.label}
                </span>
              </div>
              <button
                onClick={() => onEdit(idx)}
                className="text-xs underline"
                style={{ color: 'var(--primary)' }}
              >
                Modifier
              </button>
            </div>

            {/* Réponses */}
            {sec.items.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {sec.items.map((item) => (
                  <div key={item.fieldId} className="flex justify-between text-sm gap-4">
                    <span style={{ color: 'var(--text-muted)' }} className="shrink-0 max-w-[60%]">
                      {item.label}
                    </span>
                    <span className="font-medium text-right" style={{ color: 'var(--text)' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                Aucune réponse enregistrée
              </p>
            )}

            {/* Compteur */}
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              {sec.answeredCount} / {sec.totalCount} questions renseignées
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => onEdit(summary.length - 1)}
          className="px-5 py-2 rounded-md text-sm font-medium border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          ← Modifier
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-8 py-2.5 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {isSubmitting ? 'Envoi en cours…' : 'Envoyer mon questionnaire →'}
        </button>
      </div>
    </div>
  )
}
