import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { QUESTIONNAIRE_SCHEMA } from './schema'
import type { QuestionnaireSchema } from '@/types/questionnaire'

export interface FieldCfg {
  enabled?: boolean
  required?: boolean
}
export interface SectionCfg {
  enabled?: boolean
  fields?: Record<string, FieldCfg>
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
            required: fCfg.required !== undefined ? fCfg.required : field.required,
          }
        })
      return { ...section, fields }
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
