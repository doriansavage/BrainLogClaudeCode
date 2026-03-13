'use client'

import { useState } from 'react'

// ─── DATA ────────────────────────────────────────────────────────────────────

const PRIX_STANDARDS = [
  {
    categorie: 'Frais récurrents mensuels',
    accent: '#3b82f6',
    items: [
      {
        code: 'gestion_mensuelle',
        service: 'Gestion mensuelle de compte',
        detail: 'Frais de dossiers administratifs et facturation',
        prix: 150,
        unite: 'par mois',
      },
      {
        code: 'wms',
        service: 'Abonnement WMS',
        detail: 'Licence mensuelle — suivi temps réel, synchro commandes, profils illimités, traçabilité',
        prix: 100,
        unite: 'par mois',
      },
    ],
  },
  {
    categorie: 'Réception & déchargement',
    accent: '#8b5cf6',
    items: [
      {
        code: 'container_40',
        service: "Déchargement container 40'",
        detail: 'Max 4h',
        prix: 330,
        unite: 'par conteneur',
        condition: 'Q2.01 = Conteneur FCL/LCL',
      },
      {
        code: 'container_20',
        service: "Déchargement container 20'",
        detail: 'Max 2h',
        prix: 210,
        unite: 'par conteneur',
        condition: 'Q2.01 = Conteneur FCL/LCL',
      },
      {
        code: 'palette_mono',
        service: 'Déchargement palette monoréférence',
        detail: '',
        prix: 6.5,
        unite: 'par palette',
        condition: 'Q2.01 = Palettes ou Q2.04 ≠ 0',
      },
      {
        code: 'palette_multi',
        service: 'Déchargement palette multiréférence',
        detail: 'Si Q2.02 = Multi-SKU ou Les deux',
        prix: 6.5,
        unite: 'par palette',
        condition: 'Q2.02 = Multi-SKU',
      },
      {
        code: 'colis_mono',
        service: 'Déchargement colis monoréférence',
        detail: '',
        prix: 1.2,
        unite: 'par colis',
        condition: 'Q2.01 = Colis ou Q2.05 ≠ 0',
      },
      {
        code: 'entree_stock',
        service: 'Entrée en stock',
        detail: 'Contrôle quantitatif + mise en stock physique et informatique sur base annonce de livraison',
        prix: 0.1,
        unite: 'par article (UVC)',
      },
    ],
  },
  {
    categorie: 'Stockage',
    accent: '#f59e0b',
    items: [
      {
        code: 'stockage_palette',
        service: 'Stockage palette',
        detail: 'Dimensions : l=80 × L=120 × h=180 cm',
        prix: 10.5,
        unite: 'par palette / mois',
      },
      {
        code: 'stockage_bac',
        service: 'Stockage bac/étagère picking',
        detail: '',
        prix: null,
        unite: 'sur devis / mois',
        condition: 'Q3.02 = Bac/étagère ou Mixte',
      },
    ],
  },
  {
    categorie: 'Préparation commandes B2C',
    accent: '#10b981',
    items: [
      {
        code: 'prepa_cmd',
        service: 'Par commande',
        detail: 'Prélèvement, packing, pose étiquette transporteur, chargement',
        prix: 1.5,
        unite: 'par commande',
      },
      {
        code: 'prepa_ligne',
        service: 'Par ligne de commande',
        detail: '',
        prix: 0.25,
        unite: 'par ligne',
      },
      {
        code: 'prepa_article',
        service: 'Par article (UVC)',
        detail: '',
        prix: 0.5,
        unite: 'par article',
      },
    ],
  },
  {
    categorie: 'Préparation commandes B2B',
    accent: '#06b6d4',
    items: [
      {
        code: 'prepa_b2b',
        service: 'Préparation B2B (régie)',
        detail: 'Préparation des commandes B2B selon cahier des charges — palettisation incluse',
        prix: 39.5,
        unite: 'par heure',
        condition: 'Q4.05 = Oui ou En projet',
      },
    ],
  },
  {
    categorie: 'Fournitures & documents',
    accent: '#ec4899',
    items: [
      {
        code: 'etiquette_transport',
        service: 'Étiquette transporteur',
        detail: '',
        prix: 0.06,
        unite: 'par colis',
      },
      {
        code: 'bon_livraison',
        service: 'Impression + insertion BL',
        detail: '',
        prix: 0.15,
        unite: 'par document',
        condition: 'Q5.03 ≠ Non',
      },
      {
        code: 'insert',
        service: 'Insertion document / flyer / goodies',
        detail: '',
        prix: 0.09,
        unite: 'par pièce',
        condition: 'Q5.03 ≠ Non',
      },
      {
        code: 'douane',
        service: 'Documents douaniers hors UE',
        detail: 'Impression + insertion pour commandes hors Union Européenne',
        prix: 2.75,
        unite: 'par commande',
        condition: 'Q6.03-Q6.08 ≠ 0% (pays hors BE)',
      },
    ],
  },
  {
    categorie: 'Management des retours',
    accent: '#ef4444',
    items: [
      {
        code: 'retour',
        service: 'Traitement retour',
        detail: 'Identification & reporting client (hors déchargement, réception et mise en stock)',
        prix: 0.8,
        unite: 'par retour',
      },
    ],
  },
  {
    categorie: 'Services additionnels',
    accent: '#64748b',
    items: [
      {
        code: 'manutention',
        service: 'Manutention',
        detail: 'Inventaire, reconditionnement, re-étiquetage, réemballage, kitting, personnalisation, etc.',
        prix: 39.5,
        unite: 'par heure',
      },
      {
        code: 'administration',
        service: 'Administration',
        detail: 'Travaux spécifiques non liés à la manutention',
        prix: 65,
        unite: 'par heure',
      },
    ],
  },
]

