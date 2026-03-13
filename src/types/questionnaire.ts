// ─────────────────────────────────────────────
// Types du domaine questionnaire — Brain E-Log
// ─────────────────────────────────────────────

// ── Types de composants UI ────────────────────
//
// text         : champ texte libre (nom, email, TVA…)
// url          : champ URL avec validation http
// textarea     : texte long (commentaires)
// toggle       : bouton Oui / Non (2 options binaires)
// radio_cards  : cartes visuelles cliquables, 3–7 choix (un seul)
// icon_grid    : grille d'icônes + label, idéal secteur/origine
// slider       : curseur sur une échelle ordonnée (volumes, poids…)
// multi_select : chips multi-sélection (plusieurs réponses possibles)
// price_range  : sélection fourchette de valeur € en cards
// geo_split    : 6 sliders pays dont la somme ≈ 100% (Q6)
// scale_3      : échelle d'importance 3 niveaux (faible/moyen/fort)
// logo_picker  : grille de logos de marques (plateformes, transporteurs)
// timeline_sel : sélecteur d'horizon temporel (urgence de lancement)

export type FieldType =
  | 'text'
  | 'url'
  | 'textarea'
  | 'toggle'
  | 'radio_cards'
  | 'icon_grid'
  | 'slider'
  | 'multi_select'
  | 'price_range'
  | 'geo_split'
  | 'scale_3'
  | 'logo_picker'
  | 'timeline_sel'

// ── Métadonnées d'un champ ────────────────────

export interface SliderConfig {
  stops: string[]           // libellés des stops (ex: ['<50', '50-200', ...])
}

export interface ScaleConfig {
  low: string               // ex: "Stable"
  mid: string               // ex: "Pics modérés ±30%"
  high: string              // ex: "Forte saisonnalité ×2+"
  lowIcon?: string
  midIcon?: string
  highIcon?: string
}

export interface FieldDefinition {
  id: string                // ex: "Q1.01"
  label: string
  type: FieldType
  required: boolean
  hint?: string             // aide contextuelle sous le champ
  options?: string[]        // pour radio_cards, icon_grid, multi_select, logo_picker
  icons?: string[]          // emoji/icône par option (même index que options)
  slider?: SliderConfig     // config slider
  scale?: ScaleConfig       // config scale_3
  conditional?: {           // afficher ce champ seulement si…
    fieldId: string
    operator: 'eq' | 'neq' | 'in'
    value: string | string[]
  }
}

export interface SectionDefinition {
  id: string                // ex: "Q1"
  label: string
  icon?: string             // emoji pour la nav/progress
  description?: string      // sous-titre de la section
  fields: FieldDefinition[]
}

export interface QuestionnaireSchema {
  sections: SectionDefinition[]
}

// ── Réponses du prospect ────────────────────

/** Map fieldId → valeur(s) saisie(s) — multi_select stocke valeurs séparées par "," */
export type QuestionnaireAnswers = Record<string, string>

/** Réponses regroupées par section */
export type AnswersBySection = Record<string, QuestionnaireAnswers>

// ── Etat de navigation du formulaire ──────────

export interface FormStep {
  sectionIndex: number
  section: SectionDefinition
  isFirst: boolean
  isLast: boolean
  progress: number          // 0–100
}

export type FormScreen =
  | { screen: 'landing' }
  | { screen: 'step'; sectionIndex: number }
  | { screen: 'recap' }
  | { screen: 'confirmation' }

// ── Validation ──────────────────────────────

export type SectionErrors = Record<string, string>  // fieldId → message

// ── Entité Prospect (côté DB) ───────────────

export type ProspectStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'processing'
  | 'offer_sent'

export interface Prospect {
  id: string
  token: string
  company_name?: string
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
  current_section_index: number
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
