'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { ReactNode, CSSProperties, ElementType } from 'react'
import {
  Building2, UserCheck, FileText, ShieldCheck, Folder, ClipboardList, Bell, Plug,
  Save, Check, CheckCircle2, Mail, Phone, CreditCard, Hash,
  Upload, Archive, Plus, ChevronDown, ChevronRight, RotateCcw, Paperclip,
  BarChart3, Truck, Zap, Eye, EyeOff,
} from 'lucide-react'
import { QUESTIONNAIRE_SCHEMA } from '@/lib/questionnaire'

/* ═══════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════ */
type TabId = 'entreprise' | 'commercial' | 'offres' | 'conditions' | 'documents' | 'questionnaire' | 'notifications' | 'integrations'

const TABS: { id: TabId; label: string; icon: ElementType; desc: string }[] = [
  { id: 'entreprise',    label: 'Entreprise',    icon: Building2,    desc: 'Société & informations légales' },
  { id: 'commercial',    label: 'Commercial',    icon: UserCheck,    desc: 'Équipe & contacts sur les offres' },
  { id: 'offres',        label: 'Offres',        icon: FileText,     desc: 'Génération, affichage & tarification' },
  { id: 'conditions',    label: 'CGV',           icon: ShieldCheck,  desc: 'Conditions générales de vente' },
  { id: 'documents',     label: 'Documents',     icon: Folder,       desc: 'Fichiers & annexes avec versioning' },
  { id: 'questionnaire', label: 'Questionnaire', icon: ClipboardList,desc: 'Liens, délais & messages prospect' },
  { id: 'notifications', label: 'Notifications', icon: Bell,         desc: 'Alertes & résumés par email' },
  { id: 'integrations',  label: 'Intégrations',  icon: Plug,         desc: 'Supabase, SMTP, CRM, WMS' },
]

/* ═══════════════════════════════════════════════════════
   SETTINGS STATE
═══════════════════════════════════════════════════════ */
interface S {
  raisonSociale: string; tagline: string; siret: string; tvaIntra: string
  adresse: string; codePostal: string; ville: string; pays: string
  telephone: string; emailContact: string; siteWeb: string; secteur: string
  contactPrenom: string; contactNom: string; contactFonction: string
  contactEmail: string; contactTelephone: string; contactApparaitOffres: boolean
  offreFormatExport: string; offreValiditeJours: string; offreValiditeJusquAu: string
  offreLogo: boolean; offreClauseConf: boolean
  offreTVA: string; offreAffichage: string; offreArrondi: string
  offreMentionsLegales: string; offreSignature: string
  cgvCadre: string; cgvValidite: string; cgvPrix: string
  iban: string; delaiPaiement: string; cgvResponsabilite: string
  validiteLien: string; rappelJoursAvant: string
  messageAccueil: string; messageConfirmation: string
  nomExpediteur: string; emailExpediteur: string
  notifQuestionnaire: boolean; emailNotifQuestionnaire: string
  notifOffreAcceptee: boolean; notifOffreRefusee: boolean; emailNotifOffre: string
  resumeQuotidien: boolean; alertesTarifs: boolean
  smtpHost: string; smtpPort: string; smtpUser: string; smtpPassword: string
  wmsWebhookUrl: string; crmType: string; crmApiKey: string; maxSnapshots: string
}

const DEFAULTS: S = {
  raisonSociale: 'Brain E-Log SRL', tagline: 'Votre partenaire logistique e-commerce',
  siret: '', tvaIntra: 'BE 0000.000.000',
  adresse: '', codePostal: '', ville: 'Bruxelles', pays: 'Belgique',
  telephone: '', emailContact: 'contact@brain-log.com', siteWeb: 'https://brain-log.com', secteur: 'Logistique 3PL',
  contactPrenom: 'Mathieu', contactNom: 'Pichelin', contactFonction: 'Managing Partner',
  contactEmail: 'mathieu.pichelin@brain-log.com', contactTelephone: '+32 472 17 88 31', contactApparaitOffres: true,
  offreFormatExport: 'pdf', offreValiditeJours: '30', offreValiditeJusquAu: '2026-12-31',
  offreLogo: true, offreClauseConf: true, offreTVA: '21', offreAffichage: 'HT', offreArrondi: '0.05',
  offreMentionsLegales: "Tarifs exprimés hors taxes. Valables pour la durée indiquée sur l'offre. Brain E-Log SRL — TVA BE 0000.000.000.",
  offreSignature: 'Mathieu Pichelin\nManaging Partner — Brain E-Log SRL\ntél. +32 472 17 88 31\nmathieu.pichelin@brain-log.com',
  cgvCadre: "Cette offre est valable uniquement entre Brain E-Log SRL et le prospect désigné en page de garde.",
  cgvValidite: "Offre valable jusqu'au 31/12/2026.\nLes prix présentés ne couvrent que les activités décrites dans ce document. Tout service supplémentaire sera facturé au client sur base de nos conditions générales de vente.",
  cgvPrix: "Nos prix sont en euros HTVA.\nLa TVA n'est pas applicable quand il s'agit d'une facturation intracommunautaire.\nToute augmentation de TVA ou toute nouvelle taxe imposée par les autorités fiscales belges sera appliquée conformément à la loi belge.",
  iban: 'BE84 0689 0320 9059', delaiPaiement: '14',
  cgvResponsabilite: "La responsabilité de Brain E-Log s'arrête là où celle des transporteurs démarre. S'appliquent alors leurs conditions générales de vente.\nBrain E-Log pourra aider à la résolution des problèmes de transport (dommages, objets perdus) grâce à sa relation avec les compagnies de transport. Cela fera l'objet de suppléments.",
  validiteLien: '30', rappelJoursAvant: '7',
  messageAccueil: "Bienvenue sur notre formulaire de qualification. Merci de renseigner vos besoins logistiques avec précision afin que nous puissions vous proposer l'offre la plus adaptée.",
  messageConfirmation: "Merci ! Votre questionnaire a bien été transmis à l'équipe Brain E-Log. Nous vous recontacterons dans les 48 heures ouvrées.",
  nomExpediteur: 'Brain E-Log', emailExpediteur: 'no-reply@brain-log.com',
  notifQuestionnaire: true, emailNotifQuestionnaire: 'mathieu.pichelin@brain-log.com',
  notifOffreAcceptee: true, notifOffreRefusee: true, emailNotifOffre: 'mathieu.pichelin@brain-log.com',
  resumeQuotidien: false, alertesTarifs: true,
  smtpHost: '', smtpPort: '587', smtpUser: '', smtpPassword: '',
  wmsWebhookUrl: '', crmType: 'aucun', crmApiKey: '', maxSnapshots: '15',
}

/* ═══════════════════════════════════════════════════════
   DOCUMENTS — types & données initiales
═══════════════════════════════════════════════════════ */
type DocType = 'grille' | 'contrat' | 'annexe' | 'regles' | 'autre'
type ServiceType = 'transport' | 'surcharge' | 'assurance' | 'douane' | 'autre'

interface DocVersion {
  id: string
  vNum: number
  filename: string
  size: string
  date: string   // YYYY-MM-DD
  note: string
}