type RuleType = 'inclusion' | 'exclusion' | 'modification' | 'alerte'

interface Rule {
  condition: string
  action: string
  type: RuleType
}

const REGLES: { section: string; rules: Rule[] }[] = [
  {
    section: 'Déchargement — type de livraison',
    rules: [
      { condition: 'Q2.01 = Conteneur FCL ou LCL', action: "Afficher les lignes Déchargement container 40' (330€) et 20' (210€)", type: 'inclusion' },
      { condition: 'Q2.01 = Palettes OU Q2.04 ≠ 0', action: 'Afficher Déchargement palette (6,50€/palette)', type: 'inclusion' },
      { condition: 'Q2.01 = Colis OU Q2.05 ≠ 0', action: 'Afficher Déchargement colis (1,20€/colis)', type: 'inclusion' },
      { condition: 'Q2.02 = Multi-SKU ou Les deux', action: 'Libellé → "multiréférence" au lieu de "monoréférence"', type: 'modification' },
      { condition: "Q2.01 ≠ Conteneur", action: 'Supprimer les lignes Déchargement container', type: 'exclusion' },
    ],
  },
  {
    section: 'Bloc B2B',
    rules: [
      { condition: 'Q4.05 = Non', action: 'SUPPRIMER bloc Préparation B2B + lignes B2B fournitures + packaging B2B', type: 'exclusion' },
      { condition: 'Q4.05 = Oui ou En projet', action: 'Inclure Préparation B2B à 39,50€/h avec détails palettisation/étiquetage', type: 'inclusion' },
      { condition: 'Q5.06 ≠ Pas de B2B', action: 'Ajouter dans description B2B : "Palettisation : {Q5.06}"', type: 'modification' },
      { condition: 'Q5.07 ≠ Pas de B2B et ≠ Non', action: 'Ajouter dans description B2B : "Étiquetage : {Q5.07}"', type: 'modification' },
    ],
  },
  {
    section: 'Entrée en stock & qualité',
    rules: [
      { condition: 'Q2.10 = Quantitatif + qualitatif', action: 'Ajouter "et qualitatif" dans description entrée en stock', type: 'modification' },
      { condition: 'Q2.10 = Avec prise de photos', action: 'Ajouter "et qualitatif avec prise de photos"', type: 'modification' },
      { condition: 'Q2.10 = Contrôle complet + rapport', action: 'Ajouter "et qualitatif complet avec rapport"', type: 'modification' },
      { condition: 'Q2.11 = Non — étiquetage nécessaire', action: 'Note D : "Étiquetage EAN en sus (voir services additionnels)"', type: 'alerte' },
      { condition: 'Q1.13 ≠ Aucune', action: 'Ajouter "Enregistrement des {lots/péremption}" dans description', type: 'modification' },
      { condition: 'Q1.13 = Dates de péremption ou Les deux', action: '"Gestion FEFO automatique incluse"', type: 'modification' },
    ],
  },
  {
    section: 'Stockage spécifique',
    rules: [
      { condition: 'Q3.02 = Bac/étagère ou Mixte', action: 'Inclure sous-ligne "Stockage bac/étagère picking" (sur devis)', type: 'inclusion' },
      { condition: 'Q3.05 = Forte saisonnalité', action: 'Note : "volume variable selon saisonnalité — voir conditions"', type: 'modification' },
      { condition: 'Q1.12 = Fragile', action: '"Manipulation spéciale produits fragiles" en commentaire entrée en stock', type: 'alerte' },
      { condition: 'Q1.12 = Température contrôlée', action: '"Stockage en zone à température contrôlée — surcoût applicable"', type: 'alerte' },
      { condition: "Q1.12 = Valeur élevée (coffre)", action: '"Stockage sécurisé en coffre — surcoût applicable"', type: 'alerte' },
      { condition: 'Q1.12 = Dangereux (ADR)', action: '"Stockage ADR — conditions spécifiques à définir"', type: 'alerte' },
    ],
  },
  {
    section: 'Fournitures & documents',
    rules: [
      { condition: 'Q5.03 ≠ Non (inserts marketing)', action: 'Inclure lignes BL (0,15€) et insertion flyer (0,09€)', type: 'inclusion' },
      { condition: 'Q5.04 = Brain E-Log à facturer', action: 'Fournitures B2C libellé : "sur base des achats réels"', type: 'modification' },
      { condition: 'Q5.04 = Le prospect', action: 'Fournitures B2C libellé : "fourni par le client"', type: 'modification' },
      { condition: 'Q6.03-Q6.08 ≠ 0% (pays hors BE)', action: 'Inclure Documents douaniers (2,75€/commande)', type: 'inclusion' },
      { condition: 'Tous % pays Q6 = 0% sauf Belgique', action: 'Pas de mention douanière dans fournitures', type: 'exclusion' },
    ],
  },
  {
    section: 'Retours',
    rules: [
      { condition: 'Q7.01 = vide ET Q7.02 = vide', action: 'SUPPRIMER le bloc Management des retours entier', type: 'exclusion' },
      { condition: 'Q7.04 = Contrôle qualité + remise en stock', action: 'Ajouter "Contrôle qualité systématique avant remise en stock"', type: 'modification' },
      { condition: 'Q7.04 = Reconditionnement', action: 'Ajouter "Reconditionnement avant remise en stock"', type: 'modification' },
      { condition: 'Q7.09 = Oui — systématiquement', action: 'Ajouter "Prise de photos systématique" dans description retours', type: 'modification' },
      { condition: 'Q7.09 = Oui — si défaut', action: 'Ajouter "Prise de photos en cas de défaut constaté"', type: 'modification' },
    ],
  },
  {
    section: 'WMS — intégration',
    rules: [
      { condition: 'Q8.01 = API directe', action: 'Description WMS : "Intégration via API directe avec {Q4.10} / Flux API personnalisés"', type: 'modification' },
      { condition: 'Q8.01 = Plugin natif', action: 'Description WMS : "Intégration via plugin natif {Q4.10}"', type: 'modification' },
      { condition: 'Q8.01 = Fichier CSV/SFTP', action: 'Description WMS : "Intégration via échanges CSV/SFTP"', type: 'modification' },
      { condition: 'Q8.01 = Marketplace connector', action: 'Description WMS : "Intégration via connecteur marketplace ({Q4.11})"', type: 'modification' },
      { condition: 'Q8.02 ≠ Aucun', action: 'Ajouter dans WMS : "Synchronisation avec {Q8.02}"', type: 'modification' },
      { condition: 'Q8.03 = Oui — indispensable', action: 'Ajouter : "Synchronisation des stocks en temps réel"', type: 'modification' },
    ],
  },
  {
    section: '⚠️ Alertes à confirmer',
    rules: [
      { condition: 'Q1.12 = Plusieurs contraintes', action: '⚠️ Audit produit requis avant chiffrage définitif', type: 'alerte' },
      { condition: 'Q2.08 = Non — à dédouaner', action: '⚠️ Service douane à chiffrer séparément', type: 'alerte' },
      { condition: 'Q5.08 = Cahier des charges GMS ou Normes EDI', action: '⚠️ Conformité GMS/EDI à valider — surcoût possible', type: 'alerte' },
      { condition: 'Q5.09 = Gravure/flocage', action: '⚠️ Investissement matériel à évaluer', type: 'alerte' },
      { condition: 'Q8.02 = SAP', action: '⚠️ Intégration SAP — complexité et délai à évaluer', type: 'alerte' },
    ],
  },
]

