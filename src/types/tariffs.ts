export type PriceType = 'fixed' | 'tbd' | 'quote' | 'formula'
export type BillingType = 'une_seule_fois' | 'mensuel' | 'a_l_usage'
export type FormulaType = 'questionnaire' | 'item_ref'

export interface TariffItemFormula {
  type: FormulaType
  // Pour type = 'questionnaire'
  questionCode?: string    // e.g. 'Q4.01'
  questionLabel?: string   // e.g. 'Volume B2C / mois'
  unitPrice?: number       // e.g. 1 (€ par unité)
  // Pour type = 'item_ref'
  refItemIndex?: number    // 0-21, index dans BASE_ITEMS
  percent?: number         // ±% du prix de l'item référent
  offset?: number          // ±€ en plus du prix référent
}

export interface TariffItem {
  id: string
  groupId: string
  categoryId: string
  label: string
  description?: string
  price: number | null
  priceType: PriceType
  unit: string
  billing: BillingType
  isVisible: boolean
  condition?: string
  sortOrder: number
  notes?: string
  isCustom?: boolean
  formula?: TariffItemFormula
}

export interface TariffCategory {
  id: string
  label: string
  description?: string
  sortOrder: number
}

export interface TariffSnapshot {
  id: string
  groupId: string
  label: string
  items: TariffItem[]
  createdAt: string // ISO datetime
}

export interface TariffGroup {
  id: string
  name: string
  description?: string
  baseGroupId?: string | null
  isDefault: boolean
  isArchived: boolean
  isLocked: boolean
  usedCount: number
  createdAt: string
  updatedAt: string
}
