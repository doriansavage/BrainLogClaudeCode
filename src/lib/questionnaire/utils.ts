import { QUESTIONNAIRE_SCHEMA, TOTAL_SECTIONS } from './schema'
import type {
  FormStep,
  FormScreen,
  QuestionnaireAnswers,
  AnswersBySection,
  SectionErrors,
  SectionDefinition,
} from '@/types/questionnaire'

// ── Navigation ──────────────────────────────────────────────

export function getFormStep(sectionIndex: number): FormStep {
  const section = QUESTIONNAIRE_SCHEMA.sections[sectionIndex]
  return {
    sectionIndex,
    section,
    isFirst: sectionIndex === 0,
    isLast: sectionIndex === TOTAL_SECTIONS - 1,
    progress: Math.round(((sectionIndex + 1) / TOTAL_SECTIONS) * 100),
  }
}

export function nextScreen(current: FormScreen): FormScreen {
  if (current.screen === 'landing') return { screen: 'step', sectionIndex: 0 }
  if (current.screen === 'step') {
    const next = current.sectionIndex + 1
    return next < TOTAL_SECTIONS
      ? { screen: 'step', sectionIndex: next }
      : { screen: 'recap' }
  }
  if (current.screen === 'recap') return { screen: 'confirmation' }
  return current
}

export function prevScreen(current: FormScreen): FormScreen {
  if (current.screen === 'step') {
    const prev = current.sectionIndex - 1
    return prev >= 0
      ? { screen: 'step', sectionIndex: prev }
      : { screen: 'landing' }
  }
  if (current.screen === 'recap') {
    return { screen: 'step', sectionIndex: TOTAL_SECTIONS - 1 }
  }
  return current
}

// ── Validation ──────────────────────────────────────────────

export function validateSection(
  section: SectionDefinition,
  answers: QuestionnaireAnswers
): SectionErrors {
  const errors: SectionErrors = {}
  for (const field of section.fields) {
    if (field.required) {
      const val = answers[field.id]
      if (!val || val.trim() === '') {
        errors[field.id] = 'Ce champ est obligatoire'
      }
    }
  }
  return errors
}

export function isSectionComplete(
  section: SectionDefinition,
  answers: QuestionnaireAnswers
): boolean {
  return Object.keys(validateSection(section, answers)).length === 0
}

export function countAnsweredFields(answers: AnswersBySection): number {
  return Object.values(answers).reduce(
    (total, sectionAnswers) =>
      total + Object.values(sectionAnswers).filter((v) => v && v.trim() !== '').length,
    0
  )
}

// ── Résumé pour le récapitulatif ────────────────────────────

export interface SectionSummary {
  sectionId: string
  label: string
  answeredCount: number
  totalCount: number
  items: Array<{ fieldId: string; label: string; value: string }>
}

export function buildSummary(answers: AnswersBySection): SectionSummary[] {
  return QUESTIONNAIRE_SCHEMA.sections.map((section) => {
    const sectionAnswers = answers[section.id] ?? {}
    const items = section.fields
      .filter((f) => sectionAnswers[f.id] && sectionAnswers[f.id].trim() !== '')
      .map((f) => ({ fieldId: f.id, label: f.label, value: sectionAnswers[f.id] }))

    return {
      sectionId: section.id,
      label: section.label,
      answeredCount: items.length,
      totalCount: section.fields.length,
      items,
    }
  })
}

// ── Merge des réponses (auto-save) ──────────────────────────

export function mergeAnswers(
  current: AnswersBySection,
  sectionId: string,
  newAnswers: QuestionnaireAnswers
): AnswersBySection {
  return {
    ...current,
    [sectionId]: {
      ...(current[sectionId] ?? {}),
      ...newAnswers,
    },
  }
}

// ── Aplatir les réponses (pour envoi API) ───────────────────

export function flattenAnswers(answers: AnswersBySection): QuestionnaireAnswers {
  return Object.values(answers).reduce(
    (acc, sectionAnswers) => ({ ...acc, ...sectionAnswers }),
    {}
  )
}