interface Doc {
  id: string
  name: string
  docType: DocType
  carrier?: string        // si docType === 'grille' : 'DHL' | 'Bpost' | 'GLS' | ...
  serviceType?: ServiceType
  description: string
  isAttached: boolean     // fichier brut annexé aux offres
  usedInPricing: boolean  // valeurs utilisées dans le moteur de pricing
  isArchived: boolean
  currentVersionId: string
  versions: DocVersion[]
}

const DOCTYPE: Record<DocType, { label: string; bg: string; color: string }> = {
  grille:  { label: 'Grille tarifaire', bg: '#F0FDF4', color: '#15803d' },
  contrat: { label: 'Contrat',          bg: '#EEF4FB', color: '#094D80' },
  annexe:  { label: 'Annexe',           bg: '#F5F3FF', color: '#6d28d9' },
  regles:  { label: 'Règles ops',       bg: '#FFFBEB', color: '#b45309' },
  autre:   { label: 'Autre',            bg: '#F1F5F9', color: '#64748b' },
}

const CARRIER_COLORS: Record<string, { bg: string; color: string }> = {
  DHL:             { bg: '#FFFBEB', color: '#b45309' },
  Bpost:           { bg: '#EEF4FB', color: '#094D80' },
  GLS:             { bg: '#F0FDF4', color: '#15803d' },
  DPD:             { bg: '#FEE2E2', color: '#dc2626' },
  PostNL:          { bg: '#FFF1F2', color: '#e11d48' },
  'Mondial Relay': { bg: '#F5F3FF', color: '#6d28d9' },
  UPS:             { bg: '#FFFBEB', color: '#92400e' },
  Multi:           { bg: '#F1F5F9', color: '#64748b' },
}

