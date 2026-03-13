'use client'

import { useEffect, useState } from 'react'
import { useRulesStore, uid } from '@/store/rules'
import { useTariffStore } from '@/store/tariffs'
import type { PricingRule, RuleCondition, RuleAction, RuleActionType, ConditionOperator } from '@/types/rules'
import type { TariffGroup } from '@/types/tariffs'

// ─── Référentiel des champs questionnaire (Q1-Q8) ────────────────────────────

const Q_FIELDS = [
  { code: 'Q1.05', label: "Secteur d'activité", options: ['Mode & Accessoires', 'Beauté & Cosmétiques', 'Santé & Bien-être', 'Alimentation & Boissons', 'Maison & Déco', 'Sport & Loisirs', 'High-Tech & Électronique', 'Jouets & Enfants', 'Animaux', 'Autre'] },
  { code: 'Q1.12', label: 'Stockage spécifique', options: ['Aucun', 'Fragile', 'Volumineux', 'Température contrôlée', 'Dangereux ADR', 'Valeur élevée coffre', 'Plusieurs contraintes'] },
  { code: 'Q2.01', label: 'Mode livraison fournisseur', options: ['Conteneur FCL', 'Conteneur LCL', 'Palettes', 'Colis', 'Vrac'] },
  { code: 'Q2.02', label: 'Palettes mono/multi-SKU', options: ['Mono-SKU', 'Multi-SKU', 'Les deux'] },
  { code: 'Q3.05', label: 'Saisonnalité', options: ['Stable', 'Pics modérés ±30%', 'Forte saisonnalité ×2+'] },
  { code: 'Q4.01', label: 'Volume B2C / mois', options: ['<50', '50-200', '200-500', '500-1000', '1000-5000', '>5000'] },
  { code: 'Q4.05', label: 'Activité B2B', options: ['Oui', 'Non', 'En projet'] },
  { code: 'Q5.03', label: 'Inserts marketing', options: ['Oui — flyer/carte', 'Oui — échantillon', 'Oui — multiple', 'Non'] },
  { code: 'Q6.03', label: 'France — % volume', options: ['0%', '<5%', '5-15%', '15-30%', '30-50%', '>50%'] },
  { code: 'Q6.04', label: 'Belgique — % volume', options: ['0%', '<5%', '5-15%', '15-30%', '30-50%', '>50%'] },
  { code: 'Q6.05', label: 'Pays-Bas — % volume', options: ['0%', '<5%', '5-15%', '15-30%', '30-50%', '>50%'] },
  { code: 'Q6.06', label: 'Allemagne — % volume', options: ['0%', '<5%', '5-15%', '15-30%', '30-50%', '>50%'] },
  { code: 'Q6.07', label: 'Suisse — % volume', options: ['0%', '<5%', '5-15%', '15-30%', '30-50%', '>50%'] },
  { code: 'Q6.08', label: 'Autres pays — % volume', options: ['0%', '<5%', '5-15%', '15-30%', '30-50%', '>50%'] },
  { code: 'Q7.01', label: 'Taux retour B2C', options: ['<2%', '2-5%', '5-10%', '10-20%', '>20%'] },
  { code: 'Q7.02', label: 'Taux retour B2B', options: ['<1%', '1-3%', '3-5%', '>5%', 'Pas de B2B'] },
  { code: 'Q8.02', label: 'ERP / outil gestion', options: ['Aucun', 'Odoo', 'SAP', 'Exact Online', 'Sage', 'Autre'] },
]

// ─── Labels des 22 items tarifaires (ordre BASE_ITEMS dans tariffs.ts) ────────

