'use client'

import { useState, useCallback } from 'react'
import type { FormScreen, AnswersBySection, QuestionnaireAnswers } from '@/types/questionnaire'
import { QUESTIONNAIRE_SCHEMA, TOTAL_SECTIONS, mergeAnswers, nextScreen, prevScreen } from '@/lib/questionnaire'
import { SectionForm } from './SectionForm'
import { RecapView } from './RecapView'

interface QuestionnaireShellProps {
  token: string
  companyName?: string
  savedAnswers?: AnswersBySection
  onAutoSave?: (sectionId: string, answers: QuestionnaireAnswers, sectionIndex: number) => Promise<void>
  onSubmit?: (answers: AnswersBySection) => Promise<void>
}

export function QuestionnaireShell({
  token,
  companyName,
  savedAnswers,
  onAutoSave,
  onSubmit,
}: QuestionnaireShellProps) {
  const [screen, setScreen] = useState<FormScreen>({ screen: 'landing' })
  const [answers, setAnswers] = useState<AnswersBySection>(savedAnswers ?? {})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const goNext = useCallback((sectionAnswers?: QuestionnaireAnswers, sectionId?: string) => {
    if (sectionAnswers && sectionId) {
      const updated = mergeAnswers(answers, sectionId, sectionAnswers)
      setAnswers(updated)
      if (onAutoSave) {
        const idx = screen.screen === 'step' ? screen.sectionIndex : 0
        onAutoSave(sectionId, sectionAnswers, idx).catch(console.error)
      }
    }
    setScreen((prev) => nextScreen(prev))
  }, [answers, onAutoSave, screen])

  const goPrev = useCallback(() => {
    setScreen((prev) => prevScreen(prev))
  }, [])

  const goToSection = useCallback((sectionIndex: number) => {
    setScreen({ screen: 'step', sectionIndex })
  }, [])

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      await onSubmit?.(answers)
      setScreen({ screen: 'confirmation' })
    } catch (err) {
      console.error('Erreur soumission questionnaire', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Landing ─────────────────────────────────────────────
  if (screen.screen === 'landing') {
    return (
      <div className="flex flex-col items-center gap-8 py-4">
        {/* Icône + titre */}
        <div className="text-center flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1A72B5 100%)', boxShadow: '0 8px 24px rgba(9,77,128,0.25)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--dark-navy)', letterSpacing: '-0.02em' }}>
              {companyName ? `Bienvenue, ${companyName} !` : 'Votre questionnaire logistique'}
            </h1>
            <p className="text-base mt-2 max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Quelques questions pour construire votre offre logistique sur-mesure.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              ), label: '~8 minutes' },
            { icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ), label: 'Données sécurisées' },
            { icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ), label: 'Sauvegarde auto' },
          ].map((feat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-center"
              style={{ backgroundColor: 'var(--bg-alt)', color: 'var(--primary)' }}
            >
              {feat.icon}
              <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{feat.label}</span>
            </div>
          ))}
        </div>

        {/* Étapes */}
        <div className="w-full flex items-center gap-1 justify-center">
          {Array.from({ length: TOTAL_SECTIONS }, (_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{ backgroundColor: 'var(--border)', maxWidth: 24 }}
            />
          ))}
          <span className="ml-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {TOTAL_SECTIONS} étapes
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => goNext()}
          className="w-full py-4 rounded-xl text-base font-bold text-white transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, var(--primary) 0%, #1A72B5 100%)',
            boxShadow: '0 4px 16px rgba(9,77,128,0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(9,77,128,0.38)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(9,77,128,0.3)' }}
        >
          Commencer le questionnaire →
        </button>
      </div>
    )
  }

  if (screen.screen === 'step') {
    const { sectionIndex } = screen
    const section = QUESTIONNAIRE_SCHEMA.sections[sectionIndex]
    return (
      <SectionForm
        section={section}
        sectionIndex={sectionIndex}
        totalSections={TOTAL_SECTIONS}
        initialAnswers={answers[section.id] ?? {}}
        isFirst={sectionIndex === 0}
        isLast={sectionIndex === TOTAL_SECTIONS - 1}
        onNext={(sectionAnswers) => goNext(sectionAnswers, section.id)}
        onPrev={goPrev}
      />
    )
  }

  if (screen.screen === 'recap') {
    return (
      <RecapView
        answers={answers}
        onSubmit={handleSubmit}
        onEdit={goToSection}
        isSubmitting={isSubmitting}
      />
    )
  }

  // Confirmation ─────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
          boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--dark-navy)', letterSpacing: '-0.02em' }}>
          Questionnaire envoyé !
        </h2>
        <p className="text-base mt-3 max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Merci pour vos réponses. Nous préparons votre offre logistique personnalisée —
          Mathieu vous contactera sous <strong style={{ color: 'var(--primary)' }}>48h</strong>.
        </p>
      </div>
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium"
        style={{ backgroundColor: '#F0FDF4', color: '#166534' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.17-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        Vous serez contacté sous 48h
      </div>
    </div>
  )
}