const INITIAL_DOCS: Doc[] = [
  {
    id: 'd1', name: 'DHL Express — Grille tarifaire 2026',
    docType: 'grille', carrier: 'DHL', serviceType: 'transport',
    description: 'Tarifs DHL Express Europe & International — zones, poids, surcharges',
    isAttached: false, usedInPricing: true, isArchived: false, currentVersionId: 'v1b',
    versions: [
      { id: 'v1b', vNum: 2, filename: 'DHL_Express_Tarifs_2026_v2.xlsx', size: '1,4 Mo', date: '2026-02-15', note: 'Mise à jour surcharges carburant Q1 2026' },
      { id: 'v1a', vNum: 1, filename: 'DHL_Express_Tarifs_2026_v1.xlsx', size: '1,2 Mo', date: '2026-01-01', note: 'Grille initiale 2026' },
    ],
  },
  {
    id: 'd2', name: 'Bpost Parcel — Grille tarifaire 2026',
    docType: 'grille', carrier: 'Bpost', serviceType: 'transport',
    description: 'Tarifs Bpost Parcel — Belgique, France, Pays-Bas, zones de livraison',
    isAttached: false, usedInPricing: true, isArchived: false, currentVersionId: 'v2a',
    versions: [
      { id: 'v2a', vNum: 1, filename: 'Bpost_Parcel_Tarifs_2026.xlsx', size: '890 Ko', date: '2026-01-15', note: 'Grille initiale 2026' },
    ],
  },
  {
    id: 'd3', name: 'GLS France — Grille tarifaire 2026',
    docType: 'grille', carrier: 'GLS', serviceType: 'transport',
    description: 'Tarifs GLS France — dépôts directs et express, zones domestiques',
    isAttached: false, usedInPricing: true, isArchived: false, currentVersionId: 'v3a',
    versions: [
      { id: 'v3a', vNum: 1, filename: 'GLS_France_Tarifs_2026.xlsx', size: '720 Ko', date: '2026-01-20', note: 'Grille initiale 2026' },
    ],
  },
  {
    id: 'd4', name: 'Surcharges carburant Q2 2026',
    docType: 'grille', carrier: 'Multi', serviceType: 'surcharge',
    description: 'Indices de surcharges carburant tous transporteurs — actualisés chaque trimestre',
    isAttached: false, usedInPricing: true, isArchived: false, currentVersionId: 'v4a',
    versions: [
      { id: 'v4a', vNum: 1, filename: 'Surcharges_Carburant_Q2_2026.xlsx', size: '210 Ko', date: '2026-03-01', note: 'Indices Q2 2026 — DHL, Bpost, GLS, DPD' },
    ],
  },
  {
    id: 'd5', name: 'Conditions Générales de Vente',
    docType: 'contrat',
    description: 'Document légal Brain E-Log SRL — joint à toutes les offres commerciales',
    isAttached: true, usedInPricing: false, isArchived: false, currentVersionId: 'v5c',
    versions: [
      { id: 'v5c', vNum: 3, filename: 'CGV_BrainELog_2026_v3.pdf', size: '245 Ko', date: '2026-03-14', note: 'Mise à jour de la clause de responsabilité transport' },
      { id: 'v5b', vNum: 2, filename: 'CGV_BrainELog_2026_v2.pdf', size: '238 Ko', date: '2026-02-01', note: 'Révision des conditions TVA intracommunautaire' },
      { id: 'v5a', vNum: 1, filename: 'CGV_BrainELog_2025.pdf',    size: '220 Ko', date: '2025-03-13', note: 'Version initiale' },
    ],
  },
  {
    id: 'd6', name: 'Règles opérationnelles entrepôt',
    docType: 'regles',
    description: 'Procédures Brain E-Log — réception, stockage, expédition, retours',
    isAttached: false, usedInPricing: false, isArchived: false, currentVersionId: 'v6b',
    versions: [
      { id: 'v6b', vNum: 2, filename: 'Regles_Ops_BrainELog_v2.pdf', size: '340 Ko', date: '2026-03-01', note: 'Ajout procédures retours et reconditionnement' },
      { id: 'v6a', vNum: 1, filename: 'Regles_Ops_BrainELog_v1.pdf', size: '290 Ko', date: '2025-06-01', note: 'Version initiale' },
    ],
  },
  {
    id: 'd7', name: 'Contrat partenariat DHL 2025-2026',
    docType: 'contrat', carrier: 'DHL',
    description: 'Accord-cadre Brain E-Log × DHL — volumes, remises, conditions de service',
    isAttached: false, usedInPricing: false, isArchived: false, currentVersionId: 'v7a',
    versions: [
      { id: 'v7a', vNum: 1, filename: 'Contrat_BrainELog_DHL_2025.pdf', size: '1,1 Mo', date: '2025-04-01', note: 'Contrat signé 2025-2026' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════
   UTILITAIRES
═══════════════════════════════════════════════════════ */
function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function fmtFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function fileExt(filename: string) {
  return (filename.split('.').pop() ?? 'FIL').toUpperCase().slice(0, 4)
}

function fileIconStyle(filename: string): CSSProperties {
  const ext = (filename.split('.').pop() ?? '').toLowerCase()
  if (ext === 'pdf')                    return { background: '#FEE2E2', color: '#dc2626' }
  if (ext === 'xlsx' || ext === 'xls') return { background: '#F0FDF4', color: '#16a34a' }
  if (ext === 'docx' || ext === 'doc') return { background: '#EEF4FB', color: '#094D80' }
  return { background: 'var(--gray-100)', color: 'var(--gray-600)' }
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

/* ═══════════════════════════════════════════════════════
   STYLES PARTAGÉS
═══════════════════════════════════════════════════════ */
const inp: CSSProperties = {
  display: 'block', width: '100%', padding: '8px 12px',
  fontSize: 13, color: 'var(--gray-900)', background: '#fff',
  border: '1px solid var(--border)', borderRadius: 8,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}
const txa: CSSProperties = { ...inp, resize: 'vertical', lineHeight: 1.6 }
const sel: CSSProperties = { ...inp, cursor: 'pointer' }
const cardStyle: CSSProperties = {
  background: '#fff', border: '1px solid var(--border)',
  borderRadius: 12, overflow: 'hidden', marginBottom: 16,
}

/* ═══════════════════════════════════════════════════════
   COMPOSANTS UI PARTAGÉS
═══════════════════════════════════════════════════════ */
function Card({ title, desc, badge, children }: { title: string; desc?: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <div style={cardStyle}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>{title}</p>
          {desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</p>}
        </div>
        {badge}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function G2({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>{children}</div>
}

function F({ label, hint, span2, children }: { label: string; hint?: string; span2?: boolean; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 14, gridColumn: span2 ? 'span 2' : 'span 1' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 5 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{hint}</p>}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{
      position: 'relative', display: 'inline-flex', width: 36, height: 20, borderRadius: 99,
      border: 'none', cursor: 'pointer', flexShrink: 0,
      background: checked ? 'var(--primary)' : 'var(--gray-200)', transition: 'background 0.15s',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16,
        borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.15s',
      }} />
    </button>
  )
}

function TRow({ label, desc, checked, onChange, last }: {
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void; last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0',
      borderBottom: last ? 'none' : '1px solid var(--gray-50)',
    }}>
      <div style={{ paddingRight: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-900)' }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--gray-50)' }}>
      <Icon size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-900)' }}>{value || '—'}</span>
    </div>
  )
}

function Code({ children }: { children: ReactNode }) {
  return <code style={{ fontSize: 11, background: 'var(--gray-100)', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>{children}</code>
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500,
      background: ok ? '#F0FDF4' : '#FEF9C3', border: `1px solid ${ok ? '#bbf7d0' : '#fde68a'}`,
      color: ok ? '#15803d' : '#b45309',
    }}>
      <CheckCircle2 size={11} />
      {label}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   QUESTIONNAIRE CONFIG — types & helpers
═══════════════════════════════════════════════════════ */
interface QFieldCfg { enabled: boolean; required: boolean }
interface QSectionCfg { enabled: boolean; fields: Record<string, QFieldCfg> }
type QCfg = Record<string, QSectionCfg>

function buildDefaultQCfg(loaded: { sections: Record<string, Partial<QSectionCfg>> }): QCfg {
  const result: QCfg = {}
  for (const section of QUESTIONNAIRE_SCHEMA.sections) {
    const loadedSec = loaded.sections[section.id] ?? {}
    const fields: Record<string, QFieldCfg> = {}
    for (const field of section.fields) {
      const loadedF = loadedSec.fields?.[field.id] ?? {}
      fields[field.id] = {
        enabled: loadedF.enabled !== false,
        required: loadedF.required !== undefined ? loadedF.required : field.required,
      }
    }
    result[section.id] = {
      enabled: loadedSec.enabled !== false,
      fields,
    }
  }
  return result
}

function qCfgToPayload(cfg: QCfg) {
  const sections: Record<string, unknown> = {}
  for (const section of QUESTIONNAIRE_SCHEMA.sections) {
    const sec = cfg[section.id]
    const fields: Record<string, unknown> = {}
    for (const field of section.fields) {
      const f = sec.fields[field.id]
      fields[field.id] = { enabled: f.enabled, required: f.required }
    }
    sections[section.id] = { enabled: sec.enabled, fields }
  }
  return { sections }
}

const FIELD_TYPE_LABEL: Record<string, string> = {
  text: 'Texte', url: 'URL', textarea: 'Zone texte', toggle: 'Oui/Non',
  radio_cards: 'Choix unique', icon_grid: 'Grille icônes', slider: 'Curseur',
  multi_select: 'Multi-choix', price_range: 'Fourchette €', geo_split: 'Géo %',
  scale_3: 'Échelle 3', logo_picker: 'Logos', timeline_sel: 'Timeline',
}

/* ═══════════════════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════════════════════ */
export default function ParametresPage() {
  const [tab, setTab] = useState<TabId>('entreprise')
  const [s, setS] = useState<S>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  // Questionnaire config editor state
  const [qCfg, setQCfg] = useState<QCfg>({})
  const [qExpanded, setQExpanded] = useState<Set<string>>(new Set())
  const [qSaving, setQSaving] = useState(false)
  const [qSaved, setQSaved] = useState(false)

  useEffect(() => {
    fetch('/api/questionnaire-config')
      .then(r => r.json())
      .then(data => setQCfg(buildDefaultQCfg(data)))
      .catch(() => setQCfg(buildDefaultQCfg({ sections: {} })))
  }, [])

  const toggleQSection = useCallback((sId: string) => {
    setQCfg(prev => ({ ...prev, [sId]: { ...prev[sId], enabled: !prev[sId].enabled } }))
  }, [])

  const toggleQField = useCallback((sId: string, fId: string) => {
    setQCfg(prev => ({
      ...prev,
      [sId]: { ...prev[sId], fields: { ...prev[sId].fields, [fId]: { ...prev[sId].fields[fId], enabled: !prev[sId].fields[fId].enabled } } },
    }))
  }, [])

  const toggleQRequired = useCallback((sId: string, fId: string) => {
    setQCfg(prev => ({
      ...prev,
      [sId]: { ...prev[sId], fields: { ...prev[sId].fields, [fId]: { ...prev[sId].fields[fId], required: !prev[sId].fields[fId].required } } },
    }))
  }, [])

  const toggleQExpanded = useCallback((sId: string) => {
    setQExpanded(prev => { const n = new Set(prev); n.has(sId) ? n.delete(sId) : n.add(sId); return n })
  }, [])

  async function saveQCfg() {
    setQSaving(true)
    try {
      await fetch('/api/questionnaire-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(qCfgToPayload(qCfg)) })
      setQSaved(true)
      setTimeout(() => setQSaved(false), 2500)
    } finally {
      setQSaving(false)
    }
  }

  // Documents state
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS)
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set(['d5']))
  const [uploadTarget, setUploadTarget] = useState<string | null>(null)
  const [pendingNote, setPendingNote] = useState('')
  const [addingDoc, setAddingDoc] = useState(false)
  const [newDocForm, setNewDocForm] = useState({
    name: '', docType: 'grille' as DocType,
    carrier: '', serviceType: 'transport' as ServiceType,
    description: '', note: '',
  })
  const [newDocFile, setNewDocFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const newDocFileRef = useRef<HTMLInputElement>(null)

  function upd(k: keyof S, v: string | boolean) {
    setS(p => ({ ...p, [k]: v }))
    setSaved(false)
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // ── Documents helpers ──
  function toggleExpand(id: string) {
    setExpandedDocs(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAttach(id: string) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, isAttached: !d.isAttached } : d))
    setSaved(false)
  }

  function togglePricing(id: string) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, usedInPricing: !d.usedInPricing } : d))
    setSaved(false)
  }

  function archiveDoc(id: string) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, isArchived: !d.isArchived, isAttached: false } : d))
    setSaved(false)
  }

  function setCurrentVersion(docId: string, versionId: string) {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, currentVersionId: versionId } : d))
    setSaved(false)
  }

  function openUpload(docId: string) {
    setUploadTarget(docId)
    setPendingNote('')
    fileRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !uploadTarget) { e.target.value = ''; return }
    const doc = docs.find(d => d.id === uploadTarget)
    if (!doc) return
    const maxV = Math.max(...doc.versions.map(v => v.vNum))
    const newV: DocVersion = {
      id: uid(), vNum: maxV + 1,
      filename: file.name,
      size: fmtFileSize(file.size),
      date: new Date().toISOString().split('T')[0],
      note: pendingNote || `Version ${maxV + 1}`,
    }
    setDocs(prev => prev.map(d => d.id === uploadTarget ? {
      ...d, currentVersionId: newV.id, versions: [newV, ...d.versions],
    } : d))
    setExpandedDocs(prev => new Set([...prev, uploadTarget]))
    setUploadTarget(null)
    setSaved(false)
    e.target.value = ''
  }

  function handleAddDoc() {
    if (!newDocForm.name || !newDocFile) return
    const v1: DocVersion = {
      id: uid(), vNum: 1,
      filename: newDocFile.name,
      size: fmtFileSize(newDocFile.size),
      date: new Date().toISOString().split('T')[0],
      note: newDocForm.note || 'Version initiale',
    }
    const d: Doc = {
      id: uid(),
      name: newDocForm.name,
      docType: newDocForm.docType,
      ...(newDocForm.docType === 'grille' && newDocForm.carrier ? { carrier: newDocForm.carrier } : {}),
      ...(newDocForm.docType === 'grille' ? { serviceType: newDocForm.serviceType } : {}),
      description: newDocForm.description,
      isAttached: false, usedInPricing: newDocForm.docType === 'grille', isArchived: false,
      currentVersionId: v1.id, versions: [v1],
    }
    setDocs(prev => [d, ...prev])
    setAddingDoc(false)
    setNewDocForm({ name: '', docType: 'grille', carrier: '', serviceType: 'transport', description: '', note: '' })
    setNewDocFile(null)
    setSaved(false)
  }

  const initials = `${s.contactPrenom[0] ?? ''}${s.contactNom[0] ?? ''}`.toUpperCase()
  const grillesDocs  = docs.filter(d => !d.isArchived && d.docType === 'grille')
  const contratsDocs = docs.filter(d => !d.isArchived && d.docType !== 'grille')
  const archivedDocs = docs.filter(d => d.isArchived)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark-navy)', letterSpacing: '-0.02em' }}>Paramètres</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Configuration globale de la plateforme Brain E-Log</p>
        </div>
        <button onClick={save} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: '#fff',
          background: saved ? '#16a34a' : 'var(--primary)', transition: 'background 0.2s',
        }}>
          {saved ? <><Check size={14} /> Enregistré</> : <><Save size={14} /> Enregistrer</>}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left nav */}
        <nav style={{
          width: 220, flexShrink: 0, borderRight: '1px solid var(--border)',
          background: 'var(--gray-50)', padding: '10px 8px',
          display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto',
        }}>
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: active ? '#fff' : 'transparent',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.07)' : 'none',
                textAlign: 'left', width: '100%',
              }}>
                <Icon size={15} style={{ color: active ? 'var(--primary)' : 'var(--gray-400)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? 'var(--gray-900)' : 'var(--gray-600)', lineHeight: 1.3 }}>
                    {t.label}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, lineHeight: 1.3 }}>{t.desc}</p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* ── ENTREPRISE ── */}
          {tab === 'entreprise' && <>
            <Card title="Identité de l'entreprise" desc="Affichée sur les offres, emails et le portail prospect">
              <G2>
                <F label="Raison sociale" span2>
                  <input style={inp} value={s.raisonSociale} onChange={e => upd('raisonSociale', e.target.value)} />
                </F>
                <F label="Tagline" span2>
                  <input style={inp} value={s.tagline} onChange={e => upd('tagline', e.target.value)} />
                </F>
                <F label="Secteur d'activité" hint="Non modifiable">
                  <input style={{ ...inp, background: 'var(--gray-50)', color: 'var(--text-muted)' }} value={s.secteur} readOnly />
                </F>
                <F label="Site web">
                  <input style={inp} type="url" value={s.siteWeb} onChange={e => upd('siteWeb', e.target.value)} />
                </F>
              </G2>
            </Card>
            <Card title="Informations légales">
              <G2>
                <F label="SIRET">
                  <input style={inp} value={s.siret} onChange={e => upd('siret', e.target.value)} placeholder="000 000 000 00000" />
                </F>
                <F label="N° TVA intracommunautaire">
                  <input style={inp} value={s.tvaIntra} onChange={e => upd('tvaIntra', e.target.value)} placeholder="BE 0000.000.000" />
                </F>
              </G2>
            </Card>
            <Card title="Adresse du siège social">
              <G2>
                <F label="Rue & numéro" span2>
                  <input style={inp} value={s.adresse} onChange={e => upd('adresse', e.target.value)} placeholder="Rue de l'Entrepôt, 42" />
                </F>
                <F label="Code postal">
                  <input style={inp} value={s.codePostal} onChange={e => upd('codePostal', e.target.value)} />
                </F>
                <F label="Ville">
                  <input style={inp} value={s.ville} onChange={e => upd('ville', e.target.value)} />
                </F>
                <F label="Pays">
                  <select style={sel} value={s.pays} onChange={e => upd('pays', e.target.value)}>
                    {['Belgique','France','Luxembourg','Pays-Bas','Allemagne','Suisse'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </F>
              </G2>
            </Card>
            <Card title="Coordonnées de contact">
              <G2>
                <F label="Email général">
                  <input style={inp} type="email" value={s.emailContact} onChange={e => upd('emailContact', e.target.value)} />
                </F>
                <F label="Téléphone">
                  <input style={inp} type="tel" value={s.telephone} onChange={e => upd('telephone', e.target.value)} placeholder="+32 (0)xxx xx xx xx" />
                </F>
              </G2>
            </Card>
          </>}

          {/* ── COMMERCIAL ── */}
          {tab === 'commercial' && <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 12, marginBottom: 16,
              background: 'linear-gradient(135deg, #EEF4FB 0%, #F8FAFC 100%)', border: '1px solid #d0e4f5',
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 99, flexShrink: 0, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{initials || '?'}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>{s.contactPrenom} {s.contactNom}</p>
                <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, marginTop: 1 }}>{s.contactFonction}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, color: 'var(--gray-600)' }}>{s.contactEmail}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 2 }}>{s.contactTelephone}</p>
              </div>
            </div>
            <Card title="Contact principal — affiché sur les offres"
              desc="Nom, fonction, email et téléphone insérés automatiquement sur chaque offre générée"
              badge={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sur les offres</span>
                  <Toggle checked={s.contactApparaitOffres} onChange={v => upd('contactApparaitOffres', v)} />
                </div>
              }
            >
              <G2>
                <F label="Prénom">
                  <input style={inp} value={s.contactPrenom} onChange={e => upd('contactPrenom', e.target.value)} />
                </F>
                <F label="Nom">
                  <input style={inp} value={s.contactNom} onChange={e => upd('contactNom', e.target.value)} />
                </F>
                <F label="Fonction / Titre">
                  <input style={inp} value={s.contactFonction} onChange={e => upd('contactFonction', e.target.value)} />
                </F>
                <F label="Email professionnel">
                  <input style={inp} type="email" value={s.contactEmail} onChange={e => upd('contactEmail', e.target.value)} />
                </F>
                <F label="Téléphone direct" span2>
                  <input style={inp} type="tel" value={s.contactTelephone} onChange={e => upd('contactTelephone', e.target.value)} />
                </F>
              </G2>
            </Card>
            <Card title="Aperçu — bloc contact sur les offres">
              <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '14px 16px' }}>
                <InfoRow icon={Hash} label="Nom complet" value={`${s.contactPrenom} ${s.contactNom}`} />
                <InfoRow icon={Hash} label="Fonction" value={s.contactFonction} />
                <InfoRow icon={Mail} label="Email" value={s.contactEmail} />
                <InfoRow icon={Phone} label="Téléphone" value={s.contactTelephone} />
              </div>
            </Card>
          </>}

          {/* ── OFFRES ── */}
          {tab === 'offres' && <>
            <Card title="Génération des offres" desc="Format d'export, durée de validité et date limite globale">
              <G2>
                <F label="Format d'export par défaut">
                  <select style={sel} value={s.offreFormatExport} onChange={e => upd('offreFormatExport', e.target.value)}>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="word">Word (.docx)</option>
                  </select>
                </F>
                <F label="Durée de validité par défaut">
                  <select style={sel} value={s.offreValiditeJours} onChange={e => upd('offreValiditeJours', e.target.value)}>
                    <option value="15">15 jours</option>
                    <option value="30">30 jours</option>
                    <option value="60">60 jours</option>
                    <option value="90">90 jours</option>
                  </select>
                </F>
                <F label="Valable jusqu'au (date limite globale)" hint="Appliquée si antérieure à la durée relative">
                  <input style={inp} type="date" value={s.offreValiditeJusquAu} onChange={e => upd('offreValiditeJusquAu', e.target.value)} />
                </F>
              </G2>
              <div style={{ marginTop: 4 }}>
                <TRow label="Logo Brain E-Log sur la page de garde" checked={s.offreLogo} onChange={v => upd('offreLogo', v)} />
                <TRow label="Clause de confidentialité automatique" desc="Mention insérée en en-tête de la grille tarifaire" checked={s.offreClauseConf} onChange={v => upd('offreClauseConf', v)} last />
              </div>
            </Card>
            <Card title="Tarification & affichage des prix">
              <G2>
                <F label="Affichage des prix">
                  <select style={sel} value={s.offreAffichage} onChange={e => upd('offreAffichage', e.target.value)}>
                    <option value="HT">Hors Taxes (HT)</option>
                    <option value="TTC">Toutes Taxes Comprises (TTC)</option>
                  </select>
                </F>
                <F label="Taux TVA par défaut">
                  <select style={sel} value={s.offreTVA} onChange={e => upd('offreTVA', e.target.value)}>
                    <option value="21">21 % — Belgique</option>
                    <option value="20">20 % — France</option>
                    <option value="0">0 % — B2B intracommunautaire</option>
                  </select>
                </F>
                <F label="Arrondi des ajustements en masse">
                  <select style={sel} value={s.offreArrondi} onChange={e => upd('offreArrondi', e.target.value)}>
                    <option value="0.01">0,01 €</option>
                    <option value="0.05">0,05 €</option>
                    <option value="0.10">0,10 €</option>
                    <option value="0.50">0,50 €</option>
                    <option value="1.00">1,00 €</option>
                  </select>
                </F>
              </G2>
            </Card>
            <Card title="Contenu récurrent des offres">
              <F label="Mentions légales / pied de page">
                <textarea style={{ ...txa, minHeight: 72 }} value={s.offreMentionsLegales} onChange={e => upd('offreMentionsLegales', e.target.value)} rows={3} />
              </F>
              <F label="Bloc signature expéditeur">
                <textarea style={{ ...txa, minHeight: 88 }} value={s.offreSignature} onChange={e => upd('offreSignature', e.target.value)} rows={4} />
              </F>
            </Card>
          </>}

          {/* ── CGV ── */}
          {tab === 'conditions' && <>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#EEF4FB', border: '1px solid #d0e4f5', marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                Ces 5 clauses sont insérées dans l&apos;onglet <strong>Conditions</strong> de chaque offre Excel générée. Les variables entre accolades sont remplacées automatiquement.
              </p>
            </div>
            <Card title="§ 1 — Cadre de l'offre">
              <F label="Texte" hint="Variable disponible : {nom_client}">
                <textarea style={{ ...txa, minHeight: 72 }} value={s.cgvCadre} onChange={e => upd('cgvCadre', e.target.value)} rows={3} />
              </F>
            </Card>
            <Card title="§ 2 — Validité & conditions">
              <F label="Texte" hint="Variables : {date_limite} · {volume_min} (calculé depuis le questionnaire)">
                <textarea style={{ ...txa, minHeight: 96 }} value={s.cgvValidite} onChange={e => upd('cgvValidite', e.target.value)} rows={4} />
              </F>
            </Card>
            <Card title="§ 3 — Prix & fiscalité">
              <F label="Texte">
                <textarea style={{ ...txa, minHeight: 96 }} value={s.cgvPrix} onChange={e => upd('cgvPrix', e.target.value)} rows={4} />
              </F>
            </Card>
            <Card title="§ 4 — Paiements" desc="IBAN et délai standard affichés sur toutes les offres et factures">
              <G2>
                <F label="IBAN de paiement">
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <input style={{ ...inp, paddingLeft: 32, fontFamily: 'monospace', letterSpacing: '0.04em', fontWeight: 600 }}
                      value={s.iban} onChange={e => upd('iban', e.target.value)} placeholder="BE00 0000 0000 0000" />
                  </div>
                </F>
                <F label="Délai de paiement standard">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input style={{ ...inp, width: 72 }} type="number" min="0" value={s.delaiPaiement} onChange={e => upd('delaiPaiement', e.target.value)} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>jours</span>
                  </div>
                </F>
              </G2>
              <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 8, background: 'var(--gray-50)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.7 }}>
                <strong>Aperçu sur les offres :</strong> &ldquo;Nos factures sont payables sur le compte bancaire&nbsp;:
                <strong style={{ fontFamily: 'monospace', marginLeft: 4 }}>{s.iban || '—'}</strong>.
                Notre délai de paiement standard est de <strong>{s.delaiPaiement}&nbsp;jours</strong>.&rdquo;
              </div>
            </Card>
            <Card title="§ 5 — Responsabilité">
              <F label="Texte">
                <textarea style={{ ...txa, minHeight: 96 }} value={s.cgvResponsabilite} onChange={e => upd('cgvResponsabilite', e.target.value)} rows={4} />
              </F>
            </Card>
          </>}

          {/* ════════════════════════════════════════════════════════
              DOCUMENTS — Bibliothèque avec versioning
          ════════════════════════════════════════════════════════ */}
          {tab === 'documents' && <>

            {/* File inputs cachés */}
            <input ref={fileRef}       type="file" accept=".pdf,.xlsx,.xls,.docx,.doc" style={{ display: 'none' }} onChange={handleFileChange} />
            <input ref={newDocFileRef} type="file" accept=".pdf,.xlsx,.xls,.docx,.doc" style={{ display: 'none' }} onChange={e => { setNewDocFile(e.target.files?.[0] ?? null); e.target.value = '' }} />

            {/* Barre d'action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>Bibliothèque de documents</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {grillesDocs.filter(d => d.usedInPricing).length} grille{grillesDocs.filter(d => d.usedInPricing).length > 1 ? 's' : ''} en pricing ·{' '}
                  {docs.filter(d => !d.isArchived && d.isAttached).length} annexé{docs.filter(d => !d.isArchived && d.isAttached).length > 1 ? 's' : ''} aux offres ·{' '}
                  {docs.filter(d => !d.isArchived).length} actifs au total
                </p>
              </div>
              {!addingDoc && (
                <button onClick={() => setAddingDoc(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, background: 'var(--primary)', color: '#fff',
                }}>
                  <Plus size={14} /> Ajouter un document
                </button>
              )}
            </div>

            {/* ── Formulaire nouveau document ── */}
            {addingDoc && (
              <div style={{ ...cardStyle, border: '2px dashed var(--primary)', marginBottom: 20 }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: '#EEF4FB' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>Nouveau document</p>
                </div>
                <div style={{ padding: 20 }}>
                  <G2>
                    <F label="Nom du document" span2>
                      <input style={inp} value={newDocForm.name} onChange={e => setNewDocForm(p => ({ ...p, name: e.target.value }))} placeholder="ex : CGV 2027, Tarifs GLS, Règlement intérieur…" autoFocus />
                    </F>
                    <F label="Type de document">
                      <select style={sel} value={newDocForm.docType} onChange={e => setNewDocForm(p => ({ ...p, docType: e.target.value as DocType }))}>
                        {(Object.keys(DOCTYPE) as DocType[]).map(k => <option key={k} value={k}>{DOCTYPE[k].label}</option>)}
                      </select>
                    </F>
                    <F label="Note de version v1" hint="Décrit le contenu de cette première version">
                      <input style={inp} value={newDocForm.note} onChange={e => setNewDocForm(p => ({ ...p, note: e.target.value }))} placeholder="Version initiale" />
                    </F>
                    {newDocForm.docType === 'grille' && <>
                      <F label="Transporteur">
                        <select style={sel} value={newDocForm.carrier} onChange={e => setNewDocForm(p => ({ ...p, carrier: e.target.value }))}>
                          <option value="">— Sélectionner —</option>
                          {['DHL', 'Bpost', 'GLS', 'DPD', 'PostNL', 'Mondial Relay', 'UPS', 'Multi'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </F>
                      <F label="Type de service">
                        <select style={sel} value={newDocForm.serviceType} onChange={e => setNewDocForm(p => ({ ...p, serviceType: e.target.value as ServiceType }))}>
                          <option value="transport">Transport</option>
                          <option value="surcharge">Surcharge carburant</option>
                          <option value="assurance">Assurance</option>
                          <option value="douane">Douane</option>
                          <option value="autre">Autre</option>
                        </select>
                      </F>
                    </>}
                    <F label="Description" span2>
                      <input style={inp} value={newDocForm.description} onChange={e => setNewDocForm(p => ({ ...p, description: e.target.value }))} placeholder="À quoi sert ce document ?" />
                    </F>
                  </G2>
                  {/* File pick */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 16 }}>
                    <button type="button" onClick={() => newDocFileRef.current?.click()} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                      background: '#fff', fontSize: 13, color: 'var(--gray-700)', cursor: 'pointer',
                    }}>
                      <Upload size={14} style={{ color: 'var(--primary)' }} />
                      {newDocFile ? newDocFile.name : 'Choisir un fichier (PDF, Excel, Word)'}
                    </button>
                    {newDocFile && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtFileSize(newDocFile.size)}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleAddDoc} disabled={!newDocForm.name || !newDocFile} style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, background: 'var(--primary)', color: '#fff',
                      opacity: !newDocForm.name || !newDocFile ? 0.5 : 1,
                    }}>
                      Ajouter
                    </button>
                    <button onClick={() => { setAddingDoc(false); setNewDocFile(null) }} style={{
                      padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
                      background: '#fff', fontSize: 13, color: 'var(--gray-700)', cursor: 'pointer',
                    }}>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Grilles tarifaires transporteurs ── */}
            {grillesDocs.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Truck size={13} style={{ color: '#15803d' }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Grilles tarifaires transporteurs ({grillesDocs.length})
                  </p>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #bbf7d0', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Zap size={13} style={{ color: '#15803d', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: '#15803d', lineHeight: 1.5 }}>
                    Ces grilles (Excel) alimentent les calculs de pricing lors de la génération d&apos;offres.
                    Les tarifs transporteurs s&apos;ajoutent <strong>au-dessus</strong> des tarifs Brain E-Log (handling, stockage).
                    Activez <strong>Utilisé en pricing</strong> pour qu&apos;une grille soit intégrée au moteur de calcul.
                  </p>
                </div>
                {grillesDocs.map(doc => <DocCard key={doc.id} doc={doc} expanded={expandedDocs.has(doc.id)} onToggleExpand={() => toggleExpand(doc.id)} onToggleAttach={() => toggleAttach(doc.id)} onTogglePricing={() => togglePricing(doc.id)} onArchive={() => archiveDoc(doc.id)} onSetVersion={vId => setCurrentVersion(doc.id, vId)} onNewVersion={() => openUpload(doc.id)} />)}
              </>
            )}

            {/* ── Contrats, annexes, règles ── */}
            {contratsDocs.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: grillesDocs.length > 0 ? 16 : 0, marginBottom: 10 }}>
                  <Paperclip size={13} style={{ color: 'var(--primary)' }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Contrats, annexes & règles ({contratsDocs.length})
                  </p>
                </div>
                {contratsDocs.map(doc => <DocCard key={doc.id} doc={doc} expanded={expandedDocs.has(doc.id)} onToggleExpand={() => toggleExpand(doc.id)} onToggleAttach={() => toggleAttach(doc.id)} onTogglePricing={() => togglePricing(doc.id)} onArchive={() => archiveDoc(doc.id)} onSetVersion={vId => setCurrentVersion(doc.id, vId)} onNewVersion={() => openUpload(doc.id)} />)}
              </>
            )}

            {/* ── Archivés ── */}
            {archivedDocs.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 10 }}>
                  <Archive size={13} style={{ color: 'var(--gray-400)' }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Archivés ({archivedDocs.length})
                  </p>
                </div>
                {archivedDocs.map(doc => <DocCard key={doc.id} doc={doc} expanded={expandedDocs.has(doc.id)} onToggleExpand={() => toggleExpand(doc.id)} onToggleAttach={() => toggleAttach(doc.id)} onTogglePricing={() => togglePricing(doc.id)} onArchive={() => archiveDoc(doc.id)} onSetVersion={vId => setCurrentVersion(doc.id, vId)} onNewVersion={() => openUpload(doc.id)} />)}
              </>
            )}
          </>}

          {/* ── QUESTIONNAIRE ── */}
          {tab === 'questionnaire' && <>
            <Card title="Liens & délais">
              <G2>
                <F label="Validité du lien questionnaire" hint="Le lien devient inactif après cette durée">
                  <select style={sel} value={s.validiteLien} onChange={e => upd('validiteLien', e.target.value)}>
                    {['7','14','30','60'].map(v => <option key={v} value={v}>{v} jours</option>)}
                  </select>
                </F>
                <F label="Rappel avant expiration">
                  <select style={sel} value={s.rappelJoursAvant} onChange={e => upd('rappelJoursAvant', e.target.value)}>
                    <option value="0">Désactivé</option>
                    <option value="3">3 jours avant</option>
                    <option value="7">7 jours avant</option>
                    <option value="14">14 jours avant</option>
                  </select>
                </F>
              </G2>
            </Card>
            <Card title="Messages affichés sur le portail prospect">
              <F label="Message d'accueil" hint="Première étape du formulaire">
                <textarea style={{ ...txa, minHeight: 88 }} value={s.messageAccueil} onChange={e => upd('messageAccueil', e.target.value)} rows={3} />
              </F>
              <F label="Message de confirmation" hint="Affiché après validation">
                <textarea style={{ ...txa, minHeight: 88 }} value={s.messageConfirmation} onChange={e => upd('messageConfirmation', e.target.value)} rows={3} />
              </F>
            </Card>
            <Card title="Expéditeur des emails questionnaire">
              <G2>
                <F label="Nom de l'expéditeur">
                  <input style={inp} value={s.nomExpediteur} onChange={e => upd('nomExpediteur', e.target.value)} />
                </F>
                <F label="Adresse email d'envoi" hint="Requiert un SMTP configuré">
                  <input style={inp} type="email" value={s.emailExpediteur} onChange={e => upd('emailExpediteur', e.target.value)} />
                </F>
              </G2>
            </Card>
            <Card title="Sections du questionnaire" desc="8 sections — 97 champs (Q1 à Q8)">
              {[
                { id: 'Q1', label: 'Identité & base article', n: 15 },
                { id: 'Q2', label: 'Réception & approvisionnement', n: 13 },
                { id: 'Q3', label: 'Stockage', n: 10 },
                { id: 'Q4', label: 'Préparation de commandes', n: 14 },
                { id: 'Q5', label: 'Packaging & colisage', n: 10 },
                { id: 'Q6', label: 'Expédition', n: 15 },
                { id: 'Q7', label: 'Gestion des retours', n: 9 },
                { id: 'Q8', label: 'Informations complémentaires', n: 11 },
              ].map((q, i, arr) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', background: '#EEF4FB', padding: '2px 7px', borderRadius: 99, fontFamily: 'monospace' }}>{q.id}</span>
                    <span style={{ fontSize: 13, color: 'var(--gray-800)' }}>{q.label}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{q.n} champs</span>
                </div>
              ))}
            </Card>
          </>}

          {/* ── NOTIFICATIONS ── */}
          {tab === 'notifications' && <>
            <Card title="Questionnaire prospect">
              <TRow label="Notification à réception d'un questionnaire complété" desc="Email dès qu'un prospect finalise les 8 sections" checked={s.notifQuestionnaire} onChange={v => upd('notifQuestionnaire', v)} last />
              {s.notifQuestionnaire && <div style={{ paddingTop: 14 }}><F label="Email de réception"><input style={inp} type="email" value={s.emailNotifQuestionnaire} onChange={e => upd('emailNotifQuestionnaire', e.target.value)} /></F></div>}
            </Card>
            <Card title="Offres commerciales">
              <TRow label="Offre acceptée par un prospect" checked={s.notifOffreAcceptee} onChange={v => upd('notifOffreAcceptee', v)} />
              <TRow label="Offre refusée par un prospect" checked={s.notifOffreRefusee} onChange={v => upd('notifOffreRefusee', v)} last />
              {(s.notifOffreAcceptee || s.notifOffreRefusee) && <div style={{ paddingTop: 14 }}><F label="Email de réception"><input style={inp} type="email" value={s.emailNotifOffre} onChange={e => upd('emailNotifOffre', e.target.value)} /></F></div>}
            </Card>
            <Card title="Résumés & alertes système">
              <TRow label="Résumé quotidien d'activité" desc="Email chaque matin : prospects, offres, relances" checked={s.resumeQuotidien} onChange={v => upd('resumeQuotidien', v)} />
              <TRow label="Alerte modification de tarifs" checked={s.alertesTarifs} onChange={v => upd('alertesTarifs', v)} last />
            </Card>
          </>}

          {/* ── INTÉGRATIONS ── */}
          {tab === 'integrations' && <>
            <Card title="Base de données — Supabase" badge={<StatusBadge ok label="Connexion active" />}>
              <G2>
                <F label="URL du projet" hint="Via NEXT_PUBLIC_SUPABASE_URL dans .env.local" span2>
                  <input style={{ ...inp, background: 'var(--gray-50)', color: 'var(--text-muted)' }} value="Configuré via variable d'environnement" readOnly />
                </F>
              </G2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Modifiez <Code>NEXT_PUBLIC_SUPABASE_URL</Code> et <Code>NEXT_PUBLIC_SUPABASE_ANON_KEY</Code> dans <Code>.env.local</Code>.</p>
            </Card>
            <Card title="Historique des versions (tarifs)">
              <G2>
                <F label="Snapshots maximum par groupe tarifaire" hint="Les plus anciens sont supprimés au-delà de la limite">
                  <select style={sel} value={s.maxSnapshots} onChange={e => upd('maxSnapshots', e.target.value)}>
                    {['5','10','15','20','30'].map(v => <option key={v} value={v}>{v} snapshots{v === '15' ? ' (défaut)' : ''}</option>)}
                  </select>
                </F>
              </G2>
            </Card>
            <Card title="Email transactionnel (SMTP)">
              <G2>
                <F label="Hôte SMTP"><input style={inp} value={s.smtpHost} onChange={e => upd('smtpHost', e.target.value)} placeholder="smtp.sendgrid.net" /></F>
                <F label="Port">
                  <select style={sel} value={s.smtpPort} onChange={e => upd('smtpPort', e.target.value)}>
                    <option value="25">25</option><option value="465">465 (SSL)</option>
                    <option value="587">587 (TLS)</option><option value="2525">2525</option>
                  </select>
                </F>
                <F label="Identifiant SMTP"><input style={inp} value={s.smtpUser} onChange={e => upd('smtpUser', e.target.value)} placeholder="apikey" /></F>
                <F label="Mot de passe / Clé API"><input style={inp} type="password" value={s.smtpPassword} onChange={e => upd('smtpPassword', e.target.value)} placeholder="••••••••" /></F>
              </G2>
            </Card>
            <Card title="WMS — Synchronisation entrepôt">
              <G2>
                <F label="URL du webhook WMS" span2>
                  <input style={inp} type="url" value={s.wmsWebhookUrl} onChange={e => upd('wmsWebhookUrl', e.target.value)} placeholder="https://wms.exemple.com/webhook/brain-elog" />
                </F>
              </G2>
            </Card>
            <Card title="CRM — Gestion de la relation client">
              <G2>
                <F label="CRM utilisé">
                  <select style={sel} value={s.crmType} onChange={e => upd('crmType', e.target.value)}>
                    <option value="aucun">Aucun</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="pipedrive">Pipedrive</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="autre">Autre</option>
                  </select>
                </F>
                {s.crmType !== 'aucun' && <F label="Clé API"><input style={inp} type="password" value={s.crmApiKey} onChange={e => upd('crmApiKey', e.target.value)} placeholder="••••••••" /></F>}
              </G2>
            </Card>
          </>}

        </main>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   DOCUMENT CARD — composant autonome
