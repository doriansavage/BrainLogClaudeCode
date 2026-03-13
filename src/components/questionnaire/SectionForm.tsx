'use client'

import { useState } from 'react'
import type { SectionDefinition, QuestionnaireAnswers, SectionErrors } from '@/types/questionnaire'
import { validateSection } from '@/lib/questionnaire'
import { FormField } from './FormField'
import { ProgressBar } from './ProgressBar'

interface SectionFormProps {
  section: SectionDefinition
  sectionIndex: number       // 0-based
  totalSections: number
  initialAnswers: QuestionnaireAnswers
  isFirst: boolean
  isLast: boolean
  onNext: (answers: QuestionnaireAnswers) => void
  onPrev: () => void
}

export function SectionForm({
  section,
  sectionIndex,
  totalSections,
  initialAnswers,
  isFirst,
  isLast,
  onNext,
  onPrev,
}: SectionFormProps) {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(initialAnswers)
  const [errors, setErrors] = useState<SectionErrors>({})
  const [touched, setTouched] = useState(false)

  function handleChange(fieldId: string, value: string) {
    const updated = { ...answers, [fieldId]: value }
    setAnswers(updated)
    // Efface l'erreur du champ modifié
    if (errors[fieldId]) {
      setErrors((prev) => { const e = { ...prev }; delete e[fieldId]; return e })
    }
  }

  function handleNext() {
    const validationErrors = validateSection(section, answers)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setTouched(true)
      // Scroll vers le premier champ en erreur
      const firstErrorId = Object.keys(validationErrors)[0]
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    onNext(answers)
  }

  const progress = Math.round(((sectionIndex + 1) / totalSections) * 100)

  return (
    <div className="flex flex-col gap-7">
      {/* Progress */}
      <ProgressBar
        currentStep={sectionIndex + 1}
        totalSteps={totalSections}
        progress={progress}
      />

      {/* Titre section */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-extrabold flex-shrink-0"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            {sectionIndex + 1}
          </span>
          <h2 className="text-xl font-bold leading-tight" style={{ color: 'var(--dark-navy)', letterSpacing: '-0.01em' }}>
            {section.label}
          </h2>
        </div>
        <p className="text-xs ml-9.5" style={{ color: 'var(--text-muted)' }}>
          {section.fields.filter((f) => f.required).length} champ{section.fields.filter((f) => f.required).length > 1 ? 's' : ''} obligatoire{section.fields.filter((f) => f.required).length > 1 ? 's' : ''}
          &nbsp;·&nbsp;{section.fields.length} questions
        </p>
      </div>

      {/* Séparateur */}
      <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Champs */}
      <div className="flex flex-col gap-6">
        {section.fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={answers[field.id] ?? ''}
            error={touched ? errors[field.id] : undefined}
            onChange={handleChange}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2 gap-3">
        {!isFirst ? (
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Précédent
          </button>
        ) : <div />}
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, var(--primary) 0%, #1A72B5 100%)',
            boxShadow: '0 4px 14px rgba(9,77,128,0.28)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(9,77,128,0.36)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(9,77,128,0.28)' }}
        >
          {isLast ? 'Récapitulatif' : 'Suivant'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
