'use client'

import { useState } from 'react'
import type { CSSProperties, ElementType } from 'react'
import {
  Building2, Euro, ClipboardList, FileText, Bell, Plug,
  Save, Check, CheckCircle2,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────── */
type TabId = 'societe' | 'tarification' | 'questionnaire' | 'offres' | 'notifications' | 'integrations'

const TABS: { id: TabId; label: string; icon: ElementType; desc: string }[] = [
  { id: 'societe',        label: 'Société',          icon: Building2,    desc: 'Identité & coordonnées' },
  { id: 'tarification',   label: 'Tarification',     icon: Euro,         desc: 'Calcul & affichage des prix' },
  { id: 'questionnaire',  label: 'Questionnaire',    icon: ClipboardList,desc: 'Liens, délais & messages' },
  { id: 'offres',         label: 'Offres',           icon: FileText,     desc: 'Export & mise en page' },
  { id: 'notifications',  label: 'Notifications',    icon: Bell,         desc: 'Alertes & résumés email' },
  { id: 'integrations',   label: 'Intégrations',     icon: Plug,         desc: 'Supabase, SMTP, CRM, WMS' },
]

interface S {
  // Société
  raisonSociale: string; tagline: string; siret: string; tvaIntra: string
  adresse: string; codePostal: string; ville: string; pays: string
  telephone: string; emailContact: string; siteWeb: string
  // Tarification
  devise: string; affichagePrix: string; tauxTVA: string; arrondiBas: string
  maxSnapshots: string; dureeValiditeOffre: string
  // Questionnaire
  validiteLien: string; rappelJoursAvant: string
  messageAccueil: string; messageConfirmation: string
  nomExpediteur: string; emailExpediteur: string
  // Offres
  formatExport: string; logoSurOffre: boolean
  mentionsLegales: string; signature: string; clauseConfidentialite: boolean
  // Notifications
  notifQuestionnaire: boolean; emailNotifQuestionnaire: string
  notifOffreAcceptee: boolean; notifOffreRefusee: boolean; emailNotifOffre: string
  resumeQuotidien: boolean; alertesTarifs: boolean
  // Intégrations
  smtpHost: string; smtpPort: string; smtpUser: string; smtpPassword: string
  wmsWebhookUrl: string; crmType: string; crmApiKey: string
}

const DEFAULTS: S = {
  raisonSociale: 'Brain E-Log',
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

  devise: 'EUR',
  affichagePrix: 'HT',
  tauxTVA: '21',
  arrondiBas: '0.05',
  maxSnapshots: '15',
  dureeValiditeOffre: '30',

  validiteLien: '30',
  rappelJoursAvant: '7',
  messageAccueil: "Bienvenue sur notre formulaire de qualification. Merci de renseigner vos besoins logistiques avec précision afin que nous puissions vous proposer l'offre la plus adaptée.",
  messageConfirmation: "Merci ! Votre questionnaire a bien été transmis à l'équipe Brain E-Log. Nous vous recontacterons dans les 48 heures ouvrées.",
  nomExpediteur: 'Brain E-Log',
  emailExpediteur: 'no-reply@brain-log.com',

  formatExport: 'pdf',
  logoSurOffre: true,
  mentionsLegales: "Tarifs exprimés hors taxes. Valables pour la durée indiquée sur l'offre. Brain E-Log SRL — TVA BE 0000.000.000.",
  signature: 'Mathieu Paternotte\nDirecteur Commercial — Brain E-Log\ntél. +32 (0)xxx xx xx xx\nmathieu@brain-log.com',
  clauseConfidentialite: true,

  notifQuestionnaire: true,
  emailNotifQuestionnaire: 'mathieu@brain-log.com',
  notifOffreAcceptee: true,
  notifOffreRefusee: true,
  emailNotifOffre: 'mathieu@brain-log.com',
  resumeQuotidien: false,
  alertesTarifs: true,

  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  wmsWebhookUrl: '',
  crmType: 'aucun',
  crmApiKey: '',
}

/* ─────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────── */
const inp: CSSProperties = {
  display: 'block', width: '100%', padding: '8px 12px',
  fontSize: 13, color: 'var(--gray-900)', background: '#fff',
  border: '1px solid var(--border)', borderRadius: 8,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}
const txa: CSSProperties = { ...inp, minHeight: 88, resize: 'vertical', lineHeight: 1.6 }
const sel: CSSProperties = { ...inp, cursor: 'pointer' }

const card: CSSProperties = {
  background: '#fff', border: '1px solid var(--border)',
  borderRadius: 12, overflow: 'hidden', marginBottom: 16,
}

/* ─────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────── */
function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={card}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>{title}</p>
        {desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</p>}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function G2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>{children}</div>
}

