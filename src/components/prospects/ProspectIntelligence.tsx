'use client'

import { useEffect, useState } from 'react'
import type { Prospect } from '@/types/prospect'

interface Step {
  id: string
  category: string
  label: string
  result: string
  icon: string
  startAt: number   // ms depuis le début
  duration: number  // ms de "chargement"
}

type StepStatus = 'waiting' | 'loading' | 'done'

function buildSteps(prospect: Prospect): Step[] {
  const domain = (() => {
    try { return new URL(prospect.websiteUrl || 'https://acme.be').hostname.replace('www.', '') }
    catch { return 'site web' }
  })()

  return [
    {
      id: 'crawl',
      category: 'WEB',
      label: `Crawl de ${domain}…`,
      result: `52 pages indexées · 138 produits · Shopify détecté · Blog actif`,
      icon: '🌐',
      startAt: 0,
      duration: 2200,
    },
    {
      id: 'icp',
      category: 'ICP',
      label: 'Identification du profil e-commerce…',
      result: `${prospect.sector} · B2C majoritaire · Panier moyen estimé 64 € · Reviews 4.7/5`,
      icon: '🎯',
      startAt: 2400,
      duration: 2000,
    },
    {
      id: 'logistics',
      category: 'LOGISTIQUE',
      label: 'Analyse des flux logistiques…',
      result: `BPost (principal) · DHL Express · Livraison : Belgique + France · Délai affiché J+3`,
      icon: '📦',
      startAt: 4600,
      duration: 1800,
    },
    {
      id: 'products',
      category: 'PRODUITS',
      label: 'Analyse des SKUs et dimensions produit…',
      result: `Poids moyen : 0.8 kg · 5 best-sellers identifiés · Retours estimés : 12%`,
      icon: '📊',
      startAt: 6600,
      duration: 1500,
    },
    {
      id: 'decision_maker',
      category: 'DÉCIDEUR',
      label: `Recherche du gérant de ${prospect.companyName}…`,
      result: `Martin Dubois · CEO & Fondateur · En poste depuis 2018`,
      icon: '👤',
      startAt: 8300,
      duration: 3000,
    },
    {
      id: 'contact',
      category: 'CONTACT',
      label: 'Collecte des coordonnées professionnelles…',
      result: `m.dubois@${domain} · +32 472 18 37 94 · LinkedIn vérifié`,
      icon: '📬',
      startAt: 11500,
      duration: 2000,
    },
    {
      id: 'profile',
      category: 'PROFIL',
      label: 'Analyse approfondie du profil LinkedIn…',
      result: `847 relations · Passions : ping-pong 🏓, escalade 🧗, natation 🏊 · Actif chaque semaine`,
      icon: '🔍',
      startAt: 13700,
      duration: 2200,
    },
    {
      id: 'email',
      category: 'ENVOI',
      label: `Envoi du questionnaire à ${prospect.contactEmail}…`,
      result: `✓ Email envoyé · Lien actif 30 jours · Questionnaire : 97 questions · ~8 min`,
      icon: '📩',
      startAt: 16100,
      duration: 1400,
    },
  ]
}

