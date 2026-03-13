# Brain E-Log App — Architecture globale des écrans

> **Date :** 2026-03-13
> **Type :** Sitemap complet + UX flows

---

## Vue d'ensemble — Les 4 modules + zones globales

```
brain-elog-app/
├── [PUBLIC]  Portail prospect       /prospect/[token]
└── [ADMIN]   Interface Mathieu
    ├── /                            Dashboard
    ├── /prospects                   Gestion prospects
    ├── /tarifs                      Gestionnaire de tarifs ← Module 1
    ├── /regles                      Moteur de règles       ← Module 3
    ├── /offres                      Offres générées        ← Module 4
    └── /parametres                  Paramètres app
```

---

## ZONE PUBLIQUE — Portail prospect

### `/prospect/[token]` — Formulaire multi-étapes
> URL unique générée et envoyée par Mathieu au prospect

**Écrans :**
```
1. Landing / Accueil formulaire
   - Logo Brain E-Log
   - "Bienvenue [Nom société si connu]"
   - Description: "Remplissez ce questionnaire pour recevoir votre offre logistique personnalisée"
   - Durée estimée: ~8 min
   - [Commencer →]

2. Étapes Q1 → Q8 (8 écrans)
   - Barre de progression (Step 2/8)
   - Titre de la section (ex: "Votre activité")
   - Champs de la section
   - Sauvegarde auto à chaque étape
   - [← Précédent] [Suivant →]

3. Récapitulatif
   - Résumé des réponses par section
   - Possibilité de modifier avant envoi
   - [← Modifier] [Envoyer mon questionnaire →]

4. Confirmation
   - "Merci ! Nous vous préparons votre offre personnalisée."
   - "Mathieu vous contactera sous 48h."
   - Pas d'accès à la suite (c'est tout pour le prospect)
```

---

## ZONE ADMIN — Interface Mathieu

### Authentification
```
/login
   - Email + mot de passe
   - Logo Brain E-Log centré
   - Fond navy #24487B
```

---

### `/` — Dashboard

**Objectif :** Vue d'ensemble rapide de l'activité

```
┌─────────────────────────────────────────────────────────┐
│  KPI cards (ligne du haut)                              │
│  [Prospects actifs: 12] [Offres générées: 34] [En attente: 5] [Acceptées: 8]  │
├─────────────────────────────────────────────────────────┤
│  Activité récente (gauche)    Actions rapides (droite)  │
│  - Prospect X a rempli        [+ Nouveau prospect]      │
│    son questionnaire          [↗ Envoyer un lien]       │
│  - Offre générée pour Y       [📊 Voir les tarifs]      │
│  - Offre acceptée par Z                                 │
├─────────────────────────────────────────────────────────┤
│  Prospects récents (table preview, 5 derniers)          │
└─────────────────────────────────────────────────────────┘
```

---

### `/prospects` — Gestion des prospects

#### `/prospects` — Liste
```
[+ Nouveau prospect]  [↗ Envoyer un lien questionnaire]

Table:
Nom société | Secteur | Date | Statut | Groupe tarifaire | Actions
-----------------------------------------------------------------------
Acme SRL    | Mode    | 13/03 | Questionnaire envoyé | Standard  | [Voir] [Offre]
Shop BV     | Beauté  | 12/03 | Offre générée         | Pâqueret. | [Voir] [Renvoyer]
...

Filtres: Statut ▼  Secteur ▼  Groupe ▼  Recherche…
```

**Statuts prospect :**
```
● Nouveau         → créé manuellement, pas encore de lien envoyé
● Lien envoyé     → questionnaire envoyé, pas encore rempli
● En cours        → prospect a commencé à remplir
● Répondu         → questionnaire complet
● Offre générée   → offre créée, pas encore envoyée
● Offre envoyée   → offre envoyée par email
● Acceptée ✓
● Refusée ✗
● Archivé
```

