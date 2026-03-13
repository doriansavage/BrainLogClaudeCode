'use server'

import { getProspectByToken, upsertResponses, getResponses } from '@/lib/db/prospects'
import type { AnswersBySection, QuestionnaireAnswers } from '@/types/questionnaire'

/**
 * Auto-save à la fin de chaque section.
 */
export async function autoSaveAnswers(
  token: string,
  sectionId: string,
  answers: QuestionnaireAnswers,
  sectionIndex: number,
): Promise<void> {
  const prospect = getProspectByToken(token)
  if (!prospect) return

  const existing = getResponses(prospect.id)
  const mergedAnswers: AnswersBySection = {
    ...(existing?.answers ?? {}),
    [sectionId]: answers,
  }

  upsertResponses(prospect.id, mergedAnswers, sectionIndex, false)
}

/**
 * Soumission finale.
 */
export async function submitQuestionnaire(
  token: string,
  answers: AnswersBySection,
): Promise<void> {
  const prospect = getProspectByToken(token)
  if (!prospect) throw new Error('Token invalide')

  const totalSections = Object.keys(answers).length
  upsertResponses(prospect.id, answers, totalSections - 1, true)
}