export function ProspectIntelligence({ prospect }: { prospect: Prospect }) {
  const steps = buildSteps(prospect)
  const storageKey = `prospect-intel-done-${prospect.id}`

  const [statuses, setStatuses] = useState<Record<string, StepStatus>>(() =>
    Object.fromEntries(steps.map((s) => [s.id, 'waiting' as StepStatus]))
  )
  const [started, setStarted] = useState(false)

  useEffect(() => {
    // Si déjà vu, afficher tout immédiatement sans animation
    if (localStorage.getItem(storageKey)) {
      setStatuses(Object.fromEntries(steps.map((s) => [s.id, 'done' as StepStatus])))
      setStarted(true)
      return
    }
    // Sinon démarrer l'animation 600ms après le mount
    const boot = setTimeout(() => setStarted(true), 600)
    return () => clearTimeout(boot)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!started) return
    // Si déjà tout done (cas "déjà vu"), ne pas relancer les timers
    if (Object.values(statuses).every((s) => s === 'done')) return

    const timers: ReturnType<typeof setTimeout>[] = []

    steps.forEach((step) => {
      timers.push(
        setTimeout(() => {
          setStatuses((prev) => ({ ...prev, [step.id]: 'loading' }))
        }, step.startAt),
      )
      timers.push(
        setTimeout(() => {
          setStatuses((prev) => ({ ...prev, [step.id]: 'done' }))
        }, step.startAt + step.duration),
      )
    })

    return () => timers.forEach(clearTimeout)
  }, [started]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persiste dans localStorage quand l'animation est terminée
  useEffect(() => {
    if (Object.values(statuses).every((s) => s === 'done') && started) {
      localStorage.setItem(storageKey, '1')
    }
  }, [statuses]) // eslint-disable-line react-hooks/exhaustive-deps

  const doneCount = Object.values(statuses).filter((s) => s === 'done').length
  const allDone = doneCount === steps.length
  const totalDuration = steps[steps.length - 1].startAt + steps[steps.length - 1].duration

  return (
    <div style={{
      background: '#0D1117',
      borderRadius: 12,
      border: '1px solid #30363D',
      overflow: 'hidden',
      fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    }}>
      {/* Header terminal */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: '#161B22',
        borderBottom: '1px solid #30363D',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 99, background: '#FF5F56', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: 99, background: '#FFBD2E', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: 99, background: '#27C93F', display: 'inline-block' }} />
          </div>
          <span style={{ fontSize: 11, color: '#8B949E', marginLeft: 8 }}>
            brain-elog-intelligence · {prospect.companyName}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!allDone && started && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 10, color: '#58A6FF', fontFamily: 'inherit',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 99, background: '#58A6FF',
                animation: 'pulse 1.2s ease-in-out infinite',
                display: 'inline-block',
              }} />
              LIVE
            </span>
          )}
          {allDone && (
            <span style={{ fontSize: 10, color: '#3FB950', fontFamily: 'inherit' }}>
              ✓ ANALYSE COMPLÈTE
            </span>
          )}
        </div>
      </div>

      {/* Log stream */}
      <div style={{ padding: '12px 0', minHeight: 200 }}>
        {steps.map((step, i) => {
          const status = statuses[step.id]
          if (status === 'waiting') return null

          return (
            <div
              key={step.id}
              style={{
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                animation: 'fadeIn 300ms ease',
              }}
            >
              {/* Timestamp */}
              <span style={{ fontSize: 10, color: '#484F58', whiteSpace: 'nowrap', paddingTop: 2 }}>
                {String(i).padStart(2, '0')}
              </span>

              {/* Category badge */}
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                background: '#1C2128', color: categoryColor(step.category),
                whiteSpace: 'nowrap', letterSpacing: '0.05em', paddingTop: 3,
              }}>
                {step.category}
              </span>

              {/* Content */}
              <div style={{ flex: 1 }}>
                {status === 'loading' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Spinner />
                    <span style={{ fontSize: 12, color: '#8B949E' }}>{step.label}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12 }}>{step.icon}</span>
                    <span style={{ fontSize: 12, color: '#E6EDF3', lineHeight: 1.5 }}>
                      {step.result}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Cursor clignotant si pas encore fini */}
        {started && !allDone && (
          <div style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, color: '#484F58' }}>  </span>
            <span style={{
              fontSize: 12, color: '#3FB950',
              animation: 'blink 1s step-end infinite',
            }}>▋</span>
          </div>
        )}

        {/* Bilan final */}
        {allDone && (
          <div style={{
            margin: '12px 16px 4px',
            padding: '10px 14px',
            background: '#0D2B1A',
            border: '1px solid #1A4731',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>🚀</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#3FB950' }}>
                Intelligence collectée · {steps.length} modules exécutés
              </p>
              <p style={{ fontSize: 11, color: '#4D7C5E', marginTop: 2 }}>
                Questionnaire envoyé à {prospect.contactEmail} · En attente de réponse
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
    >
      <circle cx="6" cy="6" r="4.5" fill="none" stroke="#30363D" strokeWidth="1.5" />
      <path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" fill="none" stroke="#58A6FF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    WEB:        '#58A6FF',
    ICP:        '#BC8CFF',
    LOGISTIQUE: '#FFA657',
    PRODUITS:   '#79C0FF',
    DÉCIDEUR:   '#FF7B72',
    CONTACT:    '#56D364',
    PROFIL:     '#E3B341',
    ENVOI:      '#3FB950',
  }
  return map[cat] ?? '#8B949E'
}