const ITEM_LABELS = [
  'Frais de mise en place — Brain E-Log',   // 0  frais_demarrage
  'Frais de mise en place — WMS',           // 1
  'Gestion mensuelle de compte',             // 2  frais_recurrents
  'Abonnement WMS',                          // 3
  'Déchargement container 40 pieds',         // 4  frais_activite
  'Déchargement container 20 pieds',         // 5
  'Déchargement palette',                    // 6
  'Déchargement colis',                      // 7
  'Entrée en stock',                         // 8
  'Stockage palette',                        // 9
  'Stockage bac / étagère picking',          // 10
  'Préparation B2C — par commande',          // 11
  'Préparation B2C — par ligne',             // 12
  'Préparation B2C — par article',           // 13
  'Préparation B2B (régie)',                 // 14
  'Étiquette transporteur',                  // 15
  'Impression + insertion BL',               // 16
  'Insertion document / flyer / goodies',    // 17
  'Documents douaniers (hors UE)',           // 18
  'Management des retours',                  // 19
  'Services additionnels — Manutention',     // 20
  'Services additionnels — Administration',  // 21
]

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'regles', label: 'Règles' },
  { id: 'reference', label: 'Grille tarifaire' },
  { id: 'conditions', label: 'Conditions de vente' },
  { id: 'contact', label: 'Contact' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReglesPage() {
  const [tab, setTab] = useState('regles')
  const initRules = useRulesStore((s) => s.initialize)
  const initTariffs = useTariffStore((s) => s.initialize)

  useEffect(() => {
    initRules()
    initTariffs()
  }, [initRules, initTariffs])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--dark-navy)', margin: 0 }}>Règles</h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Moteur de règles conditionnelles — questionnaire → preset + ajustements tarifaires
          </p>
        </div>
        <ActiveBadge />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-page)', flexShrink: 0 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent', color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 150ms' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        {tab === 'regles'     && <TabRules />}
        {tab === 'reference'  && <TabReference />}
        {tab === 'conditions' && <TabConditions />}
        {tab === 'contact'    && <TabContact />}
      </div>
    </div>
  )
}

function ActiveBadge() {
  const rules = useRulesStore((s) => s.rules)
  const active = rules.filter((r) => r.enabled).length
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: active > 0 ? '#F0FDF4' : '#F1F5F9', color: active > 0 ? '#16a34a' : '#64748b' }}>
      {active} règle{active !== 1 ? 's' : ''} active{active !== 1 ? 's' : ''}
    </span>
  )
}

// ─── TAB RÈGLES ───────────────────────────────────────────────────────────────

