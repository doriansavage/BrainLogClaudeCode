# ADN Graphique — Brain e-Log
> **Source :** https://www.brain-log.com/en/
> **Extrait le :** 2026-03-13
> **Secteur :** Logistique e-commerce / Fulfillment 3PL — Belgique

---

## 1. Identité de marque

| Élément | Valeur |
|---------|--------|
| **Nom** | Brain e-Log |
| **Tagline principale** | "E-commerce expertise at your service." |
| **Tagline secondaire** | "Your growth partner" |
| **Fondée** | 2002 |
| **Localisation** | Braine-le-Château, Belgique (Sud de Bruxelles) |
| **Cœur de métier** | Stockage · Fulfillment · Livraison e-commerce |
| **Ton éditorial** | Professionnel, fiable, orienté B2B, sobre |

---

## 2. Logo

```
Format    : Wordmark (texte) — horizontal
Dimensions: 768 × 254 px (ratio 3:1)
Style     : Sans-serif géométrique, clean, typographie corporative
```

### Couleurs du logo

| Rôle | Couleur | Hex |
|------|---------|-----|
| Lettres principales | Navy bleu | `#24487B` |
| Cadre / éléments secondaires | Gris charcoal | `#4F4C4D` |

**URL directe :** `https://www.brain-log.com/web/image/website/1/logo/Brain%20e-Log?unique=cb967e0`

**Description :** Wordmark "Brain e-Log" en caractères géométriques bold, deux tonalités — le navy pour la marque, le gris pour les éléments supports. Traitement minimal, aucun icône symbolique, aucun ornement.

---

## 3. Palette de couleurs

### Couleurs confirmées

| Rôle | Nom | Hex | Usage |
|------|-----|-----|-------|
| **Primaire** | Navy Blue | `#094D80` | CTA, accents, formes SVG décoratives |
| **Logo dark** | Dark Navy | `#24487B` | Logo principal |
| **Neutre dark** | Charcoal | `#4F4C4D` | Logo secondaire, textes |
| **Background** | White | `#FFFFFF` | Fond principal des pages |

### Palette étendue (inférée du contexte)

| Rôle | Hex estimé | Justification |
|------|-----------|---------------|
| Fond section alternée | `#F5F7FA` | Standard B2B logistique, contraste doux |
| Texte principal | `#1A1A1A` | Lisibilité maximale |
| Texte muted / secondaire | `#4F4C4D` | Réutilisation du gris logo |
| Bordures / séparateurs | `#E2E8F0` | Discret, propre |
| Lien hover | `#0A3F6B` | Déclinaison foncée du primaire |

### Palette prête à l'emploi (CSS variables)

```css
:root {
  --color-primary:    #094D80;  /* Navy principal */
  --color-dark-navy:  #24487B;  /* Navy logo */
  --color-charcoal:   #4F4C4D;  /* Gris neutre */
  --color-bg:         #FFFFFF;  /* Fond blanc */
  --color-bg-alt:     #F5F7FA;  /* Fond section claire */
  --color-text:       #1A1A1A;  /* Texte corps */
  --color-muted:      #4F4C4D;  /* Texte secondaire */
  --color-border:     #E2E8F0;  /* Bordures */
  --color-primary-dark: #0A3F6B; /* Hover / actif */
}
```

---

## 4. Typographie

### Style général
Sans-serif géométrique moderne — cohérent avec le secteur logistique/B2B.
Odoo (CMS utilisé) charge généralement **Nunito**, **Lato** ou **Roboto** selon le thème.

### Recommandation de pairings (en attente de confirmation CSS)

**Option A (probable — Odoo theme standard) :**
```
Headings : Nunito (700, 800) — friendly corporate
Body      : Nunito (400, 600) — lisibilité digitale
```

**Option B (alternative observée) :**
```
Headings : Roboto (700) — neutre, logistique
Body      : Roboto (400) — très lisible
```

### Hiérarchie typographique

| Niveau | Taille estimée | Poids | Usage |
|--------|---------------|-------|-------|
| H1 Hero | 40–52px | 800 | Accroche principale |
| H2 Section | 28–36px | 700 | Titres de section |
| H3 Card | 18–22px | 600 | Titres de cartes |
| Body | 16px | 400 | Texte courant |
| Caption | 14px | 400 | Labels, sous-textes |
| CTA | 15–16px | 600–700 | Boutons |

---

## 5. Composants UI

