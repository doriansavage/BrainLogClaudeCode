# Brain E-Log App — Plan complet

> **Date :** 2026-03-13
> **Scope :** Gestionnaire de tarifs (Module 1 / 4)
> **Stack :** Next.js 15 + Supabase + Tailwind + shadcn/ui + Lucide icons

---

## Vision produit (rappel)

Application interne pour Mathieu (Brain E-Log) permettant de :
1. **Gérer les grilles de tarifs** par preset ← *ce document*
2. **Gérer les questions prospects** (formulaire web multi-étapes)
3. **Moteur de règles** conditionnelles
4. **Générer des offres** commerciales automatisées

---

## MODULE 1 — Gestionnaire de tarifs

### Feature Map complète

```
GROUPES DE TARIFS
├── CRUD groupes
│   ├── Créer un groupe (nom libre)
│   ├── Renommer / modifier description
│   ├── Archiver (soft delete)
│   ├── Supprimer (avec confirmation)
│   ├── Marquer comme défaut global
│   └── Verrouiller (read-only après utilisation)
│
├── DUPLICATION INTELLIGENTE
│   ├── Dupliquer à l'identique
│   ├── Dupliquer + X% global sur tous les prix
│   ├── Dupliquer + X% par catégorie (démarrage / récurrents / activité)
│   ├── Dupliquer + X% sur sélection d'items
│   └── Dupliquer + X€ flat (delta)
│
├── DÉFAUT CONDITIONNEL (smart default)
│   ├── Créer des règles de sélection automatique
│   │   ex: SI Q6.03 > "15%" → suggérer ce groupe
│   ├── Opérateurs: =, !=, >, <, IN, NOT IN
│   ├── Logique: AND / OR entre conditions
│   ├── Priorité entre groupes (ordre d'évaluation)
│   └── Tester les conditions sur un profil fictif
│
└── HISTORIQUE & AUDIT
    ├── Log des modifications (quoi / quand)
    ├── Badge "utilisé N fois" par groupe
    └── Comparaison 2 groupes (vue diff)

ITEMS (dans un groupe)
├── AFFICHAGE
│   ├── Groupés par catégorie (démarrage / récurrents / activité)
│   ├── Filtrer par catégorie
│   ├── Rechercher par label
│   └── Tri drag & drop (réordonner)
│
├── ÉDITION INLINE
│   ├── Modifier le prix (click-to-edit)
│   ├── Modifier le label / description / unité
│   ├── Changer le type: fixe | À définir | Sur devis | Formule
│   └── Ajouter une note interne
│
├── FORMULES (prix calculé)
│   ├── Source: un autre item du même groupe
│   ├── Opérateur: +X% ou +X€
│   ├── Recalcul automatique si source change
│   ├── Affichage: "= Stockage palette + 20% → 12,60 €"
│   └── Garde-fou: pas de référence circulaire
│
├── VISIBILITÉ
│   └── Activer / désactiver un item (inclus ou non dans l'offre)
│
├── OPÉRATIONS BULK
│   ├── Sélectionner tout / par catégorie / manuellement
│   ├── Appliquer +/-X% sur la sélection
│   ├── Appliquer +/-X€ flat sur la sélection
│   ├── Arrondir au cran choisi (0.05 / 0.10 / 0.50 / 1.00)
│   └── Reset vers valeurs du groupe parent (si dupliqué)
│
└── AJOUT PERSONNALISÉ
    ├── Ajouter un item hors template standard
    └── Supprimer un item personnalisé
```

---

## Découpage en User Stories (priorité)

### Sprint 1 — Fondations (P0)
```
US-01  En tant que Mathieu, je veux voir la liste de mes groupes de tarifs
US-02  En tant que Mathieu, je veux créer un nouveau groupe (nom, description)
US-03  En tant que Mathieu, je veux voir tous les items d'un groupe, groupés par catégorie
US-04  En tant que Mathieu, je veux modifier le prix d'un item en cliquant dessus
US-05  En tant que Mathieu, je veux activer/désactiver un item dans un groupe
US-06  En tant que Mathieu, je veux dupliquer un groupe à l'identique
```

### Sprint 2 — Duplication intelligente (P1)
```
US-07  En tant que Mathieu, je veux dupliquer un groupe avec +X% global
US-08  En tant que Mathieu, je veux dupliquer avec +X% par catégorie
US-09  En tant que Mathieu, je veux dupliquer avec +X% sur une sélection
US-10  En tant que Mathieu, je veux appliquer une opération bulk sur les items sélectionnés
US-11  En tant que Mathieu, je veux arrondir les prix automatiquement
US-12  En tant que Mathieu, je veux reset un groupe vers son parent
```

