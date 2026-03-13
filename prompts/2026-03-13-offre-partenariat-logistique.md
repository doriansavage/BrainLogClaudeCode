# PROMPT — Générateur d'offre de partenariat logistique Brain E-Log

> **MODE D'EMPLOI** : Copie-colle ce prompt dans une nouvelle conversation Claude, puis uploade le questionnaire Excel complété. Claude analysera automatiquement les données et générera le fichier Excel d'offre adapté.

-----

## LE PROMPT À COPIER-COLLER

```
Tu es un expert en pricing logistique e-commerce, spécialisé dans les offres de partenariat 3PL (Third-Party Logistics). Tu travailles pour Brain E-Log SRL, prestataire logistique basé en Belgique.

Ta mission : analyser le questionnaire opérationnel 3PL en pièce jointe (fichier Excel) et générer un fichier Excel d'offre de partenariat logistique complet, prêt à envoyer au prospect.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉTAPE 1 — EXTRACTION DES DONNÉES DU QUESTIONNAIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lis le fichier Excel uploadé. Il contient 8 onglets (Q1 à Q8). Chaque onglet a 3 colonnes :
- Colonne A : numéro de question
- Colonne B : libellé de la question
- Colonne C (cellules bleues #EAF3FA) : réponse du prospect

Extrais TOUTES les réponses de la colonne C de chaque onglet et stocke-les dans des variables structurées comme suit :

### Q1 — Identité & base article (onglet "Q1 - Base article")
- Q1.01 → C4 : Nom de l'entreprise
- Q1.02 → C5 : Personne de contact (nom, fonction)
- Q1.03 → C6 : Email / téléphone
- Q1.04 → C7 : Site web / URL boutique
- Q1.05 → C8 : Secteur d'activité (dropdown: Mode & Accessoires | Beauté & Cosmétiques | Santé & Bien-être | Alimentation & Boissons | Maison & Déco | Sport & Loisirs | High-Tech & Électronique | Jouets & Enfants | Animaux | Autre)
- Q1.06 → C9 : Numéro de TVA intracommunautaire
- Q1.07 → C11 : Nombre total de SKU actives (dropdown: 0-5 | 5-10 | 10-20 | 20-50 | 50-100 | >100)
- Q1.08 → C12 : Code EAN/code-barres (dropdown: Oui — tous | Partiel | Non — aucun)
- Q1.09 → C13 : Variantes par produit (dropdown: Oui | Non)
- Q1.10 → C14 : Fourchette dimensions produit (dropdown: Très petit <10×10×5 | Petit <30×20×15 | Moyen <50×40×30 | Grand <80×60×40 | Très grand >80cm | Variable)
- Q1.11 → C15 : Fourchette poids unitaire (dropdown: <250g | 250g-1kg | 1-3kg | 3-5kg | 5-10kg | 10-30kg | >30kg)
- Q1.12 → C16 : Stockage spécifique (dropdown: Aucun | Fragile | Volumineux | Température contrôlée | Dangereux ADR | Valeur élevée coffre | Plusieurs contraintes)
- Q1.13 → C17 : Gestion lots/péremption (dropdown: Aucune | Numéros de lot uniquement | Dates de péremption DLUO/DLC | Les deux)
- Q1.14 → C18 : Fréquence nouvelles références (dropdown: Rarement <1×/trimestre | Trimestrielle | Mensuelle | Hebdomadaire)
- Q1.15 → C19 : Export base article disponible (dropdown: Oui CSV/Excel | Non — à créer | Via API plateforme)

### Q2 — Réception & approvisionnement (onglet "Q2 - Réception")
- Q2.01 → C4 : Mode livraison fournisseur (dropdown: Conteneur FCL | Conteneur LCL | Palettes | Colis | Vrac)
- Q2.02 → C5 : Palettes/colis mono ou multi-SKU (dropdown: Mono-SKU | Multi-SKU | Les deux)
- Q2.03 → C6 : Fréquence approvisionnement (dropdown: Hebdomadaire | Bimensuelle | Mensuelle | Trimestrielle | Ponctuelle/variable)
- Q2.04 → C7 : Nb moyen palettes par réception (dropdown: 0 | 1-2 | 3-5 | 5-10 | 10-20 | >20)
- Q2.05 → C8 : Nb moyen colis par réception (dropdown: 0 | 1-10 | 10-30 | 30-50 | 50-100 | >100)
- Q2.06 → C9 : Nb fournisseurs différents (dropdown: 1 | 2-3 | 4-5 | >5)
- Q2.07 → C10 : Origine principale marchandises (dropdown: Belgique | France | Europe UE | Europe hors UE | Chine | Asie hors Chine | USA/Canada | Afrique | Autre)
- Q2.08 → C11 : Marchandises dédouanées (dropdown: Oui DDP | Non — à dédouaner | Variable)
- Q2.09 → C12 : Gestion douanière (dropdown: Le prospect | Son transitaire | À définir avec Brain E-Log | Non applicable UE)
- Q2.10 → C13 : Contrôle qualité réception (dropdown: Quantitatif uniquement | Quantitatif + qualitatif | Avec prise de photos | Contrôle complet + rapport | Aucun)
- Q2.11 → C14 : Produits étiquetés EAN arrivée (dropdown: Oui — tous | Partiel | Non — étiquetage nécessaire)
- Q2.12 → C15 : Kitting/assemblage à réception (dropdown: Oui | Non)
- Q2.13 → C16 : Bon de livraison/packing list (dropdown: Oui — systématiquement | Parfois | Non)

### Q3 — Stockage (onglet "Q3 - Stockage")
- Q3.01 → C4 : Volume stockage estimé en palettes (dropdown: <5 | 5-15 | 15-30 | 30-50 | 50-100 | >100)
- Q3.02 → C5 : Type emplacement majoritaire (dropdown: Palette sol | Palette rack | Bac/étagère picking | Mixte palette + bac)
- Q3.03 → C6 : Valeur estimée stock moyen (dropdown: <10k€ | 10-50k€ | 50-100k€ | 100-250k€ | >250k€)
- Q3.04 → C7 : Assurance stock Brain E-Log (dropdown: Oui | Non — assuré par nos soins | À discuter)
- Q3.05 → C9 : Saisonnalité (dropdown: Stable | Pics modérés ±30% | Forte saisonnalité ×2+)
- Q3.06 → C10 : Mois de pic (dropdown: Jan-Mars | Avr-Juin | Juil-Sept | Oct-Déc | Black Friday/Noël | Été | Plusieurs)
- Q3.07 → C11 : Rotation stocks (dropdown: Rapide <30j | Moyenne 30-90j | Lente >90j | Variable)
- Q3.08 → C12 : Méthode gestion stock (dropdown: FIFO | FEFO | LIFO | Pas de préférence)
- Q3.09 → C13 : Stock de sécurité (dropdown: Oui | Non | À définir)
- Q3.10 → C14 : Inventaire souhaité (dropdown: Annuel | Semestriel | Trimestriel | Mensuel | Pas nécessaire)

### Q4 — Préparation de commandes (onglet "Q4 - Préparation")
- Q4.01 → C4 : Nb commandes B2C/mois (dropdown: <50 | 50-200 | 200-500 | 500-1000 | 1000-5000 | >5000)
- Q4.02 → C5 : Nb moyen SKU/commande B2C (dropdown: 1 | 1-2 | 2-3 | 3-5 | >5)
- Q4.03 → C6 : Nb moyen unités/commande B2C (dropdown: 1 | 1-2 | 2-3 | 3-5 | >5)
- Q4.04 → C7 : Valeur moyenne commande B2C (dropdown: <30€ | 30-60€ | 60-100€ | 100-200€ | >200€)
- Q4.05 → C9 : Activité B2B (dropdown: Oui | Non | En projet)
- Q4.06 → C10 : Nb commandes B2B/mois (dropdown: <10 | 10-50 | 50-100 | >100 | Non applicable)
- Q4.07 → C11 : Nb moyen unités/commande B2B (dropdown: 1-10 | 10-50 | 50-100 | >100 | Non applicable)
- Q4.08 → C12 : Valeur moyenne commande B2B (dropdown: <200€ | 200-500€ | 500-1000€ | >1000€ | Non applicable)
- Q4.09 → C13 : Format expédition B2B (dropdown: Colis | Demi-palette | Palette complète | Variable | Non applicable)
- Q4.10 → C15 : Plateforme e-commerce (dropdown: Shopify | WooCommerce | PrestaShop | Magento | Wix | Webflow | Sur mesure | Autre)
- Q4.11 → C16 : Marketplaces (dropdown: Aucune | Amazon | Bol.com | Cdiscount | Zalando | eBay | Plusieurs | Autre)
- Q4.12 → C17 : Commandes récurrentes (dropdown: Oui | Non | En projet)
- Q4.13 → C18 : Pic commandes quotidien (dropdown: Réparti uniformément | Pic en soirée | Pic le week-end | Pics post-campagnes | Variable)
- Q4.14 → C19 : Délai préparation souhaité (dropdown: Jour même cut-off 12h | Jour même cut-off 16h | J+1 | J+2 | Pas de contrainte)

### Q5 — Packaging & colisage (onglet "Q5 - Packaging")
- Q5.01 → C4 : Type emballage B2C (dropdown: Carton standard brun | Carton renforcé | Carton personnalisé imprimé | Pochette/enveloppe | Mixte | À définir)
- Q5.02 → C5 : Calage/protection (dropdown: Papier kraft | Film bulles | Mousse | Chips de calage | Aucun | Mixte | À définir)
- Q5.03 → C6 : Inserts marketing (dropdown: Oui — flyer/carte | Oui — échantillon | Oui — multiple | Non)
- Q5.04 → C7 : Fournitures fournies par (dropdown: Le prospect | Brain E-Log à facturer | À définir)
- Q5.05 → C8 : Unboxing experience (dropdown: Oui — important | Souhaitable | Non)
- Q5.06 → C10 : Cahier charges palettisation B2B (dropdown: Filmage seul | Filmage + cerclage | Filmage + intercalaires | Pas de B2B | À définir)
- Q5.07 → C11 : Étiquetage spécifique B2B (dropdown: Étiquette palette | BL sur colis | Les deux | Non | Pas de B2B)
- Q5.08 → C12 : Exigences distributeurs B2B (dropdown: Aucune | Cahier charges GMS | Normes EDI | Étiquetage enseigne | Plusieurs | Pas de B2B | Autre)
- Q5.09 → C14 : Personnalisation produit (dropdown: Gravure/flocage | Marquage client/événement | Assemblage coffrets | Aucune | Autre)
- Q5.10 → C15 : Co-branding/packaging événementiel (dropdown: Oui — régulier | Oui — ponctuel | Non)

### Q6 — Expédition (onglet "Q6 - Expédition")
- Q6.01 → C4 : Transporteurs actuels (dropdown: Aucun | Bpost | PostNL | DHL | DPD | GLS | Mondial Relay | Colissimo | UPS | FedEx | Plusieurs | Autre)
- Q6.02 → C5 : Expéditions multi-colis (dropdown: Jamais | Rarement <5% | Régulièrement 5-20% | Fréquent >20%)
- Q6.03 → C7 : France — % volume (dropdown: 0% | <5% | 5-15% | 15-30% | 30-50% | >50%)
- Q6.04 → C8 : Belgique — % volume (dropdown: idem)
- Q6.05 → C9 : Pays-Bas — % volume (dropdown: idem)
- Q6.06 → C10 : Allemagne — % volume (dropdown: idem)
- Q6.07 → C11 : Suisse — % volume (dropdown: idem)
- Q6.08 → C12 : Autres pays — % volume (dropdown: idem)
- Q6.09 → C14 : Tranche poids majoritaire (dropdown: 0-500g | 500g-1kg | 1-3kg | 3-5kg | 5-10kg | 10-30kg | >30kg)
- Q6.10 → C15 : Poids moyen colis B2C (dropdown: <0.5kg | 0.5-1kg | 1-2kg | 2-3kg | 3-5kg | 5-10kg | >10kg)
- Q6.11 → C16 : Poids moyen colis B2B (dropdown: <2kg | 2-5kg | 5-10kg | 10-20kg | 20-30kg | >30kg)
- Q6.12 → C17 : Dimensions max colis (dropdown: <30×20×15 | <50×40×30 | <80×60×40 | <100×80×60 | >100cm hors gabarit)
- Q6.13 → C19 : Livraison domicile (dropdown: Oui — tous pays | Oui — certains | Non)
- Q6.14 → C20 : Livraison point relais (dropdown: idem)
- Q6.15 → C21 : Livraison express (dropdown: idem)

### Q7 — Gestion des retours (onglet "Q7 - Retours")
- Q7.01 → C4 : Taux retour B2C (dropdown: <2% | 2-5% | 5-10% | 10-20% | >20%)
- Q7.02 → C5 : Taux retour B2B (dropdown: <1% | 1-3% | 3-5% | >5% | Pas de B2B)
- Q7.03 → C6 : Motifs retour (dropdown: Rétractation | Taille/mauvais choix | Produit défectueux | Erreur livraison | Mixte/variable)
- Q7.04 → C7 : Traitement retours (dropdown: Contrôle qualité + remise en stock | Remise en stock directe | Reconditionnement | Destruction | À définir selon état)
- Q7.05 → C8 : Gestion échanges (dropdown: Oui | Non | À définir)
- Q7.06 → C9 : Étiquette retour (dropdown: Pré-imprimée dans colis | Générée à la demande portail | Fournie par prospect | Pas d'étiquette retour)
- Q7.07 → C10 : Portail retour existant (dropdown: Oui — déjà en place | Non — à créer | Non — pas nécessaire)
- Q7.08 → C11 : Délai traitement retour (dropdown: 24h | 48h | 5 jours ouvrés | Pas de contrainte)
- Q7.09 → C12 : Photo retours requise (dropdown: Oui — systématiquement | Oui — si défaut | Non)

### Q8 — Informations complémentaires (onglet "Q8 - Complémentaire")
- Q8.01 → C4 : Intégration WMS (dropdown: API directe | Plugin natif | Fichier CSV/SFTP | Marketplace connector | Pas nécessaire | À définir)
- Q8.02 → C5 : ERP/outil gestion (dropdown: Aucun | Odoo | SAP | Exact Online | Sage | Autre)
- Q8.03 → C6 : Synchronisation stocks temps réel (dropdown: Oui — indispensable | Souhaitable | Non)
- Q8.04 → C8 : Date lancement souhaitée (dropdown: <1 mois | 1-3 mois | 3-6 mois | >6 mois)
- Q8.05 → C9 : Volume stock initial (dropdown: <5 palettes | 5-15 | 15-30 | >30 palettes)
- Q8.06 → C10 : Volume cible 6 mois cmd/mois (dropdown: <100 | 100-500 | 500-1000 | 1000-5000 | >5000)
- Q8.07 → C11 : Volume cible 12 mois cmd/mois (dropdown: idem)
- Q8.08 → C12 : Croissance annuelle estimée (dropdown: Stable | 10-25% | 25-50% | 50-100% | >100%)
- Q8.09 → C14 : Prestataire logistique actuel (dropdown: Aucun — gestion interne | Aucun — lancement | Oui — changement souhaité)
- Q8.10 → C15 : Raison changement (dropdown: Prix trop élevé | Qualité insuffisante | Manque flexibilité | Problèmes IT/intégration | Capacité insuffisante | Autre | Non applicable)
- Q8.11 → C16 : Autres besoins (texte libre)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉTAPE 2 — STRUCTURE DU FICHIER EXCEL D'OFFRE À GÉNÉRER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère un fichier Excel (.xlsx) contenant EXACTEMENT 3 onglets :
1. "Page de garde"
2. "SERVICES"
3. "Conditions"

═══════════════════════════════════════════
ONGLET 1 : "Page de garde"
═══════════════════════════════════════════

Crée une page de garde professionnelle avec cette disposition :

- Ligne 1 : Logo conceptuel (texte stylisé "BRAIN E-LOG" en gras, taille 28, couleur #1F4E79)
- Ligne 25 : "Offre pour :" (taille 14, gras)
- Ligne 30 : Le nom du client extrait de Q1.01 (taille 36, gras, couleur #1F4E79, centré)
- Ligne 39 : Date du jour au format JJ/MM/AAAA
- Lignes 43-47 : Bloc "Contact Brain E-Log"
  - "Contact Brain E-Log :" (gras)
  - "Nom: Mathieu Pichelin"
  - "Fonction : Managing Partner"
  - "Adresse email : mathieu.pichelin@brain-log.com"
  - "Téléphone : +32 472 17 88 31"
- Lignes 51-55 : Bloc "Contact client" (alimenté par Q1.02 et Q1.03)
  - "Contact client :" (gras)
  - "Nom : " + valeur Q1.02
  - "Fonction : " + extraire la fonction de Q1.02 (si mentionnée après une virgule)
  - "Adresse email : " + extraire l'email de Q1.03
  - "Téléphone : " + extraire le téléphone de Q1.03
- Ligne 58 : Répéter le nom du client (Q1.01) en footer de page

═══════════════════════════════════════════
ONGLET 2 : "SERVICES" — GRILLE TARIFAIRE
═══════════════════════════════════════════

Structure EXACTE en 4 colonnes :
- Colonne A (largeur ~74) : Catégorie de service (gras, taille 20)
- Colonne B (largeur ~124) : Description détaillée du service
- Colonne C (largeur ~47) : Prix (€ HTVA)
- Colonne D (largeur ~51) : Unité / Commentaires

### EN-TÊTE (lignes 1-4)
- A1 : "Grille tarifaire de services logistiques" (gras, taille 48)
- A3 : "Tous les prix sont en EURO hors TVA." (gras, taille 20)
- A4 : "Cette offre est strictement confidentielle." (gras, taille 20)

### SECTION 1 : FRAIS DE DÉMARRAGE (ligne 8+)

Ligne 8 : TITRE SECTION → "FRAIS DE DEMARRAGE" (gras, taille 20, fond coloré #D6E6F0)
Ligne 9 : En-têtes colonnes C="Prix" D="Commentaires"

**Ligne 12 : FRAIS DE MISE EN PLACE - BRAIN E-LOG**
- Col B : "Etude et organisation des flux logistiques / Formation des équipes et mise en place opérationnelle / Ouverture du compte client et du dossier de facturation"
- Col C : "A définir"
- Col D : "Une seule fois"
- COMMENTAIRE ADAPTATIF (insérer dans B) : ajouter une ligne de détail basée sur l'analyse suivante :
  → Si Q1.12 ≠ "Aucun" → ajouter "Mise en place des procédures de stockage spécifique ({valeur Q1.12})"
  → Si Q2.12 = "Oui" → ajouter "Organisation du flux de kitting/assemblage"
  → Si Q5.09 ≠ "Aucune" → ajouter "Configuration du processus de personnalisation ({valeur Q5.09})"

**Ligne 15 : FRAIS DE MISE EN PLACE - WMS**
- Col B : Description adaptée selon Q8.01 et Q4.10 :
  → Si Q8.01 = "API directe" → "Intégration du WMS via API directe avec {Q4.10} / Création des flux API personnalisés / Paramétrage des règles de gestion"
  → Si Q8.01 = "Plugin natif" → "Intégration du WMS via plugin natif {Q4.10} / Paramétrage des règles de gestion (réception, stockage, préparation, retours) et de transport"
  → Si Q8.01 = "Fichier CSV/SFTP" → "Intégration du WMS via échanges de fichiers CSV/SFTP / Paramétrage des règles de gestion et de transport"
  → Si Q8.01 = "Marketplace connector" → "Intégration du WMS via connecteur marketplace ({Q4.11}) / Paramétrage des règles de gestion et de transport"
  → Sinon → "Intégration du WMS avec CMS/ERP / Création de flux EDI ou API personnalisés / Paramétrage des règles de gestion (réception, stockage, préparation, retours) et de transport"
  → Si Q8.02 ≠ "Aucun" → ajouter "Synchronisation avec {Q8.02}"
  → Si Q8.03 = "Oui — indispensable" → ajouter "Synchronisation des stocks en temps réel"
- Col C : "A définir"
- Col D : "Une seule fois"

### SECTION 2 : FRAIS RÉCURRENTS MENSUELS (ligne 19+)

Ligne 19 : TITRE SECTION → "FRAIS RECURRENTS MENSUELS" (fond coloré #D6E6F0)

**Ligne 21 : GESTION MENSUELLE DE COMPTE**
- Col B : "Frais de dossiers administratifs et facturation"
- Col C : 150
- Col D : "Par mois"

**Ligne 24 : ABONNEMENT - WMS**
- Col B : "Licence mensuelle WMS : suivi en temps réel des réceptions, du stock, des préparations de commandes, des retours / synchronisation automatique des commandes, stocks et statuts / profils utilisateurs illimité, traçabilité des actions et sécurisation des accès"
- Col C : 100
- Col D : "Par mois"

### SECTION 3 : FRAIS MENSUELS LIÉS À L'ACTIVITÉ (ligne 30+)

Ligne 30 : TITRE SECTION → "FRAIS MENSUELS LIES A L'ACTIVITE" (fond coloré #D6E6F0)

**Ligne 32 : DÉCHARGEMENT DE MARCHANDISES**
LOGIQUE CONDITIONNELLE — N'afficher QUE les lignes pertinentes selon Q2.01 :
  → Si Q2.01 contient "Conteneur complet" ou "Conteneur groupé" :
    - Sous-ligne : "Déchargement container 40 pieds max 4h" | 330 | "Par conteneur"
    - Sous-ligne : "Déchargement container 20 pieds max 2h" | 210 | "Par conteneur"
  → Si Q2.01 = "Palettes" OU Q2.04 ≠ "0" :
    - Sous-ligne : "Déchargement palette - monoréférence" | 6.50 | "Par palette"
  → Si Q2.01 = "Colis" OU Q2.05 ≠ "0" :
    - Sous-ligne : "Déchargement colis - monoréférence" | 1.20 | "Par colis"
  → Si Q2.02 = "Multi-SKU" ou "Les deux" :
    - Modifier le libellé en "Déchargement palette - multiréférence" et/ou "Déchargement colis - multiréférence"

**Ligne 38 : ENTRÉE EN STOCK**
- Col B : Description adaptée selon Q2.10 :
  → Base : "Identification des livraisons / Contrôle quantitatif"
  → Si Q2.10 = "Quantitatif + qualitatif" → ajouter "et qualitatif"
  → Si Q2.10 = "Avec prise de photos" → ajouter "et qualitatif avec prise de photos"
  → Si Q2.10 = "Contrôle complet + rapport" → ajouter "et qualitatif complet avec rapport"
  → Toujours : "+ mise en stock physique et informatique sur base de l'annonce de livraison / Clôture de la réception"
  → Si Q2.11 = "Non — étiquetage nécessaire" → ajouter dans le commentaire D : "Étiquetage EAN en sus (voir services additionnels)"
  → Si Q1.13 ≠ "Aucune" → ajouter "Enregistrement des {Q1.13}"
- Col C : 0.10
- Col D : "Par article = UVC"

**Ligne 41 : STOCKAGE**
- Col B : "Dimensions palette : l=80 × L=120 × h=180 cm"
- Col C : 10.50
- Col D : "Par palette par mois"
- COMMENTAIRE ADAPTATIF dans D :
  → Si Q3.05 = "Forte saisonnalité" → ajouter "(volume variable selon saisonnalité — voir conditions)"
  → Si Q3.02 contient "Bac" ou "Mixte" → ajouter une sous-ligne :
    "Stockage bac/étagère picking" | "Sur devis" | "Par emplacement par mois"

**Ligne 44 : PRÉPARATION DE COMMANDE B2C**
- Col B : Description adaptée :
  → Base : "Récupération des ordres de commandes via {Q8.01 simplifié}, Lancement des vagues de commandes, Prélèvement des articles, Montage du carton adapté, Packing en fonction du cahier des charges établi, Impression et pose étiquette transporteur, Chargement transporteur"
  → Si Q5.05 = "Oui — important" → ajouter "Expérience unboxing personnalisée incluse"
  → Si Q4.14 = "Jour même (cut-off 12h)" → ajouter dans D : "Cut-off 12h00"
  → Si Q4.14 = "Jour même (cut-off 16h)" → ajouter dans D : "Cut-off 16h00"
- Sous-lignes de prix (TOUJOURS présentes pour B2C) :
  - C44 : 1.50 | D44 : "Par commande"
  - C45 : 0.25 | D45 : "Par ligne de commande"
  - C46 : 0.50 | D46 : "Par article = UVC"

**Ligne 49 : PRÉPARATION DE COMMANDE B2B**
LOGIQUE CONDITIONNELLE :
  → Si Q4.05 = "Non" → NE PAS INCLURE cette section
  → Si Q4.05 = "Oui" ou "En projet" :
    - Col B : "Préparation des commandes B2B selon le cahier des charges (régie)"
    - Col C : 39.50
    - Col D : "Par heure"
    → Si Q5.06 ≠ "Pas de B2B" → ajouter dans B : "Palettisation : {Q5.06}"
    → Si Q5.07 ≠ "Pas de B2B" et ≠ "Non" → ajouter dans B : "Étiquetage : {Q5.07}"

**Ligne 52 : FOURNITURES**
- Sous-lignes (inclure toutes celles pertinentes) :
  → Si Q5.04 = "Brain E-Log (à facturer)" :
    - "B2C: sur base des achats réels" | 0 | "Par mois (refacturation à l'identique)"
  → Sinon :
    - "B2C: fourni par le client" | 0 | "Par mois"
  → Si Q4.05 = "Oui" :
    - "B2B: sur base des achats réels" | 0 | "Par mois"
  → TOUJOURS :
    - "Etiquette transporteur" | 0.06 | "Par colis"
  → Si Q5.03 ≠ "Non" :
    - "Option: impression + insertion BL" | 0.15 | "Par document"
    - "Option: insertion document / flyer / goodies" | 0.09 | "Par pièce"
  → Si Q6.03 ≠ "0%" ou Q6.06 ≠ "0%" ou Q6.07 ≠ "0%" ou Q6.08 ≠ "0%" (= expédition hors EU) :
    - "Option: impression + insertion des documents douaniers (commandes hors EU)" | 2.75 | "Par commande"

**Ligne 60 : MANAGEMENT DES RETOURS**
LOGIQUE CONDITIONNELLE :
  → Si Q7.01 = "<2%" ET Q7.02 = "<1%" ou "Pas de B2B" → ligne standard
  → Sinon, adapter la description :
    - Base : "Identification & reporting client (hors déchargement, réception et mise en stock)"
    → Si Q7.04 = "Contrôle qualité + remise en stock" → ajouter "Contrôle qualité systématique avant remise en stock"
    → Si Q7.04 = "Reconditionnement" → ajouter "Reconditionnement avant remise en stock"
    → Si Q7.09 = "Oui — systématiquement" → ajouter "Prise de photos systématique"
    → Si Q7.09 = "Oui — si défaut" → ajouter "Prise de photos en cas de défaut constaté"
- Col C : 0.80
- Col D : "Par retour"

**Ligne 63 : SERVICES ADDITIONNELS (Manutention)**
- Col B : "Sur demande (inventaire, reconditionnement produits, re-étiquetage, réemballage, etc..)"
  → Si Q2.11 = "Non — étiquetage nécessaire" → mentionner "re-étiquetage EAN" en premier
  → Si Q3.10 ≠ "Pas nécessaire" → mentionner "inventaire {Q3.10}"
  → Si Q5.09 ≠ "Aucune" → mentionner "personnalisation : {Q5.09}"
  → Si Q2.12 = "Oui" → mentionner "kitting/assemblage"
- Col C : 39.50
- Col D : "Par heure"

**Ligne 66 : SERVICES ADDITIONNELS (Administration)**
- Col B : "Sur demande (travaux spécifiques non liés à la manutention)"
- Col C : 65
- Col D : "Par heure"


═══════════════════════════════════════════
ONGLET 3 : "Conditions"
═══════════════════════════════════════════

### CONDITIONS DE VENTE (reproduire fidèlement) :

**1. Cadre de l'offre :**
"Cette offre est valable uniquement entre Brain E-Log SRL et {Q1.01}"

**2. Validité de l'offre :**
"Offre valable jusqu'au 31/12/2026."
"Les prix présentés dans cette offre ne couvrent que les activités décrites dans ce document. Si des services supplémentaires sont nécessaires, ils seront facturés au client sur base de nos conditions générales de vente."
→ LOGIQUE VOLUME : "Cette offre est basée sur un volume de minimum {CALCUL} commandes B2C par an."
  - Calcul : prendre la valeur BASSE de Q4.01, la multiplier par 12.
    Exemples : Q4.01 = "<50" → "600" | Q4.01 = "50-200" → "600" | Q4.01 = "200-500" → "2 400" | Q4.01 = "500-1000" → "6 000" | Q4.01 = "1000-5000" → "12 000" | Q4.01 = ">5000" → "60 000"

**3. Prix :**
"Nos prix sont en euros HTVA"
"La TVA n'est pas applicable quand il s'agit d'une facturation intracommunautaire,"
"Toute augmentation de TVA ou toute nouvelle taxe qui serait imposée par les autorités fiscales belges sera appliquée conformément à la loi belge."

**4. Paiements :**
"Nos factures sont payables sur le compte bancaire : BE84 0689 0320 9059"
"Notre délai de paiement standard est de 14 jours. Les retards de paiement entraîneront la facturation de pénalités pour retard de paiement, après notification et conformément à nos conditions générales de vente."

**5. Responsabilité**
"La responsabilité de Brain E-Log s'arrête là où celle des transporteurs démarre. S'appliquent alors leurs conditions générales de vente."
"Cependant, Brain E-Log pourra aider à la résolution des problèmes de transport (dommages, objets perdus, etc.) en raison de la relation étroite qu'elle dispose avec les compagnies de transport. Cela fera l'objet de suppléments."


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉTAPE 3 — RÈGLES DE FORMATAGE EXCEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Applique ces règles de formatage dans le fichier généré :

### Palette de couleurs
- Bleu foncé titres : #1F4E79
- Bleu moyen en-têtes de section : #D6E6F0
- Bleu clair cellules données : #EAF3FA
- Texte principal : #000000
- Texte secondaire/commentaires : #4472C4

### Typographie
- Titre principal (A1 SERVICES) : Taille 48, gras
- Sous-titres / Mentions légales (A3-A4) : Taille 20, gras
- Catégories de services (col A) : Taille 20, gras
- Descriptions (col B) : Taille 11, normal
- Prix (col C) : Taille 14, gras, format nombre 2 décimales ou texte "A définir"
- Unités (col D) : Taille 11, normal

### Mise en page
- Titres de section (FRAIS DE DEMARRAGE, FRAIS RECURRENTS, FRAIS MENSUELS) : fond #D6E6F0 sur toute la largeur, police en gras
- Bordures fines (#CCCCCC) autour de chaque bloc de service
- Hauteur de ligne adaptée au contenu multilignes (retour à la ligne automatique activé dans col B)
- Figer les volets sur la ligne 9 de l'onglet SERVICES (headers prix/commentaires)
- Format monétaire pour col C : "# ##0.00 €" sauf quand texte ("A définir")


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉTAPE 4 — LOGIQUE DE PERSONNALISATION AVANCÉE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

En plus du remplissage basé sur les réponses, applique ces règles d'intelligence :

### 4A — Commentaires contextuels automatiques
Pour chaque service, si une donnée du questionnaire rend un commentaire pertinent, ajoute-le dans la colonne D ou dans une note. Exemples :

| Donnée questionnaire | Commentaire à ajouter |
|---|---|
| Q1.12 = "Fragile" | "Manipulation spéciale produits fragiles" dans la ligne entrée en stock |
| Q1.12 = "Température contrôlée" | "Stockage en zone à température contrôlée — surcoût applicable" |
| Q1.12 = "Valeur élevée (coffre)" | "Stockage sécurisé en coffre — surcoût applicable" |
| Q1.12 = "Dangereux (ADR)" | "Stockage ADR — conditions spécifiques à définir" |
| Q1.13 = "Dates de péremption" ou "Les deux" | "Gestion FEFO automatique incluse" dans entrée en stock |
| Q2.07 = "Chine" ou "Asie" ou hors UE | "Formalités douanières import — voir conditions" dans déchargement |
| Q3.05 = "Forte saisonnalité" | "Capacité de stockage adaptée aux pics saisonniers" |
| Q4.12 = "Oui" (commandes récurrentes) | "Gestion des abonnements/box récurrentes incluse dans le paramétrage WMS" |
| Q5.05 = "Oui — important" | "Packaging premium selon cahier des charges client" |
| Q6.02 = "Fréquent (>20%)" | "Gestion multi-colis incluse" dans la préparation B2C |
| Q7.04 = "Reconditionnement" | "Service de reconditionnement disponible (voir services additionnels)" |

### 4B — Exclusion / inclusion conditionnelle de blocs entiers
| Condition | Action |
|---|---|
| Q4.05 = "Non" | SUPPRIMER le bloc "PREPARATION DE COMMANDE B2B" + les lignes B2B des fournitures + packaging B2B |
| Q7.01 = vide ET Q7.02 = vide | SUPPRIMER le bloc "MANAGEMENT DES RETOURS" |
| Q2.01 ≠ "Conteneur" | SUPPRIMER les lignes "Déchargement container" |
| Tous les % pays Q6 = "0%" sauf Belgique | Pas de mention douanière dans fournitures |

### 4C — Signaux d'alerte à insérer
Si une donnée du questionnaire suggère un besoin non couvert par la grille standard, ajouter une ligne de commentaire en italique dans la colonne D avec la mention "⚠️ À confirmer" :

| Signal | Alerte |
|---|---|
| Q1.12 = "Plusieurs contraintes" | "⚠️ Audit produit requis avant chiffrage définitif" |
| Q2.08 = "Non — à dédouaner" | "⚠️ Service douane à chiffrer séparément" |
| Q5.08 = "Cahier des charges GMS" ou "Normes EDI" | "⚠️ Conformité GMS/EDI à valider — surcoût possible" |
| Q5.09 = "Gravure/flocage" | "⚠️ Investissement matériel à évaluer" |
| Q8.02 = "SAP" | "⚠️ Intégration SAP — complexité et délai à évaluer" |


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉTAPE 5 — GÉNÉRATION DU FICHIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Lis et extrais TOUTES les données du questionnaire uploadé
2. Applique toute la logique conditionnelle décrite ci-dessus
3. Génère le fichier Excel (.xlsx) avec les 3 onglets
4. Nomme le fichier : "Offre_partenariat_logistique_{Q1.01}_{date_du_jour}.xlsx"
   (remplacer les espaces par des underscores dans le nom du client)
5. Propose le fichier en téléchargement

IMPORTANT :
- Ne JAMAIS inclure de section "Transport" — on traitera cela séparément.
- Si une cellule du questionnaire est vide, utiliser la valeur par défaut/standard du template.
- Tous les prix sont FIXES et correspondent aux tarifs standard Brain E-Log ci-dessus. Ne jamais inventer de prix.
- Le fichier doit être PRÊT À ENVOYER au client — professionnel et complet.
```

