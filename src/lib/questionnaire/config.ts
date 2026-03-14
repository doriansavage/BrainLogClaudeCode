import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { QUESTIONNAIRE_SCHEMA } from './schema'
import type { QuestionnaireSchema, FieldType } from '@/types/questionnaire'

export interface FieldCfg {
  enabled?: boolean
  required?: boolean
  labelOverride?: string
  hintOverride?: string
  optionsOverride?: string[]
}

export interface CustomFieldDef {
  id: string
  label: string
  type: string
  required: boolean
  hint?: string
  options?: string[]
}

export interface SectionCfg {
  enabled?: boolean
  fields?: Record<string, FieldCfg>
  customFields?: CustomFieldDef[]
}
export interface QuestionnaireConfig {
  sections: Record<string, SectionCfg>
}

/** Merge base schema + config overrides → active schema for prospect portal */
export function applyConfig(config: QuestionnaireConfig): QuestionnaireSchema {
  const sections = QUESTIONNAIRE_SCHEMA.sections
    .filter(section => config.sections[section.id]?.enabled !== false)
    .map(section => {
      const sectionCfg = config.sections[section.id] ?? {}
      const fields = section.fields
        .filter(field => sectionCfg.fields?.[field.id]?.enabled !== false)
        .map(field => {
          const fCfg = sectionCfg.fields?.[field.id] ?? {}
          return {
            ...field,
            label: fCfg.labelOverride ?? field.label,
            hint: fCfg.hintOverride !== undefined ? fCfg.hintOverride : field.hint,
            options: fCfg.optionsOverride ?? field.options,
            required: fCfg.required !== undefined ? fCfg.required : field.required,
          }
        })
      const customFields = (sectionCfg.customFields ?? []).map(cf => ({
        id: cf.id,
        label: cf.label,
        type: cf.type as FieldType,
        required: cf.required,
        ...(cf.hint ? { hint: cf.hint } : {}),
        ...(cf.options ? { options: cf.options } : {}),
      }))
      return { ...section, fields: [...fields, ...customFields] }
    })
  return { sections }
}

/** Load config from disk (server-side only) */
export function loadQConfig(): QuestionnaireConfig {
  const configPath = join(process.cwd(), 'data/questionnaire-config.json')
  if (!existsSync(configPath)) return { sections: {} }
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8'))
  } catch {
    return { sections: {} }
  }
}

/** Load and apply config, returns merged schema */
export function loadActiveSchema(): QuestionnaireSchema {
  const config = loadQConfig()
  const hasOverrides = Object.keys(config.sections).length > 0
  return hasOverrides ? applyConfig(config) : QUESTIONNAIRE_SCHEMA
}
