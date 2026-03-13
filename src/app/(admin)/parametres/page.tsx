'use client'

import { useState } from 'react'
import type { ReactNode, CSSProperties, ElementType } from 'react'
import {
  Building2, UserCheck, FileText, ShieldCheck, ClipboardList, Bell, Plug,
  Save, Check, CheckCircle2, Mail, Phone, Euro, CreditCard, Calendar,
  Globe, MapPin, Hash,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════════════════ */
type TabId = 'entreprise' | 'commercial' | 'offres' | 'conditions' | 'questionnaire' | 'notifications' | 'integrations'

const TABS: { id: TabId; label: string; icon: ElementType; desc: string }[] = [
  { id: 'entreprise',    label: 'Entreprise',    icon: Building2,    desc: 'Société & informations légales' },
  { id: 'commercial',    label: 'Commercial',    icon: UserCheck,    desc: 'Équipe & contacts sur les offres' },
  { id: 'offres',        label: 'Offres',        icon: FileText,     desc: 'Génération, affichage & tarification' },
  { id: 'conditions',    label: 'CGV',           icon: ShieldCheck,  desc: 'Conditions générales de vente' },
  { id: 'questionnaire', label: 'Questionnaire', icon: ClipboardList,desc: 'Liens, délais & messages prospect' },
  { id: 'notifications', label: 'Notifications', icon: Bell,         desc: 'Alertes & résumés par email' },
  { id: 'integrations',  label: 'Intégrations',  icon: Plug,         desc: 'Supabase, SMTP, CRM, WMS' },
]

/* ═══════════════════════════════════════════════════════════════════
   STATE TYPE
═══════════════════════════════════════════════════════════════════ */
interface S {
  // Entreprise
  raisonSociale: string; tagline: string; siret: string; tvaIntra: string
  adresse: string; codePostal: string; ville: string; pays: string
  telephone: string; emailContact: string; siteWeb: string; secteur: string

  // Commercial — contact qui apparaît sur les offres
  contactPrenom: string; contactNom: string; contactFonction: string
  contactEmail: string; contactTelephone: string; contactApparaitOffres: boolean

  // Offres — génération & présentation
  offreFormatExport: string; offreValiditeJours: string; offreValiditeJusquAu: string
  offreLogo: boolean; offreClauseConf: boolean
  offreTVA: string; offreAffichage: string; offreArrondi: string
  offreMentionsLegales: string; offreSignature: string

  // CGV
  cgvCadre: string; cgvValidite: string; cgvPrix: string
  iban: string; delaiPaiement: string; cgvResponsabilite: string

  // Questionnaire
  validiteLien: string; rappelJoursAvant: string
  messageAccueil: string; messageConfirmation: string
  nomExpediteur: string; emailExpediteur: string

  // Notifications
  notifQuestionnaire: boolean; emailNotifQuestionnaire: string
  notifOffreAcceptee: boolean; notifOffreRefusee: boolean; emailNotifOffre: string
  resumeQuotidien: boolean; alertesTarifs: boolean

  // Intégrations
  smtpHost: string; smtpPort: string; smtpUser: string; smtpPassword: string
  wmsWebhookUrl: string; crmType: string; crmApiKey: string; maxSnapshots: string
}

const DEFAULTS: S = {
  raisonSociale: 'Brain E-Log SRL',
  tagline: 'Votre partenaire logistique e-commerce',
  siret: '',
  tvaIntra: 'BE 0000.000.000',
  adresse: '',
  codePostal: '',
  ville: 'Bruxelles',
  pays: 'Belgique',
  telephone: '',
  emailContact: 'contact@brain-log.com',
  siteWeb: 'https://brain-log.com',
  secteur: 'Logistique 3PL',

  contactPrenom: 'Mathieu',
  contactNom: 'Pichelin',
  contactFonction: 'Managing Partner',
  contactEmail: 'mathieu.pichelin@brain-log.com',
  contactTelephone: '+32 472 17 88 31',
  contactApparaitOffres: true,

  offreFormatExport: 'pdf',
  offreValiditeJours: '30',
  offreValiditeJusquAu: '2026-12-31',
  offreLogo: true,
  offreClauseConf: true,
  offreTVA: '21',
  offreAffichage: 'HT',
  offreArrondi: '0.05',
  offreMentionsLegales: "Tarifs exprimés hors taxes. Valables pour la durée indiquée sur l'offre. Brain E-Log SRL — TVA BE 0000.000.000.",
  offreSignature: 'Mathieu Pichelin\nManaging Partner — Brain E-Log SRL\ntél. +32 472 17 88 31\nmathieu.pichelin@brain-log.com',

  cgvCadre:
    "Cette offre est valable uniquement entre Brain E-Log SRL et le prospect désigné en page de garde.",
  cgvValidite:
    "Offre valable jusqu'au 31/12/2026.\nLes prix présentés ne couvrent que les activités décrites dans ce document. Tout service supplémentaire sera facturé au client sur base de nos conditions générales de vente.",
  cgvPrix:
    "Nos prix sont en euros HTVA.\nLa TVA n'est pas applicable quand il s'agit d'une facturation intracommunautaire.\nToute augmentation de TVA ou toute nouvelle taxe imposée par les autorités fiscales belges sera appliquée conformément à la loi belge.",
  iban: 'BE84 0689 0320 9059',
  delaiPaiement: '14',
  cgvResponsabilite:
    "La responsabilité de Brain E-Log s'arrête là où celle des transporteurs démarre. S'appliquent alors leurs conditions générales de vente.\nBrain E-Log pourra aider à la résolution des problèmes de transport (dommages, objets perdus) grâce à sa relation avec les compagnies de transport. Cela fera l'objet de suppléments.",

  validiteLien: '30',
  rappelJoursAvant: '7',
  messageAccueil:
    "Bienvenue sur notre formulaire de qualification. Merci de renseigner vos besoins logistiques avec précision afin que nous puissions vous proposer l'offre la plus adaptée.",
  messageConfirmation:
    "Merci ! Votre questionnaire a bien été transmis à l'équipe Brain E-Log. Nous vous recontacterons dans les 48 heures ouvrées.",
  nomExpediteur: 'Brain E-Log',
  emailExpediteur: 'no-reply@brain-log.com',

  notifQuestionnaire: true,
  emailNotifQuestionnaire: 'mathieu.pichelin@brain-log.com',
  notifOffreAcceptee: true,
  notifOffreRefusee: true,
  emailNotifOffre: 'mathieu.pichelin@brain-log.com',
  resumeQuotidien: false,
  alertesTarifs: true,

  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  wmsWebhookUrl: '',
  crmType: 'aucun',
  crmApiKey: '',
  maxSnapshots: '15',
}

/* ═══════════════════════════════════════════════════════════════════
   STYLES PARTAGÉS
═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANTS UI
═══════════════════════════════════════════════════════════════════ */
function Card({ title, desc, badge, children }: { title: string; desc?: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <div style={cardStyle}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 5 }}>
        {label}
      </label>
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

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12, marginTop: 4 }}>
      {children}
    </p>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function ParametresPage() {
  const [tab, setTab] = useState<TabId>('entreprise')
  const [s, setS] = useState<S>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  function upd(k: keyof S, v: string | boolean) {
    setS(p => ({ ...p, [k]: v }))
    setSaved(false)
  }

  function save() {
    // TODO: persister en Supabase (table app_settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const initials = `${s.contactPrenom[0] ?? ''}${s.contactNom[0] ?? ''}`.toUpperCase()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ── */}
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

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left nav ── */}
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

        {/* ── Content ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* ════════════════════════════ ENTREPRISE ════════════════════════════ */}
          {tab === 'entreprise' && <>
            <Card title="Identité de l'entreprise" desc="Affichée sur les offres, emails et le portail prospect">
              <G2>
                <F label="Raison sociale" span2>
                  <input style={inp} value={s.raisonSociale} onChange={e => upd('raisonSociale', e.target.value)} />
                </F>
                <F label="Tagline" span2>
                  <input style={inp} value={s.tagline} onChange={e => upd('tagline', e.target.value)} placeholder="Votre partenaire logistique…" />
                </F>
                <F label="Secteur d'activité" hint="Non modifiable">
                  <input style={{ ...inp, background: 'var(--gray-50)', color: 'var(--text-muted)' }} value={s.secteur} readOnly />
                </F>
                <F label="Site web">
                  <input style={inp} type="url" value={s.siteWeb} onChange={e => upd('siteWeb', e.target.value)} />
                </F>
              </G2>
            </Card>

            <Card title="Informations légales" desc="SIRET, numéro de TVA intracommunautaire">
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
                  <input style={inp} value={s.codePostal} onChange={e => upd('codePostal', e.target.value)} placeholder="1000" />
                </F>
                <F label="Ville">
                  <input style={inp} value={s.ville} onChange={e => upd('ville', e.target.value)} />
                </F>
                <F label="Pays">
                  <select style={sel} value={s.pays} onChange={e => upd('pays', e.target.value)}>
                    {['Belgique', 'France', 'Luxembourg', 'Pays-Bas', 'Allemagne', 'Suisse'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </F>
              </G2>
            </Card>

            <Card title="Coordonnées de contact">
              <G2>
                <F label="Email général de contact">
                  <input style={inp} type="email" value={s.emailContact} onChange={e => upd('emailContact', e.target.value)} />
                </F>
                <F label="Téléphone de l'entreprise">
                  <input style={inp} type="tel" value={s.telephone} onChange={e => upd('telephone', e.target.value)} placeholder="+32 (0)xxx xx xx xx" />
                </F>
              </G2>
            </Card>
          </>}

          {/* ════════════════════════════ COMMERCIAL ════════════════════════════ */}
          {tab === 'commercial' && <>

            {/* Contact card — preview */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 20px', borderRadius: 12, marginBottom: 16,
              background: 'linear-gradient(135deg, #EEF4FB 0%, #F8FAFC 100%)',
              border: '1px solid #d0e4f5',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 99, flexShrink: 0,
                background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{initials || '?'}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>
                  {s.contactPrenom} {s.contactNom}
                </p>
                <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, marginTop: 1 }}>{s.contactFonction}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, color: 'var(--gray-600)' }}>{s.contactEmail}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 2 }}>{s.contactTelephone}</p>
              </div>
            </div>

            <Card
              title="Contact principal — affiché sur les offres"
              desc="Ce contact apparaît sur la page de garde et dans la signature de chaque offre générée"
              badge={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Apparaît sur les offres</span>
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
                  <input style={inp} value={s.contactFonction} onChange={e => upd('contactFonction', e.target.value)} placeholder="Managing Partner" />
                </F>
                <F label="Email professionnel">
                  <input style={inp} type="email" value={s.contactEmail} onChange={e => upd('contactEmail', e.target.value)} />
                </F>
                <F label="Téléphone direct" span2>
                  <input style={inp} type="tel" value={s.contactTelephone} onChange={e => upd('contactTelephone', e.target.value)} placeholder="+32 (0)xxx xx xx xx" />
                </F>
              </G2>
            </Card>

            <Card title="Aperçu — informations de contact sur les offres" desc="Tel qu'affiché dans le bloc contact Brain E-Log de la page de garde">
              <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.8 }}>
                <p><strong>Contact Brain E-Log :</strong></p>
                <InfoRow icon={Hash} label="Nom complet" value={`${s.contactPrenom} ${s.contactNom}`} />
                <InfoRow icon={Hash} label="Fonction" value={s.contactFonction} />
                <InfoRow icon={Mail} label="Email" value={s.contactEmail} />
                <InfoRow icon={Phone} label="Téléphone" value={s.contactTelephone} />
              </div>
            </Card>
          </>}

          {/* ════════════════════════════ OFFRES ════════════════════════════ */}
          {tab === 'offres' && <>
            <Card title="Génération des offres" desc="Format d'export et durée de validité appliquée par défaut">
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
                <F label="Valable jusqu'au (date limite globale)" hint="Surchargée la durée relative si antérieure">
                  <input style={inp} type="date" value={s.offreValiditeJusquAu} onChange={e => upd('offreValiditeJusquAu', e.target.value)} />
                </F>
              </G2>
              <div style={{ marginTop: 4 }}>
                <TRow label="Logo Brain E-Log sur la page de garde" desc="Le logo est affiché en en-tête de chaque offre" checked={s.offreLogo} onChange={v => upd('offreLogo', v)} />
                <TRow label="Clause de confidentialité automatique" desc="Mention de confidentialité ajoutée en en-tête de la grille tarifaire" checked={s.offreClauseConf} onChange={v => upd('offreClauseConf', v)} last />
              </div>
            </Card>

            <Card title="Tarification & affichage des prix" desc="Paramètres appliqués à la grille tarifaire des offres">
              <G2>
                <F label="Affichage des prix">
                  <select style={sel} value={s.offreAffichage} onChange={e => upd('offreAffichage', e.target.value)}>
                    <option value="HT">Hors Taxes (HT) — défaut</option>
                    <option value="TTC">Toutes Taxes Comprises (TTC)</option>
                  </select>
                </F>
                <F label="Taux TVA par défaut">
                  <select style={sel} value={s.offreTVA} onChange={e => upd('offreTVA', e.target.value)}>
                    <option value="21">21 % — Belgique</option>
                    <option value="20">20 % — France</option>
                    <option value="19">19 % — Allemagne</option>
                    <option value="17">17 % — Luxembourg</option>
                    <option value="0">0 % — Exonéré / B2B intracommunautaire</option>
                  </select>
                </F>
                <F label="Arrondi des ajustements en masse" hint="Appliqué lors des modifications en bloc dans le gestionnaire de tarifs">
                  <select style={sel} value={s.offreArrondi} onChange={e => upd('offreArrondi', e.target.value)}>
                    <option value="0.01">0,01 € (au centime)</option>
                    <option value="0.05">0,05 €</option>
                    <option value="0.10">0,10 €</option>
                    <option value="0.50">0,50 €</option>
                    <option value="1.00">1,00 € (à l'euro)</option>
                  </select>
                </F>
              </G2>
            </Card>

            <Card title="Contenu récurrent des offres" desc="Textes insérés automatiquement dans chaque offre générée">
              <F label="Mentions légales / pied de page" hint="SIRET, TVA, durée de validité, conditions sommaires">
                <textarea style={{ ...txa, minHeight: 72 }} value={s.offreMentionsLegales} onChange={e => upd('offreMentionsLegales', e.target.value)} rows={3} />
              </F>
              <F label="Bloc signature expéditeur" hint="Affiché en bas de l'offre — auto-alimenté depuis l'onglet Commercial">
                <textarea style={{ ...txa, minHeight: 88 }} value={s.offreSignature} onChange={e => upd('offreSignature', e.target.value)} rows={4} />
              </F>
            </Card>
          </>}

          {/* ════════════════════════════ CONDITIONS DE VENTE ════════════════════════════ */}
          {tab === 'conditions' && <>

            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#EEF4FB', border: '1px solid #d0e4f5', marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                Ces textes sont automatiquement insérés dans l&apos;onglet <strong>Conditions</strong> de chaque offre Excel générée.
              </p>
            </div>

            <Card title="§ 1 — Cadre de l'offre" desc="Définit les parties entre lesquelles l'offre est valable">
              <F label="Texte" hint="La mention '{nom_client}' sera remplacée par le nom du prospect">
                <textarea style={{ ...txa, minHeight: 72 }} value={s.cgvCadre} onChange={e => upd('cgvCadre', e.target.value)} rows={3} />
              </F>
            </Card>

            <Card title="§ 2 — Validité & conditions" desc="Durée de validité, volume minimum, services couverts">
              <F label="Texte" hint="La mention '{date_limite}' sera remplacée par la date configurée dans l'onglet Offres. '{volume_min}' par le volume minimum calculé depuis le questionnaire.">
                <textarea style={{ ...txa, minHeight: 100 }} value={s.cgvValidite} onChange={e => upd('cgvValidite', e.target.value)} rows={4} />
              </F>
            </Card>

            <Card title="§ 3 — Prix & fiscalité" desc="Mention HTVA, TVA intracommunautaire et clause fiscale">
              <F label="Texte">
                <textarea style={{ ...txa, minHeight: 88 }} value={s.cgvPrix} onChange={e => upd('cgvPrix', e.target.value)} rows={4} />
              </F>
            </Card>

            <Card title="§ 4 — Paiements" desc="IBAN, délai standard, pénalités de retard">
              <G2>
                <F label="IBAN de paiement" hint="Affiché sur toutes les offres et factures">
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <input style={{ ...inp, paddingLeft: 32, fontFamily: 'monospace', letterSpacing: '0.05em', fontWeight: 600 }}
                      value={s.iban} onChange={e => upd('iban', e.target.value)} placeholder="BE00 0000 0000 0000" />
                  </div>
                </F>
                <F label="Délai de paiement standard" hint="En jours ouvrés — après date de facture">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input style={{ ...inp, width: 80 }} type="number" min="0" value={s.delaiPaiement} onChange={e => upd('delaiPaiement', e.target.value)} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>jours</span>
                  </div>
                </F>
              </G2>
              <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 8, background: 'var(--gray-50)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.6 }}>
                <strong>Sur les offres :</strong> &ldquo;Nos factures sont payables sur le compte bancaire : <strong style={{ fontFamily: 'monospace' }}>{s.iban || '—'}</strong>. Notre délai de paiement standard est de <strong>{s.delaiPaiement} jours</strong>. Les retards entraîneront des pénalités conformément à nos CGV.&rdquo;
              </div>
            </Card>

            <Card title="§ 5 — Responsabilité" desc="Périmètre de responsabilité Brain E-Log vs transporteurs">
              <F label="Texte">
                <textarea style={{ ...txa, minHeight: 100 }} value={s.cgvResponsabilite} onChange={e => upd('cgvResponsabilite', e.target.value)} rows={4} />
              </F>
            </Card>
          </>}

          {/* ════════════════════════════ QUESTIONNAIRE ════════════════════════════ */}
          {tab === 'questionnaire' && <>
            <Card title="Liens & délais" desc="Durée de vie des liens envoyés aux prospects et rappels automatiques">
              <G2>
                <F label="Validité du lien questionnaire" hint="Le lien devient inactif après cette durée">
                  <select style={sel} value={s.validiteLien} onChange={e => upd('validiteLien', e.target.value)}>
                    <option value="7">7 jours</option>
                    <option value="14">14 jours</option>
                    <option value="30">30 jours</option>
                    <option value="60">60 jours</option>
                  </select>
                </F>
                <F label="Rappel avant expiration" hint="Email de relance envoyé au prospect X jours avant">
                  <select style={sel} value={s.rappelJoursAvant} onChange={e => upd('rappelJoursAvant', e.target.value)}>
                    <option value="0">Désactivé</option>
                    <option value="3">3 jours avant</option>
                    <option value="7">7 jours avant</option>
                    <option value="14">14 jours avant</option>
                  </select>
                </F>
              </G2>
            </Card>

            <Card title="Messages affichés sur le portail prospect" desc="Textes personnalisables sur le formulaire questionnaire public (/prospect/[token])">
              <F label="Message d'accueil" hint="Affiché sur la première étape — présente Brain E-Log et rassure le prospect">
                <textarea style={{ ...txa, minHeight: 88 }} value={s.messageAccueil} onChange={e => upd('messageAccueil', e.target.value)} rows={3} />
              </F>
              <F label="Message de confirmation" hint="Affiché après validation et envoi — confirme la bonne réception">
                <textarea style={{ ...txa, minHeight: 88 }} value={s.messageConfirmation} onChange={e => upd('messageConfirmation', e.target.value)} rows={3} />
              </F>
            </Card>

            <Card title="Expéditeur des emails questionnaire" desc="Identité affichée dans les emails de lien envoyés aux prospects">
              <G2>
                <F label="Nom de l'expéditeur">
                  <input style={inp} value={s.nomExpediteur} onChange={e => upd('nomExpediteur', e.target.value)} placeholder="Brain E-Log" />
                </F>
                <F label="Adresse email d'envoi" hint="Requiert une configuration SMTP valide dans l'onglet Intégrations">
                  <input style={inp} type="email" value={s.emailExpediteur} onChange={e => upd('emailExpediteur', e.target.value)} />
                </F>
              </G2>
            </Card>

            <Card title="Sections du questionnaire" desc="8 sections — 97 champs au total (Q1 à Q8)">
              {[
                { id: 'Q1', label: 'Identité & base article', fields: 15 },
                { id: 'Q2', label: 'Réception & approvisionnement', fields: 13 },
                { id: 'Q3', label: 'Stockage', fields: 10 },
                { id: 'Q4', label: 'Préparation de commandes', fields: 14 },
                { id: 'Q5', label: 'Packaging & colisage', fields: 10 },
                { id: 'Q6', label: 'Expédition', fields: 15 },
                { id: 'Q7', label: 'Gestion des retours', fields: 9 },
                { id: 'Q8', label: 'Informations complémentaires', fields: 11 },
              ].map((q, i, arr) => (
                <div key={q.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--gray-50)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', background: '#EEF4FB', padding: '2px 7px', borderRadius: 99, fontFamily: 'monospace' }}>
                      {q.id}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--gray-800)' }}>{q.label}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{q.fields} champs</span>
                </div>
              ))}
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                Pour modifier la structure du questionnaire, éditez <Code>data/questionnaire-fields.json</Code>
              </p>
            </Card>
          </>}

          {/* ════════════════════════════ NOTIFICATIONS ════════════════════════════ */}
          {tab === 'notifications' && <>
            <Card title="Questionnaire prospect" desc="Alertes lors de la complétion ou de l'expiration d'un questionnaire">
              <TRow
                label="Notification à réception d'un questionnaire complété"
                desc="Recevoir un email dès qu'un prospect a finalisé les 8 sections"
                checked={s.notifQuestionnaire} onChange={v => upd('notifQuestionnaire', v)} last
              />
              {s.notifQuestionnaire && (
                <div style={{ paddingTop: 14 }}>
                  <F label="Adresse email de réception">
                    <input style={inp} type="email" value={s.emailNotifQuestionnaire} onChange={e => upd('emailNotifQuestionnaire', e.target.value)} />
                  </F>
                </div>
              )}
            </Card>

            <Card title="Offres commerciales" desc="Alertes liées aux réponses reçues sur les offres envoyées">
              <TRow
                label="Offre acceptée par un prospect"
                desc="Notification immédiate à chaque acceptation d'une offre"
                checked={s.notifOffreAcceptee} onChange={v => upd('notifOffreAcceptee', v)}
              />
              <TRow
                label="Offre refusée par un prospect"
                desc="Notification immédiate à chaque refus d'une offre"
                checked={s.notifOffreRefusee} onChange={v => upd('notifOffreRefusee', v)} last
              />
              {(s.notifOffreAcceptee || s.notifOffreRefusee) && (
                <div style={{ paddingTop: 14 }}>
                  <F label="Adresse email pour les alertes offres">
                    <input style={inp} type="email" value={s.emailNotifOffre} onChange={e => upd('emailNotifOffre', e.target.value)} />
                  </F>
                </div>
              )}
            </Card>

            <Card title="Résumés & alertes système">
              <TRow
                label="Résumé quotidien d'activité"
                desc="Email chaque matin avec le récapitulatif : prospects, offres envoyées, relances à faire"
                checked={s.resumeQuotidien} onChange={v => upd('resumeQuotidien', v)}
              />
              <TRow
                label="Alerte modification de tarifs"
                desc="Être notifié quand un groupe tarifaire est modifié, archivé ou dupliqué"
                checked={s.alertesTarifs} onChange={v => upd('alertesTarifs', v)} last
              />
            </Card>
          </>}

          {/* ════════════════════════════ INTÉGRATIONS ════════════════════════════ */}
          {tab === 'integrations' && <>
            <Card
              title="Base de données — Supabase"
              desc="Connexion PostgreSQL pour la persistance des données"
              badge={<StatusBadge ok label="Connexion active" />}
            >
              <G2>
                <F label="URL du projet" hint="Définie via NEXT_PUBLIC_SUPABASE_URL dans .env.local" span2>
                  <input style={{ ...inp, background: 'var(--gray-50)', color: 'var(--text-muted)' }}
                    value="Configuré via variable d'environnement" readOnly />
                </F>
              </G2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Modifiez <Code>NEXT_PUBLIC_SUPABASE_URL</Code> et <Code>NEXT_PUBLIC_SUPABASE_ANON_KEY</Code> dans votre fichier <Code>.env.local</Code>.
              </p>
            </Card>

            <Card title="Historique des versions" desc="Paramètre global de versionning des groupes tarifaires">
              <G2>
                <F label="Snapshots maximum par groupe tarifaire" hint="Les snapshots les plus anciens sont supprimés au-delà de la limite">
                  <select style={sel} value={s.maxSnapshots} onChange={e => upd('maxSnapshots', e.target.value)}>
                    <option value="5">5 snapshots</option>
                    <option value="10">10 snapshots</option>
                    <option value="15">15 snapshots (défaut)</option>
                    <option value="20">20 snapshots</option>
                    <option value="30">30 snapshots</option>
                  </select>
                </F>
              </G2>
            </Card>

            <Card title="Email transactionnel (SMTP)" desc="Serveur d'envoi pour les emails questionnaire, offres et notifications">
              <G2>
                <F label="Hôte SMTP">
                  <input style={inp} value={s.smtpHost} onChange={e => upd('smtpHost', e.target.value)} placeholder="smtp.sendgrid.net" />
                </F>
                <F label="Port">
                  <select style={sel} value={s.smtpPort} onChange={e => upd('smtpPort', e.target.value)}>
                    <option value="25">25</option>
                    <option value="465">465 (SSL)</option>
                    <option value="587">587 (TLS — recommandé)</option>
                    <option value="2525">2525</option>
                  </select>
                </F>
                <F label="Identifiant SMTP">
                  <input style={inp} value={s.smtpUser} onChange={e => upd('smtpUser', e.target.value)} placeholder="apikey" />
                </F>
                <F label="Mot de passe / Clé API">
                  <input style={inp} type="password" value={s.smtpPassword} onChange={e => upd('smtpPassword', e.target.value)} placeholder="••••••••••••" />
                </F>
              </G2>
            </Card>

            <Card title="WMS — Synchronisation entrepôt" desc="Webhook pour synchroniser Brain E-Log avec votre Warehouse Management System">
              <G2>
                <F label="URL du webhook WMS" span2 hint="Brain E-Log envoie les événements stock & commandes à cet endpoint">
                  <input style={inp} type="url" value={s.wmsWebhookUrl} onChange={e => upd('wmsWebhookUrl', e.target.value)} placeholder="https://wms.exemple.com/webhook/brain-elog" />
                </F>
              </G2>
              {!s.wmsWebhookUrl && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Non configuré — la synchronisation WMS est désactivée.</p>
              )}
            </Card>

            <Card title="CRM — Gestion de la relation client" desc="Synchronisation automatique des prospects et offres avec votre CRM">
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
                {s.crmType !== 'aucun' && (
                  <F label="Clé API du CRM">
                    <input style={inp} type="password" value={s.crmApiKey} onChange={e => upd('crmApiKey', e.target.value)} placeholder="••••••••••••" />
                  </F>
                )}
              </G2>
            </Card>
          </>}

        </main>
      </div>
    </div>
  )
}
