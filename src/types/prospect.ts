import type { AnswersBySection } from './questionnaire'

export type ProspectStatus =
  | 'nouveau'
  | 'lien_envoyé'
  | 'en_cours'
  | 'répondu'
  | 'offre_générée'
  | 'acceptée'
  | 'refusée'

export interface Prospect {
  id: string
  token: string
  companyName: string
  contactName: string
  contactEmail: string
  websiteUrl: string
  sector: string
  notes: string
  status: ProspectStatus
  createdAt: string
  updatedAt: string
}

export interface QuestionnaireResponse {
  prospectId: string
  answers: AnswersBySection
  currentSectionIndex: number
  completedAt: string | null
  updatedAt: string
}

export const SECTORS = [
  'Mode & Textile',
  'Beauté & Cosmétiques',
  'Maison & Déco',
  'Sport & Outdoor',
  'Électronique',
  'Alimentation & Boissons',
  'Santé & Bien-être',
  'Luxe',
  'Jouets & Enfants',
  'Animalerie',
  'Auto & Moto',
  'Jardin & Bricolage',
  'Autre',
]

export const STATUS_CONFIG: Record<ProspectStatus, { label: string; bg: string; color: string }> = {
  nouveau:        { label: 'Nouveau',         bg: '#F8FAFC', color: '#475569' },
  lien_envoyé:    { label: 'Lien envoyé',     bg: '#F0F9FF', color: '#0369A1' },
  en_cours:       { label: 'En cours',        bg: '#EEF4FB', color: '#094D80' },
  répondu:        { label: 'Répondu',         bg: '#F0FDF4', color: '#15803D' },
  offre_générée:  { label: 'Offre générée',   bg: '#FFFBEB', color: '#B45309' },
  acceptée:       { label: 'Acceptée',        bg: '#F0FDF4', color: '#15803D' },
  refusée:        { label: 'Refusée',         bg: '#FFF1F2', color: '#BE123C' },
}
