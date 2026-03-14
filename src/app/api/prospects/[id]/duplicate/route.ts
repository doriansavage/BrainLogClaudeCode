import { NextResponse } from 'next/server'
import { duplicateProspect } from '@/lib/db/prospects'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const copy = duplicateProspect(id)
  if (!copy) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  return NextResponse.json(copy, { status: 201 })
}