function F({
  label, hint, span2, children,
}: { label: string; hint?: string; span2?: boolean; children: React.ReactNode }) {
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
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative', display: 'inline-flex', width: 36, height: 20,
        borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
        background: checked ? 'var(--primary)' : 'var(--gray-200)',
        transition: 'background 0.15s',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 18 : 2,
        width: 16, height: 16, borderRadius: 99, background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.15s',
      }} />
    </button>
  )
}

function TRow({ label, desc, checked, onChange, last }: {
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void; last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: last ? 'none' : '1px solid var(--gray-50)',
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-900)' }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 8, marginBottom: 16,
      background: ok ? '#F0FDF4' : '#FEF9C3',
      border: `1px solid ${ok ? '#bbf7d0' : '#fde68a'}`,
    }}>
      <CheckCircle2 size={13} style={{ color: ok ? '#16a34a' : '#d97706' }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: ok ? '#15803d' : '#b45309' }}>{label}</span>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontSize: 11, background: 'var(--gray-100)',
      padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace',
    }}>
      {children}
    </code>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────── */
export default function ParametresPage() {
  const [tab, setTab] = useState<TabId>('societe')
  const [s, setS] = useState<S>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  function upd(k: keyof S, v: string | boolean) {
    setS(p => ({ ...p, [k]: v }))
    setSaved(false)
  }

  function save() {
    // TODO: persister en Supabase
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark-navy)', letterSpacing: '-0.02em' }}>
            Paramètres
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Configuration globale de l&apos;application
          </p>
        </div>
        <button onClick={save} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: '#fff',
          background: saved ? '#16a34a' : 'var(--primary)',
          transition: 'background 0.2s',
        }}>
          {saved ? <><Check size={14} /> Enregistré</> : <><Save size={14} /> Enregistrer</>}
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left nav */}
        <nav style={{
          width: 216, flexShrink: 0, borderRight: '1px solid var(--border)',
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
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{t.desc}</p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* ───────────── SOCIÉTÉ ───────────── */}
          {tab === 'societe' && (
            <>
              <Card title="Identité de l'entreprise" desc="Informations affichées dans les offres, emails et le portail prospect">
                <G2>
                  <F label="Raison sociale">
                    <input style={inp} value={s.raisonSociale} onChange={e => upd('raisonSociale', e.target.value)} />
                  </F>
                  <F label="Tagline">
                    <input style={inp} value={s.tagline} onChange={e => upd('tagline', e.target.value)} placeholder="Votre partenaire logistique…" />
                  </F>
                  <F label="Site web">
                    <input style={inp} type="url" value={s.siteWeb} onChange={e => upd('siteWeb', e.target.value)} />
                  </F>
                  <F label="Secteur" hint="Non modifiable">
                    <input style={{ ...inp, background: 'var(--gray-50)', color: 'var(--text-muted)' }} value="Logistique 3PL" readOnly />
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

              <Card title="Adresse">
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
                      <option>Belgique</option>
                      <option>France</option>
                      <option>Luxembourg</option>
                      <option>Pays-Bas</option>
                      <option>Allemagne</option>
                    </select>
                  </F>
                </G2>
              </Card>

              <Card title="Coordonnées de contact">
                <G2>
                  <F label="Email de contact">
                    <input style={inp} type="email" value={s.emailContact} onChange={e => upd('emailContact', e.target.value)} />
                  </F>
                  <F label="Téléphone">
                    <input style={inp} type="tel" value={s.telephone} onChange={e => upd('telephone', e.target.value)} placeholder="+32 (0)xxx xx xx xx" />
                  </F>
                </G2>
              </Card>
            </>
          )}

          {/* ───────────── TARIFICATION ───────────── */}
          {tab === 'tarification' && (
            <>
              <Card title="Affichage & calcul" desc="Paramètres globaux appliqués aux tarifs et aux offres générées">
                <G2>
                  <F label="Devise">
                    <select style={sel} value={s.devise} onChange={e => upd('devise', e.target.value)}>
                      <option value="EUR">EUR — Euro (€)</option>
                      <option value="USD">USD — Dollar ($)</option>
                      <option value="GBP">GBP — Livre sterling (£)</option>
                      <option value="CHF">CHF — Franc suisse</option>
                    </select>
                  </F>
                  <F label="Affichage des prix" hint="Appliqué aux offres et exports">
                    <select style={sel} value={s.affichagePrix} onChange={e => upd('affichagePrix', e.target.value)}>
                      <option value="HT">Hors Taxes (HT)</option>
                      <option value="TTC">Toutes Taxes Comprises (TTC)</option>
                    </select>
                  </F>
                  <F label="Taux TVA par défaut">
                    <select style={sel} value={s.tauxTVA} onChange={e => upd('tauxTVA', e.target.value)}>
                      <option value="21">21 % (Belgique standard)</option>
                      <option value="20">20 % (France standard)</option>
                      <option value="19">19 % (Allemagne standard)</option>
                      <option value="17">17 % (Luxembourg standard)</option>
                      <option value="0">0 % (exonéré / export)</option>
                    </select>
                  </F>
                  <F label="Arrondi des prix par défaut" hint="Appliqué lors des ajustements en masse">
                    <select style={sel} value={s.arrondiBas} onChange={e => upd('arrondiBas', e.target.value)}>
                      <option value="0.01">0,01 € (au centime)</option>
                      <option value="0.05">0,05 €</option>
                      <option value="0.10">0,10 €</option>
                      <option value="0.50">0,50 €</option>
                      <option value="1.00">1,00 € (à l'euro)</option>
                    </select>
                  </F>
                </G2>
              </Card>

              <Card title="Historique des tarifs" desc="Versioning automatique des groupes tarifaires">
                <G2>
                  <F label="Snapshots max par groupe tarifaire" hint="Les plus anciens sont supprimés automatiquement au-delà de la limite">
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

              <Card title="Validité des offres" desc="Durée de validité appliquée par défaut à toute offre générée">
                <G2>
                  <F label="Durée de validité par défaut">
                    <select style={sel} value={s.dureeValiditeOffre} onChange={e => upd('dureeValiditeOffre', e.target.value)}>
                      <option value="15">15 jours</option>
                      <option value="30">30 jours</option>
                      <option value="60">60 jours</option>
                      <option value="90">90 jours</option>
                    </select>
                  </F>
                </G2>
              </Card>
            </>
          )}

          {/* ───────────── QUESTIONNAIRE ───────────── */}
          {tab === 'questionnaire' && (
            <>
              <Card title="Liens & délais" desc="Durée de vie des liens envoyés aux prospects et rappels automatiques">
                <G2>
                  <F label="Validité des liens questionnaire" hint="Le lien devient inactif après cette durée">
                    <select style={sel} value={s.validiteLien} onChange={e => upd('validiteLien', e.target.value)}>
                      <option value="7">7 jours</option>
                      <option value="14">14 jours</option>
                      <option value="30">30 jours</option>
                      <option value="60">60 jours</option>
                    </select>
                  </F>
                  <F label="Rappel automatique avant expiration" hint="Email de relance envoyé au prospect X jours avant l'expiration">
                    <select style={sel} value={s.rappelJoursAvant} onChange={e => upd('rappelJoursAvant', e.target.value)}>
                      <option value="0">Désactivé</option>
                      <option value="3">3 jours avant</option>
                      <option value="7">7 jours avant</option>
                      <option value="14">14 jours avant</option>
                    </select>
                  </F>
                </G2>
              </Card>

              <Card title="Messages affichés au prospect" desc="Textes personnalisables sur le portail questionnaire public">
                <F label="Message d'accueil" hint="Affiché sur la première étape du questionnaire">
                  <textarea style={txa} value={s.messageAccueil} onChange={e => upd('messageAccueil', e.target.value)} rows={3} />
                </F>
                <F label="Message de confirmation" hint="Affiché après validation et envoi du questionnaire">
                  <textarea style={txa} value={s.messageConfirmation} onChange={e => upd('messageConfirmation', e.target.value)} rows={3} />
                </F>
              </Card>

              <Card title="Expéditeur des emails questionnaire" desc="Identité affichée dans les emails envoyés aux prospects">
                <G2>
                  <F label="Nom de l'expéditeur">
                    <input style={inp} value={s.nomExpediteur} onChange={e => upd('nomExpediteur', e.target.value)} placeholder="Brain E-Log" />
                  </F>
                  <F label="Adresse email d'envoi" hint="Nécessite une configuration SMTP valide dans l'onglet Intégrations">
                    <input style={inp} type="email" value={s.emailExpediteur} onChange={e => upd('emailExpediteur', e.target.value)} />
                  </F>
                </G2>
              </Card>
            </>
          )}

          {/* ───────────── OFFRES ───────────── */}
          {tab === 'offres' && (
            <>
              <Card title="Génération des offres" desc="Format d'export et options d'affichage des offres commerciales">
                <G2>
                  <F label="Format d'export par défaut">
                    <select style={sel} value={s.formatExport} onChange={e => upd('formatExport', e.target.value)}>
                      <option value="pdf">PDF</option>
                      <option value="word">Word (.docx)</option>
                      <option value="excel">Excel (.xlsx)</option>
                    </select>
                  </F>
                </G2>
                <div style={{ marginTop: 4 }}>
                  <TRow
                    label="Logo Brain E-Log sur l'offre"
                    desc="Le logo est affiché en en-tête de chaque offre générée"
                    checked={s.logoSurOffre}
                    onChange={v => upd('logoSurOffre', v)}
                  />
                  <TRow
                    label="Clause de confidentialité automatique"
                    desc="Ajouter une clause de confidentialité en pied de chaque offre"
                    checked={s.clauseConfidentialite}
                    onChange={v => upd('clauseConfidentialite', v)}
                    last
                  />
                </div>
              </Card>

              <Card title="Contenu récurrent des offres" desc="Textes insérés automatiquement dans chaque offre">
                <F label="Mentions légales / pied de page" hint="SIRET, TVA, durée de validité, conditions générales courtes">
                  <textarea style={txa} value={s.mentionsLegales} onChange={e => upd('mentionsLegales', e.target.value)} rows={3} />
                </F>
                <F label="Bloc signature expéditeur" hint="Nom, titre, téléphone, email — affiché en fin d'offre">
                  <textarea style={txa} value={s.signature} onChange={e => upd('signature', e.target.value)} rows={4} />
                </F>
              </Card>
            </>
          )}

          {/* ───────────── NOTIFICATIONS ───────────── */}
          {tab === 'notifications' && (
            <>
              <Card title="Questionnaire" desc="Alertes lors du remplissage ou de l'expiration d'un questionnaire">
                <TRow
                  label="Notification à réception d'un questionnaire complété"
                  desc="Recevoir un email quand un prospect a finalisé son questionnaire"
                  checked={s.notifQuestionnaire}
                  onChange={v => upd('notifQuestionnaire', v)}
                  last
                />
                {s.notifQuestionnaire && (
                  <div style={{ paddingTop: 14 }}>
                    <F label="Email de réception">
                      <input style={inp} type="email" value={s.emailNotifQuestionnaire} onChange={e => upd('emailNotifQuestionnaire', e.target.value)} />
                    </F>
                  </div>
                )}
              </Card>

              <Card title="Offres commerciales" desc="Alertes liées aux réponses reçues sur les offres envoyées">
                <TRow
                  label="Offre acceptée par un prospect"
                  desc="Recevoir un email de notification à chaque acceptation"
                  checked={s.notifOffreAcceptee}
                  onChange={v => upd('notifOffreAcceptee', v)}
                />
                <TRow
                  label="Offre refusée par un prospect"
                  desc="Recevoir un email de notification à chaque refus"
                  checked={s.notifOffreRefusee}
                  onChange={v => upd('notifOffreRefusee', v)}
                  last
                />
                {(s.notifOffreAcceptee || s.notifOffreRefusee) && (
                  <div style={{ paddingTop: 14 }}>
                    <F label="Email de réception pour les alertes offres">
                      <input style={inp} type="email" value={s.emailNotifOffre} onChange={e => upd('emailNotifOffre', e.target.value)} />
                    </F>
                  </div>
                )}
              </Card>

              <Card title="Résumés & alertes système" desc="Récapitulatifs périodiques et alertes liées aux données internes">
                <TRow
                  label="Résumé quotidien d'activité"
                  desc="Recevoir un email chaque matin avec le récapitulatif prospects, offres et relances"
                  checked={s.resumeQuotidien}
                  onChange={v => upd('resumeQuotidien', v)}
                />
                <TRow
                  label="Alerte modification de tarifs"
                  desc="Être notifié quand des tarifs sont modifiés ou qu'un groupe est archivé"
                  checked={s.alertesTarifs}
                  onChange={v => upd('alertesTarifs', v)}
                  last
                />
              </Card>
            </>
          )}

          {/* ───────────── INTÉGRATIONS ───────────── */}
          {tab === 'integrations' && (
            <>
              <Card title="Base de données — Supabase" desc="Connexion PostgreSQL pour la persistance des données">
                <Badge ok label="Connexion Supabase active" />
                <G2>
                  <F label="URL du projet Supabase" hint="Définie via NEXT_PUBLIC_SUPABASE_URL dans .env.local" span2>
                    <input
                      style={{ ...inp, background: 'var(--gray-50)', color: 'var(--text-muted)' }}
                      value="Configuré via variable d'environnement"
                      readOnly
                    />
                  </F>
                </G2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Modifiez <Code>NEXT_PUBLIC_SUPABASE_URL</Code> et <Code>NEXT_PUBLIC_SUPABASE_ANON_KEY</Code> dans votre fichier <Code>.env.local</Code> pour changer la connexion.
                </p>
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

              <Card title="WMS — Synchronisation entrepôt" desc="Webhook de synchronisation avec votre Warehouse Management System">
                <G2>
                  <F label="URL du webhook WMS" span2 hint="Brain E-Log enverra les données aux mouvements de stock vers cet endpoint">
                    <input
                      style={inp} type="url"
                      value={s.wmsWebhookUrl}
                      onChange={e => upd('wmsWebhookUrl', e.target.value)}
                      placeholder="https://wms.exemple.com/webhook/brain-elog"
                    />
                  </F>
                </G2>
                {!s.wmsWebhookUrl && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Non configuré — la synchronisation WMS est désactivée.
                  </p>
                )}
              </Card>

              <Card title="CRM — Gestion de la relation client" desc="Synchronisation automatique des prospects avec votre outil CRM">
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
                      <input
                        style={inp} type="password"
                        value={s.crmApiKey}
                        onChange={e => upd('crmApiKey', e.target.value)}
                        placeholder="••••••••••••"
                      />
                    </F>
                  )}
                </G2>
              </Card>
            </>
          )}

        </main>
      </div>
    </div>
  )
}
