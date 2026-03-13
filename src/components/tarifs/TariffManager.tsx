'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from 'react'
import {
  Plus,
  MoreHorizontal,
  Eye,
  EyeOff,
  Lock,
  Star,
  Copy,
  Pencil,
  Archive,
  Trash2,
  Scale,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useTariffStore } from '@/store/tariffs'
import type { TariffGroup, TariffItem } from '@/types/tariffs'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number | null, priceType: string): string {
  if (priceType === 'tbd') return 'À définir'
  if (priceType === 'quote') return 'Sur devis'
  if (price === null) return '—'
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(price)
}

function shortUnit(unit: string): string {
  const map: Record<string, string> = {
    'par mois': '/mois',
    'par palette / par mois': '/pal/mois',
    'par conteneur': '/cont',
    'par palette': '/pal',
    'par colis': '/colis',
    'par article (UVC)': '/UVC',
    'par commande': '/cmd',
    'par ligne de commande': '/ligne',
    'par heure': '/h',
    'par document': '/doc',
    'par pièce': '/pièce',
    'par retour': '/retour',
    'par emplacement / par mois': '/empl/mois',
    forfait: 'forfait',
  }
  return map[unit] ?? unit
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

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

// ─── Modals ───────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string
  onClose: () => void
  onConfirm: (name: string, description?: string) => void
  confirmLabel?: string
  initialName?: string
  initialDesc?: string
}

