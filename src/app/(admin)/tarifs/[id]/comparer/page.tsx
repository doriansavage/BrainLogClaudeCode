export default function TarifsComparerPage() {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <h1 className="text-xl font-bold" style={{ color: 'var(--dark-navy)' }}>
          Comparer les groupes
        </h1>
      </div>
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
        <p className="text-sm">Comparaison tarifaire — à venir</p>
      </div>
    </div>
  )
}
