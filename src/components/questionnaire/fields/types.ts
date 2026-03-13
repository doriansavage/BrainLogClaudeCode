import type { FieldDefinition } from '@/types/questionnaire'

export interface FieldProps {
  field: FieldDefinition
  value: string
  error?: string
  onChange: (fieldId: string, value: string) => void
}
