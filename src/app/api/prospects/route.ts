import { NextResponse } from 'next/server'
import { readProspects, createProspect } from '@/lib/db/prospects'

export async function GET() {
  const prospects = readProspects()
  return NextResponse.json(prospects)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { companyName, contactName, contactEmail, websiteUrl, sector, notes } = body

  if (!companyName || !contactName || !contactEmail || !sector) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  const prospect = createProspect({ companyName, contactName, contactEmail, websiteUrl: websiteUrl ?? '', sector, notes })
  return NextResponse.json(prospect, { status: 201 })
}
