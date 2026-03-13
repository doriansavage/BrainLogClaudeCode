// ─────────────────────────────────────────────
// Types du domaine questionnaire — Brain E-Log
// ─────────────────────────────────────────────

// ── Schéma de définition du formulaire ────────

export type FieldType = 'text' | 'dropdown' | 'textarea'

export interface FieldDefinition {
  id: string           // ex: "Q1.01"
  label: string
  type: FieldType
  required: boolean
  options?: string[]
}

export interface SectionDefinition {
  id: string           // ex: "Q1"
  label: string
  fields: FieldDefinition[]
}

export interface QuestionnaireSchema {
  sections: SectionDefinition[]
}

// ── Réponses du prospect ────────────────────

/** Map fieldId → valeur saisie */
export type QuestionnaireAnswers = Record<string, string>

/** Réponses regroupées par section */
export type AnswersBySection = Record<string, QuestionnaireAnswers>

// ── Etat de navigation du formulaire ──────────

export interface FormStep {
  sectionIndex: number    // 0-based
  section: SectionDefinition
  isFirst: boolean
  isLast: boolean
  progress: number        // 0–100
}

export type FormScreen =
  | { screen: 'landing' }
  | { screen: 'step'; sectionIndex: number }
  | { screen: 'recap' }
  | { screen: 'confirmation' }

// ── Validation ──────────────────────────────

export interface FieldError {
  fieldId: string
  message: string
}

export type SectionErrors = Record<string, string>  // fieldId → message

// ── Entité Prospect (côté DB) ───────────────

export type ProspectStatus =
  | 'pending'       // token envoyé, pas encore commencé
  | 'in_progress'   // questionnaire en cours
  | 'submitted'     // questionnaire soumis
  | 'processing'    // Mathieu génère l'offre
  | 'offer_sent'    // offre envoyée

export interface Prospect {
  id: string
  token: string
  company_name?: string       // prérempli si connu (Q1.01)
  contact_email?: string
  status: ProspectStatus
  created_at: string
  updated_at: string
  submitted_at?: string
}

// ── Réponse enregistrée en base ─────────────

export interface QuestionnaireResponse {
  id: string
  prospect_id: string
  answers: AnswersBySection
  current_section_index: number   // pour reprendre où on s'est arrêté
  completed: boolean
  created_at: string
  updated_at: string
}

// ── Sauvegarde partielle (auto-save) ─────────

export interface AutoSavePayload {
  token: string
  sectionId: string
  answers: QuestionnaireAnswers
  currentSectionIndex: number
}
