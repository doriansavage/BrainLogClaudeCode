export default function ProspectPortalPage({
  params,
}: {
  params: { token: string }
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-alt)' }}
    >
      <div
        className="w-full max-w-2xl rounded-xl border p-10 shadow-sm"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="text-center mb-8">
          <span
            className="text-2xl font-bold"
            style={{ color: 'var(--dark-navy)' }}
          >
            Brain E-Log
          </span>
          <h1
            className="text-xl font-bold mt-4"
            style={{ color: 'var(--text)' }}
          >
            Bienvenue
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Remplissez ce questionnaire pour recevoir votre offre logistique personnalisée.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Durée estimée : ~8 min
          </p>
        </div>
        <div className="flex justify-center">
          <button
            className="px-8 py-3 rounded-md text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Commencer →
          </button>
        </div>
        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          Token: {params.token}
        </p>
      </div>
    </div>
  )
}
