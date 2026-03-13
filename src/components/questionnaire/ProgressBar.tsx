'use client'

interface ProgressBarProps {
  currentStep: number   // 1-based pour affichage
  totalSteps: number
  progress: number      // 0-100
}

export function ProgressBar({ currentStep, totalSteps, progress }: ProgressBarProps) {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Segments par étape */}
      <div className="flex items-end gap-1">
        {Array.from({ length: totalSteps }, (_, i) => {
          const done = i < currentStep - 1
          const active = i === currentStep - 1
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-300"
              style={{
                height: active ? 6 : 4,
                backgroundColor: (done || active) ? 'var(--primary)' : 'var(--border)',
                opacity: done ? 0.55 : active ? 1 : 0.35,
              }}
            />
          )
        })}
      </div>

      {/* Label */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
          Étape {currentStep} / {totalSteps}
        </span>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
        >
          {progress}%
        </span>
      </div>
    </div>
  )
}
