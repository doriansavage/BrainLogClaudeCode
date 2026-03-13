export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--dark-navy)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-8 shadow-lg"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            className="text-2xl font-bold"
            style={{ color: 'var(--dark-navy)' }}
          >
            Brain E-Log
          </span>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Interface de gestion
          </p>
        </div>

        {/* Form placeholder */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-2 transition-all"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                '--tw-ring-color': 'var(--primary)',
              } as React.CSSProperties}
              placeholder="mathieu@brain-log.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
              Mot de passe
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-2 transition-all"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
              placeholder="••••••••"
            />
          </div>
          <button
            className="w-full py-2.5 rounded-md text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  )
}
