'use client'

import { useState, useCallback } from 'react'
import type { FormScreen, AnswersBySection, QuestionnaireAnswers } from '@/types/questionnaire'
import { QUESTIONNAIRE_SCHEMA, TOTAL_SECTIONS, mergeAnswers, nextScreen, prevScreen } from '@/lib/questionnaire'
import { SectionForm } from './SectionForm'
import { RecapView } from './RecapView'

interface QuestionnaireShellProps {
  token: string
  companyName?: string
  /** Réponses partielles déjà sauvegardées (reprise) */
  savedAnswers?: AnswersBySection
  /** Appelé à chaque fin de section pour auto-save */
  onAutoSave?: (sectionId: string, answers: QuestionnaireAnswers, sectionIndex: number) => Promise<void>
  /** Appelé à la soumission finale */
  onSubmit?: (answers: AnswersBySection) => Promise<void>
}

/**
 * Orchestrateur principal du questionnaire multi-étapes.
 * Gère la navigation (landing → steps → recap → confirmation)
 * et l'état global des réponses.
 *
 * Usage dans la page /prospect/[token] :
 *   <QuestionnaireShell token={token} onAutoSave={...} onSubmit={...} />
 */
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

  // ── Navigation ─────────────────────────────────────

  const goNext = useCallback((sectionAnswers?: QuestionnaireAnswers, sectionId?: string) => {
    if (sectionAnswers && sectionId) {
      const updated = mergeAnswers(answers, sectionId, sectionAnswers)
      setAnswers(updated)
      // Auto-save asynchrone (non bloquant)
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

  // ── Soumission ─────────────────────────────────────

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

  // ── Rendu ──────────────────────────────────────────

  if (screen.screen === 'landing') {
    return (
      <div className="text-center flex flex-col items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--dark-navy)' }}>
            {companyName ? `Bienvenue, ${companyName}` : 'Bienvenue'}
          </h1>
          <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Remplissez ce questionnaire pour recevoir votre offre logistique personnalisée.
            Vos réponses sont sauvegardées automatiquement.
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Durée estimée : ~8 min · {TOTAL_SECTIONS} sections
          </p>
        </div>
        <button
          onClick={() => goNext()}
          className="px-8 py-3 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Commencer →
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

  // Confirmation
  return (
    <div className="text-center flex flex-col items-center gap-4 py-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
        style={{ backgroundColor: '#dcfce7' }}
      >
        ✓
      </div>
      <h2 className="text-xl font-bold" style={{ color: 'var(--dark-navy)' }}>
        Questionnaire envoyé !
      </h2>
      <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
        Merci. Nous vous préparons votre offre logistique personnalisée.
        Mathieu vous contactera sous 48h.
      </p>
    </div>
  )
}
