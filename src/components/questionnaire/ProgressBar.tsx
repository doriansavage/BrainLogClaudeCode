'use client'

interface ProgressBarProps {
  currentStep: number   // 1-based pour affichage
  totalSteps: number
  progress: number      // 0-100
}

export function ProgressBar({ currentStep, totalSteps, progress }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Étape {currentStep} sur {totalSteps}
        </span>
        <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
          {progress}%
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: 'var(--primary)',
          }}
        />
      </div>
    </div>
  )
}
