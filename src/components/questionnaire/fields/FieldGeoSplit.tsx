'use client'

import { useMemo } from 'react'
import type { FieldProps } from './types'

// Valeur stockée en JSON : '{"France":"40","Belgique":"30",...}'
function parseGeo(value: string): Record<string, number> {
  try {
    const parsed = JSON.parse(value)
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, Number(v)])
    )
  } catch {
    return {}
  }
}
function serializeGeo(obj: Record<string, number>): string {
  return JSON.stringify(Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, String(v)])
  ))
}

export function FieldGeoSplit({ field, value, onChange }: FieldProps) {
  const countries = field.options ?? []
  const icons = field.icons ?? []
  const geo = parseGeo(value)

  const total = useMemo(
    () => countries.reduce((sum, c) => sum + (geo[c] ?? 0), 0),
    [geo, countries]
  )

  function handleSlider(country: string, val: number) {
    const updated = { ...geo, [country]: val }
    onChange(field.id, serializeGeo(updated))
  }

  const totalOk = total === 100
  const totalColor = total > 100 ? '#ef4444' : total === 100 ? '#16a34a' : 'var(--text-muted)'

  return (
    <div className="flex flex-col gap-4">
      {/* Compteur total */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
        style={{
          backgroundColor: totalOk ? '#F0FDF4' : total > 100 ? '#FFF5F5' : 'var(--bg-alt)',
          border: `1px solid ${totalOk ? '#BBF7D0' : total > 100 ? '#FECDD3' : 'var(--border)'}`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: totalColor }}
          />
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Total répartition
          </span>
        </div>
        <span className="text-lg font-extrabold" style={{ color: totalColor }}>
          {total}%
          {total > 100 && <span className="text-xs ml-1.5 font-semibold">— trop élevé</span>}
        </span>
      </div>

      {/* Sliders par pays */}
      {countries.map((country, i) => {
        const pct = geo[country] ?? 0
        const icon = icons[i] ?? '🌍'
        return (
          <div key={country} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {country}
                </span>
              </div>
              <span
                className="text-sm font-bold px-2.5 py-0.5 rounded-lg min-w-[3.5rem] text-right"
                style={{
                  backgroundColor: pct > 0 ? 'var(--primary-light)' : 'var(--bg-alt)',
                  color: pct > 0 ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                {pct}%
              </span>
            </div>
            <div className="relative flex items-center" style={{ height: 20 }}>
              {/* Track fond */}
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
              {/* Track rempli */}
              <div
                className="absolute left-0 h-2 rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, var(--primary) 0%, #1A72B5 100%)',
                }}
              />
              {/* Thumb */}
              {pct > 0 && (
                <div
                  className="absolute w-4 h-4 rounded-full border-2 pointer-events-none transition-all"
                  style={{
                    left: `calc(${pct}% - 8px)`,
                    backgroundColor: '#fff',
                    borderColor: 'var(--primary)',
                    boxShadow: '0 1px 4px rgba(9,77,128,0.3)',
                    zIndex: 1,
                  }}
                />
              )}
              {/* Input range */}
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={pct}
                onChange={(e) => handleSlider(country, Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                style={{ zIndex: 2, height: '100%' }}
              />
            </div>
          </div>
        )
      })}

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Ajustez les curseurs pour que le total atteigne 100%
      </p>
    </div>
  )
}