const CONDITIONS_VENTE = [
  {
    titre: '1. Cadre de l\'offre',
    contenu: "Cette offre est valable uniquement entre Brain E-Log SRL et le prospect concerné.",
  },
  {
    titre: '2. Validité de l\'offre',
    contenu:
      "Offre valable jusqu'au 31/12/2026.\n\nLes prix présentés dans cette offre ne couvrent que les activités décrites dans ce document. Si des services supplémentaires sont nécessaires, ils seront facturés au client sur base de nos conditions générales de vente.",
  },
  {
    titre: '3. Volume minimum annuel',
    contenu:
      "Cette offre est basée sur un volume minimum calculé selon Q4.01 (valeur basse × 12 mois) :\n\n• < 50 cmd/mois → 600 cmd/an\n• 50–200 cmd/mois → 600 cmd/an\n• 200–500 cmd/mois → 2 400 cmd/an\n• 500–1 000 cmd/mois → 6 000 cmd/an\n• 1 000–5 000 cmd/mois → 12 000 cmd/an\n• > 5 000 cmd/mois → 60 000 cmd/an",
  },
  {
    titre: '4. Prix',
    contenu:
      "Nos prix sont en euros HTVA.\n\nLa TVA n'est pas applicable quand il s'agit d'une facturation intracommunautaire.\n\nToute augmentation de TVA ou toute nouvelle taxe qui serait imposée par les autorités fiscales belges sera appliquée conformément à la loi belge.",
  },
  {
    titre: '5. Paiements',
    contenu:
      "Nos factures sont payables sur le compte bancaire : BE84 0689 0320 9059\n\nNotre délai de paiement standard est de 14 jours. Les retards de paiement entraîneront la facturation de pénalités pour retard de paiement, après notification et conformément à nos conditions générales de vente.",
  },
  {
    titre: '6. Responsabilité',
    contenu:
      "La responsabilité de Brain E-Log s'arrête là où celle des transporteurs démarre. S'appliquent alors leurs conditions générales de vente.\n\nCependant, Brain E-Log pourra aider à la résolution des problèmes de transport (dommages, objets perdus, etc.) en raison de la relation étroite qu'elle dispose avec les compagnies de transport. Cela fera l'objet de suppléments.",
  },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fmt(prix: number | null): string {
  if (prix === null) return 'Sur devis'
  if (Number.isInteger(prix)) return `${prix} €`
  return `${prix.toFixed(2).replace('.', ',')} €`
}

const RULE_TYPE: Record<RuleType, { label: string; bg: string; color: string; border: string }> = {
  inclusion:   { label: 'Inclure',   bg: '#F0FDF4', color: '#16a34a', border: '#bbf7d0' },
  exclusion:   { label: 'Exclure',   bg: '#FFF1F2', color: '#be123c', border: '#fecdd3' },
  modification:{ label: 'Modifier',  bg: '#EFF6FF', color: '#1d4ed8', border: '#bfdbfe' },
  alerte:      { label: 'Alerte',    bg: '#FFFBEB', color: '#92400e', border: '#fde68a' },
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'tarifs',     label: 'Grille tarifaire' },
  { id: 'regles',     label: 'Règles conditionnelles' },
  { id: 'conditions', label: 'Conditions de vente' },
  { id: 'contact',    label: 'Contact & infos' },
]

