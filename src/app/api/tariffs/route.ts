import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'tariffs.json')

function ensureDir() {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export async function GET() {
  ensureDir()
  if (!fs.existsSync(DATA_FILE)) {
    return NextResponse.json(null)
  }
  const content = fs.readFileSync(DATA_FILE, 'utf-8')
  return NextResponse.json(JSON.parse(content))
}

export async function POST(req: Request) {
  ensureDir()
  const data = await req.json()
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  return NextResponse.json({ ok: true })
}
