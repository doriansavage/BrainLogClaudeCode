// ─── Types du moteur de règles Brain E-Log ───────────────────────────────────
// Une règle = SI condition(s) questionnaire → ALORS action(s) sur les tarifs

export type ConditionOperator = 'eq' | 'neq' | 'in' | 'not_in' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'not_contains'

export interface RuleCondition {
  id: string
  questionCode: string    // e.g. "Q4.05", "Q6.07"
  operator: ConditionOperator
  value: string           // pour 'in'/'not_in' : valeurs séparées par virgule
}

// Types d'actions disponibles
export type RuleActionType =
  | 'select_group'    // Appliquer un preset (TariffGroup)
  | 'adjust_percent'  // Ajuster prix d'un item de ±X%
  | 'adjust_flat'     // Ajuster prix d'un item de ±X€
  | 'set_price'       // Fixer prix d'un item à X€ (fixe)
  | 'set_tbd'         // Marquer un item comme "À définir"

export interface RuleAction {
  id: string
  type: RuleActionType
  // Pour select_group
  groupId?: string
  // Pour les actions sur item (adjust_percent / adjust_flat / set_price / set_tbd)
  itemIndex?: number    // 0-21, index dans BASE_ITEMS (tariffs.ts)
  // Valeurs selon type
  percent?: number      // e.g. 10 = +10%, -5 = -5%
  amount?: number       // e.g. 2 = +2€, -1.50 = -1.50€
  price?: number        // prix fixe pour set_price
}

export interface PricingRule {
  id: string
  name: string
  description: string
  enabled: boolean
  priority: number          // ordre d'évaluation, entier >= 1
  conditionLogic: 'AND' | 'OR'
  conditions: RuleCondition[]
  actions: RuleAction[]
  createdAt: string         // YYYY-MM-DD
  updatedAt: string         // YYYY-MM-DD
}

export interface RulesData {
  rules: PricingRule[]
}
