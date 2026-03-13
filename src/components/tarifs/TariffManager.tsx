'use client'

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { Plus, MoreHorizontal, Eye, EyeOff, Lock, Star, Copy, Pencil, Archive, Trash2, Scale, ChevronDown, ChevronRight, Sliders, Rocket, Database, Briefcase, Server, Truck, Package2, Package, PackageCheck, Warehouse, LayoutGrid, ShoppingCart, List, Scan, Users, Tag, Printer, Gift, Globe, RotateCcw, Wrench, ClipboardList, Clock, Undo2, X } from 'lucide-react'
import { useTariffStore, type DuplicateOptions } from '@/store/tariffs'
import type { TariffGroup, TariffItem, TariffCategory, TariffSnapshot, TariffItemFormula } from '@/types/tariffs'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number | null, priceType: string): string {
  if (priceType === 'tbd') return 'À définir'
  if (priceType === 'quote') return 'Sur devis'
  if (price === null) return '—'
  return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(price)
}

function shortUnit(unit: string): string {
  const map: Record<string, string> = {
    'par mois': '/mois', 'par palette / par mois': '/pal/mois', 'par conteneur': '/cont',
    'par palette': '/pal', 'par colis': '/colis', 'par article (UVC)': '/UVC',
    'par commande': '/cmd', 'par ligne de commande': '/ligne', 'par heure': '/h',
    'par document': '/doc', 'par pièce': '/pièce', 'par retour': '/retour',
    'par emplacement / par mois': '/empl/mois', forfait: 'forfait',
  }
  return map[unit] ?? unit
}

function useOutsideClick(handler: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [handler])
  return ref
}

// ─── Icônes par item ──────────────────────────────────────────────────────────

const ITEM_ICONS: Record<string, React.ComponentType<{ size: number; style?: React.CSSProperties }>> = {
  'Frais de mise en place — Brain E-Log':       Rocket,
  'Frais de mise en place — WMS':               Database,
  'Gestion mensuelle de compte':                Briefcase,
  'Abonnement WMS':                             Server,
  'Déchargement container 40 pieds (max 4h)':  Truck,
  'Déchargement container 20 pieds (max 2h)':  Truck,
  'Déchargement palette':                       Package2,
  'Déchargement colis':                         Package,
  'Entrée en stock':                            PackageCheck,
  'Stockage palette':                           Warehouse,
  'Stockage bac / étagère picking':             LayoutGrid,
  'Préparation commande B2C — par commande':    ShoppingCart,
  'Préparation commande B2C — par ligne':       List,
  'Préparation commande B2C — par article':     Scan,
  'Préparation commande B2B (régie)':           Users,
  'Étiquette transporteur':                     Tag,
  'Impression + insertion BL':                  Printer,
  'Insertion document / flyer / goodies':       Gift,
  'Documents douaniers (hors UE)':              Globe,
  'Management des retours':                     RotateCcw,
  'Services additionnels — Manutention':        Wrench,
  'Services additionnels — Administration':     ClipboardList,
}

const ROUND_OPTIONS = [
  { value: 0,    label: 'Aucun' },
  { value: 0.05, label: '0,05 €' },
  { value: 0.10, label: '0,10 €' },
  { value: 0.50, label: '0,50 €' },
  { value: 1.00, label: '1,00 €' },
]

// Champs questionnaire disponibles pour les formules
const Q_FIELDS_FORMULA = [
  { code: 'Q4.01', label: 'Volume B2C / mois', unit: 'colis' },
  { code: 'Q4.02', label: 'Lignes / commande B2C', unit: 'lignes' },
  { code: 'Q4.03', label: 'Articles / commande B2C', unit: 'articles' },
  { code: 'Q4.04', label: 'Volume B2B / mois', unit: 'palettes' },
  { code: 'Q5.01', label: 'Stock moyen', unit: 'palettes' },
  { code: 'Q5.02', label: 'Bacs picking', unit: 'bacs' },
  { code: 'Q6.07', label: 'Volume Suisse / mois', unit: 'colis' },
  { code: 'Q3.03', label: 'Retours / mois', unit: 'colis' },
]

// Labels des 22 items de base (par index, correspond à BASE_ITEMS dans le store)
const BASE_ITEM_LABELS: string[] = [
  'Frais de mise en place — Brain E-Log',
  'Frais de mise en place — WMS',
  'Gestion mensuelle de compte',
  'Abonnement WMS',
  'Déchargement container 40 pieds (max 4h)',
  'Déchargement container 20 pieds (max 2h)',
  'Déchargement palette',
  'Déchargement colis',
  'Entrée en stock',
  'Stockage palette',
  'Stockage bac / étagère picking',
  'Préparation commande B2C — par commande',
  'Préparation commande B2C — par ligne',
  'Préparation commande B2C — par article',
  'Préparation commande B2B (régie)',
  'Étiquette transporteur',
  'Impression + insertion BL',
  'Insertion document / flyer / goodies',
  'Documents douaniers (hors UE)',
  'Management des retours',
  'Services additionnels — Manutention',
  'Services additionnels — Administration',
]