═══════════════════════════════════════════════════════ */
function DocCard({ doc, expanded, onToggleExpand, onToggleAttach, onTogglePricing, onArchive, onSetVersion, onNewVersion }: {
  doc: Doc
  expanded: boolean
  onToggleExpand: () => void
  onToggleAttach: () => void
  onTogglePricing: () => void
  onArchive: () => void
  onSetVersion: (id: string) => void
  onNewVersion: () => void
}) {
  const dtype = DOCTYPE[doc.docType]
  const carrierStyle = doc.carrier ? (CARRIER_COLORS[doc.carrier] ?? CARRIER_COLORS['Multi']) : null
  const currentV = doc.versions.find(v => v.id === doc.currentVersionId) ?? doc.versions[0]
  const ext = fileExt(currentV?.filename ?? '')
  const iconS = fileIconStyle(currentV?.filename ?? '')
  const isGrille = doc.docType === 'grille'

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
      marginBottom: 10, overflow: 'hidden',
      opacity: doc.isArchived ? 0.65 : 1,
    }}>
      {/* Top section */}
      <div style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* File type badge */}
          <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, fontFamily: 'monospace', ...iconS }}>
            {ext}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>{doc.name}</p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: dtype.bg, color: dtype.color }}>
                {dtype.label}
              </span>
              {carrierStyle && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: carrierStyle.bg, color: carrierStyle.color }}>
                  {doc.carrier}
                </span>
              )}
              {doc.serviceType && doc.serviceType !== 'transport' && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
                  {doc.serviceType}
                </span>
              )}
              {doc.usedInPricing && !doc.isArchived && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#F0FDF4', color: '#15803d', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Zap size={9} /> Pricing actif
                </span>
              )}
              {doc.isAttached && !doc.isArchived && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#EEF4FB', color: '#094D80' }}>
                  ● Annexé aux offres
                </span>
              )}
              {doc.isArchived && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
                  Archivé
                </span>
              )}
            </div>
            {doc.description && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{doc.description}</p>
            )}
            {currentV && (
              <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
                <strong>v{currentV.vNum}</strong> · {currentV.filename} · {currentV.size} · {fmtDate(currentV.date)}
              </p>
            )}
          </div>

          {/* Toggles */}
          {!doc.isArchived && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              {isGrille && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Utilisé en pricing</span>
                  <Toggle checked={doc.usedInPricing} onChange={onTogglePricing} />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Annexé aux offres</span>
                <Toggle checked={doc.isAttached} onChange={onToggleAttach} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version history toggle */}
      <button onClick={onToggleExpand} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 18px', background: 'var(--gray-50)', border: 'none', borderTop: '1px solid var(--border)',
        cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
          Historique — {doc.versions.length} version{doc.versions.length > 1 ? 's' : ''}
        </span>
        {expanded
          ? <ChevronDown size={14} style={{ color: 'var(--gray-400)' }} />
          : <ChevronRight size={14} style={{ color: 'var(--gray-400)' }} />}
      </button>

      {/* Version list */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {doc.versions.map((v, i) => {
            const isCurrent = v.id === doc.currentVersionId
            return (
              <div key={v.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px',
                borderBottom: i < doc.versions.length - 1 ? '1px solid var(--gray-50)' : 'none',
                background: isCurrent ? '#F8FCFF' : '#fff',
              }}>
                {/* Version badge */}
                <span style={{
                  fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                  padding: '2px 7px', borderRadius: 99,
                  background: isCurrent ? 'var(--primary)' : 'var(--gray-100)',
                  color: isCurrent ? '#fff' : 'var(--gray-600)',
                  flexShrink: 0,
                }}>
                  v{v.vNum}
                </span>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 400, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.note || v.filename}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    {v.filename} · {v.size} · {fmtDate(v.date)}
                  </p>
                </div>

                {/* Action */}
                {isCurrent ? (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#15803d', background: '#F0FDF4', padding: '3px 8px', borderRadius: 99, flexShrink: 0 }}>
                    Actuelle
                  </span>
                ) : !doc.isArchived ? (
                  <button onClick={() => onSetVersion(v.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                    borderRadius: 6, border: '1px solid var(--border)', background: '#fff',
                    fontSize: 12, color: 'var(--gray-600)', cursor: 'pointer', flexShrink: 0,
                  }}>
                    <RotateCcw size={11} /> Appliquer
                  </button>
                ) : null}
              </div>
            )
          })}

          {/* Footer actions */}
          {!doc.isArchived && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderTop: '1px solid var(--gray-50)', background: 'var(--gray-50)', flexWrap: 'wrap' }}>
              <button onClick={onNewVersion} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                borderRadius: 7, border: 'none', background: 'var(--primary)', color: '#fff',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                <Upload size={12} /> Nouvelle version
              </button>
              {isGrille && (
                <button onClick={onTogglePricing} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                  borderRadius: 7, border: '1px solid var(--border)', background: doc.usedInPricing ? '#F0FDF4' : '#fff',
                  fontSize: 12, color: doc.usedInPricing ? '#15803d' : 'var(--gray-700)', cursor: 'pointer', fontWeight: doc.usedInPricing ? 600 : 400,
                }}>
                  <BarChart3 size={12} /> {doc.usedInPricing ? 'Retirer du pricing' : 'Activer en pricing'}
                </button>
              )}
              <button onClick={onToggleAttach} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                borderRadius: 7, border: '1px solid var(--border)', background: '#fff',
                fontSize: 12, color: 'var(--gray-700)', cursor: 'pointer',
              }}>
                <Paperclip size={12} /> {doc.isAttached ? 'Retirer des offres' : 'Annexer aux offres'}
              </button>
              <button onClick={onArchive} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', marginLeft: 'auto',
                borderRadius: 7, border: '1px solid var(--border)', background: '#fff',
                fontSize: 12, color: 'var(--gray-500)', cursor: 'pointer',
              }}>
                <Archive size={12} /> Archiver
              </button>
            </div>
          )}
          {doc.isArchived && (
            <div style={{ padding: '10px 18px', borderTop: '1px solid var(--gray-50)', background: 'var(--gray-50)' }}>
              <button onClick={onArchive} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                borderRadius: 7, border: '1px solid var(--border)', background: '#fff',
                fontSize: 12, color: 'var(--gray-700)', cursor: 'pointer',
              }}>
                <RotateCcw size={12} /> Restaurer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