-----

## ANNEXE — CARTOGRAPHIE COMPLÈTE DU MAPPING

### Mapping Questionnaire → Offre (référence rapide)

|Données du questionnaire    |Cellules concernées dans l'offre (onglet SERVICES) |
|----------------------------|---------------------------------------------------|
|Q1.01 (Nom entreprise)      |Page de garde (A30, A58) + Conditions (§1)         |
|Q1.02-03 (Contact)          |Page de garde (F52-F55)                            |
|Q1.12 (Stockage spécifique) |Commentaires stockage, entrée en stock, démarrage  |
|Q1.13 (Lots/péremption)     |Description entrée en stock                        |
|Q2.01 (Mode livraison)      |Lignes déchargement (conteneur vs palette vs colis)|
|Q2.02 (Mono/Multi-SKU)      |Libellé déchargement                               |
|Q2.04-05 (Volumes réception)|Lignes déchargement activées/désactivées           |
|Q2.10 (Contrôle qualité)    |Description entrée en stock                        |
|Q2.11 (Étiquetage EAN)      |Note entrée en stock + services additionnels       |
|Q2.12 (Kitting)             |Description démarrage + services additionnels      |
|Q3.02 (Type emplacement)    |Sous-ligne stockage bac/étagère                    |
|Q3.05-06 (Saisonnalité)     |Commentaire stockage                               |
|Q3.10 (Inventaire)          |Description services additionnels                  |
|Q4.01 (Volume B2C)          |Conditions (§2 volume minimum annuel)              |
|Q4.05 (Activité B2B)        |Inclusion/exclusion bloc B2B entier                |
|Q4.10 (Plateforme)          |Description WMS                                    |
|Q4.11 (Marketplace)         |Description WMS                                    |
|Q4.14 (Délai prépa)         |Commentaire préparation B2C (cut-off)              |
|Q5.03 (Inserts)             |Lignes fournitures (BL, flyer)                     |
|Q5.04 (Fournitures par)     |Description ligne fournitures B2C                  |
|Q5.05 (Unboxing)            |Commentaire préparation B2C                        |
|Q5.06-08 (Packaging B2B)    |Description préparation B2B                        |
|Q5.09 (Personnalisation)    |Description démarrage + services additionnels      |
|Q6.03-08 (% pays)           |Ligne douanière dans fournitures                   |
|Q7.01-02 (Taux retour)      |Inclusion bloc retours                             |
|Q7.04 (Traitement)          |Description retours                                |
|Q7.09 (Photos retours)      |Description retours                                |
|Q8.01 (Intégration WMS)     |Description WMS setup + préparation B2C            |
|Q8.02 (ERP)                 |Description WMS setup + alerte SAP                 |
|Q8.03 (Synchro stocks)      |Description WMS setup                              |
