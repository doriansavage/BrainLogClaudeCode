'use server'

import { getProspectByToken, upsertResponses, getResponses, touchLastAccess } from '@/lib/db/prospects'
import type { AnswersBySection, QuestionnaireAnswers } from '@/types/questionnaire'
import type { CommentsBySection } from '@/types/prospect'

/**
 * Auto-save à la fin de chaque section (réponses + commentaires).
 */
export async function autoSaveAnswers(
  token: string,
  sectionId: string,
  answers: QuestionnaireAnswers,
  sectionIndex: number,
  sectionComments?: Record<string, string>,
): Promise<void> {
  const prospect = getProspectByToken(token)
  if (!prospect) return

  const existing = getResponses(prospect.id)
  const mergedAnswers: AnswersBySection = {
    ...(existing?.answers ?? {}),
    [sectionId]: answers,
  }
  const mergedComments: CommentsBySection = {
    ...(existing?.commentsBySection ?? {}),
    ...(sectionComments ? { [sectionId]: sectionComments } : {}),
  }

  upsertResponses(prospect.id, mergedAnswers, sectionIndex, false, mergedComments)
}

/**
 * Soumission finale.
 */
export async function submitQuestionnaire(
  token: string,
  answers: AnswersBySection,
  commentsBySection?: CommentsBySection,
): Promise<void> {
  const prospect = getProspectByToken(token)
  if (!prospect) throw new Error('Token invalide')

  const totalSections = Object.keys(answers).length
  upsertResponses(prospect.id, answers, totalSections - 1, true, commentsBySection)
}

/**
 * Met à jour le timestamp de dernier accès au formulaire.
 */
export async function updateLastAccess(token: string): Promise<void> {
  const prospect = getProspectByToken(token)
  if (!prospect) return
  touchLastAccess(prospect.id)
}
