import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuestionnaireShell } from '@/components/questionnaire/QuestionnaireShell'
import { autoSaveAnswers, submitQuestionnaire } from '@/app/actions/questionnaire'
import type { AnswersBySection, QuestionnaireAnswers } from '@/types/questionnaire'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ProspectPortalPage({ params }: PageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Vérifier que le token est valide
  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, company_name, status')
    .eq('token', token)
    .maybeSingle()

  if (!prospect || prospect.status === 'expired') {
    notFound()
  }

  // Récupérer les réponses déjà sauvegardées
  const { data: response } = await supabase
    .from('questionnaire_responses')
    .select('answers, current_section_index')
    .eq('prospect_id', prospect.id)
    .maybeSingle()

  const savedAnswers = (response?.answers ?? {}) as AnswersBySection

  // Wrappers server actions (ajoutent le token)
  async function handleAutoSave(
    sectionId: string,
    answers: QuestionnaireAnswers,
    sectionIndex: number,
  ) {
    'use server'
    await autoSaveAnswers(token, sectionId, answers, sectionIndex)
  }

  async function handleSubmit(answers: AnswersBySection) {
    'use server'
    await submitQuestionnaire(token, answers)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: 'var(--bg-alt)' }}
    >
      <div
        className="w-full max-w-2xl rounded-xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div
          className="px-8 py-5 border-b flex items-center gap-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--primary)' }}>
            Brain e-Log
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            · Questionnaire logistique
          </span>
        </div>

        {/* Questionnaire */}
        <div className="px-8 py-8">
          <QuestionnaireShell
            token={token}
            companyName={prospect.company_name ?? undefined}
            savedAnswers={savedAnswers}
            onAutoSave={handleAutoSave}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