### Sprint 3 — Formules & avancé (P2)
```
US-13  En tant que Mathieu, je veux définir un prix comme X% d'un autre item
US-14  En tant que Mathieu, je veux définir un prix comme item_source + X€
US-15  En tant que Mathieu, je veux voir le prix calculé affiché dynamiquement
US-16  En tant que Mathieu, je veux ajouter un item personnalisé dans un groupe
US-17  En tant que Mathieu, je veux réordonner les items par drag & drop
```

### Sprint 4 — Défaut conditionnel (P2)
```
US-18  En tant que Mathieu, je veux créer une règle "SI Q6.03 > 15% ALORS ce groupe"
US-19  En tant que Mathieu, je veux combiner plusieurs conditions (AND/OR)
US-20  En tant que Mathieu, je veux définir une priorité entre groupes
US-21  En tant que Mathieu, je veux tester mes conditions sur un profil fictif
```

### Sprint 5 — Comparaison & audit (P3)
```
US-22  En tant que Mathieu, je veux comparer 2 groupes côte à côte avec les deltas
US-23  En tant que Mathieu, je veux voir l'historique des modifications d'un groupe
US-24  En tant que Mathieu, je veux verrouiller un groupe utilisé dans une offre
```

---

## Architecture des branches GitHub

```
main
 └── develop
      ├── feature/setup-nextjs-supabase        ← init projet
      ├── feature/tariff-db-schema             ← migrations DB + seed
      ├── feature/tariff-groups-list           ← US-01
      ├── feature/tariff-groups-crud           ← US-02, 03
      ├── feature/tariff-items-edit            ← US-04, 05
      ├── feature/tariff-groups-duplicate      ← US-06, 07, 08, 09
      ├── feature/tariff-items-bulk            ← US-10, 11, 12
      ├── feature/tariff-items-formula         ← US-13, 14, 15
      ├── feature/tariff-items-custom          ← US-16, 17
      ├── feature/tariff-smart-defaults        ← US-18, 19, 20, 21
      └── feature/tariff-compare-audit         ← US-22, 23, 24
```

**Convention de commits :**
```
feat(tariffs): description
fix(tariffs): description
refactor(tariffs): description
```

---

## Schéma DB (Supabase)

```sql
-- Catégories de tarifs (démarrage / récurrents / activité)
tariff_categories (
  id          uuid PRIMARY KEY,
  label       text NOT NULL,
  description text,
  sort_order  int DEFAULT 0
)

-- Groupes / presets de tarifs
tariff_groups (
  id              uuid PRIMARY KEY,
  name            text NOT NULL,
  description     text,
  base_group_id   uuid REFERENCES tariff_groups(id),  -- null = original
  is_default      boolean DEFAULT false,
  is_archived     boolean DEFAULT false,
  is_locked       boolean DEFAULT false,
  used_count      int DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- Items de tarifs
tariff_items (
  id                      uuid PRIMARY KEY,
  group_id                uuid REFERENCES tariff_groups(id) ON DELETE CASCADE,
  category_id             uuid REFERENCES tariff_categories(id),
  label                   text NOT NULL,
  description             text,
  price                   numeric(10,4),          -- null si tbd/quote
  price_type              text DEFAULT 'fixed',   -- fixed|tbd|quote|formula
  formula_source_item_id  uuid REFERENCES tariff_items(id),
  formula_operator        text,                   -- percent|delta
  formula_value           numeric(10,4),          -- % ou montant €
  unit                    text,
  billing_type            text,                   -- once|monthly|usage
  is_visible              boolean DEFAULT true,
  condition               text,                   -- ex: "Q4.05 IN ['Oui']"
  sort_order              int DEFAULT 0,
  notes                   text,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
)

-- Règles de sélection automatique d'un groupe
tariff_group_conditions (
  id               uuid PRIMARY KEY,
  group_id         uuid REFERENCES tariff_groups(id) ON DELETE CASCADE,
  field_id         text NOT NULL,    -- ex: "Q6.03"
  operator         text NOT NULL,    -- =|!=|>|<|>=|<=|IN|NOT IN
  value            text NOT NULL,    -- ex: ">15%" ou "['Chine','Asie hors Chine']"
  priority         int DEFAULT 1,
  logic            text DEFAULT 'AND'  -- AND|OR
)

-- Log des modifications
tariff_audit_log (
  id          uuid PRIMARY KEY,
  group_id    uuid REFERENCES tariff_groups(id),
  item_id     uuid REFERENCES tariff_items(id),
  action      text,          -- update|create|delete|lock|duplicate
  old_value   jsonb,
  new_value   jsonb,
  created_at  timestamptz DEFAULT now()
)
```

---

## Design System — UI Guidelines

### Palette Brain E-Log
```css
--primary:      #094D80;   /* boutons, accents */
--primary-dark: #0A3F6B;   /* hover */
--dark-navy:    #24487B;   /* sidebar, headings */
--charcoal:     #4F4C4D;   /* texte secondaire */
--bg:           #FFFFFF;   /* fond principal */
--bg-alt:       #F5F7FA;   /* fond lignes alternées, sidebar */
--border:       #E2E8F0;   /* bordures */
--text:         #1A1A1A;   /* texte principal */
```

