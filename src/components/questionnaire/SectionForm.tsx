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
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <ProgressBar
        currentStep={sectionIndex + 1}
        totalSteps={totalSections}
        progress={progress}
      />

      {/* Titre section */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--dark-navy)' }}>
          {section.label}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {section.fields.filter((f) => f.required).length} champ(s) obligatoire(s)
          · {section.fields.length} questions au total
        </p>
      </div>

      {/* Champs */}
      <div className="flex flex-col gap-4">
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
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onPrev}
          className="px-5 py-2 rounded-md text-sm font-medium border transition-colors"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
            backgroundColor: 'transparent',
          }}
        >
          ← Précédent
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {isLast ? 'Voir le récapitulatif →' : 'Suivant →'}
        </button>
      </div>
    </div>
  )
}
