import { create } from 'zustand'
import type { TariffGroup, TariffItem, TariffCategory } from '@/types/tariffs'

export const CATEGORIES: TariffCategory[] = [
  { id: 'frais_demarrage', label: 'Frais de démarrage', description: 'Facturés une seule fois', sortOrder: 1 },
  { id: 'frais_recurrents', label: 'Frais récurrents mensuels', description: 'Facturés chaque mois', sortOrder: 2 },
  { id: 'frais_activite', label: "Frais mensuels liés à l'activité", description: 'Facturés selon les volumes', sortOrder: 3 },
]

// ── Options de duplication ────────────────────────────────────────────────────

export interface DuplicateOptions {
  adjustType: 'none' | 'global' | 'per_category'
  modifierType: 'percent' | 'flat'
  globalValue: number
  perCategory: Record<string, number>
  roundTo: number
}

// ── Helpers prix ─────────────────────────────────────────────────────────────

function applyRounding(price: number, roundTo: number): number {
  if (roundTo <= 0) return Math.round(price * 100) / 100
  return Math.round(price / roundTo) * roundTo
}

function processPrice(
  price: number | null,
  type: 'percent' | 'flat',
  value: number,
  roundTo: number,
): number | null {
  if (price === null) return null
  let adjusted = price
  if (value !== 0) {
    adjusted = type === 'percent' ? price * (1 + value / 100) : price + value
  }
  const result = applyRounding(Math.max(0, adjusted), roundTo)
  return result
}

// ── Données de base ───────────────────────────────────────────────────────────

type BaseItem = Omit<TariffItem, 'id' | 'groupId'>

const BASE_ITEMS: BaseItem[] = [
  // Frais de démarrage
  { categoryId: 'frais_demarrage', label: 'Frais de mise en place — Brain E-Log', price: null, priceType: 'tbd', unit: 'forfait', billing: 'une_seule_fois', isVisible: true, sortOrder: 1, description: 'Étude et organisation des flux logistiques' },
  { categoryId: 'frais_demarrage', label: 'Frais de mise en place — WMS', price: null, priceType: 'tbd', unit: 'forfait', billing: 'une_seule_fois', isVisible: true, sortOrder: 2, description: 'Intégration WMS avec CMS/ERP' },
  // Frais récurrents
  { categoryId: 'frais_recurrents', label: 'Gestion mensuelle de compte', price: 150, priceType: 'fixed', unit: 'par mois', billing: 'mensuel', isVisible: true, sortOrder: 1, description: 'Frais de dossiers administratifs et facturation' },
  { categoryId: 'frais_recurrents', label: 'Abonnement WMS', price: 100, priceType: 'fixed', unit: 'par mois', billing: 'mensuel', isVisible: true, sortOrder: 2, description: 'Licence mensuelle WMS' },
  // Frais activité
  { categoryId: 'frais_activite', label: 'Déchargement container 40 pieds (max 4h)', price: 330, priceType: 'fixed', unit: 'par conteneur', billing: 'a_l_usage', isVisible: true, sortOrder: 1 },
  { categoryId: 'frais_activite', label: 'Déchargement container 20 pieds (max 2h)', price: 210, priceType: 'fixed', unit: 'par conteneur', billing: 'a_l_usage', isVisible: true, sortOrder: 2 },
  { categoryId: 'frais_activite', label: 'Déchargement palette', price: 6.5, priceType: 'fixed', unit: 'par palette', billing: 'a_l_usage', isVisible: true, sortOrder: 3 },
  { categoryId: 'frais_activite', label: 'Déchargement colis', price: 1.2, priceType: 'fixed', unit: 'par colis', billing: 'a_l_usage', isVisible: true, sortOrder: 4 },
  { categoryId: 'frais_activite', label: 'Entrée en stock', price: 0.10, priceType: 'fixed', unit: 'par article (UVC)', billing: 'a_l_usage', isVisible: true, sortOrder: 5 },
  { categoryId: 'frais_activite', label: 'Stockage palette', price: 10.5, priceType: 'fixed', unit: 'par palette / par mois', billing: 'mensuel', isVisible: true, sortOrder: 6, description: 'Dimensions : l=80 × L=120 × h=180 cm' },
  { categoryId: 'frais_activite', label: 'Stockage bac / étagère picking', price: null, priceType: 'quote', unit: 'par emplacement / par mois', billing: 'mensuel', isVisible: true, sortOrder: 7 },
  { categoryId: 'frais_activite', label: 'Préparation commande B2C — par commande', price: 1.5, priceType: 'fixed', unit: 'par commande', billing: 'a_l_usage', isVisible: true, sortOrder: 8 },
  { categoryId: 'frais_activite', label: 'Préparation commande B2C — par ligne', price: 0.25, priceType: 'fixed', unit: 'par ligne de commande', billing: 'a_l_usage', isVisible: true, sortOrder: 9 },
  { categoryId: 'frais_activite', label: 'Préparation commande B2C — par article', price: 0.5, priceType: 'fixed', unit: 'par article (UVC)', billing: 'a_l_usage', isVisible: true, sortOrder: 10 },
  { categoryId: 'frais_activite', label: 'Préparation commande B2B (régie)', price: 39.5, priceType: 'fixed', unit: 'par heure', billing: 'a_l_usage', isVisible: true, sortOrder: 11 },
  { categoryId: 'frais_activite', label: 'Étiquette transporteur', price: 0.06, priceType: 'fixed', unit: 'par colis', billing: 'a_l_usage', isVisible: true, sortOrder: 12 },
  { categoryId: 'frais_activite', label: 'Impression + insertion BL', price: 0.15, priceType: 'fixed', unit: 'par document', billing: 'a_l_usage', isVisible: true, sortOrder: 13 },
  { categoryId: 'frais_activite', label: 'Insertion document / flyer / goodies', price: 0.09, priceType: 'fixed', unit: 'par pièce', billing: 'a_l_usage', isVisible: true, sortOrder: 14 },
  { categoryId: 'frais_activite', label: 'Documents douaniers (hors UE)', price: 2.75, priceType: 'fixed', unit: 'par commande', billing: 'a_l_usage', isVisible: true, sortOrder: 15 },
  { categoryId: 'frais_activite', label: 'Management des retours', price: 0.8, priceType: 'fixed', unit: 'par retour', billing: 'a_l_usage', isVisible: true, sortOrder: 16 },
  { categoryId: 'frais_activite', label: 'Services additionnels — Manutention', price: 39.5, priceType: 'fixed', unit: 'par heure', billing: 'a_l_usage', isVisible: true, sortOrder: 17 },
  { categoryId: 'frais_activite', label: 'Services additionnels — Administration', price: 65, priceType: 'fixed', unit: 'par heure', billing: 'a_l_usage', isVisible: true, sortOrder: 18 },
]

