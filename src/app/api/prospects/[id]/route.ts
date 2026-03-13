import { NextResponse } from 'next/server'
import { getProspectById, updateProspect, deleteProspect } from '@/lib/db/prospects'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prospect = getProspectById(id)
  if (!prospect) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  return NextResponse.json(prospect)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = updateProspect(id, body)
  if (!updated) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = deleteProspect(id)
  if (!ok) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
