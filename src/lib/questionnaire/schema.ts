import type { QuestionnaireSchema } from '@/types/questionnaire'

// ─────────────────────────────────────────────────────────────────
// Schéma UX du questionnaire — Brain E-Log
// Chaque champ a son composant UI optimal :
//   toggle       → Oui/Non binaire
//   radio_cards  → choix unique avec cartes visuelles
//   icon_grid    → grille d'icônes (secteur, pays, plateforme)
//   slider       → volume, poids, fréquence sur échelle ordonnée
//   multi_select → plusieurs réponses possibles (chips)
//   price_range  → fourchette de valeur €
//   geo_split    → % par pays (6 sliders, somme ≈ 100%)
//   scale_3      → importance/urgence sur 3 niveaux
//   logo_picker  → grid de logos de marques
//   timeline_sel → horizon temporel (urgence)
// ─────────────────────────────────────────────────────────────────

export const QUESTIONNAIRE_SCHEMA: QuestionnaireSchema = {
  sections: [

    // ══════════════════════════════════════════
    // Q1 — Identité & base article  (15 champs)
    // ══════════════════════════════════════════
    {
      id: 'Q1',
      label: 'Identité & base article',
      icon: '🏢',
      description: 'Présentez votre entreprise et vos produits',
      fields: [
        {
          id: 'Q1.01',
          label: 'Nom de l\'entreprise',
          type: 'text',
          required: true,
          hint: 'Raison sociale ou nom commercial',
        },
        {
          id: 'Q1.02',
          label: 'Personne de contact',
          type: 'text',
          required: true,
          hint: 'Nom et fonction (ex : Marie Dupont — Responsable logistique)',
        },
        {
          id: 'Q1.03',
          label: 'Email / téléphone',
          type: 'text',
          required: true,
          hint: 'Nous vous contacterons à cette adresse pour vous envoyer votre offre',
        },
        {
          id: 'Q1.04',
          label: 'Site web / URL boutique',
          type: 'url',
          required: false,
          hint: 'ex : https://www.mamarque.com',
        },
        {
          // icon_grid : 10 secteurs avec icône visuelle
          id: 'Q1.05',
          label: 'Secteur d\'activité',
          type: 'icon_grid',
          required: true,
          options: ['Mode & Accessoires', 'Beauté & Cosmétiques', 'Santé & Bien-être', 'Alimentation & Boissons', 'Maison & Déco', 'Sport & Loisirs', 'High-Tech & Électronique', 'Jouets & Enfants', 'Animaux', 'Autre'],
          icons:   ['👗', '💄', '💊', '🍃', '🏡', '⚽', '💻', '🧸', '🐾', '📦'],
        },
        {
          id: 'Q1.06',
          label: 'Numéro de TVA intracommunautaire',
          type: 'text',
          required: false,
          hint: 'ex : BE0123456789 — facultatif à ce stade',
        },
        {
          // slider : échelle ordonnée de volumes SKU
          id: 'Q1.07',
          label: 'Nombre total de SKU actives',
          type: 'slider',
          required: true,
          hint: 'Une SKU = une référence produit unique (coloris/taille comptent séparément)',
          slider: { stops: ['0–5', '5–10', '10–20', '20–50', '50–100', '+100'] },
        },
        {
          // radio_cards : 3 choix clairs avec badge visuel
          id: 'Q1.08',
          label: 'Vos produits ont-ils un code EAN / code-barres ?',
          type: 'radio_cards',
          required: true,
          options: ['Oui — tous', 'Partiel', 'Non — aucun'],
          icons:   ['✅', '⚠️', '❌'],
          hint: 'Indispensable pour le suivi en entrepôt — sans EAN, un étiquetage sera nécessaire',
        },
        {
          // toggle : binaire Oui/Non
          id: 'Q1.09',
          label: 'Vos produits ont-ils des variantes ?',
          type: 'toggle',
          required: true,
          hint: 'Couleurs, tailles, formats… chaque combinaison compte comme une SKU distincte',
          options: ['Oui', 'Non'],
        },
        {
          // radio_cards avec taille visuelle (XS → XL)
          id: 'Q1.10',
          label: 'Fourchette de dimensions produit',
          type: 'radio_cards',
          required: true,
          options: ['Très petit  < 10×10×5 cm', 'Petit  < 30×20×15 cm', 'Moyen  < 50×40×30 cm', 'Grand  < 80×60×40 cm', 'Très grand  > 80 cm', 'Variable'],
          icons:   ['🔹', '🟦', '📦', '🗃️', '🗄️', '🔀'],
        },
        {
          // slider : échelle de poids
          id: 'Q1.11',
          label: 'Fourchette de poids unitaire',
          type: 'slider',
          required: true,
          hint: 'Poids moyen d\'une unité produit non emballée',
          slider: { stops: ['< 250 g', '250 g–1 kg', '1–3 kg', '3–5 kg', '5–10 kg', '10–30 kg', '> 30 kg'] },
        },
        {
          // radio_cards : contraintes de stockage spécifiques
          id: 'Q1.12',
          label: 'Contraintes de stockage particulières',
          type: 'radio_cards',
          required: true,
          options: ['Aucune', 'Fragile', 'Volumineux', 'Température contrôlée', 'Dangereux ADR', 'Valeur élevée — coffre', 'Plusieurs contraintes'],
          icons:   ['✅', '🫧', '📐', '🌡️', '⚠️', '🔒', '⚙️'],
        },
        {
          // radio_cards : gestion lots/péremption
          id: 'Q1.13',
          label: 'Gestion des lots et dates de péremption',
          type: 'radio_cards',
          required: true,
          options: ['Aucune', 'Numéros de lot uniquement', 'Dates de péremption (DLUO/DLC)', 'Les deux'],
          icons:   ['—', '🔢', '📅', '🔢📅'],
        },
        {
          // radio_cards : fréquence de nouvelles références
          id: 'Q1.14',
          label: 'À quelle fréquence ajoutez-vous de nouvelles références ?',
          type: 'radio_cards',
          required: false,
          options: ['Rarement < 1×/trimestre', 'Trimestrielle', 'Mensuelle', 'Hebdomadaire'],
          icons:   ['🐢', '📆', '🗓️', '⚡'],
        },
        {
          // radio_cards
          id: 'Q1.15',
          label: 'Disposez-vous d\'un export de votre base article ?',
          type: 'radio_cards',
          required: false,
          options: ['Oui — CSV / Excel', 'Non — à créer', 'Via API plateforme'],
          icons:   ['📊', '✏️', '🔌'],
          hint: 'Permet d\'accélérer le paramétrage de votre compte',
        },
      ],
    },

    // ══════════════════════════════════════════
    // Q2 — Réception & approvisionnement  (13)
    // ══════════════════════════════════════════
    {
      id: 'Q2',
      label: 'Réception & approvisionnement',
      icon: '🚛',
      description: 'Comment vos marchandises arrivent chez nous',
      fields: [
        {
          // radio_cards avec icônes transport
          id: 'Q2.01',
          label: 'Comment vos fournisseurs vous livrent-ils ?',
          type: 'radio_cards',
          required: true,
          options: ['Conteneur FCL', 'Conteneur LCL', 'Palettes', 'Colis', 'Vrac'],
          icons:   ['🚢', '🚢', '🪵', '📦', '🌾'],
        },
        {
          id: 'Q2.02',
          label: 'Vos palettes / colis sont-ils mono ou multi-SKU ?',
          type: 'radio_cards',
          required: true,
          options: ['Mono-SKU', 'Multi-SKU', 'Les deux'],
          icons:   ['1️⃣', '🔢', '↔️'],
          hint: 'Impacte le temps de déchargement et de mise en stock',
        },
        {
          // radio_cards : fréquence avec icône tempo
          id: 'Q2.03',
          label: 'Fréquence d\'approvisionnement',
          type: 'radio_cards',
          required: true,
          options: ['Hebdomadaire', 'Bimensuelle', 'Mensuelle', 'Trimestrielle', 'Ponctuelle / variable'],
          icons:   ['⚡', '🔄', '📅', '📆', '🔀'],
        },
        {
          // slider : volume palettes par livraison
          id: 'Q2.04',
          label: 'Nombre moyen de palettes par réception',
          type: 'slider',
          required: true,
          slider: { stops: ['0', '1–2', '3–5', '5–10', '10–20', '> 20'] },
        },
        {
          // slider : volume colis par livraison
          id: 'Q2.05',
          label: 'Nombre moyen de colis par réception',
          type: 'slider',
          required: true,
          slider: { stops: ['0', '1–10', '10–30', '30–50', '50–100', '> 100'] },
        },
        {
          // radio_cards simple
          id: 'Q2.06',
          label: 'Nombre de fournisseurs différents',
          type: 'radio_cards',
          required: false,
          options: ['1', '2–3', '4–5', '> 5'],
          icons:   ['1️⃣', '2️⃣', '4️⃣', '🔢'],
        },
        {
          // icon_grid : origine géographique avec drapeaux
          id: 'Q2.07',
          label: 'Origine principale de vos marchandises',
          type: 'icon_grid',
          required: true,
          options: ['Belgique', 'France', 'Europe UE', 'Europe hors UE', 'Chine', 'Asie hors Chine', 'USA / Canada', 'Afrique', 'Autre'],
          icons:   ['🇧🇪', '🇫🇷', '🇪🇺', '🌍', '🇨🇳', '🌏', '🇺🇸', '🌍', '🌐'],
        },
        {
          id: 'Q2.08',
          label: 'Vos marchandises arrivent-elles dédouanées ?',
          type: 'radio_cards',
          required: true,
          options: ['Oui — DDP (livré dédouané)', 'Non — à dédouaner à l\'arrivée', 'Variable'],
          icons:   ['✅', '📋', '🔀'],
        },
        {
          id: 'Q2.09',
          label: 'La gestion douanière est assurée par',
          type: 'radio_cards',
          required: false,
          options: ['Votre entreprise', 'Votre transitaire', 'À définir avec Brain E-Log', 'Non applicable — UE'],
          icons:   ['🏢', '🤝', '💬', '✅'],
          conditional: { fieldId: 'Q2.08', operator: 'neq', value: 'Oui — DDP (livré dédouané)' },
        },
        {
          // radio_cards : niveau de contrôle qualité
          id: 'Q2.10',
          label: 'Niveau de contrôle qualité souhaité à la réception',
          type: 'radio_cards',
          required: true,
          options: ['Aucun', 'Quantitatif uniquement', 'Quantitatif + qualitatif', 'Avec prise de photos', 'Contrôle complet + rapport'],
          icons:   ['—', '🔢', '🔢✅', '📸', '📋'],
        },
        {
          id: 'Q2.11',
          label: 'Vos produits sont-ils étiquetés EAN à l\'arrivée ?',
          type: 'radio_cards',
          required: true,
          options: ['Oui — tous', 'Partiel', 'Non — étiquetage nécessaire'],
          icons:   ['✅', '⚠️', '🏷️'],
        },
        {
          // toggle : kitting Oui/Non
          id: 'Q2.12',
          label: 'Kitting ou assemblage requis à la réception ?',
          type: 'toggle',
          required: true,
          options: ['Oui', 'Non'],
          hint: 'Ex : regroupement de plusieurs articles en un kit avant mise en stock',
        },
        {
          id: 'Q2.13',
          label: 'Un bon de livraison / packing list est-il fourni ?',
          type: 'radio_cards',
          required: false,
          options: ['Oui — systématiquement', 'Parfois', 'Non'],
          icons:   ['✅', '⚠️', '❌'],
        },
      ],
    },

    // ══════════════════════════════════════════
    // Q3 — Stockage  (10 champs)
    // ══════════════════════════════════════════
    {
      id: 'Q3',
      label: 'Stockage',
      icon: '🏭',
      description: 'Volume et organisation de votre stock',
      fields: [
        {
          // slider : volume palettes
          id: 'Q3.01',
          label: 'Volume de stockage estimé (en palettes)',
          type: 'slider',
          required: true,
          hint: '1 palette ≈ 1,2 m² au sol, hauteur ~1,8 m',
          slider: { stops: ['< 5', '5–15', '15–30', '30–50', '50–100', '> 100'] },
        },
        {
          // radio_cards avec icônes entrepôt
          id: 'Q3.02',
          label: 'Type d\'emplacement de stockage majoritaire',
          type: 'radio_cards',
          required: true,
          options: ['Palette au sol', 'Palette en rack', 'Bac / étagère picking', 'Mixte palette + bac'],
          icons:   ['⬛', '🗄️', '📋', '🔀'],
        },
        {
          // price_range : valeur du stock
          id: 'Q3.03',
          label: 'Valeur estimée de votre stock moyen',
          type: 'price_range',
          required: false,
          options: ['< 10 k€', '10–50 k€', '50–100 k€', '100–250 k€', '> 250 k€'],
          hint: 'Permet d\'évaluer vos besoins en assurance',
        },
        {
          id: 'Q3.04',
          label: 'Souhaitez-vous une assurance stock via Brain E-Log ?',
          type: 'radio_cards',
          required: false,
          options: ['Oui', 'Non — assuré par nos soins', 'À discuter'],
          icons:   ['🛡️', '✅', '💬'],
        },
        {
          // scale_3 : saisonnalité de l'activité
          id: 'Q3.05',
          label: 'Saisonnalité de votre activité',
          type: 'scale_3',
          required: true,
          scale: {
            low:  'Stable',
            mid:  'Pics modérés ±30%',
            high: 'Forte saisonnalité ×2+',
            lowIcon:  '📊',
            midIcon:  '📈',
            highIcon: '🚀',
          },
        },
        {
          // multi_select : plusieurs mois possibles
          id: 'Q3.06',
          label: 'Mois ou périodes de pic',
          type: 'multi_select',
          required: false,
          options: ['Jan–Mars', 'Avr–Juin', 'Juil–Sept', 'Oct–Déc', 'Black Friday / Noël', 'Été', 'Plusieurs'],
          conditional: { fieldId: 'Q3.05', operator: 'neq', value: 'Stable' },
        },
        {
          // radio_cards : rotation
          id: 'Q3.07',
          label: 'Rotation de vos stocks',
          type: 'radio_cards',
          required: true,
          options: ['Rapide  < 30 j', 'Moyenne  30–90 j', 'Lente  > 90 j', 'Variable'],
          icons:   ['⚡', '🔄', '🐢', '🔀'],
        },
        {
          // radio_cards : méthode FIFO/FEFO
          id: 'Q3.08',
          label: 'Méthode de gestion des stocks souhaitée',
          type: 'radio_cards',
          required: false,
          options: ['FIFO', 'FEFO', 'LIFO', 'Pas de préférence'],
          icons:   ['1️⃣', '📅', '🔙', '🤷'],
          hint: 'FIFO = premier entré premier sorti | FEFO = premier périmé premier sorti',
        },
        {
          // toggle
          id: 'Q3.09',
          label: 'Souhaitez-vous un stock de sécurité défini ?',
          type: 'toggle',
          required: false,
          options: ['Oui', 'Non'],
          hint: 'Seuil de réapprovisionnement automatique',
        },
        {
          // radio_cards : fréquence inventaire
          id: 'Q3.10',
          label: 'Fréquence d\'inventaire souhaitée',
          type: 'radio_cards',
          required: false,
          options: ['Annuel', 'Semestriel', 'Trimestriel', 'Mensuel', 'Pas nécessaire'],
          icons:   ['🗓️', '📅', '🔄', '📆', '—'],
        },
      ],
    },

    // ══════════════════════════════════════════
    // Q4 — Préparation de commandes  (14 champs)
    // ══════════════════════════════════════════
    {
      id: 'Q4',
      label: 'Préparation de commandes',
      icon: '📦',
      description: 'Volume et nature de vos expéditions clients',
      fields: [
        {
          // slider : commandes B2C par mois (échelle log)
          id: 'Q4.01',
          label: 'Nombre de commandes B2C par mois',
          type: 'slider',
          required: true,
          hint: 'Volume moyen actuel ou prévisionnel à 3 mois',
          slider: { stops: ['< 50', '50–200', '200–500', '500–1 000', '1 000–5 000', '> 5 000'] },
        },
        {
          // radio_cards : nb SKU par commande
          id: 'Q4.02',
          label: 'Nombre moyen de SKU différentes par commande B2C',
          type: 'radio_cards',
          required: true,
          options: ['1', '1–2', '2–3', '3–5', '> 5'],
          icons:   ['1️⃣', '2️⃣', '3️⃣', '5️⃣', '🔢'],
        },
        {
          id: 'Q4.03',
          label: 'Nombre moyen d\'unités par commande B2C',
          type: 'radio_cards',
          required: true,
          options: ['1', '1–2', '2–3', '3–5', '> 5'],
          icons:   ['1️⃣', '2️⃣', '3️⃣', '5️⃣', '🔢'],
        },
        {
          // price_range : panier moyen
          id: 'Q4.04',
          label: 'Valeur moyenne d\'une commande B2C',
          type: 'price_range',
          required: false,
          options: ['< 30 €', '30–60 €', '60–100 €', '100–200 €', '> 200 €'],
        },
        {
          // radio_cards : avez-vous une activité B2B ?
          id: 'Q4.05',
          label: 'Avez-vous une activité B2B (vente à des revendeurs/pro) ?',
          type: 'radio_cards',
          required: true,
          options: ['Oui', 'Non', 'En projet'],
          icons:   ['✅', '❌', '🔮'],
        },
        {
          // slider conditionnel B2B
          id: 'Q4.06',
          label: 'Nombre de commandes B2B par mois',
          type: 'slider',
          required: false,
          slider: { stops: ['< 10', '10–50', '50–100', '> 100'] },
          conditional: { fieldId: 'Q4.05', operator: 'in', value: ['Oui', 'En projet'] },
        },
        {
          id: 'Q4.07',
          label: 'Nombre moyen d\'unités par commande B2B',
          type: 'radio_cards',
          required: false,
          options: ['1–10', '10–50', '50–100', '> 100'],
          icons:   ['📦', '🗃️', '🪵', '🚛'],
          conditional: { fieldId: 'Q4.05', operator: 'in', value: ['Oui', 'En projet'] },
        },
        {
          id: 'Q4.08',
          label: 'Valeur moyenne d\'une commande B2B',
          type: 'price_range',
          required: false,
          options: ['< 200 €', '200–500 €', '500–1 000 €', '> 1 000 €'],
          conditional: { fieldId: 'Q4.05', operator: 'in', value: ['Oui', 'En projet'] },
        },
        {
          id: 'Q4.09',
          label: 'Format d\'expédition B2B majoritaire',
          type: 'radio_cards',
          required: false,
          options: ['Colis', 'Demi-palette', 'Palette complète', 'Variable'],
          icons:   ['📦', '⬛', '🪵', '🔀'],
          conditional: { fieldId: 'Q4.05', operator: 'in', value: ['Oui', 'En projet'] },
        },
        {
          // logo_picker : plateforme e-commerce avec logo
          id: 'Q4.10',
          label: 'Plateforme e-commerce utilisée',
          type: 'logo_picker',
          required: true,
          options: ['Shopify', 'WooCommerce', 'PrestaShop', 'Magento', 'Wix', 'Webflow', 'Sur mesure', 'Autre'],
          icons:   ['🛒', '🛒', '🛒', '🛒', '🌐', '🌐', '⚙️', '📦'],
        },
        {
          // multi_select : plusieurs marketplaces possibles
          id: 'Q4.11',
          label: 'Marketplaces actives ou prévues',
          type: 'multi_select',
          required: false,
          options: ['Aucune', 'Amazon', 'Bol.com', 'Cdiscount', 'Zalando', 'eBay', 'Autre'],
          icons:   ['—', '📦', '🛒', '🛒', '👗', '🛒', '➕'],
        },
        {
          // toggle / radio : abonnements
          id: 'Q4.12',
          label: 'Avez-vous des commandes récurrentes (abonnements / box) ?',
          type: 'radio_cards',
          required: false,
          options: ['Oui', 'Non', 'En projet'],
          icons:   ['✅', '❌', '🔮'],
        },
        {
          id: 'Q4.13',
          label: 'À quel moment arrivent vos pics de commandes ?',
          type: 'radio_cards',
          required: false,
          options: ['Réparti uniformément', 'Pic en soirée', 'Pic le week-end', 'Pics post-campagnes', 'Variable'],
          icons:   ['📊', '🌙', '📅', '📣', '🔀'],
        },
        {
          // radio_cards : délai de prépa — impacte le cut-off
          id: 'Q4.14',
          label: 'Délai de préparation souhaité',
          type: 'radio_cards',
          required: true,
          options: ['Jour même — cut-off 12h', 'Jour même — cut-off 16h', 'J+1', 'J+2', 'Pas de contrainte'],
          icons:   ['⚡', '🔥', '🕐', '🕑', '🤷'],
          hint: 'Le cut-off est l\'heure limite pour que la commande parte le jour même',
        },
      ],
    },

    // ══════════════════════════════════════════
    // Q5 — Packaging & colisage  (10 champs)
    // ══════════════════════════════════════════
    {
      id: 'Q5',
      label: 'Packaging & colisage',
      icon: '🎁',
      description: 'Comment vous souhaitez emballer vos envois',
      fields: [
        {
          // radio_cards avec icônes emballage
          id: 'Q5.01',
          label: 'Type d\'emballage B2C',
          type: 'radio_cards',
          required: true,
          options: ['Carton standard brun', 'Carton renforcé', 'Carton personnalisé imprimé', 'Pochette / enveloppe', 'Mixte', 'À définir'],
          icons:   ['📦', '🔒', '🎨', '✉️', '🔀', '💬'],
        },
        {
          id: 'Q5.02',
          label: 'Type de calage / protection',
          type: 'radio_cards',
          required: false,
          options: ['Papier kraft', 'Film bulles', 'Mousse', 'Chips de calage', 'Aucun', 'Mixte', 'À définir'],
          icons:   ['📰', '🫧', '🟫', '🔵', '—', '🔀', '💬'],
        },
        {
          // radio_cards : inserts marketing
          id: 'Q5.03',
          label: 'Inserts marketing dans le colis',
          type: 'radio_cards',
          required: false,
          options: ['Oui — flyer / carte', 'Oui — échantillon', 'Oui — multiple', 'Non'],
          icons:   ['🗒️', '🎁', '✨', '—'],
        },
        {
          id: 'Q5.04',
          label: 'Les fournitures d\'emballage sont fournies par',
          type: 'radio_cards',
          required: true,
          options: ['Vous-même', 'Brain E-Log — à facturer', 'À définir'],
          icons:   ['🏢', '🤝', '💬'],
        },
        {
          // scale_3 : importance de l'unboxing
          id: 'Q5.05',
          label: 'Importance de l\'expérience d\'unboxing',
          type: 'scale_3',
          required: false,
          scale: {
            low:  'Pas prioritaire',
            mid:  'Souhaitable',
            high: 'Très important — différenciant',
            lowIcon:  '📦',
            midIcon:  '🎀',
            highIcon: '✨',
          },
          hint: 'L\'unboxing désigne l\'expérience visuelle à l\'ouverture du colis',
        },
        {
          id: 'Q5.06',
          label: 'Cahier des charges palettisation B2B',
          type: 'radio_cards',
          required: false,
          options: ['Filmage seul', 'Filmage + cerclage', 'Filmage + intercalaires', 'Pas de B2B', 'À définir'],
          icons:   ['🎞️', '🎞️🔗', '🎞️📄', '—', '💬'],
          conditional: { fieldId: 'Q4.05', operator: 'in', value: ['Oui', 'En projet'] },
        },
        {
          id: 'Q5.07',
          label: 'Étiquetage spécifique requis pour le B2B',
          type: 'radio_cards',
          required: false,
          options: ['Étiquette palette', 'BL sur colis', 'Les deux', 'Non', 'Pas de B2B'],
          icons:   ['🏷️', '📄', '🏷️📄', '—', '—'],
          conditional: { fieldId: 'Q4.05', operator: 'in', value: ['Oui', 'En projet'] },
        },
        {
          id: 'Q5.08',
          label: 'Exigences spécifiques de vos distributeurs B2B',
          type: 'radio_cards',
          required: false,
          options: ['Aucune', 'Cahier charges GMS', 'Normes EDI', 'Étiquetage enseigne', 'Plusieurs', 'Non applicable'],
          icons:   ['✅', '🏪', '🔌', '🏷️', '⚙️', '—'],
          conditional: { fieldId: 'Q4.05', operator: 'in', value: ['Oui', 'En projet'] },
        },
        {
          // multi_select : personnalisations possibles
          id: 'Q5.09',
          label: 'Personnalisation produit ou packaging requise',
          type: 'multi_select',
          required: false,
          options: ['Gravure / flocage', 'Marquage client / événement', 'Assemblage coffrets', 'Aucune', 'Autre'],
          icons:   ['✏️', '🎯', '🎁', '—', '➕'],
        },
        {
          id: 'Q5.10',
          label: 'Packaging événementiel ou co-branding prévu ?',
          type: 'radio_cards',
          required: false,
          options: ['Oui — régulier', 'Oui — ponctuel', 'Non'],
          icons:   ['🎄', '🎉', '—'],
        },
      ],
    },

    // ══════════════════════════════════════════
    // Q6 — Expédition  (15 champs)
    // ══════════════════════════════════════════
    {
      id: 'Q6',
      label: 'Expédition',
      icon: '🚚',
      description: 'Transporteurs, destinations et gabarits de colis',
      fields: [
        {
          // multi_select avec logos transporteurs
          id: 'Q6.01',
          label: 'Transporteurs actuellement utilisés',
          type: 'multi_select',
          required: false,
          options: ['Aucun', 'Bpost', 'PostNL', 'DHL', 'DPD', 'GLS', 'Mondial Relay', 'Colissimo', 'UPS', 'FedEx', 'Autre'],
          icons:   ['—', '🇧🇪', '🇳🇱', '🟡', '🔴', '🟢', '🟣', '🔵', '🟤', '🟣', '➕'],
          hint: 'Plusieurs choix possibles — nous pourrons proposer des alternatives optimisées',
        },
        {
          id: 'Q6.02',
          label: 'Part des expéditions multi-colis',
          type: 'radio_cards',
          required: false,
          options: ['Jamais', 'Rarement < 5%', 'Régulièrement 5–20%', 'Fréquent > 20%'],
          icons:   ['—', '🔹', '📦📦', '📦📦📦'],
        },
        {
          // geo_split : composant spécial — 6 pays avec sliders % dont somme ≈ 100%
          id: 'Q6.geo',
          label: 'Répartition géographique de vos expéditions',
          type: 'geo_split',
          required: true,
          hint: 'Répartissez le volume total de vos expéditions par pays (total ≈ 100%)',
          options: ['France', 'Belgique', 'Pays-Bas', 'Allemagne', 'Suisse', 'Autres pays'],
          icons:   ['🇫🇷', '🇧🇪', '🇳🇱', '🇩🇪', '🇨🇭', '🌍'],
        },
        {
          // slider : tranche de poids
          id: 'Q6.09',
          label: 'Tranche de poids expédié majoritaire',
          type: 'slider',
          required: true,
          slider: { stops: ['0–500 g', '500 g–1 kg', '1–3 kg', '3–5 kg', '5–10 kg', '10–30 kg', '> 30 kg'] },
        },
        {
          // slider : poids moyen colis B2C
          id: 'Q6.10',
          label: 'Poids moyen d\'un colis B2C',
          type: 'slider',
          required: true,
          slider: { stops: ['< 500 g', '500 g–1 kg', '1–2 kg', '2–3 kg', '3–5 kg', '5–10 kg', '> 10 kg'] },
        },
        {
          // slider conditionnel B2B
          id: 'Q6.11',
          label: 'Poids moyen d\'un colis B2B',
          type: 'slider',
          required: false,
          slider: { stops: ['< 2 kg', '2–5 kg', '5–10 kg', '10–20 kg', '20–30 kg', '> 30 kg'] },
          conditional: { fieldId: 'Q4.05', operator: 'in', value: ['Oui', 'En projet'] },
        },
        {
          // radio_cards avec icône boîte
          id: 'Q6.12',
          label: 'Dimensions maximales de vos colis',
          type: 'radio_cards',
          required: false,
          options: ['< 30×20×15 cm', '< 50×40×30 cm', '< 80×60×40 cm', '< 100×80×60 cm', '> 100 cm — hors gabarit'],
          icons:   ['🔹', '🟦', '📦', '🗃️', '⚠️'],
        },
        {
          id: 'Q6.13',
          label: 'Livraison à domicile',
          type: 'radio_cards',
          required: true,
          options: ['Oui — tous pays', 'Oui — certains pays', 'Non'],
          icons:   ['🏠', '🏠', '—'],
        },
        {
          id: 'Q6.14',
          label: 'Livraison en point relais',
          type: 'radio_cards',
          required: false,
          options: ['Oui — tous pays', 'Oui — certains pays', 'Non'],
          icons:   ['📍', '📍', '—'],
        },
        {
          id: 'Q6.15',
          label: 'Livraison express J+1 ou same-day',
          type: 'radio_cards',
          required: false,
          options: ['Oui — tous pays', 'Oui — certains pays', 'Non'],
          icons:   ['⚡', '⚡', '—'],
        },
      ],
    },

    // ══════════════════════════════════════════
    // Q7 — Gestion des retours  (9 champs)
    // ══════════════════════════════════════════
    {
      id: 'Q7',
      label: 'Gestion des retours',
      icon: '↩️',
      description: 'Politique et traitement de vos retours clients',
      fields: [
        {
          // slider % : taux de retour B2C
          id: 'Q7.01',
          label: 'Taux de retour B2C estimé',
          type: 'slider',
          required: true,
          hint: 'Le taux moyen en e-commerce est de 15–30% selon le secteur',
          slider: { stops: ['< 2%', '2–5%', '5–10%', '10–20%', '> 20%'] },
        },
        {
          // slider % : taux de retour B2B
          id: 'Q7.02',
          label: 'Taux de retour B2B estimé',
          type: 'slider',
          required: false,
          slider: { stops: ['< 1%', '1–3%', '3–5%', '> 5%'] },
          conditional: { fieldId: 'Q4.05', operator: 'in', value: ['Oui', 'En projet'] },
        },
        {
          id: 'Q7.03',
          label: 'Motifs de retour principaux',
          type: 'radio_cards',
          required: false,
          options: ['Rétractation', 'Taille / mauvais choix', 'Produit défectueux', 'Erreur de livraison', 'Mixte / variable'],
          icons:   ['🔙', '📏', '💔', '📬', '🔀'],
        },
        {
          id: 'Q7.04',
          label: 'Traitement des articles retournés',
          type: 'radio_cards',
          required: true,
          options: ['Contrôle qualité + remise en stock', 'Remise en stock directe', 'Reconditionnement', 'Destruction', 'À définir selon état'],
          icons:   ['✅📦', '📦', '🔧', '🗑️', '🔀'],
        },
        {
          // toggle
          id: 'Q7.05',
          label: 'Gérez-vous des échanges produit ?',
          type: 'toggle',
          required: false,
          options: ['Oui', 'Non'],
        },
        {
          id: 'Q7.06',
          label: 'Étiquette retour',
          type: 'radio_cards',
          required: false,
          options: ['Pré-imprimée dans le colis', 'Générée via portail client', 'Fournie par vos soins', 'Pas d\'étiquette retour'],
          icons:   ['🏷️', '💻', '🏢', '—'],
        },
        {
          id: 'Q7.07',
          label: 'Portail de retour client',
          type: 'radio_cards',
          required: false,
          options: ['Oui — déjà en place', 'Non — à créer', 'Non — pas nécessaire'],
          icons:   ['✅', '🔧', '—'],
        },
        {
          id: 'Q7.08',
          label: 'Délai de traitement retour souhaité',
          type: 'radio_cards',
          required: false,
          options: ['24h', '48h', '5 jours ouvrés', 'Pas de contrainte'],
          icons:   ['⚡', '🔥', '📅', '🤷'],
        },
        {
          // toggle
          id: 'Q7.09',
          label: 'Des photos des retours sont-elles requises ?',
          type: 'toggle',
          required: false,
          options: ['Oui — systématiquement', 'Non'],
          hint: 'Utile pour les litiges ou le contrôle qualité',
        },
      ],
    },

    // ══════════════════════════════════════════
    // Q8 — Informations complémentaires  (11 champs)
    // ══════════════════════════════════════════
    {
      id: 'Q8',
      label: 'Informations complémentaires',
      icon: '⚙️',
      description: 'Intégration technique et ambitions de croissance',
      fields: [
        {
          id: 'Q8.01',
          label: 'Intégration WMS souhaitée',
          type: 'radio_cards',
          required: true,
          options: ['API directe', 'Plugin natif plateforme', 'Fichier CSV / SFTP', 'Marketplace connector', 'Pas nécessaire', 'À définir'],
          icons:   ['🔌', '🧩', '📁', '🛒', '—', '💬'],
          hint: 'Le WMS (Warehouse Management System) de Brain E-Log est connecté via plusieurs méthodes',
        },
        {
          // logo_picker : ERP avec logos
          id: 'Q8.02',
          label: 'ERP / outil de gestion utilisé',
          type: 'logo_picker',
          required: false,
          options: ['Aucun', 'Odoo', 'SAP', 'Exact Online', 'Sage', 'Autre'],
          icons:   ['—', '🟣', '🔵', '🔵', '🟢', '⚙️'],
        },
        {
          // scale_3 : importance synchro stock temps réel
          id: 'Q8.03',
          label: 'Synchronisation des stocks en temps réel',
          type: 'scale_3',
          required: true,
          scale: {
            low:  'Pas nécessaire',
            mid:  'Souhaitable',
            high: 'Indispensable',
            lowIcon:  '—',
            midIcon:  '🔄',
            highIcon: '⚡',
          },
          hint: 'Mise à jour automatique des niveaux de stock sur votre plateforme e-commerce',
        },
        {
          // timeline_sel : urgence de lancement
          id: 'Q8.04',
          label: 'Date de lancement souhaitée',
          type: 'timeline_sel',
          required: true,
          options: ['< 1 mois', '1–3 mois', '3–6 mois', '> 6 mois'],
          icons:   ['🔥', '⚡', '📅', '🔮'],
          hint: 'Nous adapterons notre réponse à votre urgence',
        },
        {
          // slider : stock initial
          id: 'Q8.05',
          label: 'Volume de stock initial à transférer',
          type: 'slider',
          required: true,
          slider: { stops: ['< 5 palettes', '5–15 palettes', '15–30 palettes', '> 30 palettes'] },
        },
        {
          // slider : volume cible 6 mois
          id: 'Q8.06',
          label: 'Volume cible à 6 mois (commandes / mois)',
          type: 'slider',
          required: false,
          slider: { stops: ['< 100', '100–500', '500–1 000', '1 000–5 000', '> 5 000'] },
        },
        {
          // slider : volume cible 12 mois
          id: 'Q8.07',
          label: 'Volume cible à 12 mois (commandes / mois)',
          type: 'slider',
          required: false,
          slider: { stops: ['< 100', '100–500', '500–1 000', '1 000–5 000', '> 5 000'] },
        },
        {
          // radio_cards : croissance annuelle
          id: 'Q8.08',
          label: 'Croissance annuelle estimée de votre activité',
          type: 'radio_cards',
          required: false,
          options: ['Stable', '10–25%', '25–50%', '50–100%', '> 100%'],
          icons:   ['📊', '📈', '🚀', '🔥', '💥'],
        },
        {
          id: 'Q8.09',
          label: 'Prestataire logistique actuel',
          type: 'radio_cards',
          required: false,
          options: ['Aucun — gestion interne', 'Aucun — nouveau lancement', 'Oui — changement souhaité'],
          icons:   ['🏢', '🆕', '🔄'],
        },
        {
          // multi_select : raisons du changement (plusieurs possibles)
          id: 'Q8.10',
          label: 'Raison(s) du changement de prestataire',
          type: 'multi_select',
          required: false,
          options: ['Prix trop élevé', 'Qualité insuffisante', 'Manque de flexibilité', 'Problèmes IT / intégration', 'Capacité insuffisante', 'Autre'],
          icons:   ['💰', '⭐', '🔒', '🔌', '📦', '➕'],
          conditional: { fieldId: 'Q8.09', operator: 'eq', value: 'Oui — changement souhaité' },
        },
        {
          // textarea : commentaires libres
          id: 'Q8.11',
          label: 'Autres besoins ou informations complémentaires',
          type: 'textarea',
          required: false,
          hint: 'Partagez tout ce qui n\'a pas été couvert dans les questions précédentes',
        },
      ],
    },

  ],
}

