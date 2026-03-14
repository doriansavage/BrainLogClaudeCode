// GET  /api/carrier-tariffs → liste toutes les grilles transporteurs
// POST /api/carrier-tariffs → sauvegarde une nouvelle grille (ou remplace)

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { CarrierTariff } from '@/types/carrier-tariffs'

const DATA_FILE = path.join(process.cwd(), 'data', 'carrier-tariffs', 'index.json')

async function readTariffs(): Promise<CarrierTariff[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as CarrierTariff[]
  } catch {
    return []
  }
}

async function writeTariffs(tariffs: CarrierTariff[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(tariffs, null, 2), 'utf-8')
}

export async function GET() {
  const tariffs = await readTariffs()
  return NextResponse.json(tariffs)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CarrierTariff
    if (!body.id || !body.carrierName) {
      return NextResponse.json({ error: 'Champs requis manquants (id, carrierName)' }, { status: 400 })
    }

    const tariffs = await readTariffs()
    const existingIndex = tariffs.findIndex((t) => t.id === body.id)

    const now = new Date().toISOString()
    const tariff: CarrierTariff = {
      ...body,
      updatedAt: now,
      createdAt: body.createdAt ?? now,
    }

    if (existingIndex >= 0) {
      tariffs[existingIndex] = tariff
    } else {
      tariffs.push(tariff)
    }

    await writeTariffs(tariffs)
    return NextResponse.json(tariff)
  } catch (err) {
    console.error('[carrier-tariffs POST]', err)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const tariffs = await readTariffs()
    const filtered = tariffs.filter((t) => t.id !== id)
    await writeTariffs(filtered)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[carrier-tariffs DELETE]', err)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
