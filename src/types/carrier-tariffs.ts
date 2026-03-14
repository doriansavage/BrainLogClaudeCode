// ─── Types Tarifs Transporteurs ───────────────────────────────────────────────
// Grille tarifaire importée depuis Excel transporteur (DPD, Colissimo, UPS…)
// Structure : zones géographiques × tranches de poids → prix

export interface CarrierZone {
  id: string           // e.g. "Z1", "Z2", "DOM"
  label: string        // e.g. "Zone 1 - France métropolitaine"
  countries: string[]  // e.g. ["FR"] ou ["DE", "AT", "CH"]
}

export interface CarrierWeightRange {
  id: string   // e.g. "W1", "W2"
  min: number  // kg ou g selon weightUnit
  max: number  // kg ou g selon weightUnit
  label?: string // e.g. "0–1 kg"
}

// prices[weightRangeId][zoneId] = prix en €
export type CarrierPriceMatrix = Record<string, Record<string, number>>

export interface CarrierTariff {
  id: string                    // e.g. "dpd-2024-q1"
  carrierName: string           // e.g. "DPD", "Colissimo", "UPS"
  label: string                 // e.g. "Grille DPD Classic Q1 2024"
  isActive: boolean
  weightUnit: 'kg' | 'g'
  zones: CarrierZone[]
  weightRanges: CarrierWeightRange[]
  prices: CarrierPriceMatrix
  createdAt: string             // ISO datetime
  updatedAt: string             // ISO datetime
  sourceFile?: string           // nom du fichier Excel source
}

// ─── Types pour le parsing côté serveur ─────────────────────────────────────

export interface ParsedSheet {
  name: string
  headers: string[]     // première ligne détectée
  rows: (string | number | null)[][]  // données brutes
  rowCount: number
  colCount: number
}

export interface ParseResult {
  fileName: string
  sheets: ParsedSheet[]
}

// ─── Types pour le mapping UI ────────────────────────────────────────────────

export interface ZoneMapping {
  columnIndex: number  // colonne du sheet = cette zone
  zoneId: string
  label: string
  countries: string[]
}

export interface WeightMapping {
  rowIndex: number     // ligne du sheet = cette tranche de poids
  weightRangeId: string
  min: number
  max: number
  label: string
}
