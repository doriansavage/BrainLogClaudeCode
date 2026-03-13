import { create } from 'zustand'
import type { PricingRule, RuleCondition, RuleAction, RulesData } from '@/types/rules'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

// ─── Données initiales (3 exemples pour bootstrapper) ────────────────────────

const INITIAL_RULES: PricingRule[] = [
  {
    id: 'rule-suisse',
    name: 'Marché Suisse (hors UE)',
    description: "Appliquer la grille premium si le client expédie en Suisse (volume > 0%)",
    enabled: true,
    priority: 1,
    conditionLogic: 'OR',
    conditions: [
      { id: uid(), questionCode: 'Q6.07', operator: 'neq', value: '0%' },
    ],
    actions: [
      { id: uid(), type: 'select_group', groupId: 'on-se-fait-plaisir' },
      { id: uid(), type: 'adjust_percent', itemIndex: 9, percent: 10 }, // Stockage palette +10%
    ],
    createdAt: '2026-03-13',
    updatedAt: '2026-03-13',
  },
  {
    id: 'rule-b2b',
    name: 'Activité B2B active',
    description: "Si le client a une activité B2B (Oui ou En projet), appliquer tarif Standard",
    enabled: true,
    priority: 2,
    conditionLogic: 'OR',
    conditions: [
      { id: uid(), questionCode: 'Q4.05', operator: 'in', value: 'Oui,En projet' },
    ],
    actions: [
      { id: uid(), type: 'select_group', groupId: 'standard' },
    ],
    createdAt: '2026-03-13',
    updatedAt: '2026-03-13',
  },
  {
    id: 'rule-saisonnalite',
    name: 'Forte saisonnalité',
    description: "Si le client a une forte saisonnalité, appliquer grille premium + majoration stockage",
    enabled: false,
    priority: 3,
    conditionLogic: 'AND',
    conditions: [
      { id: uid(), questionCode: 'Q3.05', operator: 'eq', value: 'Forte saisonnalité ×2+' },
    ],
    actions: [
      { id: uid(), type: 'select_group', groupId: 'on-se-fait-plaisir' },
      { id: uid(), type: 'adjust_percent', itemIndex: 9, percent: 15 }, // Stockage palette +15%
    ],
    createdAt: '2026-03-13',
    updatedAt: '2026-03-13',
  },
]

// ─── Store ────────────────────────────────────────────────────────────────────

interface RulesStore {
  rules: PricingRule[]
  isLoading: boolean
  // Lifecycle
  initialize: () => Promise<void>
  // CRUD
  addRule: (rule: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateRule: (id: string, changes: Partial<PricingRule>) => void
  deleteRule: (id: string) => void
  toggleRule: (id: string) => void
  // Priorité
  movePriority: (id: string, direction: 'up' | 'down') => void
}

export const useRulesStore = create<RulesStore>((set, get) => {

  function save() {
    const data: RulesData = { rules: get().rules }
    fetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((err) => console.error('[rules] save error:', err))
  }

  function today() {
    return new Date().toISOString().split('T')[0]
  }

  return {
    rules: INITIAL_RULES,
    isLoading: false,

    initialize: async () => {
      if (get().isLoading) return
      set({ isLoading: true })
      try {
        const res = await fetch('/api/rules')
        const data = await res.json()
        if (data && Array.isArray(data.rules) && data.rules.length > 0) {
          set({ rules: data.rules })
        } else {
          save() // premier boot → seed les données initiales
        }
      } catch (err) {
        console.error('[rules] initialize error:', err)
      } finally {
        set({ isLoading: false })
      }
    },

    addRule: (partial) => {
      const maxPriority = Math.max(0, ...get().rules.map((r) => r.priority))
      const rule: PricingRule = {
        ...partial,
        id: 'rule-' + uid(),
        priority: maxPriority + 1,
        createdAt: today(),
        updatedAt: today(),
      }
      set((s) => ({ rules: [...s.rules, rule] }))
      save()
    },

    updateRule: (id, changes) => {
      set((s) => ({
        rules: s.rules.map((r) =>
          r.id === id ? { ...r, ...changes, updatedAt: today() } : r
        ),
      }))
      save()
    },

    deleteRule: (id) => {
      set((s) => ({ rules: s.rules.filter((r) => r.id !== id) }))
      save()
    },

    toggleRule: (id) => {
      const rule = get().rules.find((r) => r.id === id)
      if (!rule) return
      get().updateRule(id, { enabled: !rule.enabled })
    },

    movePriority: (id, direction) => {
      set((s) => {
        const sorted = [...s.rules].sort((a, b) => a.priority - b.priority)
        const idx = sorted.findIndex((r) => r.id === id)
        if (idx === -1) return {}
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= sorted.length) return {}
        const newRules = sorted.map((r) => ({ ...r }))
        ;[newRules[idx].priority, newRules[swapIdx].priority] = [
          newRules[swapIdx].priority,
          newRules[idx].priority,
        ]
        return { rules: newRules }
      })
      save()
    },
  }
})

// ─── Exports helpers utilisés dans la page ────────────────────────────────────

export { uid }
export type { RuleCondition, RuleAction }