function GroupModal({ title, onClose, onConfirm, confirmLabel = 'Créer', initialName = '', initialDesc = '' }: ModalProps) {
  const [name, setName] = useState(initialName)
  const [desc, setDesc] = useState(initialDesc)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  function submit() {
    if (name.trim()) { onConfirm(name.trim(), desc.trim() || undefined); onClose() }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-[440px] rounded-xl border shadow-2xl p-6"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold mb-5" style={{ color: 'var(--dark-navy)' }}>{title}</h2>
        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Nom du groupe <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && submit()}
              className="w-full px-3 py-2 rounded-md border text-sm outline-none transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="ex: On se fait plaisir"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Description
            </label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm outline-none transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              placeholder="Optionnel"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

interface DuplicateModalProps {
  source: TariffGroup
  onClose: () => void
  onConfirm: (sourceId: string, newName: string) => void
}

function DuplicateModal({ source, onClose, onConfirm }: DuplicateModalProps) {
  const [name, setName] = useState(`${source.name} (copie)`)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])

  function submit() {
    if (name.trim()) { onConfirm(source.id, name.trim()); onClose() }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-[480px] rounded-xl border shadow-2xl p-6"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold mb-1" style={{ color: 'var(--dark-navy)' }}>
          Dupliquer &quot;{source.name}&quot;
        </h2>
        <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
          Tous les items et prix seront copiés à l&apos;identique.
        </p>
        <div className="mb-5">
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Nom du nouveau groupe
          </label>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && submit()}
            className="w-full px-3 py-2 rounded-md border text-sm outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div
          className="rounded-md border p-3 mb-5 text-xs"
          style={{ backgroundColor: 'var(--bg-alt)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          💡 Les options d&apos;ajustement global (+X%) seront disponibles au Sprint 2
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Dupliquer →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Group Dropdown ───────────────────────────────────────────────────────────

interface GroupDropdownProps {
  group: TariffGroup
  onRename: () => void
  onDuplicate: () => void
  onArchive: () => void
  onDelete: () => void
  onSetDefault: () => void
}

function GroupDropdown({ group, onRename, onDuplicate, onArchive, onDelete, onSetDefault }: GroupDropdownProps) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const ref = useOutsideClick(close)

  const actions = [
    !group.isDefault && { icon: Star, label: 'Définir comme défaut', fn: onSetDefault },
    { icon: Copy, label: 'Dupliquer', fn: onDuplicate },
    !group.isLocked && { icon: Pencil, label: 'Renommer', fn: onRename },
    { icon: Archive, label: group.isArchived ? 'Désarchiver' : 'Archiver', fn: onArchive },
    !group.isDefault && !group.isLocked && {
      icon: Trash2, label: 'Supprimer', fn: onDelete, danger: true,
    },
  ].filter(Boolean) as { icon: React.ComponentType<{ size: number }>, label: string, fn: () => void, danger?: boolean }[]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="p-1 rounded transition-colors hover:bg-gray-200"
        style={{ color: 'var(--text-muted)' }}
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-6 z-40 w-44 rounded-lg border shadow-lg py-1"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          {actions.map(({ icon: Icon, label, fn, danger }) => (
            <button
              key={label}
              onClick={() => { fn(); setOpen(false) }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-colors hover:bg-gray-50 text-left"
              style={{ color: danger ? '#e53e3e' : 'var(--text)' }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Inline Price Cell ────────────────────────────────────────────────────────

function PriceCell({ item }: { item: TariffItem }) {
  const { updateItemPrice } = useTariffStore()
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    if (item.priceType === 'tbd' || item.priceType === 'quote' || item.priceType === 'formula') return
    setRaw(item.price !== null ? String(item.price) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const parsed = parseFloat(raw.replace(',', '.'))
    if (!isNaN(parsed) && parsed >= 0) {
      updateItemPrice(item.id, Math.round(parsed * 10000) / 10000)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className="w-24 px-1.5 py-0.5 text-right text-sm font-mono border-b-2 outline-none bg-transparent"
        style={{ borderColor: 'var(--primary)', color: 'var(--text)' }}
        autoFocus
      />
    )
  }

  const isSpecial = item.priceType === 'tbd' || item.priceType === 'quote'
  const isFormula = item.priceType === 'formula'

  return (
    <span
      onClick={startEdit}
      className={cn(
        'text-sm font-mono whitespace-nowrap',
        isSpecial && 'italic cursor-default',
        isFormula && 'font-medium',
        !isSpecial && !isFormula && 'cursor-pointer hover:underline underline-offset-2'
      )}
      style={{
        color: isFormula ? 'var(--primary)' : isSpecial ? 'var(--text-muted)' : 'var(--text)',
      }}
      title={!isSpecial ? 'Cliquer pour modifier' : undefined}
    >
      {formatPrice(item.price, item.priceType)}
    </span>
  )
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({ item }: { item: TariffItem }) {
  const { toggleItemVisibility } = useTariffStore()

  return (
    <tr
      className={cn('group border-b transition-colors hover:bg-gray-50/70', !item.isVisible && 'opacity-40')}
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Drag handle placeholder */}
      <td className="pl-5 pr-1 py-2.5 w-8">
        <div
          className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab select-none text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          ⠿
        </div>
      </td>

      {/* Label */}
      <td className="px-2 py-2.5">
        <span className="text-sm" style={{ color: 'var(--text)' }}>
          {item.label}
        </span>
      </td>

      {/* Price */}
      <td className="px-3 py-2.5 text-right">
        <PriceCell item={item} />
      </td>

      {/* Unit */}
      <td className="px-3 py-2.5 pr-5 w-28">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {shortUnit(item.unit)}
        </span>
      </td>

      {/* Visibility */}
      <td className="pr-4 py-2.5 w-10">
        <button
          onClick={() => toggleItemVisibility(item.id)}
          className="p-1 rounded transition-colors hover:bg-gray-200"
          title={item.isVisible ? 'Masquer de l\'offre' : 'Inclure dans l\'offre'}
          style={{ color: item.isVisible ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          {item.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </td>
    </tr>
  )
}

// ─── Category Section ─────────────────────────────────────────────────────────

function CategorySection({ categoryId, label, items }: { categoryId: string; label: string; items: TariffItem[] }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <tbody>
      {/* Category header */}
      <tr
        className="cursor-pointer select-none"
        style={{ backgroundColor: 'var(--bg-alt)' }}
        onClick={() => setCollapsed((v) => !v)}
      >
        <td colSpan={5} className="px-5 py-2">
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </span>
            <span
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: 'var(--dark-navy)' }}
            >
              {label}
            </span>
            <span
              className="ml-auto text-xs font-semibold rounded-full px-1.5 py-0.5"
              style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              {items.length}
            </span>
          </div>
        </td>
      </tr>
      {/* Items */}
      {!collapsed &&
        items
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => <ItemRow key={item.id} item={item} />)}
      {/* Spacer */}
      <tr><td colSpan={5} className="h-1" /></tr>
    </tbody>
  )
}

// ─── Items Panel ──────────────────────────────────────────────────────────────

function ItemsPanel() {
  const { groups, items, categories, selectedGroupId, duplicateGroup, renameGroup, archiveGroup, deleteGroup, setDefaultGroup } = useTariffStore()
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<string>('all')

  const group = groups.find((g) => g.id === selectedGroupId)
  if (!group) return null

  const groupItems = items.filter((i) => i.groupId === selectedGroupId)

  const filteredItems = groupItems.filter((item) => {
    const matchSearch = item.label.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || item.categoryId === catFilter
    return matchSearch && matchCat
  })

  const visibleCount = groupItems.filter((i) => i.isVisible).length

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Group header */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold truncate" style={{ color: 'var(--dark-navy)' }}>
              {group.name}
            </h2>
            {group.isDefault && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                défaut
              </span>
            )}
            {group.isLocked && (
              <span
                className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded"
                style={{ backgroundColor: '#fffbeb', color: '#b45309' }}
              >
                <Lock size={11} /> verrouillé
              </span>
            )}
            {group.isArchived && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                archivé
              </span>
            )}
          </div>
          {group.description && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {group.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
          <span>{visibleCount}/{groupItems.length} items actifs</span>
          <span>·</span>
          <span>utilisé {group.usedCount}×</span>
        </div>
        <GroupDropdown
          group={group}
          onRename={() => setShowRenameModal(true)}
          onDuplicate={() => setShowDuplicateModal(true)}
          onArchive={() => archiveGroup(group.id)}
          onDelete={() => deleteGroup(group.id)}
          onSetDefault={() => setDefaultGroup(group.id)}
        />
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-alt)' }}
      >
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border text-xs font-medium outline-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg)' }}
        >
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un item…"
          className="flex-1 max-w-xs px-3 py-1.5 rounded-md border text-xs outline-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg)' }}
        />
        <div className="ml-auto flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus size={13} />
            Item
          </button>
        </div>
      </div>

      {/* Items table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm border-collapse">
          {categories
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((cat) => {
              const catItems = filteredItems.filter((i) => i.categoryId === cat.id)
              if (catItems.length === 0 && catFilter !== 'all') return null
              if (catItems.length === 0 && search) return null
              return (
                <CategorySection
                  key={cat.id}
                  categoryId={cat.id}
                  label={cat.label}
                  items={catItems}
                />
              )
            })}
        </table>
      </div>

      {/* Modals */}
      {showDuplicateModal && (
        <DuplicateModal
          source={group}
          onClose={() => setShowDuplicateModal(false)}
          onConfirm={duplicateGroup}
        />
      )}
      {showRenameModal && (
        <GroupModal
          title={`Renommer "${group.name}"`}
          onClose={() => setShowRenameModal(false)}
          onConfirm={(name, desc) => renameGroup(group.id, name, desc)}
          confirmLabel="Enregistrer"
          initialName={group.name}
          initialDesc={group.description ?? ''}
        />
      )}
    </div>
  )
}

