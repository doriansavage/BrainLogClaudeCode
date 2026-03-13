'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, ExternalLink, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Prospect } from '@/types/prospect'
import type { QuestionnaireResponse } from '@/types/prospect'
import { STATUS_CONFIG, SECTORS } from '@/types/prospect'
import { QUESTIONNAIRE_SCHEMA } from '@/lib/questionnaire'
import { ProspectIntelligence } from './ProspectIntelligence'

interface ProspectDetailProps {
  id: string
}

function StatusBadge({ status }: { status: Prospect['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  )
}

export function ProspectDetail({ id }: ProspectDetailProps) {
  const router = useRouter()
  const [prospect, setProspect] = useState<Prospect | null>(null)
  const [responses, setResponses] = useState<QuestionnaireResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/prospects/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/prospects/${id}/responses`).then(r => r.ok ? r.json() : null),
    ]).then(([p, r]) => {
      setProspect(p)
      setResponses(r?.prospectId ? r : null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  function copyLink() {
    if (!prospect) return
    const url = `${window.location.origin}/prospect/${prospect.token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function updateStatus(status: Prospect['status']) {
    if (!prospect) return
    setSaving(true)
    const res = await fetch(`/api/prospects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setProspect(updated)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`Supprimer le prospect "${prospect?.companyName}" ? Cette action est irréversible.`)) return
    await fetch(`/api/prospects/${id}`, { method: 'DELETE' })
    router.push('/prospects')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader2 size={20} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!prospect) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Prospect introuvable.</p>
        <Link href="/prospects" style={{ fontSize: 13, color: 'var(--primary)' }}>← Retour à la liste</Link>
      </div>
    )
  }

  const questionnaireUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/prospect/${prospect.token}`
  const totalSections = QUESTIONNAIRE_SCHEMA.sections.length
  const answeredSections = responses ? Object.keys(responses.answers).length : 0
  const progress = Math.round((answeredSections / totalSections) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '20px 32px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/prospects" style={{ color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>
                {prospect.companyName}
              </h1>
              <StatusBadge status={prospect.status} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {prospect.sector} · {prospect.contactName} · {prospect.contactEmail}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleDelete}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              borderRadius: 8, fontSize: 13, border: '1px solid var(--border)',
              background: '#fff', color: 'var(--danger-600)', cursor: 'pointer',
            }}
          >
            <Trash2 size={14} /> Supprimer
          </button>
          <button
            onClick={copyLink}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: copied ? 'var(--success-600)' : 'var(--primary)',
              color: '#fff', border: 'none', cursor: 'pointer', transition: 'background 150ms',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Lien copié !' : 'Copier le lien questionnaire'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Col gauche — Infos + Lien */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Lien questionnaire */}
          <div style={{
            border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px',
            background: '#fff',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              Lien questionnaire
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--border)',
            }}>
              <span style={{
                fontSize: 11, color: 'var(--gray-500)', flex: 1, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                /prospect/{prospect.token.slice(0, 16)}…
              </span>
              <a href={questionnaireUrl} target="_blank" rel="noreferrer"
                style={{ color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
                <ExternalLink size={12} />
              </a>
            </div>
            <button
              onClick={copyLink}
              style={{
                marginTop: 8, width: '100%', padding: '7px', borderRadius: 7, fontSize: 12,
                fontWeight: 500, border: '1px solid var(--border)',
                background: copied ? 'var(--success-50)' : '#fff',
                color: copied ? 'var(--success-600)' : 'var(--gray-600)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copié !' : 'Copier le lien'}
            </button>
          </div>

          {/* Statut */}
          <div style={{
            border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px',
            background: '#fff',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              Changer le statut
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  disabled={saving || prospect.status === key}
                  onClick={() => updateStatus(key as Prospect['status'])}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                    borderRadius: 7, border: 'none', cursor: prospect.status === key ? 'default' : 'pointer',
                    background: prospect.status === key ? cfg.bg : 'transparent',
                    transition: 'background 100ms', textAlign: 'left',
                  }}
                >
                  <span style={{
                    width: 7, height: 7, borderRadius: 99, flexShrink: 0,
                    background: cfg.color,
                  }} />
                  <span style={{ fontSize: 12, fontWeight: prospect.status === key ? 600 : 400, color: cfg.color }}>
                    {cfg.label}
                  </span>
                  {prospect.status === key && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: cfg.color }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Infos société */}
          <div style={{
            border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px',
            background: '#fff', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Informations
            </p>
            {[
              { label: 'Société', value: prospect.companyName },
              { label: 'Contact', value: prospect.contactName },
              { label: 'Email', value: prospect.contactEmail },
              { label: 'Secteur', value: prospect.sector },
              { label: 'Site', value: prospect.websiteUrl || '—' },
              { label: 'Créé le', value: new Date(prospect.createdAt).toLocaleDateString('fr-BE') },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 1 }}>{label}</p>
                <p style={{ fontSize: 13, color: 'var(--gray-700)', fontWeight: 500 }}>{value}</p>
              </div>
            ))}
            {prospect.notes && (
              <div>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 1 }}>Notes</p>
                <p style={{ fontSize: 12, color: 'var(--gray-600)', fontStyle: 'italic' }}>{prospect.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Col droite — Questionnaire */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Progression */}
          <div style={{
            border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px',
            background: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>
                Questionnaire
              </p>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                {answeredSections}/{totalSections} sections
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: responses?.completedAt ? 'var(--success-500)' : 'var(--primary)',
                width: `${progress}%`, borderRadius: 99, transition: 'width 500ms',
              }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>
              {responses?.completedAt
                ? `✓ Complété le ${new Date(responses.completedAt).toLocaleDateString('fr-BE')}`
                : responses
                ? `En cours — dernière activité ${new Date(responses.updatedAt).toLocaleDateString('fr-BE')}`
                : 'Le prospect n\'a pas encore commencé.'}
            </p>
          </div>

          {/* Intelligence panel */}
          <ProspectIntelligence prospect={prospect} />

          {/* Réponses par section */}
          {responses && Object.keys(responses.answers).length > 0 && (
            <div style={{
              border: '1px solid var(--border)', borderRadius: 12,
              background: '#fff', overflow: 'hidden',
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>
                  Réponses par section
                </p>
              </div>
              <div style={{ maxHeight: 480, overflow: 'auto' }}>
                {QUESTIONNAIRE_SCHEMA.sections.map((section) => {
                  const sectionAnswers = responses.answers[section.id]
                  if (!sectionAnswers) return (
                    <div key={section.id} style={{
                      padding: '12px 20px', borderBottom: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--gray-200)', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{section.title}</span>
                    </div>
                  )
                  const answered = Object.values(sectionAnswers).filter(v => v !== '').length
                  return (
                    <details key={section.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <summary style={{
                        padding: '12px 20px', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: 10, listStyle: 'none',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--success-500)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', flex: 1 }}>
                          {section.title}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                          {answered} réponse{answered > 1 ? 's' : ''}
                        </span>
                      </summary>
                      <div style={{ padding: '8px 20px 16px 36px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {section.fields.filter(f => sectionAnswers[f.id] !== undefined && sectionAnswers[f.id] !== '').map(f => (
                          <div key={f.id}>
                            <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 1 }}>{f.label}</p>
                            <p style={{ fontSize: 12, color: 'var(--gray-700)' }}>{sectionAnswers[f.id]}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
