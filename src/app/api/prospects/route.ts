import { NextResponse } from 'next/server'
import { readProspects, createProspect } from '@/lib/db/prospects'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

const WHATSAPP_NOTIFY = '32479574827'
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003'

export async function GET() {
  const prospects = readProspects()
  return NextResponse.json(prospects)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { companyName, contactName, contactEmail, contactPhone, websiteUrl, sector, notes } = body

  if (!companyName || !contactName || !contactEmail || !sector) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  const prospect = createProspect({
    companyName,
    contactName,
    contactEmail,
    contactPhone: contactPhone ?? '',
    websiteUrl: websiteUrl ?? '',
    sector,
    notes,
  })

  // Envoi WhatsApp asynchrone — ne bloque pas la réponse
  const formLink = `${APP_BASE_URL}/prospect/${prospect.token}`
  const message =
    `🆕 Nouveau prospect créé : *${companyName}*\n` +
    `👤 Contact : ${contactName}${contactPhone ? ` — ${contactPhone}` : ''}\n` +
    `🔗 Lien questionnaire : ${formLink}`

  sendWhatsAppMessage(WHATSAPP_NOTIFY, message).catch((err) =>
    console.error('[WhatsApp] Échec envoi notification prospect:', err)
  )

  return NextResponse.json(prospect, { status: 201 })
}
