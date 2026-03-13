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
- **feat(app)**: Bootstrap Next.js 15 + Tailwind CSS + TypeScript dans le repo
- **feat(app)**: Design system Brain E-Log (CSS vars, font Nunito, palette navy)
- **feat(app)**: 17 routes App Router + layout admin avec sidebar Lucide + dashboard

---

## Architecture

### Stack
- **Framework**: Next.js 15 (App Router)
- **CSS**: Tailwind CSS 4 + CSS variables Brain E-Log
- **Font**: Nunito (Google Fonts via CSS @import)
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

## Notes & Décisions

_Documenter ici les décisions importantes prises pendant le développement._
