'use client'

import type { FieldProps } from './types'

export function FieldSlider({ field, value, error, onChange }: FieldProps) {
  const stops = field.slider?.stops ?? []
  const currentIndex = stops.indexOf(value)
  const activeIndex = currentIndex >= 0 ? currentIndex : -1

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const idx = Number(e.target.value)
    onChange(field.id, stops[idx])
  }

  const pct = activeIndex >= 0 && stops.length > 1
    ? (activeIndex / (stops.length - 1)) * 100
    : 0

  return (
    <div className="flex flex-col gap-4">
      {/* Valeur sélectionnée */}
      <div className="flex justify-center">
        <span
          className="px-4 py-1.5 rounded-full text-sm font-bold"
          style={{
            backgroundColor: activeIndex >= 0 ? 'var(--primary)' : 'var(--bg-alt)',
            color: activeIndex >= 0 ? '#fff' : 'var(--text-muted)',
          }}
        >
          {activeIndex >= 0 ? value : '— Sélectionner —'}
        </span>
      </div>

      {/* Track + thumb */}
      <div className="px-2">
        <div className="relative">
          {/* Track de fond */}
          <div
            className="w-full h-2 rounded-full"
            style={{ backgroundColor: 'var(--border)' }}
          />
          {/* Track rempli */}
          {activeIndex >= 0 && (
            <div
              className="absolute top-0 left-0 h-2 rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: 'var(--primary)' }}
            />
          )}
          {/* Input range invisible par-dessus */}
          <input
            id={field.id}
            type="range"
            min={0}
            max={stops.length - 1}
            step={1}
            value={activeIndex >= 0 ? activeIndex : 0}
            onChange={handleChange}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
            style={{ zIndex: 2 }}
          />
          {/* Dots sur les stops */}
          <div className="absolute top-0 left-0 w-full flex justify-between px-0" style={{ top: '-3px' }}>
            {stops.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: i <= activeIndex ? 'var(--primary)' : 'var(--bg)',
                  borderColor: i <= activeIndex ? 'var(--primary)' : 'var(--border)',
                  transform: i === activeIndex ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Labels des stops */}
      <div className="flex justify-between">
        {stops.map((stop, i) => (
          <button
            key={stop}
            type="button"
            onClick={() => onChange(field.id, stop)}
            className="flex-1 text-center cursor-pointer transition-colors"
            style={{
              fontSize: '10px',
              fontWeight: i === activeIndex ? '700' : '500',
              color: i === activeIndex ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            {stop}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-xs text-center" style={{ color: '#ef4444' }}>{error}</p>
      )}
    </div>
  )
}
