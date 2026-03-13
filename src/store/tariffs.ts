import { create } from 'zustand'
import type { TariffGroup, TariffItem, TariffCategory, TariffSnapshot } from '@/types/tariffs'

const MAX_SNAPSHOTS_PER_GROUP = 15

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
  return applyRounding(Math.max(0, adjusted), roundTo)
}

// ── Données initiales ─────────────────────────────────────────────────────────

type BaseItem = Omit<TariffItem, 'id' | 'groupId'>

const BASE_ITEMS: BaseItem[] = [
  { categoryId: 'frais_demarrage', label: 'Frais de mise en place — Brain E-Log', price: null, priceType: 'tbd', unit: 'forfait', billing: 'une_seule_fois', isVisible: true, sortOrder: 1, description: 'Étude et organisation des flux logistiques' },
  { categoryId: 'frais_demarrage', label: 'Frais de mise en place — WMS', price: null, priceType: 'tbd', unit: 'forfait', billing: 'une_seule_fois', isVisible: true, sortOrder: 2, description: 'Intégration WMS avec CMS/ERP' },
  { categoryId: 'frais_recurrents', label: 'Gestion mensuelle de compte', price: 150, priceType: 'fixed', unit: 'par mois', billing: 'mensuel', isVisible: true, sortOrder: 1, description: 'Frais de dossiers administratifs et facturation' },
  { categoryId: 'frais_recurrents', label: 'Abonnement WMS', price: 100, priceType: 'fixed', unit: 'par mois', billing: 'mensuel', isVisible: true, sortOrder: 2, description: 'Licence mensuelle WMS' },
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
    price: item.price !== null && modifier !== 1
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
  snapshots: TariffSnapshot[]
  selectedGroupId: string
  isLoading: boolean
  // Init
  initialize: () => Promise<void>
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
  applyBulkAdjustment: (groupId: string, type: 'percent' | 'flat', value: number, roundTo: number, categoryId?: string) => void
  // Historique
  saveSnapshot: (groupId: string, label: string) => void
  revertToSnapshot: (snapshotId: string) => void
  deleteSnapshot: (snapshotId: string) => void
}

