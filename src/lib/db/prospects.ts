import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { Prospect, QuestionnaireResponse, ProspectStatus, CommentsBySection } from '@/types/prospect'
import type { AnswersBySection } from '@/types/questionnaire'

const DATA_DIR = path.join(process.cwd(), 'data')
const PROSPECTS_FILE = path.join(DATA_DIR, 'prospects.json')
const RESPONSES_FILE = path.join(DATA_DIR, 'questionnaire_responses.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

// ── Prospects ──────────────────────────────────────────────────────────────

export function readProspects(): Prospect[] {
  ensureDir()
  if (!fs.existsSync(PROSPECTS_FILE)) return []
  return JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf-8')) as Prospect[]
}

function writeProspects(prospects: Prospect[]) {
  ensureDir()
  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(prospects, null, 2), 'utf-8')
}

export function getProspectById(id: string): Prospect | null {
  return readProspects().find((p) => p.id === id) ?? null
}

export function getProspectByToken(token: string): Prospect | null {
  return readProspects().find((p) => p.token === token) ?? null
}

export function createProspect(data: {
  companyName: string
  contactName: string
  contactEmail: string
  websiteUrl: string
  sector: string
  notes?: string
}): Prospect {
  const now = new Date().toISOString()
  const prospect: Prospect = {
    id: randomUUID(),
    token: randomUUID(),
    companyName: data.companyName,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    websiteUrl: data.websiteUrl,
    sector: data.sector,
    notes: data.notes ?? '',
    status: 'nouveau',
    createdAt: now,
    updatedAt: now,
  }
  const prospects = readProspects()
  prospects.unshift(prospect) // plus récent en premier
  writeProspects(prospects)
  return prospect
}

export function updateProspect(id: string, data: Partial<Omit<Prospect, 'id' | 'token' | 'createdAt'>>): Prospect | null {
  const prospects = readProspects()
  const idx = prospects.findIndex((p) => p.id === id)
  if (idx === -1) return null
  prospects[idx] = {
    ...prospects[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  writeProspects(prospects)
  return prospects[idx]
}

export function deleteProspect(id: string): boolean {
  const prospects = readProspects()
  const filtered = prospects.filter((p) => p.id !== id)
  if (filtered.length === prospects.length) return false
  writeProspects(filtered)
  // Supprimer aussi les réponses
  deleteResponses(id)
  return true
}

// ── Questionnaire Responses ───────────────────────────────────────────────

type ResponsesStore = Record<string, QuestionnaireResponse>

function readResponsesStore(): ResponsesStore {
  ensureDir()
  if (!fs.existsSync(RESPONSES_FILE)) return {}
  return JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf-8')) as ResponsesStore
}

function writeResponsesStore(store: ResponsesStore) {
  ensureDir()
  fs.writeFileSync(RESPONSES_FILE, JSON.stringify(store, null, 2), 'utf-8')
}

export function getResponses(prospectId: string): QuestionnaireResponse | null {
  const store = readResponsesStore()
  return store[prospectId] ?? null
}

export function upsertResponses(
  prospectId: string,
  answers: AnswersBySection,
  currentSectionIndex: number,
  completed: boolean,
  commentsBySection?: CommentsBySection,
): QuestionnaireResponse {
  const store = readResponsesStore()
  const now = new Date().toISOString()
  const existing = store[prospectId]
  store[prospectId] = {
    prospectId,
    answers,
    commentsBySection: commentsBySection ?? existing?.commentsBySection ?? {},
    currentSectionIndex,
    completedAt: completed ? (existing?.completedAt ?? now) : null,
    lastAccessAt: existing?.lastAccessAt ?? now,
    updatedAt: now,
  }
  writeResponsesStore(store)

  // Mettre à jour le statut du prospect
  const newStatus: ProspectStatus = completed ? 'répondu' : 'en_cours'
  updateProspect(prospectId, { status: newStatus })

  return store[prospectId]
}

/** Met à jour uniquement le timestamp de dernier accès. */
export function touchLastAccess(prospectId: string): void {
  const store = readResponsesStore()
  const now = new Date().toISOString()
  if (store[prospectId]) {
    store[prospectId] = { ...store[prospectId], lastAccessAt: now }
    writeResponsesStore(store)
  }
}

function deleteResponses(prospectId: string) {
  const store = readResponsesStore()
  delete store[prospectId]
  writeResponsesStore(store)
}
