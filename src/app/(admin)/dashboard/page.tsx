import { Users, FileText, Clock, CheckCircle2, Plus, Link2, BarChart3, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const kpis = [
  { label: 'Prospects actifs', value: '12', delta: '+3 ce mois', icon: Users, iconBg: '#EEF4FB', iconColor: '#094D80' },
  { label: 'Offres générées', value: '34', delta: '+8 ce mois', icon: FileText, iconBg: '#F0FDF4', iconColor: '#16a34a' },
  { label: 'En attente', value: '5', delta: '2 urgents', icon: Clock, iconBg: '#FFFBEB', iconColor: '#d97706' },
  { label: 'Offres acceptées', value: '8', delta: '76% taux', icon: CheckCircle2, iconBg: '#FFF1F2', iconColor: '#e11d48' },
]

const activity = [
  { id: 1, text: 'Acme SRL a rempli son questionnaire', time: 'il y a 2h', dot: '#094D80' },
  { id: 2, text: 'Offre générée pour Shop BV', time: 'il y a 5h', dot: '#16a34a' },
  { id: 3, text: 'Offre acceptée par Mode & Co', time: 'hier', dot: '#16a34a' },
  { id: 4, text: 'Lien questionnaire envoyé à Luxe Retail', time: 'hier', dot: '#d97706' },
  { id: 5, text: 'Nouveau prospect créé : BeautyBox', time: 'il y a 2j', dot: '#94a3b8' },
]

const prospects = [
  { id: 1, name: 'Acme SRL', sector: 'Mode', date: '13/03', status: 'Répondu', sBg: '#EEF4FB', sColor: '#094D80', group: 'Standard' },
  { id: 2, name: 'Shop BV', sector: 'Beauté', date: '12/03', status: 'Offre générée', sBg: '#FFFBEB', sColor: '#b45309', group: 'Pâquerettes' },
  { id: 3, name: 'Mode & Co', sector: 'Mode', date: '11/03', status: 'Acceptée', sBg: '#F0FDF4', sColor: '#15803d', group: 'Standard' },
  { id: 4, name: 'Luxe Retail', sector: 'Luxe', date: '10/03', status: 'Lien envoyé', sBg: '#F8FAFC', sColor: '#475569', group: '—' },
  { id: 5, name: 'BeautyBox', sector: 'Beauté', date: '09/03', status: 'Nouveau', sBg: '#F8FAFC', sColor: '#475569', group: '—' },
]

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 12,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
}

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '24px 32px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
              Bonjour, Mathieu 👋
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              Résumé de l&apos;activité Brain E-Log
            </p>
          </div>
          <span style={{ fontSize: 12, color: 'var(--gray-400)', paddingTop: 4 }}>
            Vendredi 13 mars 2026
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 32px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {kpis.map((k) => {
            const Icon = k.icon
            return (
              <div key={k.label} style={card}>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} strokeWidth={1.75} style={{ color: k.iconColor }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                      <TrendingUp size={10} style={{ color: '#16a34a' }} />
                      {k.delta}
                    </div>
                  </div>
                  <p style={{ fontSize: 30, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {k.value}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 5 }}>{k.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Middle row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 272px', gap: 14 }}>
          {/* Activity */}
          <div style={card}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>Activité récente</h2>
            </div>
            <div>
              {activity.map((a, i) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px',
                  borderBottom: i < activity.length - 1 ? '1px solid var(--gray-50)' : 'none',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: a.dot, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--gray-700)' }}>{a.text}</span>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)', flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={card}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>Actions rapides</h2>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/prospects/nouveau" style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--primary)', color: '#fff',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
                <Plus size={15} /> Nouveau prospect
              </Link>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '10px 14px', borderRadius: 8,
                background: '#fff', color: 'var(--gray-700)',
                border: '1px solid var(--border)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>
                <Link2 size={15} style={{ color: 'var(--primary)' }} /> Envoyer un lien
              </button>
              <Link href="/tarifs" style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '10px 14px', borderRadius: 8,
                background: '#fff', color: 'var(--gray-700)',
                border: '1px solid var(--border)', fontSize: 13, fontWeight: 500, textDecoration: 'none',
              }}>
                <BarChart3 size={15} style={{ color: 'var(--primary)' }} /> Gérer les tarifs
              </Link>
            </div>
            <div style={{ margin: '0 16px 16px', padding: '12px 14px', borderRadius: 8, background: '#EEF4FB', border: '1px solid #d0e4f5' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>Résumé du mois</p>
              {[
                { label: 'Questionnaires envoyés', val: '7' },
                { label: 'Offres créées', val: '5' },
                { label: 'Taux de conversion', val: '71%' },
              ].map((r) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-900)' }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prospects table */}
        <div style={card}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>Prospects récents</h2>
            <Link href="/prospects" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--primary)', textDecoration: 'none' }}>
              Voir tout <ArrowRight size={13} />
            </Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                {['Nom société', 'Secteur', 'Date', 'Statut', 'Groupe tarifaire', ''].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '9px 20px',
                    fontSize: 11, fontWeight: 600, color: 'var(--gray-400)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prospects.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < prospects.length - 1 ? '1px solid var(--gray-50)' : 'none', cursor: 'pointer' }}>
                  <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>{p.name}</td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{p.sector}</td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{p.date}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: p.sBg, color: p.sColor }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{p.group}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <Link href={`/prospects/${p.id}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary)', textDecoration: 'none' }}>
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
