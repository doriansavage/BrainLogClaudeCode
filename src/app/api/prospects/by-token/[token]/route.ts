import { NextResponse } from 'next/server'
import { getProspectByToken, getResponses } from '@/lib/db/prospects'

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const prospect = getProspectByToken(token)
  if (!prospect) return NextResponse.json({ error: 'Token invalide' }, { status: 404 })

  const responses = getResponses(prospect.id)

  return NextResponse.json({
    id: prospect.id,
    companyName: prospect.companyName,
    status: prospect.status,
    savedAnswers: responses?.answers ?? {},
    currentSectionIndex: responses?.currentSectionIndex ?? 0,
  })
}
