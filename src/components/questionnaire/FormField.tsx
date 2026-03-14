'use client'

import { useState } from 'react'
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
  comment?: string
  shareUrl?: string
  onChange: (fieldId: string, value: string) => void
  onCommentChange?: (fieldId: string, comment: string) => void
}

export function FormField({ field, value, error, comment, shareUrl, onChange, onCommentChange }: FormFieldProps) {
  const [helpOpen, setHelpOpen] = useState(false)
  const props = { field, value, error, onChange }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 14,
    border: error
      ? '1.5px solid #FCA5A5'
      : helpOpen
        ? '1.5px solid #FCD34D'
        : '1px solid rgba(9,77,128,0.09)',
    boxShadow: error
      ? '0 2px 8px rgba(239,68,68,0.08)'
      : '0 1px 3px rgba(9,77,128,0.05), 0 4px 12px rgba(9,77,128,0.06)',
    padding: '20px 22px',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  // Message de partage de la question
  const questionText = `Question : ${field.label}${field.hint ? `\n(${field.hint})` : ''}`
  const shareText = shareUrl
    ? `${questionText}\n\nPour répondre au questionnaire complet :\n${shareUrl}`
    : questionText
  const emailHref = `mailto:?subject=${encodeURIComponent(`Aide questionnaire - ${field.label}`)}&body=${encodeURIComponent(`Bonjour,\n\nJe remplis un questionnaire logistique et j'ai besoin d'aide pour la question suivante :\n\n${questionText}\n\nLien du questionnaire :\n${shareUrl ?? ''}\n\nMerci`)}`
  const waHref = `https://wa.me/?text=${encodeURIComponent(`Bonjour, peux-tu m'aider à répondre à cette question de questionnaire logistique ?\n\n${shareText}`)}`

  return (
    <div style={cardStyle}>
      <div className="flex flex-col gap-2.5">

        {/* Label + icône aide */}
        <div className="flex items-start justify-between gap-2">
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

          {/* Bouton aide */}
          <button
            type="button"
            onClick={() => setHelpOpen(o => !o)}
            title="Je ne sais pas répondre à cette question"
            className="flex-shrink-0 mt-0.5 p-1 rounded-md transition-colors cursor-pointer"
            style={{
              color: helpOpen ? '#D97706' : '#CBD5E1',
              backgroundColor: helpOpen ? '#FFFBEB' : 'transparent',
            }}
            onMouseEnter={(e) => { if (!helpOpen) e.currentTarget.style.color = '#D97706' }}
            onMouseLeave={(e) => { if (!helpOpen) e.currentTarget.style.color = '#CBD5E1' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
        </div>

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

        {/* Hint contextuel */}
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

      {/* Panneau d'aide — connecté à la card, séparé par un divider */}
      {helpOpen && (
        <>
          <div className="mt-4 -mx-0" style={{ height: 1, backgroundColor: '#FDE68A' }} />
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#92400E' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Vous ne savez pas répondre à cette question ?
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: '#78350F' }}>
                Laissez une note ou posez votre question
              </label>
              <textarea
                value={comment ?? ''}
                onChange={(e) => onCommentChange?.(field.id, e.target.value)}
                placeholder="Ex : je ne connais pas ce chiffre, je vais demander à mon équipe…"
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg resize-none"
                style={{ border: '1.5px solid #FCD34D', backgroundColor: '#FFFEF7', color: 'var(--dark-navy)', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#FCD34D'; e.currentTarget.style.boxShadow = 'none' }}
              />
              {comment && (
                <p className="text-xs" style={{ color: '#A16207' }}>✓ Note sauvegardée automatiquement</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium" style={{ color: '#78350F' }}>
                Demandez de l&apos;aide à quelqu&apos;un :
              </p>
              <div className="flex gap-2">
                <a href={emailHref}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: '#fff', color: '#92400E', border: '1px solid #FDE68A', textDecoration: 'none' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Partager par email
                </a>
                <a href={waHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', textDecoration: 'none' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Partager sur WhatsApp
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