### Typographie
```
Font: Nunito (Google Fonts)
H1:   28px / 700
H2:   22px / 700
H3:   16px / 600
Body: 14px / 400
Cap:  12px / 400
```

### Composants clés
```
Sidebar gauche    → bg #F5F7FA, bordure droite #E2E8F0
Header app        → bg #24487B (dark navy), texte blanc
Groupe actif      → bg blanc, bordure gauche 3px #094D80
Badge défaut      → bg #094D80, texte blanc, radius 4px
Badge archivé     → bg #E2E8F0, texte #4F4C4D
Badge verrouillé  → bg amber-50, texte amber-700, icône 🔒
Ligne item        → hover bg #F5F7FA, transition douce
Prix éditables    → click → input inline, border-bottom #094D80
Prix "À définir"  → texte italic #4F4C4D
Prix "Sur devis"  → texte italic #4F4C4D
Prix "Formule"    → texte bleu #094D80 + icône "="
Checkbox bulk     → accent-color #094D80
Drag handle       → icône GripVertical, visible au hover
```

### Layout Tariff Manager
```
┌──────────────────────────────────────────────────────────────┐
│  🧠 Brain E-Log                              Mathieu P.  ▼  │  ← header #24487B
├──────────────┬───────────────────────────────────────────────┤
│  Navigation  │                                               │
│  ─────────── │  Standard          [défaut] [⋯ actions]     │
│  📊 Tarifs ● │  ──────────────────────────────────────────── │
│  👥 Prospects │  Catégorie ▼  Rechercher…   + Item  Bulk ▼  │
│  ⚙ Règles    │                                               │
│  📄 Offres   │  FRAIS DE DÉMARRAGE                     2     │
│  ─────────── │  ▢ ⠿ Mise en place Brain E-Log  À définir   │
│  GROUPES     │  ▢ ⠿ Mise en place WMS           À définir   │
│              │                                               │
│  ● Standard  │  FRAIS RÉCURRENTS MENSUELS              2     │
│    Pâqueret. │  ▢ ⠿ Gestion de compte  [150,00 €] /mois ✓  │
│    On se fait│  ▢ ⠿ Abonnement WMS     [100,00 €] /mois ✓  │
│    plaisir   │                                               │
│  ─────────── │  FRAIS D'ACTIVITÉ                      17     │
│  + Nouveau   │  ▢ ⠿ Déchargement 40'   [330,00 €] /cont ✓  │
│  ⚖ Comparer  │  ▢ ⠿ Déchargement 20'   [210,00 €] /cont ✓  │
│              │  ▢ ⠿ Décharg. palette    [  6,50 €] /pal  ✓  │
│              │  ▢ ⠿ Entrée en stock     [  0,10 €] /UVC  ✓  │
│              │  ▢ ⠿ Stockage palette    [ 10,50 €] /pal  ✓  │
│              │  ▢ ⠿ Stockage bac        Sur devis    /empl  │
│              │  ▢ ⠿ Prépa B2C cmd       [  1,50 €] /cmd  ✓  │
│              │  ...                                          │
└──────────────┴───────────────────────────────────────────────┘

Modal duplication:
┌────────────────────────────────────────┐
│  Dupliquer "Standard"                  │
│  ──────────────────────────────────── │
│  Nom du nouveau groupe: [____________] │
│                                        │
│  Ajustement des prix:                  │
│  ○ Copie exacte                        │
│  ○ +/- sur tous les prix    [___] %    │
│  ○ Par catégorie:                      │
│    Démarrage     [___] %               │
│    Récurrents    [___] %               │
│    Activité      [___] %               │
│  ○ +/- montant fixe         [___] €   │
│                                        │
│  Arrondir au: ○ 0.05 ○ 0.10 ○ 0.50   │
│                                        │
│  [Annuler]              [Dupliquer →]  │
└────────────────────────────────────────┘
```

---

## Stack technique retenu

```
Framework:    Next.js 15 (App Router)
DB + Auth:    Supabase (PostgreSQL + Row Level Security)
UI:           Tailwind CSS + shadcn/ui
Icons:        Lucide React (outline, cohérent ADN Brain E-Log)
Font:         Nunito via next/font
Drag & Drop:  @dnd-kit/core
Forms:        React Hook Form + Zod
État local:   Zustand
Hosting:      Vercel
```

---

## Prochaines étapes

1. `feature/setup-nextjs-supabase` → init projet, env vars, auth basique
2. `feature/tariff-db-schema` → migrations + seed depuis les JSON
3. `feature/tariff-groups-list` → UI sidebar groupes
4. `feature/tariff-items-edit` → table items + édition inline
5. ...suite selon sprints ci-dessus