function createItems(groupId: string, modifier = 1): TariffItem[] {
  return BASE_ITEMS.map((item, i) => ({
    ...item,
    id: `${groupId}-item-${i}`,
    groupId,
    price:
      item.price !== null && modifier !== 1
        ? Math.round(item.price * modifier * 100) / 100
        : item.price,
  }))
}

const INITIAL_GROUPS: TariffGroup[] = [
  { id: 'standard', name: 'Standard', description: 'Grille tarifaire de référence', baseGroupId: null, isDefault: true, isArchived: false, isLocked: false, usedCount: 8, createdAt: '2026-03-01', updatedAt: '2026-03-13' },
  { id: 'paquereites', name: 'Pâquerettes', description: 'Tarifs préférentiels — clients partenaires', baseGroupId: 'standard', isDefault: false, isArchived: false, isLocked: false, usedCount: 3, createdAt: '2026-03-05', updatedAt: '2026-03-10' },
  { id: 'on-se-fait-plaisir', name: 'On se fait plaisir', description: 'Tarifs premium', baseGroupId: 'standard', isDefault: false, isArchived: false, isLocked: true, usedCount: 2, createdAt: '2026-03-08', updatedAt: '2026-03-08' },
]

const INITIAL_ITEMS: TariffItem[] = [
  ...createItems('standard', 1),
  ...createItems('paquereites', 0.85),
  ...createItems('on-se-fait-plaisir', 1.3),
]

// ── Store ─────────────────────────────────────────────────────────────────────

interface TariffStore {
  groups: TariffGroup[]
  items: TariffItem[]
  categories: TariffCategory[]
  selectedGroupId: string
  // Navigation
  selectGroup: (id: string) => void
  // Groupes
  createGroup: (name: string, description?: string) => void
  duplicateGroup: (sourceId: string, newName: string, options?: DuplicateOptions) => void
  renameGroup: (id: string, name: string, description?: string) => void
  archiveGroup: (id: string) => void
  deleteGroup: (id: string) => void
  setDefaultGroup: (id: string) => void
  // Items
  updateItemPrice: (itemId: string, price: number | null) => void
  setItemPriceType: (itemId: string, priceType: TariffItem['priceType']) => void
  toggleItemVisibility: (itemId: string) => void
  // Ajustements en masse
  applyBulkAdjustment: (
    groupId: string,
    type: 'percent' | 'flat',
    value: number,
    roundTo: number,
    categoryId?: string,
  ) => void
}

