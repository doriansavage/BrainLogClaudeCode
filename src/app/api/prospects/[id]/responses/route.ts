import { NextResponse } from 'next/server'
import { getProspectById, getResponses, upsertResponses } from '@/lib/db/prospects'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const responses = getResponses(id)
  return NextResponse.json(responses ?? {})
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const prospect = getProspectById(id)
  if (!prospect) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  const { answers, currentSectionIndex, completed } = await req.json()
  const result = upsertResponses(id, answers, currentSectionIndex ?? 0, completed ?? false)
  return NextResponse.json(result)
}