// ─── Group Panel (left) ───────────────────────────────────────────────────────

function GroupPanel() {
  const { groups, selectedGroupId, selectGroup, createGroup, duplicateGroup, renameGroup, archiveGroup, deleteGroup, setDefaultGroup } = useTariffStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [duplicateTarget, setDuplicateTarget] = useState<TariffGroup | null>(null)
  const [renameTarget, setRenameTarget] = useState<TariffGroup | null>(null)

  const activeGroups = groups.filter((g) => !g.isArchived)
  const archivedGroups = groups.filter((g) => g.isArchived)

  function renderGroup(group: TariffGroup) {
    const active = group.id === selectedGroupId
    return (
      <div
        key={group.id}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md cursor-pointer group/row transition-colors"
        style={{
          backgroundColor: active ? '#fff' : undefined,
          borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
        }}
        onClick={() => selectGroup(group.id)}
      >
        <span
          className="flex-1 text-sm truncate font-medium"
          style={{ color: active ? 'var(--primary)' : 'var(--text)' }}
        >
          {group.name}
        </span>
        {group.isDefault && (
          <Star size={11} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        )}
        {group.isLocked && (
          <Lock size={11} style={{ color: '#b45309', flexShrink: 0 }} />
        )}
        <div className="opacity-0 group-hover/row:opacity-100 transition-opacity">
          <GroupDropdown
            group={group}
            onRename={() => setRenameTarget(group)}
            onDuplicate={() => setDuplicateTarget(group)}
            onArchive={() => archiveGroup(group.id)}
            onDelete={() => deleteGroup(group.id)}
            onSetDefault={() => setDefaultGroup(group.id)}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col flex-shrink-0 border-r"
      style={{ width: 220, backgroundColor: 'var(--bg-alt)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Groupes tarifaires
        </p>
      </div>

      {/* Group list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {activeGroups.map(renderGroup)}

        {archivedGroups.length > 0 && (
          <div className="pt-3">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
              Archivés
            </p>
            {archivedGroups.map(renderGroup)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="border-t p-2 space-y-1"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white"
          style={{ color: 'var(--primary)' }}
        >
          <Plus size={14} />
          Nouveau groupe
        </button>
        <button
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white"
          style={{ color: 'var(--text-muted)' }}
        >
          <Scale size={14} />
          Comparer 2 groupes
        </button>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <GroupModal
          title="Nouveau groupe tarifaire"
          onClose={() => setShowCreateModal(false)}
          onConfirm={createGroup}
          confirmLabel="Créer le groupe"
        />
      )}
      {duplicateTarget && (
        <DuplicateModal
          source={duplicateTarget}
          onClose={() => setDuplicateTarget(null)}
          onConfirm={duplicateGroup}
        />
      )}
      {renameTarget && (
        <GroupModal
          title={`Renommer "${renameTarget.name}"`}
          onClose={() => setRenameTarget(null)}
          onConfirm={(name, desc) => renameGroup(renameTarget.id, name, desc)}
          confirmLabel="Enregistrer"
          initialName={renameTarget.name}
          initialDesc={renameTarget.description ?? ''}
        />
      )}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function TariffManager() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <GroupPanel />
      <ItemsPanel />
    </div>
  )
}