#### `/prospects/[id]` — Fiche prospect
```
┌──────────────────────────────────────────────────────────┐
│  Acme SRL                   [Statut: Répondu ▼]          │
│  mathieu@acme.com | +32 ...                              │
│  Secteur: Mode | TVA: BE0123...                          │
├──────────────────────────────────────────────────────────┤
│  TABS: [Questionnaire] [Enrichissement] [Offres] [Notes] │
├──────────────────────────────────────────────────────────┤
│  TAB Questionnaire:                                       │
│  Réponses Q1-Q8 avec possibilité de modifier             │
│  (Mathieu peut corriger/compléter les réponses)          │
├──────────────────────────────────────────────────────────┤
│  TAB Enrichissement:                                      │
│  - Logo du site (auto-récupéré)                          │
│  - Couleurs brand (auto-détectées)                       │
│  - Description activité (auto-générée par IA)            │
│  - Chiffre d'affaires estimé, nb employés               │
│  - [Relancer l'enrichissement]                           │
├──────────────────────────────────────────────────────────┤
│  TAB Offres:                                             │
│  Liste des offres générées pour ce prospect              │
├──────────────────────────────────────────────────────────┤
│  Sidebar droite:                                          │
│  Groupe tarifaire: [Standard ▼]  ← sélecteur             │
│  Défaut suggéré: "Pâquerettes"   ← par règle conditionnelle │
│  [Générer l'offre →]                                     │
└──────────────────────────────────────────────────────────┘
```

#### `/prospects/nouveau` — Créer un prospect
```
2 modes:
A) Saisie manuelle rapide (juste nom + email + envoyer lien)
B) Saisie complète (Mathieu remplit lui-même le questionnaire)
```

---

### `/tarifs` — Gestionnaire de tarifs ← MODULE 1

#### `/tarifs` — Vue principale (liste groupes + items)
```
Layout 2 colonnes:
- Gauche: liste des groupes + bouton créer
- Droite: items du groupe sélectionné par catégorie

(voir plan détaillé dans brain-elog-app-plan.md)
```

#### `/tarifs/[id]/comparer` — Comparaison 2 groupes
```
[Groupe A: Standard ▼]  vs  [Groupe B: Pâquerettes ▼]

Table side-by-side:
Service               | Standard  | Pâquerettes | Delta
──────────────────────|─────────────────────────|───────
Gestion compte        | 150,00€   | 120,00€     | -20%
Abonnement WMS        | 100,00€   | 80,00€      | -20%
Stockage palette      | 10,50€    | 8,00€       | -23.8%
...
```

---

### `/regles` — Moteur de règles ← MODULE 3

#### `/regles` — Liste des règles
```
[+ Nouvelle règle]

Règles actives:
─────────────────────────────────────────────────────
Rule #1  |  SI Q6.03 > "15%"  →  Suggérer "Price-France"    [✓ active] [⋯]
Rule #2  |  SI Q1.05 = "Alimentation" ET Q1.13 ≠ "Aucune"
          →  Suggérer "Premium Frais"                        [✓ active] [⋯]
Rule #3  |  SI Q4.01 = ">5000"  →  Suggérer "Volume+"        [✗ désact] [⋯]
─────────────────────────────────────────────────────

Filtres: Type ▼  Champ ▼  Actif/Inactif ▼
```

#### `/regles/[id]` — Éditeur de règle
```
┌─────────────────────────────────────────────────────┐
│  Éditeur de règle                                   │
│                                                     │
│  SI  [Q6.03 — France ▼] [> ▼] [15% ▼]             │
│  ET  [Q6.04 — Belgique ▼] [= ▼] [0% ▼]            │
│  [+ Ajouter une condition]                          │
│                                                     │
│  ALORS  suggérer le groupe  [Price-France ▼]        │
│         avec priorité       [1 ▼]                   │
│                                                     │
│  [Tester cette règle →]  [Annuler] [Enregistrer]   │
└─────────────────────────────────────────────────────┘

Panel "Tester":
  Simuler avec le profil de: [Acme SRL ▼]
  → Résultat: ✓ Règle déclenchée → "Price-France" suggéré
```

---

### `/offres` — Offres générées ← MODULE 4 (dernière étape)

