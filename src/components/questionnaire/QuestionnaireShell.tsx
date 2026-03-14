'use client'

import { useState, useCallback } from 'react'
import type { FormScreen, AnswersBySection, QuestionnaireAnswers } from '@/types/questionnaire'
import type { CommentsBySection } from '@/types/prospect'
import { QUESTIONNAIRE_SCHEMA, TOTAL_SECTIONS, mergeAnswers, nextScreen, prevScreen } from '@/lib/questionnaire'
import { SectionForm } from './SectionForm'
import { RecapView } from './RecapView'

interface QuestionnaireShellProps {
  token: string
  companyName?: string
  savedAnswers?: AnswersBySection
  savedComments?: CommentsBySection
  savedSectionIndex?: number        // -1 = jamais commencé
  lastAccessAt?: string | null      // ISO datetime du dernier accès
  shareUrl?: string                 // URL complète du formulaire
  onAutoSave?: (sectionId: string, answers: QuestionnaireAnswers, sectionIndex: number, comments?: Record<string, string>) => Promise<void>
  onSubmit?: (answers: AnswersBySection, comments?: CommentsBySection) => Promise<void>
}

// ─── Helper : format date/heure lisible ──────────────────────────────────────
function formatAccessDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Barre de partage ────────────────────────────────────────────────────────
function ShareBar({ shareUrl, lastAccessAt }: { shareUrl: string; lastAccessAt?: string | null }) {
  const [copied, setCopied] = useState(false)

  function copyUrl() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const emailHref = `mailto:?subject=${encodeURIComponent('Questionnaire logistique Brain e-Log')}&body=${encodeURIComponent(`Bonjour,\n\nVoici le lien pour remplir le questionnaire logistique :\n${shareUrl}\n\nMerci`)}`
  const waHref = `https://wa.me/?text=${encodeURIComponent(`Bonjour, voici le lien pour compléter le questionnaire logistique Brain e-Log :\n${shareUrl}`)}`

  return (
    <div
      className="rounded-xl px-4 py-3 mb-5 flex flex-col gap-2.5"
      style={{ backgroundColor: '#F0F7FF', border: '1px solid rgba(9,77,128,0.12)' }}
    >
      {lastAccessAt && (
        <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Dernier accès :&nbsp;<strong style={{ color: 'var(--primary)' }}>{formatAccessDate(lastAccessAt)}</strong>
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Envoyer le questionnaire :</span>

        <button
          onClick={copyUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          style={{ backgroundColor: copied ? '#DCFCE7' : '#fff', color: copied ? '#15803D' : 'var(--primary)', border: '1px solid', borderColor: copied ? '#BBF7D0' : 'rgba(9,77,128,0.2)' }}
        >
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          )}
          {copied ? 'Copié !' : 'Copier'}
        </button>

        <a href={emailHref}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ backgroundColor: '#fff', color: 'var(--primary)', border: '1px solid rgba(9,77,128,0.2)', textDecoration: 'none' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          Email
        </a>

        <a href={waHref} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', textDecoration: 'none' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function QuestionnaireShell({
  token,
  companyName,
  savedAnswers,
  savedComments,
  savedSectionIndex = -1,
  lastAccessAt,
  shareUrl,
  onAutoSave,
  onSubmit,
}: QuestionnaireShellProps) {
  // Reprendre depuis la section sauvegardée (si déjà commencé)
  const initialScreen: FormScreen = savedSectionIndex >= 0
    ? { screen: 'step', sectionIndex: savedSectionIndex }
    : { screen: 'landing' }

  const [screen, setScreen] = useState<FormScreen>(initialScreen)
  const [answers, setAnswers] = useState<AnswersBySection>(savedAnswers ?? {})
  const [comments, setComments] = useState<CommentsBySection>(savedComments ?? {})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const goNext = useCallback((
    sectionAnswers?: QuestionnaireAnswers,
    sectionId?: string,
    sectionComments?: Record<string, string>,
  ) => {
    if (sectionAnswers && sectionId) {
      const updated = mergeAnswers(answers, sectionId, sectionAnswers)
      setAnswers(updated)
      if (sectionComments) {
        setComments(prev => ({ ...prev, [sectionId]: sectionComments }))
      }
      if (onAutoSave) {
        const idx = screen.screen === 'step' ? screen.sectionIndex : 0
        onAutoSave(sectionId, sectionAnswers, idx, sectionComments).catch(console.error)
      }
    }
    setScreen((prev) => nextScreen(prev))
  }, [answers, onAutoSave, screen])

  const goPrev = useCallback(() => setScreen((prev) => prevScreen(prev)), [])
  const goToSection = useCallback((sectionIndex: number) => setScreen({ screen: 'step', sectionIndex }), [])

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      await onSubmit?.(answers, comments)
      setScreen({ screen: 'confirmation' })
    } catch (err) {
      console.error('Erreur soumission questionnaire', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const showShareBar = !!(shareUrl && screen.screen !== 'confirmation')

  // ── Landing ──────────────────────────────────────────────────────────────
  if (screen.screen === 'landing') {
    return (
      <div className="flex flex-col items-center gap-8 py-4">
        {showShareBar && <ShareBar shareUrl={shareUrl!} lastAccessAt={lastAccessAt} />}

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

        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>), label: '~8 minutes' },
            { icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>), label: 'Données sécurisées' },
            { icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>), label: 'Sauvegarde auto' },
          ].map((feat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-alt)', color: 'var(--primary)' }}>
              {feat.icon}
              <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{feat.label}</span>
            </div>
          ))}
        </div>

        <div className="w-full flex items-center gap-1 justify-center">
          {Array.from({ length: TOTAL_SECTIONS }, (_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: 'var(--border)', maxWidth: 24 }} />
          ))}
          <span className="ml-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{TOTAL_SECTIONS} étapes</span>
        </div>

        <button
          onClick={() => goNext()}
          className="w-full py-4 rounded-xl text-base font-bold text-white transition-all cursor-pointer"
          style={{ background: 'linear-gradient(90deg, var(--primary) 0%, #1A72B5 100%)', boxShadow: '0 4px 16px rgba(9,77,128,0.3)' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(9,77,128,0.38)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(9,77,128,0.3)' }}
        >
          Commencer le questionnaire →
        </button>
      </div>
    )
  }

  // ── Step ─────────────────────────────────────────────────────────────────
  if (screen.screen === 'step') {
    const { sectionIndex } = screen
    const section = QUESTIONNAIRE_SCHEMA.sections[sectionIndex]
    return (
      <div className="flex flex-col gap-0">
        {showShareBar && <ShareBar shareUrl={shareUrl!} lastAccessAt={lastAccessAt} />}
        <SectionForm
          section={section}
          sectionIndex={sectionIndex}
          totalSections={TOTAL_SECTIONS}
          initialAnswers={answers[section.id] ?? {}}
          initialComments={comments[section.id] ?? {}}
          isFirst={sectionIndex === 0}
          isLast={sectionIndex === TOTAL_SECTIONS - 1}
          shareUrl={shareUrl}
          onNext={(sectionAnswers, sectionComments) => goNext(sectionAnswers, section.id, sectionComments)}
          onPrev={goPrev}
        />
      </div>
    )
  }

  // ── Recap ─────────────────────────────────────────────────────────────────
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

  // ── Confirmation ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--dark-navy)', letterSpacing: '-0.02em' }}>Questionnaire envoyé !</h2>
        <p className="text-base mt-3 max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Merci pour vos réponses. Nous préparons votre offre logistique personnalisée —
          Mathieu vous contactera sous <strong style={{ color: 'var(--primary)' }}>48h</strong>.
        </p>
      </div>
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: '#F0FDF4', color: '#166534' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.17-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        Vous serez contacté sous 48h
      </div>
    </div>
  )
}