export default function ReglesPage() {
  const [tab, setTab] = useState('tarifs')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--dark-navy)', margin: 0 }}>
            Règles métier
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Grille tarifaire Brain E-Log · Logique conditionnelle · Conditions de vente
          </p>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 20,
            background: '#EFF6FF',
            color: '#1d4ed8',
          }}
        >
          Validité : 31/12/2026
        </span>
      </div>

      {/* ── Tabs ── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-page)',
          flexShrink: 0,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'color 150ms',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        {tab === 'tarifs'     && <TabTarifs />}
        {tab === 'regles'     && <TabRegles />}
        {tab === 'conditions' && <TabConditions />}
        {tab === 'contact'    && <TabContact />}
      </div>
    </div>
  )
}

// ─── TAB: GRILLE TARIFAIRE ────────────────────────────────────────────────────

function TabTarifs() {
  return (
    <div style={{ maxWidth: 920 }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Tous les prix sont en <strong>euros HTVA</strong>. Les lignes avec une <em>condition</em> ne s'affichent que si la réponse correspondante du questionnaire prospect remplit le critère.
      </p>

      {PRIX_STANDARDS.map((groupe) => (
        <div key={groupe.categorie} style={{ marginBottom: 28 }}>
          {/* Group header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 12px',
              borderLeft: `3px solid ${groupe.accent}`,
              background: '#F8FAFC',
              borderRadius: '0 4px 4px 0',
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark-navy)' }}>
              {groupe.categorie}
            </span>
            <span
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 10,
                background: groupe.accent + '22',
                color: groupe.accent,
                fontWeight: 600,
              }}
            >
              {groupe.items.length} poste{groupe.items.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                {['Service', 'Détail / description', 'Prix HTVA', 'Unité', 'Condition'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '5px 10px',
                      textAlign: i === 2 ? 'right' : 'left',
                      fontWeight: 500,
                      color: 'var(--text-muted)',
                      fontSize: 11,
                      width: ['22%', '32%', '12%', '18%', '16%'][i],
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupe.items.map((item, i) => (
                <tr
                  key={item.code}
                  style={{
                    background: i % 2 === 0 ? '#fff' : '#FAFAFA',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <td style={{ padding: '8px 10px', fontWeight: 500, color: 'var(--dark-navy)' }}>
                    {item.service}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#64748b', fontSize: 11, lineHeight: 1.5 }}>
                    {item.detail || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      fontWeight: 700,
                      fontSize: 13,
                      color: item.prix === null ? '#94a3b8' : '#094D80',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {fmt(item.prix)}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#475569', fontSize: 11 }}>
                    {item.unite}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    {item.condition ? (
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: '#FEF9C3',
                          color: '#713f12',
                          fontWeight: 500,
                          display: 'inline-block',
                          lineHeight: 1.6,
                        }}
                      >
                        {item.condition}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Nota bene */}
      <div
        style={{
          marginTop: 8,
          padding: '12px 16px',
          borderRadius: 8,
          background: '#FEF3C7',
          border: '1px solid #fde68a',
          fontSize: 12,
          color: '#78350f',
          lineHeight: 1.7,
        }}
      >
        <strong>⚠️ Règle absolue :</strong> tous les prix ci-dessus sont FIXES. Ne jamais inventer ou modifier un prix sans validation de Mathieu Pichelin.
        La section <em>Transport</em> est intentionnellement absente — elle est traitée séparément.
      </div>
    </div>
  )
}

