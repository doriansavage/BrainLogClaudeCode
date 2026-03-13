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
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(135deg, #EEF4FB 0%, #F4F6FA 50%, #EBF4FF 100%)',
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg)',
          boxShadow: '0 4px 6px -1px rgba(9,77,128,0.06), 0 20px 40px -8px rgba(9,77,128,0.14)',
          border: '1px solid rgba(9,77,128,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(90deg, var(--primary) 0%, #1A72B5 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{
              width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M2 2h4.5a3.5 3.5 0 0 1 0 7H2V2z" fill="#fff" fillOpacity=".95" />
                <path d="M2 9h5a3 3 0 0 1 0 3H2V9z" fill="#fff" fillOpacity=".65" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white tracking-wide">Brain e-Log</span>
          </div>
          {prospect.companyName && (
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
            >
              {prospect.companyName}
            </span>
          )}
        </div>

        {/* Questionnaire */}
        <div className="px-8 py-10">
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