const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 50,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)',
}
const modalBox = (width: number): React.CSSProperties => ({
  width, maxHeight: '90vh', overflowY: 'auto',
  background: '#fff', borderRadius: 14,
  border: '1px solid var(--border)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
  padding: 28,
})
const inputBase: React.CSSProperties = {
  width: '100%', padding: '8px 11px', borderRadius: 8,
  border: '1px solid var(--border)', fontSize: 13,
  color: 'var(--gray-900)', outline: 'none', boxSizing: 'border-box',
}
const labelSm: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'var(--gray-500)', textTransform: 'uppercase' as const,
  letterSpacing: '0.06em', marginBottom: 10,
}
const divider: React.CSSProperties = { height: 1, background: 'var(--border)', margin: '20px -28px' }

function RoundPills({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {ROUND_OPTIONS.map((r) => (
        <button key={r.value} onClick={() => onChange(r.value)} style={{
          padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
          border: `1px solid ${value === r.value ? 'var(--primary)' : 'var(--border)'}`,
          background: value === r.value ? 'var(--primary-light)' : '#fff',
          color: value === r.value ? 'var(--primary)' : 'var(--gray-600)',
          transition: 'all 120ms',
        }}>
          {r.label}
        </button>
      ))}
    </div>
  )
}

// ─── Modal Créer/Renommer groupe ──────────────────────────────────────────────

interface GroupModalProps {
  title: string; subtitle?: string; onClose: () => void
  onConfirm: (name: string, description?: string) => void
  confirmLabel?: string; initialName?: string; initialDesc?: string
}

