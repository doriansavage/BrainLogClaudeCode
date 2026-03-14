// POST /api/carrier-tariffs/parse
// Reçoit un fichier Excel en multipart/form-data
// Retourne les sheets parsées (headers + rows brutes)

import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import type { ParseResult, ParsedSheet } from '@/types/carrier-tariffs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
    ]
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json({ error: 'Format non supporté. Utilise .xlsx, .xls ou .csv' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellText: true, cellDates: true })

    const sheets: ParsedSheet[] = workbook.SheetNames.map((sheetName) => {
      const worksheet = workbook.Sheets[sheetName]
      // Convertit en tableau 2D brut
      const raw: (string | number | null)[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        blankrows: false,
      }) as (string | number | null)[][]

      // Filtre les lignes entièrement nulles
      const nonEmptyRows = raw.filter((row) => row.some((cell) => cell !== null && cell !== ''))

      const headers = (nonEmptyRows[0] ?? []).map((h) => (h != null ? String(h) : ''))
      const rows = nonEmptyRows.slice(1)

      return {
        name: sheetName,
        headers,
        rows,
        rowCount: rows.length,
        colCount: headers.length,
      }
    })

    const result: ParseResult = {
      fileName: file.name,
      sheets,
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[carrier-tariffs/parse]', err)
    return NextResponse.json({ error: 'Erreur lors du parsing du fichier' }, { status: 500 })
  }
}
