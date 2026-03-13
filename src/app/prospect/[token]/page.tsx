import { notFound } from 'next/navigation'
import { getProspectByToken, getResponses } from '@/lib/db/prospects'
import { QuestionnaireShell } from '@/components/questionnaire/QuestionnaireShell'
import { autoSaveAnswers, submitQuestionnaire } from '@/app/actions/questionnaire'
import type { AnswersBySection, QuestionnaireAnswers } from '@/types/questionnaire'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ProspectPortalPage({ params }: PageProps) {
  const { token } = await params

  const prospect = getProspectByToken(token)
  if (!prospect) notFound()

  const responses = getResponses(prospect.id)
  const savedAnswers = (responses?.answers ?? {}) as AnswersBySection

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
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h4.5a3.5 3.5 0 0 1 0 7H2V2z" fill="#fff" fillOpacity=".9" />
              <path d="M2 9h5a3 3 0 0 1 0 3H2V9z" fill="#fff" fillOpacity=".6" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
              Brain e-Log
            </span>
            {prospect.companyName && (
              <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                · {prospect.companyName}
              </span>
            )}
          </div>
        </div>

        {/* Questionnaire */}
        <div className="px-8 py-8">
          <QuestionnaireShell
            token={token}
            companyName={prospect.companyName}
            savedAnswers={savedAnswers}
            onAutoSave={handleAutoSave}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