### Bouton principal (CTA)
```
Texte    : "Request a quote"
Style    : Background #094D80, texte blanc, sans bordure
Shape    : Arrondi (border-radius probable 4–8px)
Hover    : Fond légèrement foncé #0A3F6B
```

### Navigation
```
Structure : Barre horizontale fixe ou sticky
Items     : Home / Services (dropdown) / About / Contact us
Droite    : Sign in + "Request a quote" (CTA)
Extras    : Sélecteur de langue (EN/NL/FR) avec drapeaux PNG 25px
```

### Icônes de services
```
Style     : Outline SVG (stroke, pas de fill plein)
Thèmes    : Shopping cart, Storage furniture, Box, Delivery van
Cohérence : Même épaisseur de trait, même viewBox
Source    : Iconset propriétaire ou adapté
```

### Cards de services
```
Layout   : Grille 4 colonnes (desktop), icône + titre + description
Fond     : Blanc ou fond légèrement grisé
Bordure  : Subtile ou shadow légère
```

### Section statistiques
```
Layout   : Grille de métriques clés (chiffres + labels)
Style    : Chiffres en grand, texte bold navy ou charcoal
```

### Footer
```
Structure : Multi-colonnes (liens, contact, social, compte)
Fond     : Probablement #1A1A1A ou navy foncé (standard B2B)
```

---

## 6. Images & photographie

### Style photo
- **Photographie d'entrepôt** : shots réels, lumière naturelle, environnement logistique propre
- Référence confirmée : `IMAGE_DEPOT_001.webp` — intérieur dépôt/entrepôt
- Ton **professionnel**, sans staging excessif — authenticité opérationnelle

### Formats
```
Photos   : WebP (optimisé)
Icônes   : SVG (outline)
Drapeaux : PNG 25px height
```

### Charte image
| Critère | Valeur |
|---------|--------|
| Sujet | Entrepôts, flux logistiques, packaging, livraison |
| Ton | Neutre, lumière réaliste, pas de filtre agressif |
| Couleurs dominantes | Gris industriel + bleu (cohérence avec brand) |
| Éviter | Stock photos trop génériques, images figées |

---

## 7. Partenaires transporteurs
Logo carousel visible avec : **BPost · Colissimo · DHL · DPD · Deutsche Post · Geodis · GLS · Mondial Relay · UPS · FedEx**

> Ces logos tiers doivent rester sur fond blanc/neutre pour garantir leur lisibilité.

---

## 8. Tone of voice & personnalité de marque

| Attribut | Description |
|----------|-------------|
| **Expertise** | "Depuis 2002" — crédibilité métier |
| **Clarté** | Offre lisible en 4 services, sans jargon superflu |
| **Efficacité** | Mots clés : "optimize", "rigor", "speed" |
| **Proximité** | "Small, familial structure" — accessible sans être informel |
| **International** | 3 langues (EN/NL/FR), partenaires pan-européens |

---

## 9. Résumé ADN en une phrase

> **Brain e-Log est une marque Navy & White, sans-serif géométrique, sobre et professionnelle, qui parle d'efficacité logistique avec des icônes outline claires, des photos d'entrepôt authentiques et un CTA bleu direct.**

---

## 10. Fichiers de référence collectés

| Type | URL / Chemin |
|------|-------------|
| Logo SVG | `https://www.brain-log.com/web/image/website/1/logo/Brain%20e-Log?unique=cb967e0` |
| Forme décorative | `https://www.brain-log.com/en/web_editor/shape/theme_paptic/s_picture.svg?c1=%23094D80` |
| Photo dépôt | `https://www.brain-log.com/web/image/49721-a4a2e96a/IMAGE_DEPOT_001.webp` |
| Icône e-commerce | `https://www.brain-log.com/web/image/25185-81e83cf3/shopping-outline_mobile-cart2.svg` |
| Icône storage | `https://www.brain-log.com/web/image/24482-15564422/furniture-outline_storage.svg` |
| Icône fulfillment | `https://www.brain-log.com/web/image/25186-918bc699/shopping-outline_box%202.svg` |
| Icône shipping | `https://www.brain-log.com/web/image/25187-47aa3cb5/shopping-outline_delivery-fast2.svg` |
| Icônes process | `https://www.brain-log.com/web/image/25198-45fe25d6/ecomm_step_1.svg` → `step_4.svg` |

---

*Document généré via analyse de https://www.brain-log.com/en/ — à affiner avec accès direct aux fichiers CSS.*
