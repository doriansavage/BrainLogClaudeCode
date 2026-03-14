import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const CONFIG_PATH = join(process.cwd(), 'data/questionnaire-config.json')

function readConfig() {
  if (!existsSync(CONFIG_PATH)) return { sections: {} }
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
  } catch {
    return { sections: {} }
  }
}

export async function GET() {
  return NextResponse.json(readConfig())
}

export async function POST(req: Request) {
  const body = await req.json()
  writeFileSync(CONFIG_PATH, JSON.stringify(body, null, 2))
  return NextResponse.json({ ok: true })
}
