import { TariffManager } from '@/components/tarifs/TariffManager'

export default function TarifsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="flex items-center justify-between px-8 py-5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--dark-navy)' }}>
            Tarifs
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Groupes tarifaires et grilles de prix
          </p>
        </div>
      </div>
      <TariffManager />
    </div>
  )
}
