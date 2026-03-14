'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ExternalLink, Copy, Check, Loader2, Trash2, Files, AlertTriangle } from 'lucide-react'
import type { Prospect } from '@/types/prospect'
import { STATUS_CONFIG } from '@/types/prospect'

function StatusBadge({ status }: { status: Prospect['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      style={{
        fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
        background: cfg.bg, color: cfg.color,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const url = `${window.location.origin}/prospect/${token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); handleCopy() }}
      title="Copier le lien questionnaire"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 500, padding: '4px 8px', borderRadius: 6,
        border: '1px solid var(--border)',
        background: copied ? 'var(--success-50)' : '#fff',
        color: copied ? 'var(--success-600)' : 'var(--gray-500)',
        cursor: 'pointer', transition: 'all 150ms',
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copié !' : 'Lien'}
    </button>
  )
}

function ActionButton({ onClick, title, children, danger }: {
  onClick: (e: React.MouseEvent) => void
  title: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 500, padding: '4px 8px', borderRadius: 6,
        border: `1px solid ${danger ? '#fca5a5' : 'var(--border)'}`,
        background: danger ? '#FEF2F2' : '#fff',
        color: danger ? '#DC2626' : 'var(--gray-600)',
        cursor: 'pointer', transition: 'all 150ms',
      }}
    >
      {children}
    </button>
  )
}

export function ProspectsList() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('tous')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/prospects')
      .then((r) => r.json())
      .then((data) => { setProspects(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (confirmDelete !== id) { setConfirmDelete(id); return }
    await fetch(`/api/prospects/${id}`, { method: 'DELETE' })
    setProspects((prev) => prev.filter((p) => p.id !== id))
    setConfirmDelete(null)
  }

  async function handleDuplicate(id: string) {
    setDuplicating(id)
    const res = await fetch(`/api/prospects/${id}/duplicate`, { method: 'POST' })
    if (res.ok) {
      const copy = await res.json()
      setProspects((prev) => [copy, ...prev])
    }
    setDuplicating(null)
  }

  const filtered = prospects.filter((p) => {
    const matchSearch =
      search === '' ||
      p.companyName.toLowerCase().includes(search.toLowerCase()) ||
      p.contactName.toLowerCase().includes(search.toLowerCase()) ||
      p.contactEmail.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'tous' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const kpis = [
    { label: 'Total',      value: prospects.length,                                          color: 'var(--gray-800)' },
    { label: 'En cours',   value: prospects.filter(p => ['lien_envoyé','en_cours'].includes(p.status)).length, color: '#094D80' },
    { label: 'Répondus',   value: prospects.filter(p => p.status === 'répondu').length,       color: '#15803D' },
    { label: 'Acceptés',   value: prospects.filter(p => p.status === 'acceptée').length,      color: '#15803D' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '24px 32px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
              Prospects
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              Gestion des prospects et questionnaires
            </p>
          </div>
          <Link
            href="/prospects/nouveau"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'var(--primary)', color: '#fff', textDecoration: 'none',
              transition: 'opacity 150ms',
            }}
          >
            <Plus size={15} />
            Nouveau prospect
          </Link>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {kpis.map((k) => (
            <div key={k.label} style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 10,
              padding: '14px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {k.label}
              </p>
              <p style={{ fontSize: 24, fontWeight: 700, color: k.color, marginTop: 4 }}>
                {k.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un prospect…"
              style={{
                width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                border: '1px solid var(--border)', borderRadius: 8, fontSize: 13,
                background: '#fff', color: 'var(--gray-800)', outline: 'none',
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8,
              fontSize: 13, background: '#fff', color: 'var(--gray-700)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="tous">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 32px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Loader2 size={20} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8 }}>
            <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>
              {prospects.length === 0 ? 'Aucun prospect pour l\'instant.' : 'Aucun résultat pour ces filtres.'}
            </p>
            {prospects.length === 0 && (
              <Link href="/prospects/nouveau" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>
                Créer le premier prospect →
              </Link>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Société', 'Contact', 'Secteur', 'Statut', 'Date', 'Actions'].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 600,
                    color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid var(--border)', background: '#fff',
                    position: 'sticky', top: 0,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 100ms' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                    <Link href={`/prospects/${p.id}`} style={{ textDecoration: 'none' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>{p.companyName}</span>
                      {p.websiteUrl && (
                        <a href={p.websiteUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                          style={{ marginLeft: 6, color: 'var(--gray-400)', verticalAlign: 'middle' }}>
                          <ExternalLink size={11} style={{ display: 'inline' }} />
                        </a>
                      )}
                    </Link>
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                    <p style={{ fontSize: 13, color: 'var(--gray-700)' }}>{p.contactName}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{p.contactEmail}</p>
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{p.sector}</span>
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      {new Date(p.createdAt).toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap' }}>
                      <CopyLinkButton token={p.token} />
                      <Link
                        href={`/prospects/${p.id}`}
                        style={{
                          fontSize: 11, fontWeight: 500, padding: '4px 8px', borderRadius: 6,
                          border: '1px solid var(--border)', background: '#fff',
                          color: 'var(--gray-600)', textDecoration: 'none',
                        }}
                      >
                        Voir
                      </Link>
                      <ActionButton
                        onClick={(e) => { e.preventDefault(); handleDuplicate(p.id) }}
                        title="Dupliquer ce prospect"
                      >
                        {duplicating === p.id
                          ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                          : <Files size={11} />}
                      </ActionButton>
                      <ActionButton
                        onClick={(e) => { e.preventDefault(); handleDelete(p.id) }}
                        title={confirmDelete === p.id ? 'Cliquer pour confirmer la suppression' : 'Supprimer ce prospect'}
                        danger={confirmDelete === p.id}
                      >
                        {confirmDelete === p.id
                          ? <><AlertTriangle size={11} />Confirmer</>
                          : <Trash2 size={11} />}
                      </ActionButton>
                      {confirmDelete === p.id && (
                        <button
                          onClick={(e) => { e.preventDefault(); setConfirmDelete(null) }}
                          style={{
                            fontSize: 11, padding: '4px 6px', borderRadius: 6,
                            border: '1px solid var(--border)', background: '#fff',
                            color: 'var(--gray-400)', cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
