import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Link2,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

const kpis = [
  {
    label: 'Prospects actifs',
    value: '12',
    icon: Users,
    color: 'var(--primary)',
  },
  {
    label: 'Offres générées',
    value: '34',
    icon: FileText,
    color: '#6366f1',
  },
  {
    label: 'En attente',
    value: '5',
    icon: Clock,
    color: '#f59e0b',
  },
  {
    label: 'Acceptées',
    value: '8',
    icon: CheckCircle2,
    color: '#10b981',
  },
]

const recentActivity = [
  {
    id: 1,
    text: 'Acme SRL a rempli son questionnaire',
    time: 'il y a 2h',
    type: 'questionnaire',
  },
  {
    id: 2,
    text: 'Offre générée pour Shop BV',
    time: 'il y a 5h',
    type: 'offer',
  },
  {
    id: 3,
    text: 'Offre acceptée par Mode & Co',
    time: 'hier',
    type: 'accepted',
  },
  {
    id: 4,
    text: 'Lien envoyé à Luxe Retail',
    time: 'hier',
    type: 'link',
  },
  {
    id: 5,
    text: 'Nouveau prospect créé : BeautyBox',
    time: 'il y a 2j',
    type: 'new',
  },
]

const recentProspects = [
  {
    id: 1,
    name: 'Acme SRL',
    sector: 'Mode',
    date: '13/03',
    status: 'Répondu',
    group: 'Standard',
    statusColor: '#6366f1',
  },
  {
    id: 2,
    name: 'Shop BV',
    sector: 'Beauté',
    date: '12/03',
    status: 'Offre générée',
    group: 'Pâquerettes',
    statusColor: '#f59e0b',
  },
  {
    id: 3,
    name: 'Mode & Co',
    sector: 'Mode',
    date: '11/03',
    status: 'Acceptée',
    group: 'Standard',
    statusColor: '#10b981',
  },
  {
    id: 4,
    name: 'Luxe Retail',
    sector: 'Luxe',
    date: '10/03',
    status: 'Lien envoyé',
    group: '—',
    statusColor: 'var(--charcoal)',
  },
  {
    id: 5,
    name: 'BeautyBox',
    sector: 'Beauté',
    date: '09/03',
    status: 'Nouveau',
    group: '—',
    statusColor: 'var(--charcoal)',
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--dark-navy)' }}
          >
            Dashboard
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Vue d&apos;ensemble de l&apos;activité
          </p>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          13 mars 2026
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className="rounded-lg border p-4 flex items-center gap-4"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: kpi.color + '15' }}
                >
                  <Icon size={20} style={{ color: kpi.color }} />
                </div>
                <div>
                  <p
                    className="text-2xl font-bold leading-none"
                    style={{ color: 'var(--text)' }}
                  >
                    {kpi.value}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {kpi.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Middle row: Activity + Quick actions */}
        <div className="grid grid-cols-3 gap-4">
          {/* Recent activity */}
          <div
            className="col-span-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="px-5 py-3.5 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2
                className="text-sm font-semibold"
                style={{ color: 'var(--dark-navy)' }}
              >
                Activité récente
              </h2>
            </div>
            <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text)' }}
                  >
                    {item.text}
                  </span>
                  <span
                    className="text-xs ml-4 flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick actions */}
          <div
            className="rounded-lg border"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="px-5 py-3.5 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2
                className="text-sm font-semibold"
                style={{ color: 'var(--dark-navy)' }}
              >
                Actions rapides
              </h2>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href="/prospects/nouveau"
                className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium w-full text-left transition-colors hover:opacity-90"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                }}
              >
                <Plus size={15} />
                <span>Nouveau prospect</span>
              </Link>
              <button
                className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium w-full text-left transition-colors border hover:bg-gray-50"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <Link2 size={15} style={{ color: 'var(--primary)' }} />
                <span>Envoyer un lien</span>
              </button>
              <Link
                href="/tarifs"
                className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium w-full text-left transition-colors border hover:bg-gray-50"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <BarChart3 size={15} style={{ color: 'var(--primary)' }} />
                <span>Voir les tarifs</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Prospects récents */}
        <div
          className="rounded-lg border"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="px-5 py-3.5 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}
          >
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--dark-navy)' }}
            >
              Prospects récents
            </h2>
            <Link
              href="/prospects"
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--primary)' }}
            >
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--bg-alt)',
                    borderBottom: `1px solid var(--border)`,
                  }}
                >
                  {['Nom société', 'Secteur', 'Date', 'Statut', 'Groupe tarifaire', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-2.5 text-xs font-semibold"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {recentProspects.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b transition-colors hover:bg-gray-50 cursor-pointer"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <td
                      className="px-5 py-3 font-semibold"
                      style={{ color: 'var(--text)' }}
                    >
                      {p.name}
                    </td>
                    <td
                      className="px-5 py-3"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {p.sector}
                    </td>
                    <td
                      className="px-5 py-3"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {p.date}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: p.statusColor + '18',
                          color: p.statusColor,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {p.group}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/prospects/${p.id}`}
                        className="text-xs font-medium transition-colors hover:opacity-80"
                        style={{ color: 'var(--primary)' }}
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