#### `/offres` — Liste
```
Table:
Prospect | Date | Groupe utilisé | Format | Statut | Actions
─────────────────────────────────────────────────────────────
Acme SRL | 13/03 | Standard     | Web    | Envoyée | [Voir] [Renvoyer]
Shop BV  | 12/03 | Pâquerettes  | PDF    | Acceptée| [Voir]
...
```

#### `/offres/[id]` — Détail offre
```
Aperçu de l'offre générée
Options: [Aperçu web] [Télécharger PDF] [Télécharger PPTX]
         [Envoyer par email →]

Historique des envois
```

#### `/offres/generer/[prospect-id]` — Génération
```
Étape 1: Confirmer les données
  - Résumé questionnaire prospect
  - Groupe tarifaire sélectionné: [Standard ▼]
  - Règles appliquées: affichées

Étape 2: Options de génération
  - Format: [Présentation web] [Excel] [PDF] [PowerPoint]
  - Langue: [FR ▼]
  - Options: [Inclure section transport] [Inclure CGV]

Étape 3: Aperçu
  - Preview de l'offre générée
  - [Modifier] [Valider et envoyer →]
```

---

### `/parametres` — Paramètres

```
TABS: [Brain E-Log] [Utilisateurs] [Email] [Intégrations]

TAB Brain E-Log:
  - Nom de la société
  - Adresse / TVA
  - Logo (upload)
  - Contact commercial (Mathieu)
  - Signature email
  - Pied de page offres

TAB Email:
  - Template email d'envoi offre
  - Template email lien questionnaire
  - Adresse d'expédition

TAB Intégrations: (futur)
  - Connexion CRM
  - Webhooks
```

---

## Navigation globale

```
Sidebar (toujours visible):
┌────────────────────┐
│  🧠 Brain E-Log    │  ← logo + nom app
├────────────────────┤
│  ⬚  Dashboard      │
│  👥 Prospects      │  + badge nb "en attente"
│  📊 Tarifs         │
│  ⚙  Règles         │
│  📄 Offres         │
├────────────────────┤
│  ──────────────    │
│  ⚙  Paramètres     │
│  👤 Mathieu P.     │
└────────────────────┘
```

---

## UX Flows principaux

### Flow 1 — Nouveau prospect → Offre envoyée
```
Prospects → [+ Nouveau prospect]
  → Saisir nom + email
  → Copier le lien questionnaire
  → Envoyer à Mathieu
  → [Notification] "Acme SRL a rempli son questionnaire"
  → Prospects → Acme SRL → [Statut: Répondu]
  → Choisir groupe tarifaire (suggestion auto par règles)
  → [Générer l'offre →]
  → Aperçu → [Envoyer par email →]
  → Statut → "Offre envoyée"
```

### Flow 2 — Créer un nouveau preset tarifaire
```
Tarifs → [+ Créer un groupe]
  → Nommer "On se fait plaisir"
  → Dupliquer depuis "Standard" avec +30% global
  → Arrondir au 0.50€
  → Ajuster manuellement certains items
  → Ajouter règle: "SI Q4.01 = '>5000' → suggérer ce groupe"
  → Enregistrer
```

### Flow 3 — Prospect remplit son questionnaire (côté public)
```
/prospect/[token]
  → Landing → Commencer
  → Q1 (Identité) → Q2 → Q3 → ... → Q8
  → Récapitulatif → Envoyer
  → Confirmation
  → [Notification Mathieu] "Nouveau questionnaire reçu"
```

---

## Résumé des écrans (total)

| Zone | Écrans |
|------|--------|
| Public — Portail prospect | 4 (landing, Q1-Q8 groupés, récap, confirm) |
| Admin — Auth | 1 (login) |
| Admin — Dashboard | 1 |
| Admin — Prospects | 3 (liste, fiche, nouveau) |
| Admin — Tarifs | 2 (principal, comparaison) |
| Admin — Règles | 2 (liste, éditeur) |
| Admin — Offres | 3 (liste, détail, générateur) |
| Admin — Paramètres | 1 (multi-tabs) |
| **Total** | **~17 écrans** |
