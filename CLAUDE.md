# CLAUDE.md — BrainLogClaudeCode

## Règle fondamentale : Commit, Push, Documenter

**Chaque modification de code ou de fichier DOIT suivre ce cycle obligatoire :**

1. **Modifier** le fichier concerné
2. **Commit** avec un message clair et descriptif
3. **Push** vers GitHub immédiatement après le commit
4. **Documenter** la modification dans ce fichier CLAUDE.md (section Changelog)

### Format de commit
```
type(scope): description courte

- détail 1
- détail 2
```

Types : `feat`, `fix`, `docs`, `refactor`, `chore`, `test`

---

## Projet

**Repo GitHub :** https://github.com/doriansavage/BrainLogClaudeCode
**Créé le :** 2026-03-13

---

## Changelog

### 2026-03-14 (suite)
- **feat(whatsapp)**: Notifications WhatsApp automatiques à la création de prospect
  - `src/lib/whatsapp.ts` : service Baileys — `sendWhatsAppMessage(toNumber, message)`, session persistée dans `scripts/whatsapp-session/`, timeout 15s, gestion reconnexion
  - `scripts/whatsapp-test.ts` : script de test QR code + envoi message, usage : `npx tsx scripts/whatsapp-test.ts`
  - `package.json` : ajout `@whiskeysockets/baileys` + `qrcode-terminal`
  - `src/app/api/prospects/route.ts` : appel `sendWhatsAppMessage` asynchrone (non-bloquant) après création prospect — message avec nom société, contact, lien questionnaire
  - `src/types/prospect.ts` : ajout champ `contactPhone: string`
  - `src/lib/db/prospects.ts` : `createProspect()` accepte `contactPhone?`
  - `src/components/prospects/NouveauProspectForm.tsx` : champ Téléphone/WhatsApp rendu obligatoire, hint format international, message info mis à jour ("envoyé automatiquement par WhatsApp")

### 2026-03-14
- **feat(transporteurs)**: Module import Excel grilles tarifaires transporteurs
  - `src/types/carrier-tariffs.ts` : types `CarrierTariff`, `CarrierZone`, `CarrierWeightRange`, `CarrierPriceMatrix`, `ParseResult`, `ZoneMapping`, `WeightMapping`
  - `src/app/api/carrier-tariffs/parse/route.ts` : POST multipart → SheetJS parsing, retourne sheets brutes (headers + rows)
  - `src/app/api/carrier-tariffs/route.ts` : GET/POST/DELETE stockage dans `data/carrier-tariffs/index.json`
  - `src/app/(admin)/tarifs/transporteurs/page.tsx` : wizard 6 étapes
    - **Upload** : drag & drop / clic, champs nom transporteur + libellé grille
    - **Feuille** : sélection parmi les sheets du fichier (auto-skip si 1 seule)
    - **Zones** : mapping colonne Excel → zone géographique (ID, libellé, pays preset)
    - **Poids** : mapping ligne Excel → tranche de poids (min, max, unité kg/g)
    - **Aperçu** : tableau grille finale avec stats (zones, tranches, prix définis)
    - **Done** : confirmation sauvegarde
  - Auto-détection heuristique des zones et tranches depuis le fichier
  - `src/components/layout/Sidebar.tsx` : ajout lien Transporteurs (sous-item indenté de Tarifs)