function GroupModal({ title, subtitle, onClose, onConfirm, confirmLabel = 'Créer', initialName = '', initialDesc = '' }: GroupModalProps) {
  const [name, setName] = useState(initialName)
  const [desc, setDesc] = useState(initialDesc)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  function submit() { if (name.trim()) { onConfirm(name.trim(), desc.trim() || undefined); onClose() } }

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={(e) => e.stopPropagation()} style={modalBox(460)}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginBottom: subtitle ? 4 : 20 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{subtitle}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Nom du groupe *</label>
            <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && submit()}
              style={inputBase} placeholder="ex: On se fait plaisir" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Description</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} style={inputBase} placeholder="Optionnel" />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={submit} disabled={!name.trim()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: name.trim() ? 'var(--primary)' : 'var(--gray-200)', fontSize: 13, fontWeight: 600, color: name.trim() ? '#fff' : 'var(--gray-400)', cursor: name.trim() ? 'pointer' : 'default' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Dupliquer ──────────────────────────────────────────────────────────

interface DupState {
  adjustType: 'none' | 'global' | 'per_category'
  modType: 'percent' | 'flat'
  globalVal: string
  catVals: Record<string, string>
  roundTo: number
}

function DuplicateModal({ source, onClose, onConfirm }: {
  source: TariffGroup
  onClose: () => void
  onConfirm: (sourceId: string, newName: string, options: DuplicateOptions) => void
}) {
  const { categories } = useTariffStore()
  const [name, setName] = useState(`${source.name} (copie)`)
  const [dup, setDup] = useState<DupState>({
    adjustType: 'none',
    modType: 'percent',
    globalVal: '',
    catVals: Object.fromEntries(categories.map((c) => [c.id, ''])),
    roundTo: 0,
  })
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])

  function setD<K extends keyof DupState>(k: K, v: DupState[K]) { setDup((p) => ({ ...p, [k]: v })) }

  function submit() {
    if (!name.trim()) return
    const parse = (s: string) => parseFloat(s.replace(',', '.')) || 0
    const options: DuplicateOptions = {
      adjustType: dup.adjustType,
      modifierType: dup.modType,
      globalValue: parse(dup.globalVal),
      perCategory: Object.fromEntries(Object.entries(dup.catVals).map(([k, v]) => [k, parse(v)])),
      roundTo: dup.roundTo,
    }
    onConfirm(source.id, name.trim(), options)
    onClose()
  }

  const typeLabel = dup.modType === 'percent' ? '%' : '€'
  const adjustTypes: { key: DupState['adjustType']; label: string }[] = [
    { key: 'none', label: 'Copie exacte' },
    { key: 'global', label: 'Global' },
    { key: 'per_category', label: 'Par catégorie' },
  ]

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={(e) => e.stopPropagation()} style={modalBox(520)}>

        {/* Header */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
          Dupliquer &quot;{source.name}&quot;
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Créez une variante de cette grille tarifaire avec des prix ajustés.
        </p>

        {/* Nom */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Nom du nouveau groupe *</label>
          <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && submit()} style={inputBase} />
        </div>

        <div style={divider} />

        {/* Section ajustement */}
        <p style={labelSm}>Ajustement des prix</p>

        {/* Radio type */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {adjustTypes.map(({ key, label }) => (
            <button key={key} onClick={() => setD('adjustType', key)} style={{
              flex: 1, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${dup.adjustType === key ? 'var(--primary)' : 'var(--border)'}`,
              background: dup.adjustType === key ? 'var(--primary-light)' : '#fff',
              fontSize: 12, fontWeight: dup.adjustType === key ? 700 : 500,
              color: dup.adjustType === key ? 'var(--primary)' : 'var(--gray-600)',
              transition: 'all 120ms',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Global */}
        {dup.adjustType === 'global' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
                Valeur <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(+ augmentation · – réduction)</span>
              </label>
              <input value={dup.globalVal} onChange={(e) => setD('globalVal', e.target.value)}
                type="number" step="0.01" placeholder={dup.modType === 'percent' ? 'ex: 10 ou -15' : 'ex: 0.10 ou -5'}
                style={{ ...inputBase, width: '100%' }} />
            </div>
            <select value={dup.modType} onChange={(e) => setD('modType', e.target.value as 'percent' | 'flat')}
              style={{ padding: '8px 11px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--gray-700)', background: '#fff', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
              <option value="percent">%</option>
              <option value="flat">€ (flat)</option>
            </select>
          </div>
        )}

        {/* Par catégorie */}
        {dup.adjustType === 'per_category' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>
                Valeur par catégorie <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(+ / –)</span>
              </label>
              <select value={dup.modType} onChange={(e) => setD('modType', e.target.value as 'percent' | 'flat')}
                style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 12, color: 'var(--gray-700)', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option value="percent">%</option>
                <option value="flat">€ (flat)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--gray-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.label}
                  </span>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <input
                      value={dup.catVals[cat.id] ?? ''}
                      onChange={(e) => setD('catVals', { ...dup.catVals, [cat.id]: e.target.value })}
                      type="number" step="0.01" placeholder="0"
                      style={{ width: 90, padding: '6px 30px 6px 10px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 13, color: 'var(--gray-900)', outline: 'none', textAlign: 'right' }} />
                    <span style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--gray-400)', pointerEvents: 'none' }}>
                      {typeLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={divider} />

        {/* Section arrondi */}
        <p style={labelSm}>Arrondi après calcul</p>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            Arrondir les prix au plus proche de :
          </p>
          <RoundPills value={dup.roundTo} onChange={(v) => setD('roundTo', v)} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={submit} disabled={!name.trim()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: name.trim() ? 'var(--primary)' : 'var(--gray-200)', fontSize: 13, fontWeight: 600, color: name.trim() ? '#fff' : 'var(--gray-400)', cursor: name.trim() ? 'pointer' : 'default' }}>
            Dupliquer →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Ajustement en masse ────────────────────────────────────────────────

function BulkAdjustModal({ group, onClose }: { group: TariffGroup; onClose: () => void }) {
  const { categories, items, applyBulkAdjustment } = useTariffStore()
  const [catTarget, setCatTarget] = useState('all')
  const [modType, setModType] = useState<'percent' | 'flat'>('percent')
  const [rawVal, setRawVal] = useState('')
  const [roundTo, setRoundTo] = useState(0)

  const value = parseFloat(rawVal.replace(',', '.')) || 0
  const hasAction = value !== 0 || roundTo > 0

  const targetItems = items.filter((i) => {
    if (i.groupId !== group.id) return false
    if (catTarget !== 'all' && i.categoryId !== catTarget) return false
    return i.priceType === 'fixed' && i.price !== null
  })

  // Aperçu : préfère un item où l'arrondi a un effet visible
  const previewItem = (() => {
    if (roundTo <= 0) return targetItems[0]
    return targetItems.find((item) => {
      if (item.price == null) return false
      let adj = item.price
      if (value !== 0) adj = modType === 'percent' ? adj * (1 + value / 100) : adj + value
      adj = Math.max(0, adj)
      const rounded = Math.round(adj / roundTo) * roundTo
      return Math.abs(rounded - adj) > 0.001
    }) ?? targetItems[0]
  })()

  let previewAfter: number | null = null
  if (previewItem?.price != null && hasAction) {
    let adj = previewItem.price
    if (value !== 0) adj = modType === 'percent' ? adj * (1 + value / 100) : adj + value
    if (roundTo > 0) adj = Math.round(adj / roundTo) * roundTo
    previewAfter = Math.max(0, Math.round(adj * 100) / 100)
  }

  function apply() {
    if (!hasAction) return
    applyBulkAdjustment(group.id, modType, value, roundTo, catTarget === 'all' ? undefined : catTarget)
    onClose()
  }

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={(e) => e.stopPropagation()} style={modalBox(460)}>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
          Ajuster les prix
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Applique un ajustement à la grille &quot;{group.name}&quot;.
        </p>

        {/* Cible */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Appliquer à</label>
          <select value={catTarget} onChange={(e) => setCatTarget(e.target.value)}
            style={{ ...inputBase, cursor: 'pointer' }}>
            <option value="all">Toutes les catégories</option>
            {[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Ajustement */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
            Ajustement <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(+ augmentation · – réduction)</span>
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={rawVal} onChange={(e) => setRawVal(e.target.value)}
              type="number" step="0.01"
              placeholder={modType === 'percent' ? 'ex: 10 ou -15' : 'ex: 0.10 ou -5'}
              style={{ ...inputBase, flex: 1 }} />
            <select value={modType} onChange={(e) => setModType(e.target.value as 'percent' | 'flat')}
              style={{ padding: '8px 11px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--gray-700)', background: '#fff', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
              <option value="percent">%</option>
              <option value="flat">€ (flat)</option>
            </select>
          </div>
        </div>

        {/* Arrondi */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 8 }}>
            Arrondi après calcul
          </label>
          <RoundPills value={roundTo} onChange={setRoundTo} />
        </div>

        {/* Aperçu */}
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--gray-50)', border: '1px solid var(--border)', marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Aperçu</p>
          {hasAction ? (
            <p style={{ fontSize: 13, color: 'var(--gray-700)' }}>
              <strong>{targetItems.length}</strong> prix fixes seront modifiés
              {previewItem?.price != null && previewAfter !== null && (
                <> · ex:{' '}
                  <span style={{ fontFamily: 'monospace' }}>{formatPrice(previewItem.price, 'fixed')}</span>
                  {' → '}
                  <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{formatPrice(previewAfter, 'fixed')}</strong>
                </>
              )}
            </p>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Configurez un ajustement ou un arrondi ci-dessus.</p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={apply} disabled={!hasAction} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: hasAction ? 'var(--primary)' : 'var(--gray-200)', fontSize: 13, fontWeight: 600, color: hasAction ? '#fff' : 'var(--gray-400)', cursor: hasAction ? 'pointer' : 'default' }}>
            Appliquer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Historique ─────────────────────────────────────────────────────────

function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `Il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Il y a ${diffH}h`
  return d.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function HistoryModal({ group, onClose }: { group: TariffGroup; onClose: () => void }) {
  const { snapshots, revertToSnapshot, deleteSnapshot, saveSnapshot } = useTariffStore()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const groupSnaps = [...snapshots.filter((s) => s.groupId === group.id)].reverse()

  function handleRevert(snap: TariffSnapshot) {
    // Sauvegarde l'état actuel avant de revenir en arrière
    saveSnapshot(group.id, `Avant restauration "${snap.label}"`)
    revertToSnapshot(snap.id)
    onClose()
  }

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalBox(500), maxHeight: '80vh' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Clock size={16} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', flex: 1 }}>
            Historique — {group.name}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', padding: 4 }}>
            <X size={16} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Un snapshot est créé automatiquement avant chaque ajustement en masse.
        </p>

        {groupSnaps.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <Clock size={32} style={{ color: 'var(--gray-300)', marginBottom: 10 }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Aucun snapshot pour ce groupe.<br />
              Ils apparaîtront automatiquement avant les prochains ajustements.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', maxHeight: 400 }}>
            {groupSnaps.map((snap) => (
              <div key={snap.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                border: `1px solid ${confirmId === snap.id ? 'var(--primary)' : 'var(--border)'}`,
                background: confirmId === snap.id ? 'var(--primary-light)' : '#fff',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {snap.label}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                    {formatRelativeDate(snap.createdAt)} · {snap.items.filter(i => i.priceType === 'fixed').length} prix fixes
                  </p>
                </div>

                {confirmId === snap.id ? (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setConfirmId(null)}
                      style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff', fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', cursor: 'pointer' }}>
                      Annuler
                    </button>
                    <button onClick={() => handleRevert(snap)}
                      style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: 'var(--primary)', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Undo2 size={11} /> Confirmer
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => setConfirmId(snap.id)}
                      style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff', fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Undo2 size={11} /> Restaurer
                    </button>
                    <button onClick={() => deleteSnapshot(snap.id)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-400)' }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ ...divider, marginTop: 20 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => { saveSnapshot(group.id, 'Checkpoint manuel'); }}
            style={{ padding: '7px 13px', borderRadius: 7, border: '1px solid var(--border)', background: '#fff', fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={12} /> Sauvegarder maintenant
          </button>
          <button onClick={onClose}
            style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--primary)', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Group Dropdown ────────────────────────────────────────────────────────────

function GroupDropdown({ group, onRename, onDuplicate, onArchive, onDelete, onSetDefault }: {
  group: TariffGroup; onRename: () => void; onDuplicate: () => void
  onArchive: () => void; onDelete: () => void; onSetDefault: () => void
}) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const ref = useOutsideClick(close)

  const actions = [
    !group.isDefault && { icon: Star, label: 'Définir comme défaut', fn: onSetDefault },
    { icon: Copy, label: 'Dupliquer', fn: onDuplicate },
    !group.isLocked && { icon: Pencil, label: 'Renommer', fn: onRename },
    { icon: Archive, label: group.isArchived ? 'Désarchiver' : 'Archiver', fn: onArchive },
    !group.isDefault && !group.isLocked && { icon: Trash2, label: 'Supprimer', fn: onDelete, danger: true },
  ].filter(Boolean) as { icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>, label: string, fn: () => void, danger?: boolean }[]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: open ? 'var(--gray-100)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-400)' }}>
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 30, zIndex: 40, width: 190, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: 4, overflow: 'hidden' }}>
          {actions.map(({ icon: Icon, label, fn, danger }) => (
            <button key={label} onClick={() => { fn(); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, color: danger ? '#e11d48' : 'var(--gray-700)', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}>
              <Icon size={13} style={{ opacity: 0.8 }} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Price Cell ────────────────────────────────────────────────────────────────

function PriceCell({ item, trigger = 0 }: { item: TariffItem; trigger?: number }) {
  const { updateItemPrice, setItemPriceType } = useTariffStore()
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // tbd et fixed sont éditables ; quote reste "Sur devis" (choix métier)
  const isEditable = item.priceType === 'fixed' || item.priceType === 'tbd'

  // Déclenchement externe (clic sur la ligne)
  useEffect(() => {
    if (trigger > 0 && isEditable && !editing) {
      setRaw(item.price !== null ? String(item.price) : '')
      setEditing(true)
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  function startEdit() {
    if (!isEditable) return
    setRaw(item.price !== null ? String(item.price) : '')
    setEditing(true)
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0)
  }

  function commit() {
    const parsed = parseFloat(raw.replace(',', '.'))
    if (!isNaN(parsed) && parsed >= 0) {
      updateItemPrice(item.id, Math.round(parsed * 10000) / 10000)
    } else {
      // Champ vide → repasse en "À définir"
      setItemPriceType(item.id, 'tbd')
    }
    setEditing(false)
  }

  const isTbd = item.priceType === 'tbd'
  const isSpecial = isTbd || item.priceType === 'quote'

  if (editing) {
    return (
      <input ref={inputRef} value={raw} onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        autoFocus placeholder="ex: 500"
        style={{ width: 100, padding: '3px 6px', fontSize: 13, fontFamily: 'monospace', textAlign: 'right', border: 'none', borderBottom: '2px solid var(--primary)', background: 'transparent', outline: 'none', color: 'var(--gray-900)' }} />
    )
  }

  return (
    <span onClick={startEdit}
      title={isEditable ? 'Cliquer pour saisir un prix' : undefined}
      style={{
        fontSize: 13, fontFamily: 'ui-monospace, monospace',
        color: isSpecial ? (isTbd ? '#b45309' : 'var(--gray-400)') : 'var(--gray-800)',
        fontStyle: isSpecial ? 'italic' : 'normal',
        fontWeight: isSpecial ? 400 : 500,
        cursor: isEditable ? 'pointer' : 'default',
        padding: '2px 4px', borderRadius: 4,
        transition: 'background 150ms',
      }}>
      {formatPrice(item.price, item.priceType)}
    </span>
  )
}

// ─── Billing config ───────────────────────────────────────────────────────────

const BILLING_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  mensuel:        { label: 'mensuel',  color: '#3b82f6', bg: '#EFF6FF' },
  a_l_usage:      { label: 'usage',    color: '#16a34a', bg: '#F0FDF4' },
  une_seule_fois: { label: 'unique',   color: '#d97706', bg: '#FFFBEB' },
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function formulaLabel(f: TariffItemFormula): string {
  if (f.type === 'questionnaire') {
    const q = Q_FIELDS_FORMULA.find((q) => q.code === f.questionCode)
    const ql = q?.label ?? f.questionCode ?? '?'
    return `${ql} × ${f.unitPrice ?? '?'} €/${q?.unit ?? 'unité'}`
  }
  if (f.type === 'item_ref') {
    const ref = f.refItemIndex !== undefined ? BASE_ITEM_LABELS[f.refItemIndex] ?? `#${f.refItemIndex}` : '?'
    const parts: string[] = []
    if (f.percent !== undefined && f.percent !== 0) parts.push(`${f.percent > 0 ? '+' : ''}${f.percent}%`)
    if (f.offset !== undefined && f.offset !== 0) parts.push(`${f.offset > 0 ? '+' : ''}${f.offset}€`)
    return `Basé sur "${ref}"${parts.length ? ' ' + parts.join(' ') : ''}`
  }
  return 'Formule'
}

function ItemRow({ item, index }: { item: TariffItem; index: number }) {
  const { toggleItemVisibility, deleteCustomItem } = useTariffStore()
  const [hovered, setHovered] = useState(false)
  const [triggerEdit, setTriggerEdit] = useState(0)

  function handleRowClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button')) return
    setTriggerEdit((t) => t + 1)
  }

  const billing = BILLING_CONFIG[item.billing] ?? { label: item.billing, color: '#94a3b8', bg: '#f8fafc' }
  const baseBg = index % 2 === 0 ? '#fff' : '#FAFBFD'

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleRowClick}
      style={{
        borderBottom: '1px solid #F1F5F9',
        background: hovered ? '#EFF6FF' : baseBg,
        transition: 'background 100ms',
        opacity: item.isVisible ? 1 : 0.38,
        cursor: 'pointer',
      }}>

      {/* Drag handle */}
      <td style={{ paddingLeft: 16, paddingRight: 4, paddingTop: 8, paddingBottom: 8, width: 20, verticalAlign: 'middle' }}>
        <span style={{ fontSize: 13, color: '#CBD5E1', opacity: hovered ? 1 : 0, cursor: 'grab', userSelect: 'none', display: 'block', textAlign: 'center' }}>⠿</span>
      </td>

      {/* Icon + label + description */}
      <td style={{ padding: '7px 10px 7px 6px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          {(() => { const Icon = ITEM_ICONS[item.label]; return Icon ? <Icon size={13} style={{ color: '#94A3B8', flexShrink: 0, marginTop: 2 }} /> : null })()}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 450, color: '#1E293B', lineHeight: '1.35' }}>{item.label}</span>
              {item.isCustom && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: '#EDE9FE', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                  custom
                </span>
              )}
            </div>
            {item.description && (
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1, lineHeight: '1.3' }}>{item.description}</div>
            )}
            {item.formula && (
              <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 1, lineHeight: '1.3', fontStyle: 'italic' }}>
                ƒ {formulaLabel(item.formula)}
              </div>
            )}
          </div>
          {item.isCustom && hovered && (
            <button onClick={(e) => { e.stopPropagation(); deleteCustomItem(item.id) }} title="Supprimer cet item"
              style={{ flexShrink: 0, width: 20, height: 20, border: 'none', background: 'transparent', borderRadius: 4, cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <X size={12} />
            </button>
          )}
        </div>
      </td>

      {/* Price */}
      <td style={{ padding: '7px 8px', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
        <PriceCell item={item} trigger={triggerEdit} />
      </td>

      {/* Unit + billing */}
      <td style={{ padding: '7px 8px 7px 4px', width: 120, verticalAlign: 'middle' }}>
        <div style={{ fontSize: 12, color: '#64748B', lineHeight: '1.3' }}>{shortUnit(item.unit)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: billing.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: billing.color, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
            {billing.label}
          </span>
        </div>
      </td>

      {/* Visibility toggle */}
      <td style={{ padding: '7px 16px 7px 4px', width: 36, verticalAlign: 'middle' }}>
        <button onClick={() => toggleItemVisibility(item.id)} title={item.isVisible ? 'Masquer' : 'Afficher'}
          style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: item.isVisible ? 'var(--primary)' : '#CBD5E1', opacity: hovered || !item.isVisible ? 1 : 0, transition: 'opacity 150ms' }}>
          {item.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </td>
    </tr>
  )
}

// ─── Category Section ─────────────────────────────────────────────────────────

const CATEGORY_ACCENT: Record<string, string> = {
  frais_demarrage:  '#f59e0b',
  frais_recurrents: '#3b82f6',
  frais_activite:   '#8b5cf6',
}

function CategorySection({ categoryId, label, description, items }: { categoryId: string; label: string; description?: string; items: TariffItem[] }) {
  const [collapsed, setCollapsed] = useState(false)
  const accent = CATEGORY_ACCENT[categoryId] ?? '#64748b'

  // Stats rapides par billing
  const fixedCount = items.filter((i) => i.priceType === 'fixed').length

  return (
    <tbody>
      <tr onClick={() => setCollapsed((v) => !v)} style={{ cursor: 'pointer', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <td colSpan={5} style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 16px 8px 0', borderLeft: `3px solid ${accent}`, paddingLeft: 14 }}>
            <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>
                {label}
              </span>
              {description && (
                <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 8, fontWeight: 400 }}>{description}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {fixedCount < items.length && (
                <span style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', background: '#FFFBEB', padding: '1px 6px', borderRadius: 99 }}>
                  {items.length - fixedCount} à définir
                </span>
              )}
              <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 99, background: '#E2E8F0', color: '#475569' }}>
                {items.length}
              </span>
            </div>
          </div>
        </td>
      </tr>
      {!collapsed && items.sort((a, b) => a.sortOrder - b.sortOrder).map((item, idx) => <ItemRow key={item.id} item={item} index={idx} />)}
      <tr><td colSpan={5} style={{ height: 4, background: '#fff' }} /></tr>
    </tbody>
  )
}

// ─── Items Panel ──────────────────────────────────────────────────────────────

function ItemsPanel() {
  const { groups, items, categories, snapshots, selectedGroupId, duplicateGroup, renameGroup, archiveGroup, deleteGroup, setDefaultGroup } = useTariffStore()
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  const group = groups.find((g) => g.id === selectedGroupId)
  if (!group) return null

  const groupItems = items.filter((i) => i.groupId === selectedGroupId)
  const filteredItems = groupItems.filter((i) => {
    const matchSearch = i.label.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || i.categoryId === catFilter
    return matchSearch && matchCat
  })
  const visibleCount = groupItems.filter((i) => i.isVisible).length

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
      {/* Group header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{group.name}</h2>
            {group.isDefault && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'var(--primary)', color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>défaut</span>
            )}
            {group.isLocked && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: '#FFFBEB', color: '#b45309', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                <Lock size={9} /> verrouillé
              </span>
            )}
            {group.isArchived && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: '#F1F5F9', color: '#64748B' }}>archivé</span>
            )}
          </div>
          {group.description && <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{group.description}</p>}
        </div>
        <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0 }}>{visibleCount}/{groupItems.length} actifs · {group.usedCount}× utilisé</span>
        <GroupDropdown group={group}
          onRename={() => setShowRenameModal(true)}
          onDuplicate={() => setShowDuplicateModal(true)}
          onArchive={() => archiveGroup(group.id)}
          onDelete={() => deleteGroup(group.id)}
          onSetDefault={() => setDefaultGroup(group.id)} />
      </div>

      {/* Toolbar */}
      <div style={{ padding: '8px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, fontWeight: 500, color: '#475569', background: '#fff', cursor: 'pointer', outline: 'none' }}>
          <option value="all">Toutes catégories</option>
          {[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un item…"
          style={{ flex: 1, maxWidth: 260, padding: '5px 10px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, color: '#475569', background: '#fff', outline: 'none' }} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={() => setShowHistoryModal(true)}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            <Clock size={13} /> Historique
            {snapshots.filter(s => s.groupId === selectedGroupId).length > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 16, height: 16, borderRadius: 99, background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                {snapshots.filter(s => s.groupId === selectedGroupId).length}
              </span>
            )}
          </button>
          <button onClick={() => setShowBulkModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            <Sliders size={13} /> Ajuster les prix
          </button>
          <button onClick={() => setShowAddItemModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={13} /> Item
          </button>
        </div>
      </div>

      {/* Items table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => {
            const catItems = filteredItems.filter((i) => i.categoryId === cat.id)
            if (catItems.length === 0) return null
            return <CategorySection key={cat.id} categoryId={cat.id} label={cat.label} description={cat.description} items={catItems} />
          })}
        </table>
      </div>

      {showDuplicateModal && (
        <DuplicateModal source={group} onClose={() => setShowDuplicateModal(false)} onConfirm={duplicateGroup} />
      )}
      {showRenameModal && (
        <GroupModal title={`Renommer "${group.name}"`} onClose={() => setShowRenameModal(false)} onConfirm={(n, d) => renameGroup(group.id, n, d)} confirmLabel="Enregistrer" initialName={group.name} initialDesc={group.description ?? ''} />
      )}
      {showBulkModal && (
        <BulkAdjustModal group={group} onClose={() => setShowBulkModal(false)} />
      )}
      {showHistoryModal && (
        <HistoryModal group={group} onClose={() => setShowHistoryModal(false)} />
      )}
      {showAddItemModal && (
        <AddItemModal groupId={group.id} onClose={() => setShowAddItemModal(false)} />
      )}
    </div>
  )
}

// ─── Group Panel ──────────────────────────────────────────────────────────────

function GroupPanel() {
  const { groups, selectedGroupId, selectGroup, createGroup, duplicateGroup, renameGroup, archiveGroup, deleteGroup, setDefaultGroup } = useTariffStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [duplicateTarget, setDuplicateTarget] = useState<TariffGroup | null>(null)
  const [renameTarget, setRenameTarget] = useState<TariffGroup | null>(null)

  const activeGroups = groups.filter((g) => !g.isArchived)
  const archivedGroups = groups.filter((g) => g.isArchived)

  function GroupRow({ group }: { group: TariffGroup }) {
    const [hovered, setHovered] = useState(false)
    const active = group.id === selectedGroupId
    return (
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onClick={() => selectGroup(group.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', borderRadius: 8, marginBottom: 1,
          background: active ? 'var(--primary-light)' : hovered ? 'var(--gray-50)' : 'transparent',
          cursor: 'pointer', transition: 'background 120ms',
        }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? 'var(--primary)' : 'var(--gray-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {group.name}
        </span>
        {group.isDefault && <Star size={11} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
        {group.isLocked && <Lock size={11} style={{ color: '#b45309', flexShrink: 0 }} />}
        <div style={{ opacity: hovered ? 1 : 0, transition: 'opacity 150ms', flexShrink: 0 }}>
          <GroupDropdown group={group}
            onRename={() => setRenameTarget(group)}
            onDuplicate={() => setDuplicateTarget(group)}
            onArchive={() => archiveGroup(group.id)}
            onDelete={() => deleteGroup(group.id)}
            onSetDefault={() => setDefaultGroup(group.id)} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: 224, background: '#fff', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '12px 12px 4px', flexShrink: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 10px 8px' }}>Groupes</p>
        {activeGroups.map((g) => <GroupRow key={g.id} group={g} />)}
        {archivedGroups.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-300)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 10px 6px' }}>Archivés</p>
            {archivedGroups.map((g) => <GroupRow key={g.id} group={g} />)}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--primary)', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <Plus size={14} /> Nouveau groupe
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <Scale size={14} /> Comparer 2 groupes
        </button>
      </div>

      {showCreateModal && (
        <GroupModal title="Nouveau groupe tarifaire" onClose={() => setShowCreateModal(false)} onConfirm={createGroup} confirmLabel="Créer le groupe" />
      )}
      {duplicateTarget && (
        <DuplicateModal source={duplicateTarget} onClose={() => setDuplicateTarget(null)} onConfirm={duplicateGroup} />
      )}
      {renameTarget && (
        <GroupModal title={`Renommer "${renameTarget.name}"`} onClose={() => setRenameTarget(null)} onConfirm={(n, d) => renameGroup(renameTarget.id, n, d)} confirmLabel="Enregistrer" initialName={renameTarget.name} initialDesc={renameTarget.description ?? ''} />
      )}
    </div>
  )
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────

type PriceMode = 'fixed' | 'tbd' | 'quote' | 'questionnaire' | 'item_ref'

function AddItemModal({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const { addCustomItem, categories } = useTariffStore()

  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 'frais_activite')
  const [unit, setUnit] = useState('par unité')
  const [billing, setBilling] = useState<TariffItem['billing']>('a_l_usage')
  const [priceMode, setPriceMode] = useState<PriceMode>('fixed')
  const [fixedPrice, setFixedPrice] = useState('')
  // Questionnaire formula
  const [questionCode, setQuestionCode] = useState(Q_FIELDS_FORMULA[0].code)
  const [unitPrice, setUnitPrice] = useState('')
  // Item ref formula
  const [refItemIndex, setRefItemIndex] = useState(0)
  const [refPercent, setRefPercent] = useState('')
  const [refOffset, setRefOffset] = useState('')

  function handleSubmit() {
    if (!label.trim()) return

    let priceType: TariffItem['priceType'] = 'fixed'
    let price: number | null = null
    let formula: TariffItemFormula | undefined

    if (priceMode === 'fixed') {
      priceType = 'fixed'
      price = parseFloat(fixedPrice.replace(',', '.')) || 0
    } else if (priceMode === 'tbd') {
      priceType = 'tbd'
    } else if (priceMode === 'quote') {
      priceType = 'quote'
    } else if (priceMode === 'questionnaire') {
      priceType = 'formula'
      const q = Q_FIELDS_FORMULA.find((q) => q.code === questionCode)
      formula = {
        type: 'questionnaire',
        questionCode,
        questionLabel: q?.label,
        unitPrice: parseFloat(unitPrice.replace(',', '.')) || 0,
      }
    } else if (priceMode === 'item_ref') {
      priceType = 'formula'
      formula = {
        type: 'item_ref',
        refItemIndex,
        percent: parseFloat(refPercent.replace(',', '.')) || undefined,
        offset: parseFloat(refOffset.replace(',', '.')) || undefined,
      }
    }

    addCustomItem(groupId, {
      categoryId,
      label: label.trim(),
      description: description.trim() || undefined,
      price,
      priceType,
      unit,
      billing,
      isVisible: true,
      formula,
    })
    onClose()
  }

  const btnBase: React.CSSProperties = {
    padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border)',
  }

  return (
    <div style={modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalBox(500)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Ajouter un item personnalisé</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 4 }}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Label */}
          <div>
            <label style={labelSm}>Libellé *</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="ex : Picking spécial" style={inputBase} autoFocus />
          </div>

          {/* Description */}
          <div>
            <label style={labelSm}>Description (optionnel)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ex : Manutention hors-gabarit" style={inputBase} />
          </div>

          {/* Catégorie + Unité */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelSm}>Catégorie</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ ...inputBase }}>
                {[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelSm}>Unité</label>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="par colis" style={inputBase} />
            </div>
          </div>

          {/* Facturation */}
          <div>
            <label style={labelSm}>Type de facturation</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['une_seule_fois', 'mensuel', 'a_l_usage'] as const).map((b) => {
                const cfg = BILLING_CONFIG[b]
                const active = billing === b
                return (
                  <button key={b} onClick={() => setBilling(b)}
                    style={{ flex: 1, padding: '7px 8px', borderRadius: 7, border: `1px solid ${active ? cfg.color : '#E2E8F0'}`, background: active ? cfg.bg : '#fff', color: active ? cfg.color : '#64748B', fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer' }}>
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={divider} />

          {/* Prix */}
          <div>
            <label style={labelSm}>Type de prix</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {([
                { value: 'fixed',          label: 'Prix fixe' },
                { value: 'tbd',            label: 'À définir' },
                { value: 'quote',          label: 'Sur devis' },
                { value: 'questionnaire',  label: '× Variable' },
                { value: 'item_ref',       label: 'Basé sur item' },
              ] as { value: PriceMode; label: string }[]).map((opt) => (
                <button key={opt.value} onClick={() => setPriceMode(opt.value)}
                  style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${priceMode === opt.value ? 'var(--primary)' : '#E2E8F0'}`, background: priceMode === opt.value ? 'var(--primary-light)' : '#fff', color: priceMode === opt.value ? 'var(--primary)' : '#64748B', fontSize: 12, fontWeight: priceMode === opt.value ? 600 : 400, cursor: 'pointer' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prix fixe */}
          {priceMode === 'fixed' && (
            <div>
              <label style={labelSm}>Prix (€)</label>
              <input value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} placeholder="ex : 1.50" style={{ ...inputBase, maxWidth: 160 }} type="number" min={0} step={0.01} />
            </div>
          )}

          {/* Formule questionnaire */}
          {priceMode === 'questionnaire' && (
            <div style={{ background: '#F5F3FF', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ ...labelSm, color: '#6D28D9' }}>Variable questionnaire</label>
                <select value={questionCode} onChange={(e) => setQuestionCode(e.target.value)} style={{ ...inputBase }}>
                  {Q_FIELDS_FORMULA.map((q) => (
                    <option key={q.code} value={q.code}>{q.code} — {q.label} ({q.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ ...labelSm, color: '#6D28D9' }}>Prix unitaire (€ par {Q_FIELDS_FORMULA.find((q) => q.code === questionCode)?.unit ?? 'unité'})</label>
                <input value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="ex : 1" style={{ ...inputBase, maxWidth: 160 }} type="number" min={0} step={0.01} />
              </div>
              <div style={{ fontSize: 11, color: '#7C3AED', fontStyle: 'italic' }}>
                Résultat = volume × {unitPrice || '?'} € — calculé au moment de la génération d&apos;offre
              </div>
            </div>
          )}

          {/* Formule item ref */}
          {priceMode === 'item_ref' && (
            <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ ...labelSm, color: '#166534' }}>Item de référence</label>
                <select value={refItemIndex} onChange={(e) => setRefItemIndex(parseInt(e.target.value))} style={{ ...inputBase }}>
                  {BASE_ITEM_LABELS.map((label, idx) => (
                    <option key={idx} value={idx}>{idx}. {label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelSm, color: '#166534' }}>Ajustement %</label>
                  <input value={refPercent} onChange={(e) => setRefPercent(e.target.value)} placeholder="ex : 10 ou -5" style={{ ...inputBase }} type="number" step={1} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelSm, color: '#166534' }}>Ajustement €</label>
                  <input value={refOffset} onChange={(e) => setRefOffset(e.target.value)} placeholder="ex : 2 ou -1.5" style={{ ...inputBase }} type="number" step={0.01} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#16a34a', fontStyle: 'italic' }}>
                Résultat = prix de &quot;{BASE_ITEM_LABELS[refItemIndex]}&quot;{refPercent ? ` ${parseFloat(refPercent) > 0 ? '+' : ''}${refPercent}%` : ''}{refOffset ? ` ${parseFloat(refOffset) > 0 ? '+' : ''}${refOffset}€` : ''}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ ...btnBase, background: '#fff', color: '#64748B' }}>Annuler</button>
          <button onClick={handleSubmit} disabled={!label.trim()}
            style={{ ...btnBase, background: label.trim() ? 'var(--primary)' : '#CBD5E1', color: '#fff', border: 'none', fontWeight: 600 }}>
            Ajouter l&apos;item
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function TariffManager() {
  const { initialize, isLoading } = useTariffStore()

  useEffect(() => {
    initialize()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--gray-200)', borderTopColor: 'var(--primary)', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13 }}>Chargement des tarifs…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#fff' }}>
      <GroupPanel />
      <ItemsPanel />
    </div>
  )
}
