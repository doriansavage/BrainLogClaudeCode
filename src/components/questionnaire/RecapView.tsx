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

  const answeredSections = summary.filter((s) => s.answeredCount > 0).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold" style={{ color: 'var(--dark-navy)', letterSpacing: '-0.01em' }}>
          Récapitulatif de vos réponses
        </h2>
        <div className="flex items-center gap-2">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Vérifiez vos informations avant d&rsquo;envoyer.
          </p>
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            {answeredSections}/{summary.length} sections
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-3">
        {summary.map((sec, idx) => {
          const completionPct = sec.totalCount > 0 ? Math.round((sec.answeredCount / sec.totalCount) * 100) : 0
          return (
            <div
              key={sec.sectionId}
              className="rounded-xl overflow-hidden"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                boxShadow: '0 1px 4px rgba(9,77,128,0.04)',
              }}
            >
              {/* Header section */}
              <div
                className="flex justify-between items-center px-4 py-3"
                style={{ backgroundColor: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--dark-navy)' }}>
                    {sec.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: completionPct === 100 ? '#F0FDF4' : 'var(--border)',
                      color: completionPct === 100 ? '#16a34a' : 'var(--text-muted)',
                    }}
                  >
                    {completionPct}%
                  </span>
                  <button
                    onClick={() => onEdit(idx)}
                    className="flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors"
                    style={{ color: 'var(--primary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-hover)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--primary)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifier
                  </button>
                </div>
              </div>

              {/* Réponses */}
              <div className="px-4 py-3">
                {sec.items.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {sec.items.map((item) => (
                      <div key={item.fieldId} className="flex justify-between text-sm gap-4">
                        <span className="shrink-0 max-w-[55%] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {item.label}
                        </span>
                        <span className="font-semibold text-right leading-relaxed" style={{ color: 'var(--text)' }}>
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
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="flex justify-between items-center pt-2 gap-3">
        <button
          onClick={() => onEdit(summary.length - 1)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Modifier
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-60"
          style={{
            background: 'linear-gradient(90deg, var(--primary) 0%, #1A72B5 100%)',
            boxShadow: '0 4px 16px rgba(9,77,128,0.30)',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(9,77,128,0.38)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(9,77,128,0.30)'
          }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Envoi en cours…
            </>
          ) : (
            <>
              Envoyer le questionnaire
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