- **feat(theme)**: Redesign Material Design (Google-style) — `globals.css`, `Sidebar.tsx`, `dashboard/page.tsx`
  - Cards : ombres renforcées + `.card-interactive` hover lift (translateY -2px + shadow)
  - Boutons : `.btn-primary` avec box-shadow + lift, `.btn-secondary` border 1.5px + hover primary
  - Badges : palettes saturées (DBEAFE/#1E40AF, DCFCE7/#14532D, FEF3C7/#78350F…)
  - Sidebar : actif `primary-100` + fontWeight 700, `.nav-item` hover CSS
  - Dashboard KPI : `border-top` colorée par métrique + card-interactive, delta pill vert
  - Table : `table-row-hover` → primary-50, status badges haute saturation sémantique
- **feat(tarifs)**: Items personnalisés dans TariffManager
  - Types `TariffItemFormula`, `FormulaType` dans `src/types/tariffs.ts`
  - `TariffItem` étendu avec `isCustom?: boolean` et `formula?: TariffItemFormula`
  - Store: `addCustomItem` + `deleteCustomItem` dans `src/store/tariffs.ts`
  - Modal `AddItemModal` : 5 modes de prix (fixe, à définir, sur devis, ×variable questionnaire, basé sur item)
  - `ItemRow` : badge "custom", sous-texte formule violet, bouton suppression au survol
- **feat(regles)**: Opérateurs numériques + Simulateur de prix
  - `ConditionOperator` étendu : `lt`, `lte`, `gt`, `gte`, `contains`, `not_contains`
  - `Q_FIELDS` : flag `isNumeric + unit` sur Q4.01 (Volume B2C), Q4.04 (B2B), Q5.01 (Stock)
  - Tab **⚡ Simulateur** dans `/regles` :
    - Inputs : number pour champs numériques, dropdown pour catégoriels
    - Engine `runSimulation()` : cascade — première règle gagne pour le preset, toutes les règles empilent leurs ajustements
    - Résultats : règles déclenchées, grille sélectionnée, tableau prix base vs final avec diff surlignée
- **feat(parametres)**: Page Paramètres — v1 (6 onglets) → v2 (7 onglets, valeurs business extraites du prompt) → v3 (onglet Documents avec versioning) → v4 (grilles tarifaires comme sources de pricing)
  - `src/app/(admin)/parametres/page.tsx` — ~1240 lignes, 8 onglets
  - **Entreprise** : raison sociale, légal, adresse, contact
  - **Commercial** : profil Mathieu Pichelin (prénom/nom/fonction/email/tél) — card aperçu live
  - **Offres** : format export, validité, TVA, arrondi, logo, clause confidentialité
  - **CGV** : 5 clauses éditables (Cadre, Validité, Prix, Paiements+IBAN BE84..., Responsabilité)
  - **Documents** : bibliothèque avec versioning, deux usages distincts par doc :
    - `usedInPricing` — grille Excel alimentant le moteur de calcul transport
    - `isAttached` — fichier brut annexé aux offres
    - Types : `grille | contrat | annexe | regles | autre`
    - Champs `carrier` (DHL, Bpost, GLS, DPD…) + `serviceType` (transport, surcharge…)
    - 7 docs initiaux : 4 grilles transporteurs + CGV v3 + Règles Ops + Contrat DHL
    - Grouping : Grilles tarifaires / Contrats & Annexes / Archivés
    - Formulaire ajout : champs carrier+serviceType conditionnels si docType=grille
  - **Questionnaire** : validité lien, rappel, messages accueil/confirmation, expéditeur SMTP
  - **Notifications** : toggles par événement + emails de réception
  - **Intégrations** : Supabase, SMTP, WMS webhook, CRM

### 2026-03-13
- **init**: Initialisation du projet BrainLogClaudeCode
- **chore**: Création du CLAUDE.md avec règles de workflow
- **chore**: Configuration des settings Claude (toutes permissions autorisées)
- **docs**: Ajout section "Skills à charger" avec 8 skills logistique/ecommerce
- **docs**: Ajout skills Webdesign (9) et Frontend Dev (9)
- **docs**: Ajout skills Brainstorming & Planning (8)
- **feat**: Création dossier prompts/ + prompt générateur offre partenariat logistique Brain E-Log
- **feat**: Extraction données → `data/questionnaire-fields.json` (97 champs, 8 sections) + `data/tariffs-standard.json` (21 postes tarifaires, 3 catégories)
- **docs**: ADN graphique Brain e-Log → `adn-graphique-brain-log.md` (couleurs, logo, typo, UI, images)
- **docs**: Plan complet Module 1 Tarifs → `docs/brain-elog-app-plan.md` (user stories, DB schema, UI, branches)
- **docs**: Architecture globale 17 écrans → `docs/app-screens-architecture.md` (sitemap, flows UX)
- **feat(tarifs)**: Abandon Supabase → stockage JSON local (`data/tariffs.json` via API route GET/POST)
- **refactor(tarifs)**: Rewrite store Zustand sans Supabase, pattern `save()` optimiste après chaque mutation
- **refactor(tarifs)**: TariffManager UI — rows denses (7px padding), accents couleur par catégorie, billing dots
- **feat(regles)**: Page `/regles` — grille tarifaire + logique conditionnelle Q1-Q8 + conditions de vente + contact
- **feat(app)**: Bootstrap Next.js 15 + Tailwind CSS + TypeScript dans le repo
- **feat(app)**: Design system Brain E-Log (CSS vars, font Nunito, palette navy)
- **feat(app)**: 17 routes App Router + layout admin avec sidebar Lucide + dashboard
- **feat(tarifs)**: Module 1 Sprint 1 — TariffManager complet (3 groupes, 22 postes, Zustand store)
- **feat(ui)**: Redesign complet — Inter font, gray scale, shadows, sidebar épurée, dashboard moderne, TariffManager épuré
- **feat(prospect)**: Redesign complet du formulaire questionnaire prospect (19 fichiers)
  - Page wrapper : fond dégradé bleu, card shadow premium, border subtile
  - Header : bandeau gradient navy + pill nom entreprise
  - Landing : hero SVG, 3 feature cards, dots d'étapes, CTA gradient avec hover lift
  - ProgressBar : segments par étape avec hauteur active, badge % coloré
  - SectionForm : badge numéro d'étape, séparateur, boutons nav avec SVG arrows
  - FormField : label dark-navy, erreur avec icône SVG circle-info
  - FieldText / Textarea / Url : border-2 rounded-xl, bg-alt, focus ring bleu avec glow
  - FieldToggle : pill switcher intégré style iOS sur fond bg-alt
  - FieldRadioCards / IconGrid / LogoPicker : hover border + box-shadow sélection
  - FieldMultiSelect : pills avec hover border transition
  - FieldSlider : thumb blanc visible + border, track gradient bleu, badge valeur
  - FieldPriceRange : € répétés selon rang, hover border
  - FieldScale3 / TimelineSel : shadow coloré thématique, hover border
  - FieldGeoSplit : thumb visible sur sliders, counter statut coloré (vert/rouge/gris)
  - RecapView : sections avec header coloré, badge %, bouton submit avec spinner SVG
  - Confirmation : checkmark SVG gradient vert, badge "contacté sous 48h"

---

## Architecture

### Stack
- **Framework**: Next.js 15 (App Router)
- **CSS**: Tailwind CSS 4 + CSS variables Brain E-Log (`src/app/globals.css`)
- **Font**: Inter (Google Fonts via CSS @import)
- **Icons**: Lucide React
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Persistence**: JSON local (`data/`) via API routes Next.js (pas de Supabase — abandonné)
- **Hosting**: Vercel (à configurer)

### Design System — conventions CSS (`globals.css`)

**Philosophie** : Material Design (Google-style) — contraste élevé, animations hover, sémantique couleur forte.

**Classes à utiliser en priorité (ne pas dupliquer en inline) :**

| Classe | Usage |
|---|---|
| `.card` | Toute card blanche avec shadow + transition |
| `.card-interactive` | Card cliquable — hover lift `translateY(-2px)` |
| `.btn-primary` | Bouton action principale — shadow + lift hover |
| `.btn-secondary` | Bouton secondaire — border 1.5px + hover → primary color |
| `.btn-ghost` | Lien-bouton sans border |
| `.badge-{color}` | Chips statut — `blue/green/amber/red/orange/violet/teal/gray` |
| `.badge-solid-{color}` | Chips fond plein blanc |
| `.table-row-hover` | `<tr>` cliquable — hover → `primary-50` |
| `.nav-item` | Liens sidebar — hover `gray-100` via CSS (pas d'inline) |
| `.input` | Tous les `<input>` / `<textarea>` du back-office |
| `.dot-pulse` | Indicateur animé "en cours" (ping vert) |

**Couleurs sémantiques status badges (en inline style dans les tables/listes) :**
- Répondu / Actif → `#DBEAFE / #1E40AF`
- Offre générée / En cours → `#FEF3C7 / #78350F`
- Acceptée / Succès → `#DCFCE7 / #14532D`
- Lien envoyé / Neutre → `#E2E8F0 / #374151`
- Nouveau / Violet → `#EDE9FE / #5B21B6`
- Urgent / Danger → `#FEE2E2 / #991B1B`

**Règle sidebar** : `navItemStyle(active)` dans `Sidebar.tsx` — actif = `primary-100` bg + `primary-700` text + `fontWeight 700`. Hover géré par `.nav-item` CSS. Ne pas ajouter `transition` en inline (conflit).

### Pattern de persistence (JSON local)
Toutes les données sont persistées en fichiers JSON dans `data/` via des routes API Next.js :
- `data/tariffs.json` ← `GET/POST /api/tariffs` ← store `useTariffStore`
- `data/rules.json`   ← `GET/POST /api/rules`   ← store `useRulesStore`
- `data/carrier-tariffs/` ← `GET/POST/DELETE /api/carrier-tariffs` ← wizard transporteurs

Chaque store a un helper `save()` qui POST l'état complet après chaque mutation (pattern optimiste).

### Structure des routes
```
src/app/
├── page.tsx                          → redirect /dashboard
├── layout.tsx                        → root layout
├── login/page.tsx
├── prospect/[token]/page.tsx         → portail public prospect
└── (admin)/
    ├── layout.tsx                    → sidebar + main content
    ├── dashboard/page.tsx            ✅ Dashboard complet
    ├── prospects/page.tsx            → Module 2 (à développer)
    ├── prospects/[id]/page.tsx
    ├── prospects/nouveau/page.tsx
    ├── tarifs/page.tsx               ✅ Module 1 — TariffManager complet
    │   └── transporteurs/page.tsx   ✅ Module Transporteurs (Excel import — wizard 6 étapes)
    ├── regles/page.tsx               ✅ Module 3 — Moteur de règles + Simulateur
    ├── offres/page.tsx               → Module 4 (à développer)
    ├── offres/[id]/page.tsx
    ├── offres/generer/page.tsx
    └── parametres/page.tsx           ✅ 8 onglets (entreprise, commercial, offres, CGV, documents, questionnaire, notifs, intégrations)
```

### Modules construits

#### Module 1 — Tarifs (`/tarifs`) ✅
- **TariffManager** : 3 groupes, 22 postes, 3 catégories
- **Store** `src/store/tariffs.ts` : CRUD groupes, ajustements bulk, snapshots historique
- **Types** `src/types/tariffs.ts` : TariffItem, TariffGroup, TariffItemFormula (formula types)
- **Items custom** : AddItemModal avec 5 modes de prix (fixe, tbd, quote, questionnaire×, item_ref)
- **Composant** : `src/components/tarifs/TariffManager.tsx` (~1100 lignes)

#### Module 1b — Transporteurs (`/tarifs/transporteurs`) ✅
- **Wizard 6 étapes** : Upload → Feuille → Zones → Poids → Aperçu → Done
- **API** `src/app/api/carrier-tariffs/route.ts` : GET/POST/DELETE, stockage `data/carrier-tariffs/index.json`
- **API Parse** `src/app/api/carrier-tariffs/parse/route.ts` : POST multipart → SheetJS, retourne sheets brutes
- **Types** `src/types/carrier-tariffs.ts` : `CarrierTariff`, `CarrierZone`, `CarrierWeightRange`, `CarrierPriceMatrix`, `ParseResult`
- **Auto-détection** heuristique des zones et tranches depuis l'Excel

#### Module 2 — Prospects (`/prospects`) 🔧
- **Types** `src/types/prospect.ts` : `Prospect` avec `contactPhone`
- **DB** `src/lib/db/prospects.ts` : `readProspects`, `createProspect` (JSON local)
- **API** `src/app/api/prospects/route.ts` : GET/POST — notification WhatsApp auto à la création
- **Form** `src/components/prospects/NouveauProspectForm.tsx` : champ Téléphone/WhatsApp obligatoire

#### Module 3 — Règles (`/regles`) ✅
- **Moteur de règles** : PricingRule = SI conditions(Q) → ALORS actions(preset+prix)
- **Store** `src/store/rules.ts` : CRUD, priorités, persistence
- **Types** `src/types/rules.ts` : ConditionOperator (10 opérateurs incl. gt/lt/gte/lte/contains)
- **Simulateur** : engine `runSimulation()` — cascade (1ère règle gagne pour preset, toutes empilent ajustements)
- **Q_FIELDS** : 19 champs avec `isNumeric` pour Q4.01/Q4.04/Q5.01 (volumes)
- **4 tabs** : Règles | ⚡ Simulateur | Grille tarifaire | Conditions de vente

### Prochaine priorité : Module Offres (`/offres`)

Génération automatique d'offres commerciales PDF à partir du questionnaire prospect + grilles tarifaires transporteurs.

---

## Skills à charger

Lorsqu'on demande d'utiliser l'un des skills suivants, le charger via le Skill tool :

### Logistique / E-commerce
- `shopify-automation`
- `data-engineering-data-pipeline`
- `kpi-dashboard-design`
- `dbt-transformation-patterns`
- `billing-automation`
- `docusign-automation`
- `microservices-patterns`
- `event-sourcing-architect`

### Webdesign
- `ui-ux-pro-max`
- `ui-skills`
- `web-design-guidelines`
- `frontend-design`
- `canvas-design`
- `mobile-design`
- `tailwind-design-system`
- `theme-factory`
- `stitch-ui-design`

### Frontend Dev
- `frontend-dev-guidelines`
- `react-best-practices`
- `react-patterns`
- `react-ui-patterns`
- `nextjs-best-practices`
- `nextjs-app-router-patterns`
- `tailwind-patterns`
- `web-performance-optimization`
- `frontend-mobile-development-component-scaffold`

### Brainstorming & Planning
- `brainstorming`
- `multi-agent-brainstorming`
- `plan-writing`
- `writing-plans`
- `concise-planning`
- `planning-with-files`
- `architecture-decision-records`
- `deep-research`

---

## Scraping & Crawling

**Outil utilisé : Crawlee + Playwright**
Crawlee est le système utilisé dans ce projet pour scraper et crawler des pages web externes : récupérer du contenu, des tarifs, des formulaires, des textes marketing sur des sites tiers (concurrents, partenaires, portails logistiques, etc.).

**Documentation complète → [`docs/crawlee.md`](docs/crawlee.md)**
Toute la documentation Crawlee (crawlers disponibles, options, API `page`, `enqueueLinks`, `Dataset`, patterns, anti-détection, erreurs fréquentes) se trouve dans ce fichier. **Consulter `docs/crawlee.md` avant tout travail de scraping.**

**Scripts disponibles :**
| Fichier | Cible | Output |
|---|---|---|
| `scripts/scrape-brain-log.ts` | brain-log.com (8 pages FR) | `storage/brain-log-full.json` |

**Lancer un scraper :**
```bash
npx tsx scripts/[nom-du-script].ts
```

---

## Notes & Décisions

### Décisions architecturales
- **Supabase abandonné** : persistence JSON local via API routes Next.js, plus simple et sans coût
- **Pattern store Zustand** : chaque mutation appelle `save()` → POST `/api/{resource}` → écrit le fichier JSON. Premier boot = seed données initiales + save.
- **Moteur de règles — cascade** : pour la sélection de preset, la **première** règle qui matche gagne. Pour les ajustements de prix, **toutes** les règles matchées s'empilent dans l'ordre de priorité.
- **Items tarifaires — itemIndex** : les règles référencent les items par index 0-21 correspondant à l'ordre de `BASE_ITEMS` dans `src/store/tariffs.ts`. IDs items = `${groupId}-item-${index}`.
- **Custom items** : IDs = `${groupId}-custom-${Date.now()}`, ne sont pas affectés par les règles (qui n'opèrent que sur les 22 items base).
