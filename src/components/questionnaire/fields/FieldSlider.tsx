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
    <div className="flex flex-col gap-5">
      {/* Valeur sélectionnée */}
      <div className="flex justify-center">
        <span
          className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
          style={{
            backgroundColor: activeIndex >= 0 ? 'var(--primary)' : 'var(--bg-alt)',
            color: activeIndex >= 0 ? '#fff' : 'var(--text-muted)',
            boxShadow: activeIndex >= 0 ? '0 4px 12px rgba(9,77,128,0.25)' : 'none',
            minWidth: 120,
            textAlign: 'center',
          }}
        >
          {activeIndex >= 0 ? value : 'Sélectionner…'}
        </span>
      </div>

      {/* Track + thumb */}
      <div className="px-3">
        <div className="relative" style={{ height: 24, display: 'flex', alignItems: 'center' }}>
          {/* Track de fond */}
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
          {/* Track rempli */}
          {activeIndex >= 0 && (
            <div
              className="absolute left-0 h-2 rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--primary) 0%, #1A72B5 100%)',
              }}
            />
          )}
          {/* Input range invisible */}
          <input
            id={field.id}
            type="range"
            min={0}
            max={stops.length - 1}
            step={1}
            value={activeIndex >= 0 ? activeIndex : 0}
            onChange={handleChange}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            style={{ zIndex: 2, height: '100%' }}
          />
          {/* Thumb visible */}
          {activeIndex >= 0 && (
            <div
              className="absolute w-5 h-5 rounded-full border-2 transition-all pointer-events-none"
              style={{
                left: `calc(${pct}% - 10px)`,
                backgroundColor: '#fff',
                borderColor: 'var(--primary)',
                boxShadow: '0 2px 6px rgba(9,77,128,0.35)',
                zIndex: 1,
              }}
            />
          )}
          {/* Dots sur les stops */}
          <div className="absolute top-0 left-0 w-full flex justify-between" style={{ top: 'calc(50% - 4px)' }}>
            {stops.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: i <= activeIndex ? 'var(--primary)' : 'var(--border)',
                  transform: i === activeIndex ? 'scale(0)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between px-1">
        {stops.map((stop, i) => (
          <button
            key={stop}
            type="button"
            onClick={() => onChange(field.id, stop)}
            className="flex-1 text-center cursor-pointer transition-colors"
            style={{
              fontSize: '11px',
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
