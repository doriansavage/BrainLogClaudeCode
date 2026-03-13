'use client'

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { Plus, MoreHorizontal, Eye, EyeOff, Lock, Star, Copy, Pencil, Archive, Trash2, Scale, ChevronDown, ChevronRight } from 'lucide-react'
import { useTariffStore } from '@/store/tariffs'
import type { TariffGroup, TariffItem } from '@/types/tariffs'

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

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string; subtitle?: string; onClose: () => void
  onConfirm: (name: string, description?: string) => void
  confirmLabel?: string; initialName?: string; initialDesc?: string
}

function GroupModal({ title, subtitle, onClose, onConfirm, confirmLabel = 'Créer', initialName = '', initialDesc = '' }: ModalProps) {
  const [name, setName] = useState(initialName)
  const [desc, setDesc] = useState(initialDesc)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  function submit() { if (name.trim()) { onConfirm(name.trim(), desc.trim() || undefined); onClose() } }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, background: '#fff', borderRadius: 14, border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginBottom: subtitle ? 4 : 20 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{subtitle}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Nom du groupe *</label>
            <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && submit()}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--gray-900)', outline: 'none', boxSizing: 'border-box' }}
              placeholder="ex: On se fait plaisir" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Description</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--gray-900)', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Optionnel" />
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

function DuplicateModal({ source, onClose, onConfirm }: { source: TariffGroup; onClose: () => void; onConfirm: (sourceId: string, newName: string) => void }) {
  const [name, setName] = useState(`${source.name} (copie)`)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])
  function submit() { if (name.trim()) { onConfirm(source.id, name.trim()); onClose() } }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, background: '#fff', borderRadius: 14, border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>Dupliquer &quot;{source.name}&quot;</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Tous les items et prix seront copiés à l&apos;identique.</p>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Nom du nouveau groupe</label>
          <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && submit()}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--primary-light)', border: '1px solid #d0e4f5', marginBottom: 24, fontSize: 12, color: 'var(--gray-600)' }}>
          💡 Options d&apos;ajustement (+X% global/catégorie) disponibles au Sprint 2
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', cursor: 'pointer' }}>Annuler</button>
          <button onClick={submit} disabled={!name.trim()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--primary)', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Dupliquer →</button>
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
        <div style={{ position: 'absolute', right: 0, top: 30, zIndex: 40, width: 180, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '4px', overflow: 'hidden' }}>
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

function PriceCell({ item }: { item: TariffItem }) {
  const { updateItemPrice } = useTariffStore()
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    if (item.priceType !== 'fixed') return
    setRaw(item.price !== null ? String(item.price) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const parsed = parseFloat(raw.replace(',', '.'))
    if (!isNaN(parsed) && parsed >= 0) updateItemPrice(item.id, Math.round(parsed * 10000) / 10000)
    setEditing(false)
  }

  const isSpecial = item.priceType === 'tbd' || item.priceType === 'quote'
  const formatted = formatPrice(item.price, item.priceType)

  if (editing) {
    return (
      <input ref={inputRef} value={raw} onChange={(e) => setRaw(e.target.value)}
        onBlur={commit} onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        autoFocus
        style={{ width: 90, padding: '3px 6px', fontSize: 13, fontFamily: 'monospace', textAlign: 'right', border: 'none', borderBottom: '2px solid var(--primary)', background: 'transparent', outline: 'none', color: 'var(--gray-900)' }} />
    )
  }

  return (
    <span onClick={startEdit}
      title={!isSpecial ? 'Cliquer pour modifier' : undefined}
      style={{
        fontSize: 13, fontFamily: 'ui-monospace, monospace',
        color: isSpecial ? 'var(--gray-400)' : 'var(--gray-800)',
        fontStyle: isSpecial ? 'italic' : 'normal',
        fontWeight: isSpecial ? 400 : 500,
        cursor: isSpecial ? 'default' : 'pointer',
        padding: '2px 4px', borderRadius: 4,
        transition: 'background 150ms',
      }}
    >
      {formatted}
    </span>
  )
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({ item }: { item: TariffItem }) {
  const { toggleItemVisibility } = useTariffStore()
  const [hovered, setHovered] = useState(false)
  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ borderBottom: '1px solid var(--gray-50)', background: hovered ? '#FAFBFC' : '#fff', transition: 'background 100ms', opacity: item.isVisible ? 1 : 0.4 }}>
      <td style={{ paddingLeft: 20, paddingRight: 8, paddingTop: 10, paddingBottom: 10, width: 24 }}>
        <span style={{ fontSize: 14, color: 'var(--gray-300)', opacity: hovered ? 1 : 0, cursor: 'grab', userSelect: 'none', display: 'block', textAlign: 'center' }}>⠿</span>
      </td>
      <td style={{ padding: '10px 8px', flex: 1 }}>
        <span style={{ fontSize: 13, color: 'var(--gray-800)', fontWeight: 400 }}>{item.label}</span>
      </td>
      <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
        <PriceCell item={item} />
      </td>
      <td style={{ padding: '10px 12px', paddingRight: 20, width: 110 }}>
        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{shortUnit(item.unit)}</span>
      </td>
      <td style={{ padding: '10px 16px 10px 4px', width: 36 }}>
        <button onClick={() => toggleItemVisibility(item.id)} title={item.isVisible ? 'Masquer' : 'Afficher'}
          style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: item.isVisible ? 'var(--primary)' : 'var(--gray-300)', opacity: hovered || !item.isVisible ? 1 : 0, transition: 'opacity 150ms' }}>
          {item.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </td>
    </tr>
  )
}

