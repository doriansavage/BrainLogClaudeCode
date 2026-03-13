export default function ProspectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <h1 className="text-xl font-bold" style={{ color: 'var(--dark-navy)' }}>
          Fiche prospect
        </h1>
      </div>
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
        <p className="text-sm">Prospect #{params.id} — à venir</p>
      </div>
    </div>
  )
}