export const useTariffStore = create<TariffStore>((set, get) => ({
  groups: INITIAL_GROUPS,
  items: INITIAL_ITEMS,
  categories: CATEGORIES,
  selectedGroupId: 'standard',

  selectGroup: (id) => set({ selectedGroupId: id }),

  createGroup: (name, description) => {
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
    const newGroup: TariffGroup = {
      id, name, description,
      baseGroupId: null, isDefault: false, isArchived: false, isLocked: false, usedCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    set((s) => ({
      groups: [...s.groups, newGroup],
      items: [...s.items, ...createItems(id, 1)],
      selectedGroupId: id,
    }))
  },

  duplicateGroup: (sourceId, newName, options) => {
    const {
      adjustType = 'none',
      modifierType = 'percent',
      globalValue = 0,
      perCategory = {},
      roundTo = 0,
    } = options ?? {}

    const id = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
    const source = get().groups.find((g) => g.id === sourceId)
    if (!source) return

    const newGroup: TariffGroup = {
      ...source, id, name: newName,
      baseGroupId: sourceId, isDefault: false, isLocked: false, usedCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }

    const sourceItems = get().items.filter((i) => i.groupId === sourceId)
    const newItems: TariffItem[] = sourceItems.map((item, idx) => {
      let newPrice = item.price
      if (item.priceType === 'fixed') {
        if (adjustType === 'global') {
          newPrice = processPrice(item.price, modifierType, globalValue, roundTo)
        } else if (adjustType === 'per_category') {
          const catVal = perCategory[item.categoryId] ?? 0
          newPrice = processPrice(item.price, modifierType, catVal, roundTo)
        } else if (roundTo > 0 && item.price !== null) {
          newPrice = applyRounding(item.price, roundTo)
        }
      }
      return { ...item, id: `${id}-item-${idx}`, groupId: id, price: newPrice }
    })

    set((s) => ({
      groups: [...s.groups, newGroup],
      items: [...s.items, ...newItems],
      selectedGroupId: id,
    }))
  },

  applyBulkAdjustment: (groupId, type, value, roundTo, categoryId) => {
    const today = new Date().toISOString().split('T')[0]
    set((s) => ({
      items: s.items.map((item) => {
        if (item.groupId !== groupId) return item
        if (categoryId && item.categoryId !== categoryId) return item
        if (item.priceType !== 'fixed' || item.price === null) return item
        return { ...item, price: processPrice(item.price, type, value, roundTo) }
      }),
      groups: s.groups.map((g) =>
        g.id === groupId ? { ...g, updatedAt: today } : g
      ),
    }))
  },

  updateItemPrice: (itemId, price) =>
    set((s) => ({
      items: s.items.map((item) =>
        item.id === itemId ? { ...item, price, priceType: price !== null ? 'fixed' : item.priceType } : item
      ),
    })),

  setItemPriceType: (itemId, priceType) =>
    set((s) => ({
      items: s.items.map((item) =>
        item.id === itemId ? { ...item, priceType, price: priceType !== 'fixed' ? null : item.price } : item
      ),
    })),

  toggleItemVisibility: (itemId) =>
    set((s) => ({
      items: s.items.map((item) =>
        item.id === itemId ? { ...item, isVisible: !item.isVisible } : item
      ),
    })),

  renameGroup: (id, name, description) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === id ? { ...g, name, description: description ?? g.description, updatedAt: new Date().toISOString().split('T')[0] } : g
      ),
    })),

  archiveGroup: (id) =>
    set((s) => ({
      groups: s.groups.map((g) => (g.id === id ? { ...g, isArchived: !g.isArchived } : g)),
      selectedGroupId: s.selectedGroupId === id
        ? s.groups.find((g) => !g.isArchived && g.id !== id)?.id ?? ''
        : s.selectedGroupId,
    })),

  deleteGroup: (id) =>
    set((s) => ({
      groups: s.groups.filter((g) => g.id !== id),
      items: s.items.filter((i) => i.groupId !== id),
      selectedGroupId: s.selectedGroupId === id
        ? s.groups.find((g) => g.id !== id)?.id ?? ''
        : s.selectedGroupId,
    })),

  setDefaultGroup: (id) =>
    set((s) => ({
      groups: s.groups.map((g) => ({ ...g, isDefault: g.id === id })),
    })),
}))