function TabRules() {
  const { rules, addRule, updateRule, deleteRule, toggleRule, movePriority } = useRulesStore()
  const groups = useTariffStore((s) => s.groups)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const sorted = [...rules].sort((a, b) => a.priority - b.priority)

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Les règles sont évaluées dans l'ordre de priorité. La première règle dont la condition est satisfaite s'applique.
        </p>
        <button
          onClick={() => { setIsCreating(true); setEditingId(null) }}
          style={{ padding: '7px 14px', borderRadius: 6, background: 'var(--primary)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          + Nouvelle règle
        </button>
      </div>

      {/* Formulaire nouvelle règle */}
      {isCreating && (
        <RuleEditor
          rule={null}
          groups={groups.filter((g) => !g.isArchived)}
          onSave={(partial) => { addRule(partial); setIsCreating(false) }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* Liste des règles */}
      {sorted.map((rule, idx) =>
        editingId === rule.id ? (
          <RuleEditor
            key={rule.id}
            rule={rule}
            groups={groups.filter((g) => !g.isArchived)}
            onSave={(changes) => { updateRule(rule.id, changes); setEditingId(null) }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <RuleCard
            key={rule.id}
            rule={rule}
            groups={groups}
            isFirst={idx === 0}
            isLast={idx === sorted.length - 1}
            onEdit={() => { setEditingId(rule.id); setIsCreating(false) }}
            onDelete={() => deleteRule(rule.id)}
            onToggle={() => toggleRule(rule.id)}
            onMoveUp={() => movePriority(rule.id, 'up')}
            onMoveDown={() => movePriority(rule.id, 'down')}
          />
        )
      )}

      {/* Empty state */}
      {sorted.length === 0 && !isCreating && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚙</div>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Aucune règle définie</p>
          <p style={{ fontSize: 12, marginBottom: 20 }}>Créez des règles pour automatiser la sélection de preset et l'ajustement des prix.</p>
          <button onClick={() => setIsCreating(true)} style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--primary)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Créer la première règle
          </button>
        </div>
      )}
    </div>
  )
}

// ─── RULE CARD (vue compacte) ─────────────────────────────────────────────────

interface RuleCardProps {
  rule: PricingRule
  groups: TariffGroup[]
  isFirst: boolean
  isLast: boolean
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function RuleCard({ rule, groups, isFirst, isLast, onEdit, onDelete, onToggle, onMoveUp, onMoveDown }: RuleCardProps) {
  const condSummary = rule.conditions.map((c) => {
    const op = c.operator === 'eq' ? '=' : c.operator === 'neq' ? '≠' : c.operator === 'in' ? '∈ {' : '∉ {'
    const val = (c.operator === 'in' || c.operator === 'not_in') ? c.value + '}' : `"${c.value}"`
    return `${c.questionCode} ${op} ${val}`
  }).join(rule.conditionLogic === 'AND' ? ' ET ' : ' OU ')

  const actSummary = rule.actions.map((a) => {
    if (a.type === 'select_group') {
      const g = groups.find((gr) => gr.id === a.groupId)
      return `Preset: ${g?.name ?? a.groupId}`
    }
    const label = ITEM_LABELS[a.itemIndex ?? 0] ?? '?'
    const short = label.split(' — ')[1] ?? label.split(' ').slice(-2).join(' ')
    if (a.type === 'adjust_percent') return `${short} ${a.percent! > 0 ? '+' : ''}${a.percent}%`
    if (a.type === 'adjust_flat') return `${short} ${a.amount! > 0 ? '+' : ''}${a.amount}€`
    if (a.type === 'set_price') return `${short} = ${a.price}€`
    if (a.type === 'set_tbd') return `${short} = À définir`
    return ''
  }).join(' · ')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 8, border: '1px solid #E2E8F0', borderRadius: 8, background: rule.enabled ? '#fff' : '#F8FAFC', opacity: rule.enabled ? 1 : 0.65 }}>
      {/* Priorité + flèches */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
        <button onClick={onMoveUp} disabled={isFirst} style={arrowBtn}>↑</button>
        <button onClick={onMoveDown} disabled={isLast} style={arrowBtn}>↓</button>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', width: 16, textAlign: 'center', flexShrink: 0 }}>{rule.priority}</span>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-navy)' }}>{rule.name}</span>
          {rule.description && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {rule.description}</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', background: '#F5F3FF', color: '#6d28d9', padding: '1px 5px', borderRadius: 3 }}>{condSummary}</span>
          <span style={{ color: '#94a3b8' }}>→</span>
          <span style={{ color: '#334155' }}>{actSummary}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Toggle */}
        <button
          onClick={onToggle}
          title={rule.enabled ? 'Désactiver' : 'Activer'}
          style={{ width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', background: rule.enabled ? '#16a34a' : '#cbd5e1', position: 'relative', transition: 'background 200ms', flexShrink: 0 }}
        >
          <span style={{ position: 'absolute', top: 2, left: rule.enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 200ms' }} />
        </button>
        <Btn onClick={onEdit} title="Modifier">✏</Btn>
        <Btn onClick={onDelete} title="Supprimer" danger>✕</Btn>
      </div>
    </div>
  )
}

// ─── RULE EDITOR (formulaire inline) ─────────────────────────────────────────

interface RuleEditorProps {
  rule: PricingRule | null
  groups: TariffGroup[]
  onSave: (data: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function RuleEditor({ rule, groups, onSave, onCancel }: RuleEditorProps) {
  const isNew = rule === null
  const [name, setName] = useState(rule?.name ?? '')
  const [description, setDescription] = useState(rule?.description ?? '')
  const [enabled, setEnabled] = useState(rule?.enabled ?? true)
  const [logic, setLogic] = useState<'AND' | 'OR'>(rule?.conditionLogic ?? 'AND')
  const [conditions, setConditions] = useState<RuleCondition[]>(rule?.conditions ?? [])
  const [actions, setActions] = useState<RuleAction[]>(rule?.actions ?? [])
  const [error, setError] = useState('')

  function handleSave() {
    if (!name.trim()) { setError('Le nom est requis'); return }
    onSave({ name: name.trim(), description: description.trim(), enabled, priority: rule?.priority ?? 99, conditionLogic: logic, conditions, actions })
  }

  function addCondition() {
    setConditions((p) => [...p, { id: uid(), questionCode: 'Q4.05', operator: 'eq', value: 'Oui' }])
  }

  function removeCondition(id: string) {
    setConditions((p) => p.filter((c) => c.id !== id))
  }

  function updateCondition(id: string, changes: Partial<RuleCondition>) {
    setConditions((p) => p.map((c) => c.id === id ? { ...c, ...changes } : c))
  }

  function addAction() {
    setActions((p) => [...p, { id: uid(), type: 'select_group', groupId: groups[0]?.id ?? 'standard' }])
  }

  function removeAction(id: string) {
    setActions((p) => p.filter((a) => a.id !== id))
  }

  function updateAction(id: string, changes: Partial<RuleAction>) {
    setActions((p) => p.map((a) => a.id === id ? { ...a, ...changes } : a))
  }

  return (
    <div style={{ border: '2px solid var(--primary)', borderRadius: 10, padding: 20, marginBottom: 16, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {isNew ? 'Nouvelle règle' : 'Modifier la règle'}
        </span>
        <span style={{ flex: 1 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Activée
        </label>
      </div>

      {/* Nom + description */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="Nom de la règle *"
          style={{ ...inputSt, flex: 1, fontWeight: 600 }}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          style={{ ...inputSt, flex: 2 }}
        />
      </div>
      {error && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>{error}</p>}

      {/* Conditions */}
      <Section label="CONDITION(S)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Logique :</span>
          <SegmentControl
            value={logic}
            options={[{ value: 'AND', label: 'ET — toutes doivent être vraies' }, { value: 'OR', label: 'OU — au moins une doit être vraie' }]}
            onChange={(v) => setLogic(v as 'AND' | 'OR')}
          />
        </div>
        {conditions.map((c) => (
          <ConditionRow key={c.id} condition={c} onChange={(ch) => updateCondition(c.id, ch)} onRemove={() => removeCondition(c.id)} />
        ))}
        {conditions.length === 0 && (
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Aucune condition — la règle s'applique toujours.</p>
        )}
        <AddBtn onClick={addCondition} label="+ Ajouter une condition" />
      </Section>

      {/* Actions */}
      <Section label="ACTIONS">
        {actions.map((a) => (
          <ActionRow key={a.id} action={a} groups={groups} onChange={(ch) => updateAction(a.id, ch)} onRemove={() => removeAction(a.id)} />
        ))}
        {actions.length === 0 && (
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Aucune action définie.</p>
        )}
        <AddBtn onClick={addAction} label="+ Ajouter une action" />
      </Section>

      {/* Boutons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={handleSave} style={{ padding: '7px 18px', borderRadius: 6, background: 'var(--primary)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Sauvegarder
        </button>
        <button onClick={onCancel} style={{ padding: '7px 14px', borderRadius: 6, background: 'none', color: 'var(--text-muted)', border: '1px solid #E2E8F0', fontSize: 12, cursor: 'pointer' }}>
          Annuler
        </button>
      </div>
    </div>
  )
}

// ─── CONDITION ROW ─────────────────────────────────────────────────────────────

function ConditionRow({ condition, onChange, onRemove }: { condition: RuleCondition; onChange: (c: Partial<RuleCondition>) => void; onRemove: () => void }) {
  const field = Q_FIELDS.find((f) => f.code === condition.questionCode)
  const isMulti = condition.operator === 'in' || condition.operator === 'not_in'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      {/* Question */}
      <select
        value={condition.questionCode}
        onChange={(e) => onChange({ questionCode: e.target.value, value: '' })}
        style={selectSt}
      >
        {Q_FIELDS.map((f) => (
          <option key={f.code} value={f.code}>{f.code} — {f.label}</option>
        ))}
      </select>

      {/* Opérateur */}
      <select value={condition.operator} onChange={(e) => onChange({ operator: e.target.value as ConditionOperator, value: '' })} style={{ ...selectSt, width: 160 }}>
        <option value="eq">= est égal à</option>
        <option value="neq">≠ est différent de</option>
        <option value="in">∈ est parmi</option>
        <option value="not_in">∉ n'est pas parmi</option>
      </select>

      {/* Valeur */}
      {!isMulti && field?.options ? (
        <select value={condition.value} onChange={(e) => onChange({ value: e.target.value })} style={selectSt}>
          {field.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : isMulti && field?.options ? (
        <MultiCheckbox options={field.options} value={condition.value} onChange={(v) => onChange({ value: v })} />
      ) : (
        <input value={condition.value} onChange={(e) => onChange({ value: e.target.value })} placeholder="valeur" style={inputSt} />
      )}

      <button onClick={onRemove} title="Supprimer" style={{ ...arrowBtn, color: '#ef4444', fontSize: 14 }}>×</button>
    </div>
  )
}

// ─── ACTION ROW ───────────────────────────────────────────────────────────────

function ActionRow({ action, groups, onChange, onRemove }: { action: RuleAction; groups: TariffGroup[]; onChange: (c: Partial<RuleAction>) => void; onRemove: () => void }) {
  const ACTION_LABELS: Record<RuleActionType, string> = {
    select_group:    'Appliquer preset',
    adjust_percent:  'Ajuster prix %',
    adjust_flat:     'Ajuster prix €',
    set_price:       'Fixer prix à',
    set_tbd:         'Marquer À définir',
  }

  function changeType(type: RuleActionType) {
    onChange({ type, groupId: type === 'select_group' ? (groups[0]?.id ?? 'standard') : undefined, itemIndex: type !== 'select_group' ? 0 : undefined, percent: undefined, amount: undefined, price: undefined })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 12px', background: '#F8FAFC', borderRadius: 6 }}>
      {/* Type d'action */}
      <select value={action.type} onChange={(e) => changeType(e.target.value as RuleActionType)} style={{ ...selectSt, width: 160 }}>
        {(Object.entries(ACTION_LABELS) as [RuleActionType, string][]).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      {/* Champs selon type */}
      {action.type === 'select_group' && (
        <select value={action.groupId ?? ''} onChange={(e) => onChange({ groupId: e.target.value })} style={selectSt}>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      )}

      {action.type !== 'select_group' && (
        <select value={action.itemIndex ?? 0} onChange={(e) => onChange({ itemIndex: Number(e.target.value) })} style={{ ...selectSt, flex: 1 }}>
          {ITEM_LABELS.map((label, i) => <option key={i} value={i}>{label}</option>)}
        </select>
      )}

      {action.type === 'adjust_percent' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="number" value={action.percent ?? 0} onChange={(e) => onChange({ percent: Number(e.target.value) })} style={{ ...inputSt, width: 64, textAlign: 'right' }} />
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>%</span>
        </div>
      )}

      {action.type === 'adjust_flat' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="number" step="0.01" value={action.amount ?? 0} onChange={(e) => onChange({ amount: Number(e.target.value) })} style={{ ...inputSt, width: 72, textAlign: 'right' }} />
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>€</span>
        </div>
      )}

      {action.type === 'set_price' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="number" step="0.01" min="0" value={action.price ?? 0} onChange={(e) => onChange({ price: Number(e.target.value) })} style={{ ...inputSt, width: 72, textAlign: 'right' }} />
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>€ fixe</span>
        </div>
      )}

      {action.type === 'set_tbd' && (
        <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, padding: '3px 8px', background: '#FFFBEB', borderRadius: 4 }}>→ À définir plus tard</span>
      )}

      <button onClick={onRemove} title="Supprimer" style={{ ...arrowBtn, color: '#ef4444', fontSize: 14, marginLeft: 'auto' }}>×</button>
    </div>
  )
}

// ─── MULTI CHECKBOX (pour opérateurs in/not_in) ───────────────────────────────

function MultiCheckbox({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const selected = value ? value.split(',').map((v) => v.trim()) : []
  function toggle(opt: string) {
    const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]
    onChange(next.join(','))
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 340 }}>
      {options.map((opt) => (
        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer', padding: '2px 7px', borderRadius: 4, background: selected.includes(opt) ? '#EFF6FF' : '#F8FAFC', border: `1px solid ${selected.includes(opt) ? '#93c5fd' : '#E2E8F0'}`, color: selected.includes(opt) ? '#1d4ed8' : '#475569' }}>
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} style={{ margin: 0 }} />
          {opt}
        </label>
      ))}
    </div>
  )
}

// ─── SOUS-COMPOSANTS UI ───────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}

function SegmentControl({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', border: '1px solid #E2E8F0', borderRadius: 6, overflow: 'hidden' }}>
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{ padding: '4px 12px', fontSize: 11, border: 'none', cursor: 'pointer', background: value === opt.value ? 'var(--primary)' : '#fff', color: value === opt.value ? '#fff' : '#475569', fontWeight: value === opt.value ? 600 : 400, transition: 'background 150ms' }}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, color: 'var(--primary)', background: 'none', border: '1px dashed #93c5fd', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontWeight: 500 }}>
      {label}
    </button>
  )
}

function Btn({ onClick, title, danger, children }: { onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid #E2E8F0', background: 'none', cursor: 'pointer', fontSize: 12, color: danger ? '#ef4444' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </button>
  )
}

// ─── TAB: GRILLE TARIFAIRE (référence statique) ────────────────────────────────

const PRIX_REF = [
  { cat: 'Frais récurrents mensuels', color: '#3b82f6', items: [
    { label: 'Gestion mensuelle de compte', prix: 150, unite: 'par mois' },
    { label: 'Abonnement WMS', prix: 100, unite: 'par mois' },
  ]},
  { cat: 'Réception & déchargement', color: '#8b5cf6', items: [
    { label: "Déchargement container 40'", prix: 330, unite: 'par conteneur', cond: 'Q2.01 = Conteneur FCL/LCL' },
    { label: "Déchargement container 20'", prix: 210, unite: 'par conteneur', cond: 'Q2.01 = Conteneur FCL/LCL' },
    { label: 'Déchargement palette', prix: 6.5, unite: 'par palette', cond: 'Q2.01 = Palettes ou Q2.04 ≠ 0' },
    { label: 'Déchargement colis', prix: 1.2, unite: 'par colis', cond: 'Q2.01 = Colis ou Q2.05 ≠ 0' },
    { label: 'Entrée en stock', prix: 0.10, unite: 'par article (UVC)' },
  ]},
  { cat: 'Stockage', color: '#f59e0b', items: [
    { label: 'Stockage palette', prix: 10.5, unite: 'par palette / mois' },
    { label: 'Stockage bac / étagère picking', prix: null, unite: 'sur devis / mois', cond: 'Q3.02 = Bac ou Mixte' },
  ]},
  { cat: 'Préparation B2C', color: '#10b981', items: [
    { label: 'Par commande', prix: 1.5, unite: 'par commande' },
    { label: 'Par ligne de commande', prix: 0.25, unite: 'par ligne' },
    { label: 'Par article (UVC)', prix: 0.5, unite: 'par article' },
  ]},
  { cat: 'Préparation B2B', color: '#06b6d4', items: [
    { label: 'Préparation B2B (régie)', prix: 39.5, unite: 'par heure', cond: 'Q4.05 = Oui ou En projet' },
  ]},
  { cat: 'Fournitures & documents', color: '#ec4899', items: [
    { label: 'Étiquette transporteur', prix: 0.06, unite: 'par colis' },
    { label: 'Impression + insertion BL', prix: 0.15, unite: 'par document', cond: 'Q5.03 ≠ Non' },
    { label: 'Insertion flyer / goodies', prix: 0.09, unite: 'par pièce', cond: 'Q5.03 ≠ Non' },
    { label: 'Documents douaniers (hors UE)', prix: 2.75, unite: 'par commande', cond: 'Q6.07+ ≠ 0%' },
  ]},
  { cat: 'Retours', color: '#ef4444', items: [
    { label: 'Management des retours', prix: 0.8, unite: 'par retour' },
  ]},
  { cat: 'Services additionnels', color: '#64748b', items: [
    { label: 'Manutention', prix: 39.5, unite: 'par heure' },
    { label: 'Administration', prix: 65, unite: 'par heure' },
  ]},
]

function TabReference() {
  return (
    <div style={{ maxWidth: 860 }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Prix de référence standard Brain E-Log (HTVA). Ce sont les prix de base avant application des règles.</p>
      {PRIX_REF.map((g) => (
        <div key={g.cat} style={{ marginBottom: 22 }}>
          <div style={{ borderLeft: `3px solid ${g.color}`, padding: '6px 12px', background: '#F8FAFC', marginBottom: 4, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark-navy)' }}>{g.cat}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#F1F5F9' }}>
                <th style={th}>Service</th>
                <th style={{ ...th, textAlign: 'right', width: '12%' }}>Prix HTVA</th>
                <th style={{ ...th, width: '20%' }}>Unité</th>
                <th style={{ ...th, width: '22%' }}>Condition</th>
              </tr>
            </thead>
            <tbody>
              {g.items.map((item, i) => (
                <tr key={item.label} style={{ background: i % 2 ? '#FAFAFA' : '#fff', borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 500, color: 'var(--dark-navy)' }}>{item.label}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: item.prix === null ? '#94a3b8' : '#094D80', fontVariantNumeric: 'tabular-nums' }}>
                    {item.prix === null ? 'Devis' : Number.isInteger(item.prix) ? `${item.prix} €` : `${item.prix.toFixed(2).replace('.', ',')} €`}
                  </td>
                  <td style={{ padding: '7px 10px', color: '#475569' }}>{item.unite}</td>
                  <td style={{ padding: '7px 10px' }}>
                    {'cond' in item && item.cond ? <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#FEF9C3', color: '#713f12', fontWeight: 500 }}>{item.cond}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

// ─── TAB: CONDITIONS DE VENTE ─────────────────────────────────────────────────

const CGV = [
  { titre: '1. Cadre de l\'offre', texte: "Cette offre est valable uniquement entre Brain E-Log SRL et le prospect concerné." },
  { titre: '2. Validité', texte: "Offre valable jusqu'au 31/12/2026. Les prix ne couvrent que les activités décrites dans ce document. Tout service supplémentaire sera facturé selon nos conditions générales de vente." },
  { titre: '3. Volume minimum annuel', texte: "L'offre est basée sur le volume minimum issu de Q4.01 (valeur basse × 12 mois) :\n• < 50 cmd/mois → 600 cmd/an\n• 50–200 → 600\n• 200–500 → 2 400\n• 500–1 000 → 6 000\n• 1 000–5 000 → 12 000\n• > 5 000 → 60 000 cmd/an" },
  { titre: '4. Prix', texte: "Nos prix sont en euros HTVA. La TVA n'est pas applicable pour les facturations intracommunautaires. Toute nouvelle taxe imposée par les autorités fiscales belges sera appliquée conformément à la loi belge." },
  { titre: '5. Paiements', texte: "Nos factures sont payables sur : BE84 0689 0320 9059\nDélai de paiement : 14 jours. Retards → pénalités conformément à nos CGV." },
  { titre: '6. Responsabilité', texte: "La responsabilité de Brain E-Log s'arrête là où celle des transporteurs démarre. Brain E-Log peut aider à la résolution des litiges de transport (dommages, pertes, etc.) — cela fait l'objet de suppléments." },
]

function TabConditions() {
  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CGV.map((s) => (
          <div key={s.titre} style={{ padding: '14px 18px', borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-navy)', margin: '0 0 6px 0' }}>{s.titre}</h3>
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{s.texte}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TAB: CONTACT ─────────────────────────────────────────────────────────────

function TabContact() {
  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ padding: '20px 24px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>MP</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark-navy)' }}>Mathieu Pichelin</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Managing Partner · Brain E-Log SRL</div>
          </div>
        </div>
        {[
          { label: 'Email', value: 'mathieu.pichelin@brain-log.com' },
          { label: 'Téléphone', value: '+32 472 17 88 31' },
          { label: 'IBAN', value: 'BE84 0689 0320 9059' },
          { label: 'Validité offre', value: '31/12/2026' },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', width: 90, flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-navy)' }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px', borderRadius: 8, background: '#EFF6FF', border: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', lineHeight: 1.8 }}>
        <strong>Règles de génération :</strong>
        <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
          <li>Ne jamais inclure de section <em>Transport</em> (traitement séparé)</li>
          <li>Tous les prix sont FIXES — ne jamais inventer un tarif</li>
          <li>Si cellule questionnaire vide → utiliser valeur standard template</li>
        </ul>
      </div>
    </div>
  )
}

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────

const inputSt: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #E2E8F0',
  borderRadius: 6,
  fontSize: 12,
  outline: 'none',
  background: '#fff',
  color: 'var(--dark-navy)',
}

const selectSt: React.CSSProperties = {
  ...inputSt,
  cursor: 'pointer',
}

const arrowBtn: React.CSSProperties = {
  width: 20,
  height: 20,
  border: '1px solid #E2E8F0',
  borderRadius: 4,
  background: 'none',
  cursor: 'pointer',
  fontSize: 11,
  color: '#94a3b8',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
}

const th: React.CSSProperties = {
  padding: '5px 10px',
  textAlign: 'left',
  fontWeight: 500,
  color: 'var(--text-muted)',
  fontSize: 11,
}