export const TOTAL_SECTIONS = QUESTIONNAIRE_SCHEMA.sections.length   // 8
export const TOTAL_FIELDS = QUESTIONNAIRE_SCHEMA.sections.reduce(
  (acc, s) => acc + s.fields.length, 0
)

// Récapitulatif des types utilisés (pour documentation)
// toggle       : 5  (Q1.09, Q2.12, Q3.09, Q7.05, Q7.09)
// radio_cards  : 46
// icon_grid    : 2  (Q1.05, Q2.07)
// slider       : 16 (Q1.07, Q1.11, Q2.04, Q2.05, Q3.01, Q4.01, Q4.06, Q6.09, Q6.10, Q6.11, Q7.01, Q7.02, Q8.05, Q8.06, Q8.07 + 1)
// multi_select : 5  (Q3.06, Q4.11, Q5.09, Q6.01, Q8.10)
// price_range  : 4  (Q3.03, Q4.04, Q4.08, Q6 implicit)
// geo_split    : 1  (Q6.geo — remplace Q6.03→Q6.08)
// scale_3      : 3  (Q3.05, Q5.05, Q8.03)
// logo_picker  : 2  (Q4.10, Q8.02)
// textarea     : 1  (Q8.11)
// text/url     : 5  (Q1.01→Q1.04, Q1.06)
// timeline_sel : 1  (Q8.04)
