export type PriceType = 'fixed' | 'tbd' | 'quote' | 'formula'
export type BillingType = 'une_seule_fois' | 'mensuel' | 'a_l_usage'

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
}

export interface TariffCategory {
  id: string
  label: string
  description?: string
  sortOrder: number
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
