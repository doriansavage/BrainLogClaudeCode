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
- **CSS**: Tailwind CSS 4 + CSS variables Brain E-Log
- **Font**: Inter (Google Fonts via CSS @import)
- **Icons**: Lucide React
- **State**: Zustand (installé)
- **Forms**: React Hook Form + Zod (installé)
- **Hosting**: Vercel (à configurer)
- **DB**: Supabase (à configurer)

### Structure des routes
```
src/app/
├── page.tsx                          → redirect /dashboard
├── layout.tsx                        → root layout (Nunito, globals.css)
├── login/page.tsx
├── prospect/[token]/page.tsx         → portail public prospect
└── (admin)/
    ├── layout.tsx                    → sidebar + main content
    ├── dashboard/page.tsx            ✅ Dashboard complet
    ├── prospects/page.tsx            → à développer (Module 2)
    ├── prospects/[id]/page.tsx
    ├── prospects/nouveau/page.tsx
    ├── tarifs/page.tsx               → à développer (Module 1 — priorité)
    ├── tarifs/[id]/comparer/page.tsx
    ├── regles/page.tsx               → à développer (Module 3)
    ├── regles/[id]/page.tsx
    ├── offres/page.tsx               → à développer (Module 4)
    ├── offres/[id]/page.tsx
    ├── offres/generer/page.tsx
    └── parametres/page.tsx
```

### Prochaine priorité : Module 1 — Gestionnaire de Tarifs
Voir `docs/brain-elog-app-plan.md` pour les 24 user stories et le schéma DB.

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

_Documenter ici les décisions importantes prises pendant le développement._