export const useTariffStore = create<TariffStore>((set, get) => {

  // Persiste tout l'état dans data/tariffs.json via l'API route
  function save() {
    const { groups, items, snapshots } = get()
    fetch('/api/tariffs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groups, items, snapshots }),
    }).catch((err) => console.error('[tariffs] save error:', err))
  }

  return {
    groups: INITIAL_GROUPS,
    items: INITIAL_ITEMS,
    categories: CATEGORIES,
    snapshots: [],
    selectedGroupId: 'standard',
    isLoading: false,

    // ── Initialisation depuis le fichier JSON ──────────────────────────────────

    initialize: async () => {
      if (get().isLoading) return
      set({ isLoading: true })
      try {
        const res = await fetch('/api/tariffs')
        const data = await res.json()
        if (data && data.groups?.length > 0) {
          set({
            groups: data.groups,
            items: data.items ?? [],
            snapshots: data.snapshots ?? [],
            selectedGroupId: data.groups.find((g: TariffGroup) => g.isDefault)?.id ?? data.groups[0]?.id ?? 'standard',
          })
        } else {
          // Premier démarrage → seed + sauvegarde
          save()
        }
      } catch (err) {
        console.error('[tariffs] initialize error:', err)
      } finally {
        set({ isLoading: false })
      }
    },

    selectGroup: (id) => set({ selectedGroupId: id }),

    // ── Snapshots ──────────────────────────────────────────────────────────────

    saveSnapshot: (groupId, label) => {
      const currentItems = get().items.filter((i) => i.groupId === groupId)
      const snap: TariffSnapshot = {
        id: `snap-${groupId}-${Date.now()}`,
        groupId,
        label,
        items: currentItems.map((i) => ({ ...i })),
        createdAt: new Date().toISOString(),
      }
      set((s) => {
        const groupSnaps = s.snapshots.filter((sn) => sn.groupId === groupId)
        const others = s.snapshots.filter((sn) => sn.groupId !== groupId)
        const kept = groupSnaps.slice(-(MAX_SNAPSHOTS_PER_GROUP - 1))
        return { snapshots: [...others, ...kept, snap] }
      })
      save()
    },

    revertToSnapshot: (snapshotId) => {
      const snap = get().snapshots.find((s) => s.id === snapshotId)
      if (!snap) return
      const today = new Date().toISOString().split('T')[0]
      set((s) => ({
        items: [...s.items.filter((i) => i.groupId !== snap.groupId), ...snap.items.map((i) => ({ ...i }))],
        groups: s.groups.map((g) => g.id === snap.groupId ? { ...g, updatedAt: today } : g),
      }))
      save()
    },

    deleteSnapshot: (snapshotId) => {
      set((s) => ({ snapshots: s.snapshots.filter((sn) => sn.id !== snapshotId) }))
      save()
    },

    // ── Groupes ────────────────────────────────────────────────────────────────

    createGroup: (name, description) => {
      const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
      const newGroup: TariffGroup = {
        id, name, description,
        baseGroupId: null, isDefault: false, isArchived: false, isLocked: false, usedCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      }
      const newItems = createItems(id, 1)
      set((s) => ({ groups: [...s.groups, newGroup], items: [...s.items, ...newItems], selectedGroupId: id }))
      save()
    },

    duplicateGroup: (sourceId, newName, options) => {
      const {
        adjustType = 'none', modifierType = 'percent',
        globalValue = 0, perCategory = {}, roundTo = 0,
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
      const newItems: TariffItem[] = get().items.filter((i) => i.groupId === sourceId).map((item, idx) => {
        let newPrice = item.price
        if (item.priceType === 'fixed') {
          if (adjustType === 'global') newPrice = processPrice(item.price, modifierType, globalValue, roundTo)
          else if (adjustType === 'per_category') newPrice = processPrice(item.price, modifierType, perCategory[item.categoryId] ?? 0, roundTo)
          else if (roundTo > 0 && item.price !== null) newPrice = applyRounding(item.price, roundTo)
        }
        return { ...item, id: `${id}-item-${idx}`, groupId: id, price: newPrice }
      })

      set((s) => ({ groups: [...s.groups, newGroup], items: [...s.items, ...newItems], selectedGroupId: id }))
      save()
    },

    applyBulkAdjustment: (groupId, type, value, roundTo, categoryId) => {
      get().saveSnapshot(groupId, (() => {
        const catLabel = categoryId
          ? get().categories.find((c) => c.id === categoryId)?.label ?? categoryId
          : 'toutes catégories'
        const sign = value > 0 ? '+' : ''
        const typeLabel = type === 'percent' ? '%' : '€'
        return `Avant ajustement ${sign}${value}${typeLabel} · ${catLabel}`
      })())

      const today = new Date().toISOString().split('T')[0]
      set((s) => {
        const newItems = s.items.map((item) => {
          if (item.groupId !== groupId) return item
          if (categoryId && item.categoryId !== categoryId) return item
          if (item.priceType !== 'fixed' || item.price === null) return item
          return { ...item, price: processPrice(item.price, type, value, roundTo) }
        })
        return {
          items: newItems,
          groups: s.groups.map((g) => g.id === groupId ? { ...g, updatedAt: today } : g),
        }
      })
      save()
    },

    updateItemPrice: (itemId, price) => {
      set((s) => ({
        items: s.items.map((item) =>
          item.id === itemId ? { ...item, price, priceType: price !== null ? 'fixed' : item.priceType } : item
        ),
      }))
      save()
    },

    setItemPriceType: (itemId, priceType) => {
      set((s) => ({
        items: s.items.map((item) =>
          item.id === itemId ? { ...item, priceType, price: priceType !== 'fixed' ? null : item.price } : item
        ),
      }))
      save()
    },

    toggleItemVisibility: (itemId) => {
      set((s) => ({
        items: s.items.map((i) => i.id === itemId ? { ...i, isVisible: !i.isVisible } : i),
      }))
      save()
    },

    renameGroup: (id, name, description) => {
      const today = new Date().toISOString().split('T')[0]
      set((s) => ({
        groups: s.groups.map((g) =>
          g.id === id ? { ...g, name, description: description ?? g.description, updatedAt: today } : g
        ),
      }))
      save()
    },

    archiveGroup: (id) => {
      const group = get().groups.find((g) => g.id === id)
      if (!group) return
      const newArchived = !group.isArchived
      set((s) => ({
        groups: s.groups.map((g) => g.id === id ? { ...g, isArchived: newArchived } : g),
        selectedGroupId: s.selectedGroupId === id
          ? s.groups.find((g) => !g.isArchived && g.id !== id)?.id ?? ''
          : s.selectedGroupId,
      }))
      save()
    },

    deleteGroup: (id) => {
      set((s) => ({
        groups: s.groups.filter((g) => g.id !== id),
        items: s.items.filter((i) => i.groupId !== id),
        snapshots: s.snapshots.filter((sn) => sn.groupId !== id),
        selectedGroupId: s.selectedGroupId === id
          ? s.groups.find((g) => g.id !== id)?.id ?? ''
          : s.selectedGroupId,
      }))
      save()
    },

    setDefaultGroup: (id) => {
      set((s) => ({ groups: s.groups.map((g) => ({ ...g, isDefault: g.id === id })) }))
      save()
    },
  }
})
