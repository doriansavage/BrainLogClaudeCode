'use server'

import { createClient } from '@/lib/supabase/server'
import type { AnswersBySection, QuestionnaireAnswers } from '@/types/questionnaire'

/**
 * Sauvegarde automatique à la fin de chaque section.
 * Non bloquante côté client (catch en background).
 */
export async function autoSaveAnswers(
  token: string,
  sectionId: string,
  answers: QuestionnaireAnswers,
  sectionIndex: number,
): Promise<void> {
  const supabase = await createClient()

  // Récupérer le prospect
  const { data: prospect, error: pErr } = await supabase
    .from('prospects')
    .select('id')
    .eq('token', token)
    .single()

  if (pErr || !prospect) return

  const prospectId = prospect.id

  // Upsert sur questionnaire_responses
  const { data: existing } = await supabase
    .from('questionnaire_responses')
    .select('id, answers')
    .eq('prospect_id', prospectId)
    .maybeSingle()

  const mergedAnswers = {
    ...(existing?.answers ?? {}),
    [sectionId]: answers,
  }

  if (existing) {
    await supabase
      .from('questionnaire_responses')
      .update({
        answers: mergedAnswers,
        current_section_index: sectionIndex,
      })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('questionnaire_responses')
      .insert({
        prospect_id: prospectId,
        answers: mergedAnswers,
        current_section_index: sectionIndex,
        completed: false,
        submitted_at: null,
      })
  }

  // Mettre le prospect en in_progress
  await supabase
    .from('prospects')
    .update({ status: 'in_progress' })
    .eq('id', prospectId)
    .eq('status', 'pending')
}

/**
 * Soumission finale du questionnaire.
 */
export async function submitQuestionnaire(
  token: string,
  answers: AnswersBySection,
): Promise<void> {
  const supabase = await createClient()

  const { data: prospect, error: pErr } = await supabase
    .from('prospects')
    .select('id')
    .eq('token', token)
    .single()

  if (pErr || !prospect) throw new Error('Token invalide')

  const prospectId = prospect.id

  const { data: existing } = await supabase
    .from('questionnaire_responses')
    .select('id')
    .eq('prospect_id', prospectId)
    .maybeSingle()

  const now = new Date().toISOString()

  if (existing) {
    await supabase
      .from('questionnaire_responses')
      .update({
        answers,
        completed: true,
        submitted_at: now,
      })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('questionnaire_responses')
      .insert({
        prospect_id: prospectId,
        answers,
        current_section_index: 7,
        completed: true,
        submitted_at: now,
      })
  }

  await supabase
    .from('prospects')
    .update({ status: 'completed' })
    .eq('id', prospectId)
}
