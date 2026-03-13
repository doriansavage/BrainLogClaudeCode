'use client'

import type { FieldDefinition } from '@/types/questionnaire'
import { FieldText }        from './fields/FieldText'
import { FieldUrl }         from './fields/FieldUrl'
import { FieldTextarea }    from './fields/FieldTextarea'
import { FieldToggle }      from './fields/FieldToggle'
import { FieldRadioCards }  from './fields/FieldRadioCards'
import { FieldIconGrid }    from './fields/FieldIconGrid'
import { FieldSlider }      from './fields/FieldSlider'
import { FieldMultiSelect } from './fields/FieldMultiSelect'
import { FieldPriceRange }  from './fields/FieldPriceRange'
import { FieldScale3 }      from './fields/FieldScale3'
import { FieldLogoPicker }  from './fields/FieldLogoPicker'
import { FieldTimelineSel } from './fields/FieldTimelineSel'
import { FieldGeoSplit }    from './fields/FieldGeoSplit'

interface FormFieldProps {
  field: FieldDefinition
  value: string
  error?: string
  onChange: (fieldId: string, value: string) => void
}

export function FormField({ field, value, error, onChange }: FormFieldProps) {
  const props = { field, value, error, onChange }

  return (
    <div className="flex flex-col gap-2.5">

      {/* Label */}
      <label
        htmlFor={field.id}
        className="text-sm font-semibold leading-snug"
        style={{ color: 'var(--dark-navy)' }}
      >
        {field.label}
        {field.required && (
          <span className="ml-1.5 text-xs font-medium" style={{ color: 'var(--primary)' }}>*</span>
        )}
      </label>

      {/* Composant UI selon le type */}
      {field.type === 'text'         && <FieldText        {...props} />}
      {field.type === 'url'          && <FieldUrl         {...props} />}
      {field.type === 'textarea'     && <FieldTextarea    {...props} />}
      {field.type === 'toggle'       && <FieldToggle      {...props} />}
      {field.type === 'radio_cards'  && <FieldRadioCards  {...props} />}
      {field.type === 'icon_grid'    && <FieldIconGrid    {...props} />}
      {field.type === 'slider'       && <FieldSlider      {...props} />}
      {field.type === 'multi_select' && <FieldMultiSelect {...props} />}
      {field.type === 'price_range'  && <FieldPriceRange  {...props} />}
      {field.type === 'scale_3'      && <FieldScale3      {...props} />}
      {field.type === 'logo_picker'  && <FieldLogoPicker  {...props} />}
      {field.type === 'timeline_sel' && <FieldTimelineSel {...props} />}
      {field.type === 'geo_split'    && <FieldGeoSplit    {...props} />}

      {/* Hint contextuel (masqué si erreur) */}
      {field.hint && !error && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {field.hint}
        </p>
      )}

      {/* Erreur de validation */}
      {error && (
        <div className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{error}</p>
        </div>
      )}
    </div>
  )
}
