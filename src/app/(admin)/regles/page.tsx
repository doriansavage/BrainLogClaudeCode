export default function ReglesPage() {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--dark-navy)' }}>
            Règles
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Moteur de règles conditionnelles
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
        <p className="text-sm">Module Règles — à venir</p>
      </div>
    </div>
  )
}