// ─── Category Section ─────────────────────────────────────────────────────────

function CategorySection({ label, items }: { categoryId: string; label: string; items: TariffItem[] }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <tbody>
      <tr onClick={() => setCollapsed((v) => !v)} style={{ cursor: 'pointer', background: 'var(--gray-50)' }}>
        <td colSpan={5} style={{ padding: '8px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
              {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {label}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 99, background: 'var(--gray-200)', color: 'var(--gray-500)' }}>
              {items.length}
            </span>
          </div>
        </td>
      </tr>
      {!collapsed && items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => <ItemRow key={item.id} item={item} />)}
      <tr><td colSpan={5} style={{ height: 4, background: '#fff' }} /></tr>
    </tbody>
  )
}

// ─── Items Panel ──────────────────────────────────────────────────────────────

function ItemsPanel() {
  const { groups, items, categories, selectedGroupId, duplicateGroup, renameGroup, archiveGroup, deleteGroup, setDefaultGroup } = useTariffStore()
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
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
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>{group.name}</h2>
            {group.isDefault && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'var(--primary)', color: '#fff' }}>défaut</span>
            )}
            {group.isLocked && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#FFFBEB', color: '#b45309' }}>
                <Lock size={10} /> verrouillé
              </span>
            )}
            {group.isArchived && (
              <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: 'var(--gray-100)', color: 'var(--gray-500)' }}>archivé</span>
            )}
          </div>
          {group.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{group.description}</p>}
        </div>
        <span style={{ fontSize: 12, color: 'var(--gray-400)', flexShrink: 0 }}>{visibleCount}/{groupItems.length} actifs · {group.usedCount}× utilisé</span>
        <GroupDropdown group={group} onRename={() => setShowRenameModal(true)} onDuplicate={() => setShowDuplicateModal(true)} onArchive={() => archiveGroup(group.id)} onDelete={() => deleteGroup(group.id)} onSetDefault={() => setDefaultGroup(group.id)} />
      </div>

      {/* Toolbar */}
      <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', background: '#fff', cursor: 'pointer', outline: 'none' }}>
          <option value="all">Toutes catégories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un item…"
          style={{ flex: 1, maxWidth: 280, padding: '6px 10px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 12, color: 'var(--gray-700)', background: '#fff', outline: 'none' }} />
        <div style={{ marginLeft: 'auto' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 7, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={13} /> Item
          </button>
        </div>
      </div>

      {/* Items table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {categories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => {
            const catItems = filteredItems.filter((i) => i.categoryId === cat.id)
            if (catItems.length === 0) return null
            return <CategorySection key={cat.id} categoryId={cat.id} label={cat.label} items={catItems} />
          })}
        </table>
      </div>

      {showDuplicateModal && <DuplicateModal source={group} onClose={() => setShowDuplicateModal(false)} onConfirm={duplicateGroup} />}
      {showRenameModal && <GroupModal title={`Renommer "${group.name}"`} onClose={() => setShowRenameModal(false)} onConfirm={(n, d) => renameGroup(group.id, n, d)} confirmLabel="Enregistrer" initialName={group.name} initialDesc={group.description ?? ''} />}
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

      {showCreateModal && <GroupModal title="Nouveau groupe tarifaire" onClose={() => setShowCreateModal(false)} onConfirm={createGroup} confirmLabel="Créer le groupe" />}
      {duplicateTarget && <DuplicateModal source={duplicateTarget} onClose={() => setDuplicateTarget(null)} onConfirm={duplicateGroup} />}
      {renameTarget && <GroupModal title={`Renommer "${renameTarget.name}"`} onClose={() => setRenameTarget(null)} onConfirm={(n, d) => renameGroup(renameTarget.id, n, d)} confirmLabel="Enregistrer" initialName={renameTarget.name} initialDesc={renameTarget.description ?? ''} />}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function TariffManager() {
  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#fff', borderRadius: '0 0 0 0' }}>
      <GroupPanel />
      <ItemsPanel />
    </div>
  )
}
