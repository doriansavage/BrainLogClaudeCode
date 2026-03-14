'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Truck, ChevronDown, ChevronRight, Trash2, Check, AlertCircle, Loader2, Plus, X, Save, Eye } from 'lucide-react'
import type {
  ParseResult, ParsedSheet,
  CarrierTariff, CarrierZone, CarrierWeightRange, CarrierPriceMatrix,
  ZoneMapping, WeightMapping,
} from '@/types/carrier-tariffs'

// ─── Étapes du wizard ───────────────────────────────────────────────────────
type Step = 'upload' | 'select-sheet' | 'map-columns' | 'map-rows' | 'preview' | 'done'

const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'select-sheet', label: 'Feuille' },
  { id: 'map-columns', label: 'Zones' },
  { id: 'map-rows', label: 'Poids' },
  { id: 'preview', label: 'Aperçu' },
  { id: 'done', label: 'Sauvegardé' },
]

const COUNTRY_PRESETS: Record<string, string[]> = {
  FR: ['FR'],
  'BE-LU': ['BE', 'LU'],
  DE: ['DE'],
  ES: ['ES'],
  IT: ['IT'],
  'UK': ['GB'],
  'DOM-TOM': ['GP', 'MQ', 'GF', 'RE', 'YT', 'PM', 'MF', 'BL', 'WF', 'PF', 'NC'],
  Europe: ['DE', 'AT', 'BE', 'LU', 'NL', 'ES', 'IT', 'PT', 'CH', 'DK', 'SE', 'NO', 'FI', 'PL', 'CZ', 'HU'],
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function TransporteursPage() {
  const [step, setStep] = useState<Step>('upload')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<ParsedSheet | null>(null)
  const [carrierName, setCarrierName] = useState('')
  const [tariffLabel, setTariffLabel] = useState('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g'>('kg')
  const [headerRowIndex, setHeaderRowIndex] = useState(0) // index dans rows où sont les en-têtes de zones
  const [firstDataRow, setFirstDataRow] = useState(1)
  const [weightColIndex, setWeightColIndex] = useState(0) // colonne contenant le libellé de poids
  const [zoneMappings, setZoneMappings] = useState<ZoneMapping[]>([])
  const [weightMappings, setWeightMappings] = useState<WeightMapping[]>([])
  const [savedTariffs, setSavedTariffs] = useState<CarrierTariff[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Upload ────────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/carrier-tariffs/parse', { method: 'POST', body: fd })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error ?? 'Erreur parsing')
      }
      const data: ParseResult = await res.json()
      setParseResult(data)
      // Auto-select first sheet
      if (data.sheets.length === 1) {
        setSelectedSheet(data.sheets[0])
        autoDetect(data.sheets[0])
        setStep('map-columns')
      } else {
        setStep('select-sheet')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  // ─── Auto-détection heuristique ────────────────────────────────────────────
  function autoDetect(sheet: ParsedSheet) {
    // Trouve la ligne avec le plus de valeurs non-nulles → headers de zones
    let bestRow = 0
    let bestCount = 0
    const preview = [sheet.headers, ...sheet.rows.slice(0, 10)]
    preview.forEach((row, i) => {
      const count = row.filter((c) => c !== null && c !== '').length
      if (count > bestCount) { bestCount = count; bestRow = i }
    })
    setHeaderRowIndex(bestRow)
    setFirstDataRow(bestRow + 1)

    // Auto-génère les mappings de zones à partir des colonnes (sauf col 0 = poids)
    const allRows = [sheet.headers, ...sheet.rows]
    const headerRow = allRows[bestRow] ?? []
    const zones: ZoneMapping[] = []
    headerRow.forEach((cell, colIdx) => {
      if (colIdx === 0 || cell === null || cell === '') return
      const label = String(cell).trim()
      zones.push({
        columnIndex: colIdx,
        zoneId: `Z${colIdx}`,
        label,
        countries: guessCountries(label),
      })
    })
    setZoneMappings(zones)

    // Auto-génère les mappings de poids à partir des lignes
    const dataRows = allRows.slice(bestRow + 1).filter(r => r.some(c => c !== null && c !== ''))
    const weights: WeightMapping[] = dataRows.map((row, i) => {
      const raw = String(row[0] ?? '').trim()
      const parsed = parseWeightRange(raw)
      return {
        rowIndex: i,
        weightRangeId: `W${i + 1}`,
        min: parsed.min,
        max: parsed.max,
        label: raw || `Tranche ${i + 1}`,
      }
    })
    setWeightMappings(weights)
  }

  function guessCountries(label: string): string[] {
    const upper = label.toUpperCase()
    for (const [key, countries] of Object.entries(COUNTRY_PRESETS)) {
      if (upper.includes(key) || upper.includes(key.replace('-', ''))) return countries
    }
    return []
  }

  function parseWeightRange(raw: string): { min: number; max: number } {
    // e.g. "0-1 kg", "1–2", "2kg", "jusqu'à 3", "> 10"
    const nums = raw.match(/[\d.,]+/g)?.map(n => parseFloat(n.replace(',', '.'))) ?? []
    if (nums.length >= 2) return { min: nums[0], max: nums[1] }
    if (nums.length === 1) return { min: 0, max: nums[0] }
    return { min: 0, max: 0 }
  }

  // ─── Sélection sheet ────────────────────────────────────────────────────────
  function selectSheet(sheet: ParsedSheet) {
    setSelectedSheet(sheet)
    autoDetect(sheet)
    setStep('map-columns')
  }

  // ─── Mise à jour mappings zones ────────────────────────────────────────────
  function updateZone(idx: number, field: keyof ZoneMapping, value: unknown) {
    setZoneMappings(prev => prev.map((z, i) => i === idx ? { ...z, [field]: value } : z))
  }
  function removeZone(idx: number) {
    setZoneMappings(prev => prev.filter((_, i) => i !== idx))
  }
  function addZone() {
    setZoneMappings(prev => [...prev, {
      columnIndex: -1, zoneId: `Z${prev.length + 1}`,
      label: `Zone ${prev.length + 1}`, countries: [],
    }])
  }

  // ─── Mise à jour mappings poids ────────────────────────────────────────────
  function updateWeight(idx: number, field: keyof WeightMapping, value: unknown) {
    setWeightMappings(prev => prev.map((w, i) => i === idx ? { ...w, [field]: value } : w))
  }
  function removeWeight(idx: number) {
    setWeightMappings(prev => prev.filter((_, i) => i !== idx))
  }

  // ─── Construction de la grille finale ──────────────────────────────────────
  function buildTariff(): CarrierTariff {
    const allRows = selectedSheet ? [selectedSheet.headers, ...selectedSheet.rows] : []
    const dataRows = allRows.slice(firstDataRow).filter(r => r.some(c => c !== null && c !== ''))

    const prices: CarrierPriceMatrix = {}
    weightMappings.forEach((wm, rowIdx) => {
      if (rowIdx >= dataRows.length) return
      const row = dataRows[rowIdx]
      prices[wm.weightRangeId] = {}
      zoneMappings.forEach((zm) => {
        const raw = row[zm.columnIndex]
        const val = typeof raw === 'number' ? raw : parseFloat(String(raw ?? '').replace(',', '.'))
        if (!isNaN(val)) prices[wm.weightRangeId][zm.zoneId] = val
      })
    })

    const id = `${carrierName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    const now = new Date().toISOString()
    return {
      id,
      carrierName: carrierName || 'Transporteur',
      label: tariffLabel || `Grille ${carrierName}`,
      isActive: true,
      weightUnit,
      zones: zoneMappings.map(zm => ({
        id: zm.zoneId, label: zm.label, countries: zm.countries,
      })),
      weightRanges: weightMappings.map(wm => ({
        id: wm.weightRangeId, min: wm.min, max: wm.max, label: wm.label,
      })),
      prices,
      createdAt: now,
      updatedAt: now,
      sourceFile: parseResult?.fileName,
    }
  }

  // ─── Sauvegarde ─────────────────────────────────────────────────────────────
  async function saveTariff() {
    setLoading(true)
    setError(null)
    try {
      const tariff = buildTariff()
      const res = await fetch('/api/carrier-tariffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tariff),
      })
      if (!res.ok) throw new Error('Erreur sauvegarde')
      setSavedTariffs(prev => [...prev, tariff])
      setStep('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('upload')
    setParseResult(null)
    setSelectedSheet(null)
    setCarrierName('')
    setTariffLabel('')
    setZoneMappings([])
    setWeightMappings([])
    setError(null)
  }

  const previewTariff = step === 'preview' ? buildTariff() : null

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Truck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tarifs Transporteurs</h1>
          <p className="text-sm text-gray-500">Importez les grilles tarifaires depuis vos fichiers Excel</p>
        </div>
      </div>

      {/* Stepper */}
      <StepBar current={step} />

      {/* Erreur globale */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ─── Étape 1 : Upload ─── */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom du transporteur</label>
              <input
                value={carrierName}
                onChange={e => setCarrierName(e.target.value)}
                placeholder="DPD, Colissimo, UPS…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Libellé de la grille</label>
              <input
                value={tariffLabel}
                onChange={e => setTariffLabel(e.target.value)}
                placeholder="Grille DPD Classic Q1 2024"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}
            `}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm">Analyse du fichier…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <Upload className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="font-medium text-gray-700">Glissez votre fichier Excel ici</p>
                  <p className="text-xs text-gray-400 mt-1">ou cliquez pour parcourir — .xlsx, .xls, .csv</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>

          {/* Grilles existantes */}
          <ExistingTariffsList />
        </div>
      )}

      {/* ─── Étape 2 : Sélection de la feuille ─── */}
      {step === 'select-sheet' && parseResult && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Le fichier <strong>{parseResult.fileName}</strong> contient {parseResult.sheets.length} feuilles.
            Sélectionne celle qui contient la grille tarifaire :
          </p>
          <div className="grid gap-3">
            {parseResult.sheets.map((sheet) => (
              <button
                key={sheet.name}
                onClick={() => selectSheet(sheet)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 text-left transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">{sheet.name}</p>
                  <p className="text-xs text-gray-400">{sheet.rowCount} lignes × {sheet.colCount} colonnes</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
          <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600">← Reprendre depuis le début</button>
        </div>
      )}

      {/* ─── Étape 3 : Mapping colonnes → zones ─── */}
      {step === 'map-columns' && selectedSheet && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Feuille : <strong>{selectedSheet.name}</strong> — Configure chaque colonne comme une zone géographique.
            </p>
            <div className="flex gap-2 items-center">
              <label className="text-xs text-gray-500">Unité de poids</label>
              <select
                value={weightUnit}
                onChange={e => setWeightUnit(e.target.value as 'kg' | 'g')}
                className="text-xs border border-gray-200 rounded px-2 py-1"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
              </select>
            </div>
          </div>

          {/* Aperçu des premières lignes */}
          <SheetPreview sheet={selectedSheet} highlightCols={zoneMappings.map(z => z.columnIndex)} />

          {/* Ligne d'en-têtes / première ligne de données */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ligne des en-têtes de zones (index)</label>
              <input
                type="number" min={0}
                value={headerRowIndex}
                onChange={e => setHeaderRowIndex(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Première ligne de données (index)</label>
              <input
                type="number" min={0}
                value={firstDataRow}
                onChange={e => setFirstDataRow(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          {/* Zones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Zones détectées ({zoneMappings.length})</p>
              <button onClick={addZone} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                <Plus className="w-3 h-3" /> Ajouter zone
              </button>
            </div>
            {zoneMappings.map((zone, idx) => (
              <ZoneRow key={idx} zone={zone} idx={idx} sheet={selectedSheet}
                onChange={updateZone} onRemove={removeZone} />
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setStep('select-sheet')} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">← Retour</button>
            <button
              onClick={() => setStep('map-rows')}
              className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* ─── Étape 4 : Mapping lignes → tranches de poids ─── */}
      {step === 'map-rows' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Vérifie les tranches de poids détectées et ajuste si nécessaire.</p>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {weightMappings.map((w, idx) => (
              <WeightRow key={idx} weight={w} idx={idx} unit={weightUnit}
                onChange={updateWeight} onRemove={removeWeight} />
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setStep('map-columns')} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">← Retour</button>
            <button
              onClick={() => setStep('preview')}
              className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Aperçu →
            </button>
          </div>
        </div>
      )}

      {/* ─── Étape 5 : Aperçu & sauvegarde ─── */}
      {step === 'preview' && previewTariff && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">Aperçu de la grille : <span className="text-blue-600">{previewTariff.label}</span></p>
          </div>

          <TariffPreviewTable tariff={previewTariff} />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-700">{previewTariff.zones.length}</p>
              <p className="text-xs text-gray-500 mt-1">zones</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-700">{previewTariff.weightRanges.length}</p>
              <p className="text-xs text-gray-500 mt-1">tranches de poids</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-700">
                {Object.values(previewTariff.prices).reduce((sum, row) => sum + Object.keys(row).length, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">prix définis</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setStep('map-rows')} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">← Retour</button>
            <button
              onClick={saveTariff}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sauvegarder la grille
            </button>
          </div>
        </div>
      )}

      {/* ─── Étape 6 : Done ─── */}
      {step === 'done' && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">Grille sauvegardée !</p>
            <p className="text-sm text-gray-500 mt-1">
              La grille <strong>{tariffLabel || carrierName}</strong> est disponible dans le moteur de prix.
            </p>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload className="w-4 h-4" /> Importer une nouvelle grille
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Composant : barre de progression ────────────────────────────────────────
function StepBar({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex(s => s.id === current)
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={s.id} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              done ? 'bg-green-100 text-green-700' :
              active ? 'bg-blue-600 text-white' :
              'bg-gray-100 text-gray-400'
            }`}>
              {done && <Check className="w-3 h-3" />}
              {s.label}
            </div>
            {i < STEPS.length - 1 && <div className={`w-4 h-px ${i < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Composant : aperçu brut du sheet ────────────────────────────────────────
function SheetPreview({ sheet, highlightCols }: { sheet: ParsedSheet; highlightCols: number[] }) {
  const allRows = [sheet.headers, ...sheet.rows]
  const preview = allRows.slice(0, 6)
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="text-xs w-full">
        <tbody>
          {preview.map((row, ri) => (
            <tr key={ri} className={ri === 0 ? 'bg-gray-50 font-medium' : 'border-t border-gray-100'}>
              <td className="px-2 py-1 text-gray-300 w-6">{ri}</td>
              {row.map((cell, ci) => (
                <td key={ci} className={`px-2 py-1 max-w-24 truncate ${highlightCols.includes(ci) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>
                  {cell != null ? String(cell) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Composant : ligne de mapping zone ───────────────────────────────────────
function ZoneRow({ zone, idx, sheet, onChange, onRemove }: {
  zone: ZoneMapping; idx: number; sheet: ParsedSheet
  onChange: (idx: number, field: keyof ZoneMapping, value: unknown) => void
  onRemove: (idx: number) => void
}) {
  const allRows = [sheet.headers, ...sheet.rows]
  const allCols = (allRows[0] ?? []).map((h, i) => ({ i, label: h != null ? String(h) : `Col ${i}` }))

  return (
    <div className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-gray-100 hover:border-gray-200">
      <div className="col-span-3">
        <select
          value={zone.columnIndex}
          onChange={e => onChange(idx, 'columnIndex', Number(e.target.value))}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        >
          <option value={-1}>— col —</option>
          {allCols.map(c => <option key={c.i} value={c.i}>Col {c.i}: {c.label.slice(0, 20)}</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <input
          value={zone.zoneId}
          onChange={e => onChange(idx, 'zoneId', e.target.value)}
          placeholder="Z1"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        />
      </div>
      <div className="col-span-3">
        <input
          value={zone.label}
          onChange={e => onChange(idx, 'label', e.target.value)}
          placeholder="Zone 1 - France"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        />
      </div>
      <div className="col-span-3">
        <select
          value={zone.countries.join(',')}
          onChange={e => onChange(idx, 'countries', e.target.value ? e.target.value.split(',') : [])}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        >
          <option value="">— pays —</option>
          {Object.entries(COUNTRY_PRESETS).map(([k, v]) => (
            <option key={k} value={v.join(',')}>{k}</option>
          ))}
        </select>
      </div>
      <div className="col-span-1 flex justify-end">
        <button onClick={() => onRemove(idx)} className="p-1 text-gray-300 hover:text-red-400">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Composant : ligne de mapping poids ──────────────────────────────────────
function WeightRow({ weight, idx, unit, onChange, onRemove }: {
  weight: WeightMapping; idx: number; unit: string
  onChange: (idx: number, field: keyof WeightMapping, value: unknown) => void
  onRemove: (idx: number) => void
}) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-gray-100 hover:border-gray-200">
      <div className="col-span-1 text-xs text-gray-400 text-center">#{idx + 1}</div>
      <div className="col-span-4">
        <input
          value={weight.label}
          onChange={e => onChange(idx, 'label', e.target.value)}
          placeholder="Libellé"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        />
      </div>
      <div className="col-span-2">
        <input
          type="number" step="0.01"
          value={weight.min}
          onChange={e => onChange(idx, 'min', parseFloat(e.target.value) || 0)}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        />
      </div>
      <div className="col-span-1 text-center text-xs text-gray-400">→</div>
      <div className="col-span-2">
        <input
          type="number" step="0.01"
          value={weight.max}
          onChange={e => onChange(idx, 'max', parseFloat(e.target.value) || 0)}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        />
      </div>
      <div className="col-span-1 text-xs text-gray-400">{unit}</div>
      <div className="col-span-1 flex justify-end">
        <button onClick={() => onRemove(idx)} className="p-1 text-gray-300 hover:text-red-400">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Composant : tableau d'aperçu de la grille finale ────────────────────────
function TariffPreviewTable({ tariff }: { tariff: CarrierTariff }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="text-xs w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left font-medium text-gray-500">Poids ({tariff.weightUnit})</th>
            {tariff.zones.map(z => (
              <th key={z.id} className="px-3 py-2 text-center font-medium text-gray-700">{z.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tariff.weightRanges.map((wr, i) => (
            <tr key={wr.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              <td className="px-3 py-2 font-medium text-gray-700">{wr.label || `${wr.min}–${wr.max}`}</td>
              {tariff.zones.map(z => {
                const price = tariff.prices[wr.id]?.[z.id]
                return (
                  <td key={z.id} className="px-3 py-2 text-center">
                    {price != null ? (
                      <span className="font-mono text-green-700">{price.toFixed(2)} €</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Composant : liste des grilles existantes ─────────────────────────────────
function ExistingTariffsList() {
  const [tariffs, setTariffs] = useState<CarrierTariff[]>([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  async function load() {
    if (loaded) { setOpen(o => !o); return }
    const res = await fetch('/api/carrier-tariffs')
    const data = await res.json() as CarrierTariff[]
    setTariffs(data)
    setLoaded(true)
    setOpen(true)
  }

  async function deleteTariff(id: string) {
    await fetch(`/api/carrier-tariffs?id=${id}`, { method: 'DELETE' })
    setTariffs(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="rounded-xl border border-gray-200">
      <button
        onClick={load}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400" /> Grilles existantes</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {tariffs.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 italic">Aucune grille importée</p>
          ) : tariffs.map(t => (
            <div key={t.id} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-800">{t.label}</p>
                <p className="text-xs text-gray-400">{t.zones.length} zones · {t.weightRanges.length} tranches</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t.isActive ? 'Actif' : 'Inactif'}
                </span>
                <button onClick={() => deleteTariff(t.id)} className="p-1 text-gray-300 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