// ─── TAB: RÈGLES CONDITIONNELLES ────────────────────────────────────────────

function TabRegles() {
  return (
    <div style={{ maxWidth: 880 }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Ces règles déterminent automatiquement le contenu de l'offre en fonction des réponses du questionnaire prospect (Q1–Q8).
      </p>

      {/* Légende */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {(Object.entries(RULE_TYPE) as [RuleType, (typeof RULE_TYPE)[RuleType]][]).map(([key, cfg]) => (
          <span
            key={key}
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '3px 9px',
              borderRadius: 12,
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
            }}
          >
            {cfg.label}
          </span>
        ))}
      </div>

      {REGLES.map((section) => (
        <div key={section.section} style={{ marginBottom: 32 }}>
          <h3
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--dark-navy)',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {section.section}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {section.rules.map((rule, i) => {
              const cfg = RULE_TYPE[rule.type]
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 6,
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {/* Badge type */}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {cfg.label}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Condition */}
                    <span
                      style={{
                        display: 'inline-block',
                        fontFamily: 'monospace',
                        fontSize: 11,
                        background: '#F5F3FF',
                        color: '#6d28d9',
                        padding: '1px 7px',
                        borderRadius: 4,
                        marginBottom: 5,
                        lineHeight: 1.7,
                      }}
                    >
                      {rule.condition}
                    </span>
                    {/* Action */}
                    <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                      {rule.action}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── TAB: CONDITIONS DE VENTE ────────────────────────────────────────────────

function TabConditions() {
  return (
    <div style={{ maxWidth: 720 }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Conditions standard incluses dans l'onglet &ldquo;Conditions&rdquo; du fichier d'offre généré (Excel).
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CONDITIONS_VENTE.map((section) => (
          <div
            key={section.titre}
            style={{
              padding: '16px 20px',
              borderRadius: 8,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <h3
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--dark-navy)',
                marginBottom: 8,
              }}
            >
              {section.titre}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: '#475569',
                lineHeight: 1.75,
                whiteSpace: 'pre-line',
                margin: 0,
              }}
            >
              {section.contenu}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TAB: CONTACT ────────────────────────────────────────────────────────────

function TabContact() {
  return (
    <div style={{ maxWidth: 560 }}>
      {/* Carte contact */}
      <div
        style={{
          padding: '24px',
          borderRadius: 10,
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            MP
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark-navy)' }}>
              Mathieu Pichelin
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Managing Partner · Brain E-Log SRL
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Email',          value: 'mathieu.pichelin@brain-log.com' },
            { label: 'Téléphone',      value: '+32 472 17 88 31' },
            { label: 'IBAN',           value: 'BE84 0689 0320 9059' },
            { label: 'Validité offre', value: '31/12/2026' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  width: 100,
                  flexShrink: 0,
                }}
              >
                {label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-navy)' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rappels importants */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 8,
          background: '#EFF6FF',
          border: '1px solid #bfdbfe',
          fontSize: 12,
          color: '#1e40af',
          lineHeight: 1.8,
        }}
      >
        <strong>Règles de génération d'offre :</strong>
        <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
          <li>Ne jamais inclure de section <em>Transport</em> (traitement séparé)</li>
          <li>Tous les prix sont FIXES — ne jamais inventer un tarif</li>
          <li>Si une cellule du questionnaire est vide, utiliser la valeur standard du template</li>
          <li>Le fichier généré doit être prêt à envoyer : professionnel et complet</li>
        </ul>
      </div>
    </div>
  )
}
