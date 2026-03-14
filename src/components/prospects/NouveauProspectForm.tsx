'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SECTORS } from '@/types/prospect'

interface FieldProps {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}

function Field({ label, required, hint, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
        {label}
        {required && <span style={{ color: 'var(--primary)', marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{hint}</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8,
  fontSize: 13, color: 'var(--gray-800)', background: '#fff', outline: 'none',
  transition: 'border-color 150ms',
}

export function NouveauProspectForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    companyName: 'Acme SRL',
    contactName: 'Jean Dupont',
    contactEmail: 'jean.dupont@acme.be',
    contactPhone: '+32 470 00 00 00',
    websiteUrl: 'https://www.acme.be',
    sector: 'Mode & Textile',
    notes: 'Lead via salon Paris — intéressé par la formule Premium',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.companyName || !form.contactName || !form.contactEmail || !form.sector || !form.contactPhone) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erreur lors de la création.')
        return
      }

      const prospect = await res.json()
      router.push(`/prospects/${prospect.id}`)
    } catch {
      setError('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        padding: '20px 32px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <Link href="/prospects" style={{ color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>
            Nouveau prospect
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Un lien questionnaire unique sera généré automatiquement.
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{
            padding: '12px 16px', borderRadius: 8, background: 'var(--primary-50)',
            border: '1px solid var(--primary-100)', fontSize: 12, color: 'var(--primary)',
          }}>
            💡 Après création, le lien du questionnaire sera envoyé automatiquement par WhatsApp.
          </div>

          {/* Section Société */}
          <div style={{
            border: '1px solid var(--border)', borderRadius: 12, padding: '20px',
            background: '#fff', display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Société
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Nom de la société" required>
                <input
                  style={inputStyle}
                  value={form.companyName}
                  onChange={(e) => set('companyName', e.target.value)}
                  placeholder="Acme SRL"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </Field>

              <Field label="Secteur" required>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.sector}
                  onChange={(e) => set('sector', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                >
                  <option value="">Choisir…</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Site web" hint="URL du site e-commerce">
              <input
                style={inputStyle}
                value={form.websiteUrl}
                onChange={(e) => set('websiteUrl', e.target.value)}
                placeholder="https://www.acme.com"
                type="url"
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </Field>
          </div>

          {/* Section Contact */}
          <div style={{
            border: '1px solid var(--border)', borderRadius: 12, padding: '20px',
            background: '#fff', display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Contact
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Nom du contact" required>
                <input
                  style={inputStyle}
                  value={form.contactName}
                  onChange={(e) => set('contactName', e.target.value)}
                  placeholder="Jean Dupont"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </Field>

              <Field label="Téléphone / WhatsApp" required hint="Format international : +32 470 00 00 00">
                <input
                  style={inputStyle}
                  value={form.contactPhone}
                  onChange={(e) => set('contactPhone', e.target.value)}
                  placeholder="+32 470 00 00 00"
                  type="tel"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </Field>
            </div>

            <Field label="Email" required>
              <input
                style={inputStyle}
                value={form.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)}
                placeholder="jean@acme.com"
                type="email"
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </Field>
          </div>

          {/* Notes */}
          <div style={{
            border: '1px solid var(--border)', borderRadius: 12, padding: '20px',
            background: '#fff',
          }}>
            <Field label="Notes internes" hint="Contexte, origine du prospect, commentaires…">
              <textarea
                style={{ ...inputStyle, resize: 'none', height: 80, fontFamily: 'inherit' }}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Ex : Lead via salon Paris — intéressé par la formule Premium"
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </Field>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--danger-600)', fontWeight: 500 }}>⚠ {error}</p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: loading ? 'var(--gray-300)' : 'var(--primary)', color: '#fff',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Création…' : 'Créer le prospect →'}
            </button>

            <Link href="/prospects" style={{
              padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: '1px solid var(--border)', color: 'var(--gray-600)', textDecoration: 'none',
              background: '#fff',
            }}>
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
