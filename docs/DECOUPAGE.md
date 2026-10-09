# UBA Tchad — Spot institutionnel « Voir plus grand »
## Dossier de pré-production : analyse, découpage synchro et direction artistique

| Paramètre | Valeur |
|---|---|
| Format | 1920 × 1080, 16:9, H.264 (CRF 16) + AAC 320 kb/s |
| Cadence | 30 i/s par défaut — rendu possible en 25 / 50 / 60 i/s sans retouche (montage écrit en secondes) |
| Durée totale | **51,0 s** (pré-roll 0,8 s + voix-off 46,4 s + pack-shot tenu ~4 s) |
| Voix-off | `public/audio/voix-off-uba-tchad.mp3` — 46,45 s, mono 44,1 kHz, posée à **00:00.80** |
| Habillage sonore | `public/audio/sound-design.mp3` — procédural, calé sur les mêmes repères, ~12 dB sous la VO |
| Moteur | Remotion 4 (React/TypeScript), rendu déterministe image par image |

> **Note de durée.** Le script fourni annonçait 00:00 → 01:00, mais l'enregistrement réel dure 46,45 s.
> Le montage suit l'audio réel (maître du temps) ; la durée cible « 50 à 60 s » est atteinte avec
> le pré-roll d'ouverture et un pack-shot final tenu 4 s.

---

## 1. Analyse du site de référence (ubachad.com)

Le site n'était pas joignable depuis l'environnement de production (DNS/proxy) : l'analyse s'appuie sur
l'indexation des pages publiques du site (moteur de recherche) et sur les sources de presse citées en
fin de document. **Les codes couleur exacts et la police propriétaire n'ont pas pu être relevés dans la
feuille de style** : ce sont des paramètres isolés (`src/theme.ts`, `src/fonts.ts`, `src/brand.ts`) à
recaler sur la charte officielle avant diffusion.

| Élément repéré | Contenu relevé | Traitement dans le film |
|---|---|---|
| **Logo / bloc-marque** | Lettres « UBA » en capitales, bloc rouge dominant ; signature « United Bank for Africa » | Bloc rouge + « UBA » blanc (substitut vectoriel), signature + « TCHAD ». Le logo officiel se branche via `BRAND.logo` |
| **Couleurs** | Rouge UBA (≈ `#E31720`, référence catalogue logo), blanc, noir/anthracite | Rouge = accents et lumière ; noir profond / anthracite = fonds ; blanc = UI et lisibilité |
| **Bouton d'ouverture de compte** | Parcours « Ouvrir un compte en ligne » : formulaire ≈ 4 minutes, rappel d'un conseiller, finalisation en agence | Écran « Ouvrir un compte » dans le smartphone + puce flottante « ≈ 4 minutes » ; CTA final « Ouvrir un compte » |
| **Léo, banquier virtuel** | Chatbot IA (WhatsApp, Messenger) : envoyer de l'argent, acheter du crédit, consulter son solde ; premier chatbot africain à permettre les paiements transfrontaliers (PAPSS) | Écran de chat « Léo · Banquier virtuel · en ligne », demande de transfert, confirmation instantanée, badge 24h/24 |
| **Cartes** | Cartes de débit et Visa prépayée rechargeable, acceptée dans plus de 200 pays | Carte rouge 3D (puce, sans contact, VISA) + carte noire, puces « Paiements sécurisés » et « Acceptée dans +200 pays » |
| **Comptes** | Compte courant, compte épargne | Deux panneaux de verre « Compte courant / Pour le quotidien » et « Compte épargne / Pour vos projets » |
| **Canaux digitaux** | Application UBA Mobile, Magic Banking `*919#` (USSD, tout opérateur), Internet Banking entreprises | Écran d'accueil de l'app + mention « Magic Banking *919# » |
| **Entreprises** | Banque des entreprises / Corporate Banking, financement | Skyline isométrique Entrepreneurs → PME → Grandes organisations, panneau « Corporate Banking » |
| **Positionnement groupe** | « Africa's global bank » — présence dans 20 pays africains + places financières internationales | Globe filaire reliant N'Djaména aux places du groupe ; signature « La banque globale de l'Afrique » |
| **Disposition des blocs** | Pages structurées en blocs (titre, accroche, liste d'avantages, CTA) | Grammaire reprise : sur-titre → titre fort → liste → CTA, en colonnes gauche (texte) / droite (objet 3D) |

**Typographies.** Police du site non vérifiable : le film utilise **Montserrat** (titrage, géométrique,
institutionnel) et **Inter** (interfaces), toutes deux sous licence OFL et embarquées dans `public/fonts/`.

---

## 2. Méthode de synchronisation

La voix-off est le **maître du temps**. `scripts/align_voiceover.py` aligne le texte connu sur le signal
(sans modèle de reconnaissance vocale) et produit `src/timeline/voiceover.json` :

1. **Groupes de souffle** — pauses ≥ 110 ms ; le seuil est choisi automatiquement pour obtenir exactement
   les 17 groupes du script. Frontières mesurées à ± 10 ms.
2. **Micro-pauses de ponctuation** (virgules, deux-points) — creux d'énergie le plus profond autour de la
   position attendue.
3. **Attaques sibilantes** — les mots commençant par /s z ʃ ʒ/ (« solutions », « sécurisées », « sommets »,
   « Tchad »…) sont calés sur le début mesuré de la friction (énergie > 3,5 kHz).
4. **Autres mots** — répartition syllabique entre ancres, aimantée sur le creux d'énergie le plus proche.

Contrôle qualité : débit vérifié groupe par groupe (5 à 7 syllabes/s). Ce contrôle a révélé que la voix
marque une **pause expressive après « osent »** (« …avec ceux qui osent | voir plus grand ») et non après
« construit » : le découpage a été corrigé en conséquence.

Chaque mot porte sa provenance (`anchor`) : **mesuré** (pause, ponctuation, sibilante — ± 10 à 30 ms) ou
**estimé** (± 80 à 150 ms). **Tous les temps forts visuels sont calés sur des mots mesurés.** Chaque
apparition de mot à l'écran anticipe de 80 ms (2–3 images) l'attaque sonore, ce que l'œil perçoit comme
parfaitement synchrone.

`src/timeline/cues.ts` lit ce fichier : changer de voix-off puis lancer `npm run align` resynchronise
tout le film sans toucher aux scènes.

---

## 3. Tableau de découpage synchro

Timecodes en **temps vidéo** (`mm:ss.cc`, VO décalée de +0,80 s). Image = n° de frame à 30 i/s.
Les mots en **gras** dans la colonne Animation sont les déclencheurs synchronisés.

### Séquence 1 — AMBITION (00:00.00 → 00:07.49)

| # | Timecode | Durée | Voix-off | Visuel associé | Animation (déclencheurs) | Transition |
|---|---|---|---|---|---|---|
| 0 | 00:00.00 → 00:00.85<br>img 0–25 | 0,85 s | *(silence — pré-roll)* | Noir anthracite, sol en perspective, point de lumière rouge au centre | Ouverture au noir (0,35 s) ; l'étincelle s'allume puis s'étire symétriquement en **ligne d'horizon rouge** (fil rouge du film) | Fondu depuis le noir |
| 1 | 00:00.85 → 00:02.52<br>img 26–76 | 1,67 s | « L'avenir se construit avec ceux qui osent » | Manifeste centré en deux lignes au-dessus de l'horizon | Révélation mot à mot (masque + défloutage) : **L'avenir** 0.85 · **se** 1.27 · **construit** 1.44 · **avec** 1.67 · **ceux** 2.12 · **qui** 2.26 · **osent** 2.38 | Travelling arrière continu (échelle 1,06 → 1) |
| 2 | 00:02.63 → 00:03.59<br>img 79–108 | 0,96 s | « voir plus grand. » | « voir plus » + **GRAND** monumental (236 px), halo rouge | **voir** 2.63 : le manifeste recule et s'atténue ; l'horizon **se cabre en courbe de croissance** (morph de Bézier) ; **grand** 3.16 : « GRAND » se pose (interlettrage qui s'ouvre, défloutage) | — |
| 3 | 00:04.03 → 00:06.84<br>img 121–205 | 2,81 s | « Et si la banque devenait enfin le reflet de vos ambitions ? » | Question en deux lignes, « ambitions ? » en rouge ; dalle de verre et **reflet miroir** du texte | **Et** 4.03 : « GRAND » s'évapore, la courbe s'atténue ; **reflet** 5.81 : la dalle de verre s'ouvre et le texte s'y reflète (symétrie exacte) ; **ambitions** 6.32 | **Match cut** 6.84 → 7.22 : texte aspiré vers le haut, la dalle glisse vers la gauche et cède la place au plateau isométrique |

### Séquence 2 — PARTICULIERS (00:06.69 → 00:18.62)

| # | Timecode | Durée | Voix-off | Visuel associé | Animation (déclencheurs) | Transition |
|---|---|---|---|---|---|---|
| 4 | 00:07.22 → 00:09.98<br>img 217–299 | 2,76 s | « Particuliers, familles, bâtisseurs du quotidien… » | Plateau isométrique, 3 dalles 3D alignées en diagonale, pictogrammes debout + libellés | Chaque dalle tombe et se pose sur son mot, liseré rouge, pictogramme tracé au trait : **Particuliers** 7.22 · **familles** 8.16 · **bâtisseurs** 8.96 | Panoramique caméra vers la droite (9.9 → 10.9) |
| 5 | 00:10.33 → 00:13.69<br>img 310–411 | 3,37 s | « UBA Tchad vous accompagne avec des solutions bancaires de proximité, » | Titrage gauche « UBA Tchad / vous accompagne » ; **bloc UBA rouge en volume** devant les dalles ; repère de localisation | **UBA** 10.33 : le bloc jaillit (ressort amorti) ; **accompagne** 11.13 : fils lumineux au sol du bloc vers chaque profil, flux animé ; **solutions** 12.21 : le repère tombe, ondes concentriques ; **proximité** 13.07 : puce « Solutions de proximité » | Le monde iso s'enfonce et se dissout (13.6 → 14.2) |
| 6 | 00:13.96 → 00:15.93<br>img 419–478 | 1,97 s | « des comptes adaptés à votre style de vie » | Titrage « des comptes adaptés / à votre style de vie » ; deux panneaux de verre en perspective : Compte courant, Compte épargne | **comptes** 14.14 : les panneaux pivotent depuis la droite (rotateY −38° → −14°), icônes tracées ; **style** 15.37 : liseré rouge lumineux + coches vertes « adapté » | Les panneaux filent vers la gauche avec flou |
| 7 | 00:16.04 → 00:18.07<br>img 481–542 | 2,04 s | « et des cartes sécurisées pour chaque instant. » | **Carte bancaire UBA rouge en 3D** (puce, sans contact, VISA) devant une carte noire ; titrage « des cartes sécurisées / pour chaque instant » | **cartes** 16.45 : la carte arrive des profondeurs en pivotant (75° → −16°) ; **sécurisées** 16.56 : reflet lumineux qui balaie la carte + puce « Paiements sécurisés » (bouclier tracé) ; **chaque** 17.54 : puce « Acceptée dans +200 pays » | **Zoom-through** 17.97 → 18.5 : la carte fonce vers la caméra avec flou de mouvement |

### Séquence 3 — BANQUE DIGITALE (00:18.02 → 00:31.94)

| # | Timecode | Durée | Voix-off | Visuel associé | Animation (déclencheurs) | Transition |
|---|---|---|---|---|---|---|
| 8 | 00:18.41 → 00:19.39<br>img 552–582 | 0,98 s | « Plus besoin d'attendre. » | « Plus besoin / d'attendre. » (104 px, rouge) ; anneau de chargement rouge à droite | **Plus** 18.41 ; **d'attendre** 19.02 : l'anneau qui tournait se referme d'un coup en cercle vert + coche — l'attente est abolie | L'anneau s'ouvre et laisse surgir le smartphone |
| 9 | 00:19.60 → 00:21.71<br>img 588–651 | 2,11 s | « Prenez le contrôle de votre argent du bout des doigts. » | **Smartphone 3D** (épaisseur réelle, reflet vitre), écran d'accueil de l'app : « Bienvenue », boutons « Ouvrir un compte » / « Se connecter », Magic Banking *919# | Le téléphone monte en vue isométrique (rotateX 56°, rotateZ −38°) puis se redresse en 3/4 ; **Prenez** 19.60 · **contrôle** 20.14 ; **bout** 21.16 : impact du doigt (onde) sur « Ouvrir un compte », bouton enfoncé | Push horizontal (style iOS) vers l'écran suivant |
| 10 | 00:22.00 → 00:24.07<br>img 660–722 | 2,07 s | « Ouvrez votre compte en ligne en quelques minutes, » | Écran « Ouvrir un compte » : barre d'étapes, champs Nom, Téléphone, Type de compte, Agence ; puce flottante « ≈ 4 minutes » | **Ouvrez** 22.00 : l'écran glisse ; saisie automatique champ par champ avec curseur rouge et coches ; **quelques** 23.32 : la puce horloge jaillit en Z (couche UI éclatée) ; fin de groupe : « Compte ouvert ! » (coche verte) | Push horizontal |
| 11a | 00:24.21 → 00:26.10<br>img 726–783 | 1,89 s | « consultez vos soldes en temps réel » | Tableau de bord : carte de solde rouge, actions rapides (Envoyer, Payer, Recharger, Léo), courbe d'activité, opérations | **consultez** 24.21 : le solde défile de 0 à 1 250 000 FCFA ; **soldes** 25.23 : la courbe d'activité se trace ; **temps** 25.55 : puce « Temps réel » + point vert pulsant | Push horizontal vers le chat |
| 11b | 00:26.15 → 00:28.05<br>img 785–842 | 1,90 s | « et laissez Léo, votre banquier virtuel, » | Écran de chat **Léo** (avatar, « Banquier virtuel · en ligne ») ; titrage « Léo, » 140 px rouge + « votre banquier virtuel » | **Léo** 26.43 : nom géant ; l'avatar cligne des yeux ; **banquier** 27.11 : premier message de Léo | — |
| 11c | 00:28.11 → 00:31.04<br>img 843–931 | 2,93 s | « simplifier vos paiements et transferts 24h/24. » | Bulles de conversation, indicateur de saisie, reçu de transfert ; badge flottant « 24h/24 · 7j/7 » | **simplifier** 28.11 : demande « Envoie 50 000 FCFA à Moussa » ; **paiements** 28.89 : Léo écrit… ; **transferts** 29.55 : « Transfert effectué ✓ » ; **24h/24** 29.87 : le badge horloge jaillit à 140 px en Z | **Match cut** 30.94 → 31.84 : le téléphone se rabat à plat en isométrie et se fond dans le sol où naissent les tours |

### Séquence 4 — CORPORATE (00:30.89 → 00:41.33)

| # | Timecode | Durée | Voix-off | Visuel associé | Animation (déclencheurs) | Transition |
|---|---|---|---|---|---|---|
| 12 | 00:31.39 → 00:33.97<br>img 942–1019 | 2,58 s | « Entrepreneurs, PME, grandes organisations : » | Skyline isométrique : 3 tours de verre anthracite à liseré rouge, hauteurs croissantes ; sur-titre « Entreprises & institutions » | Chaque tour s'élève sur son mot, pictogramme + libellé : **Entrepreneurs** 31.39 · **PME** 32.34 · **grandes** 32.97 | — |
| 13a | 00:34.25 → 00:36.70<br>img 1028–1101 | 2,45 s | « propulsez votre activité vers de nouveaux sommets » | Titrage « Propulsez / votre activité / vers de nouveaux sommets » ; **courbe de croissance rouge** partant du toit de la plus haute tour | **propulsez** 34.25 : panoramique, les tours grandissent (×1,45), la caméra s'élève ; la courbe se trace jusqu'au sommet ; **sommets** 36.19 : impact lumineux + ondes au sommet | — |
| 13b | 00:36.70 → 00:38.75<br>img 1101–1163 | 2,05 s | « grâce à notre expertise en Corporate Banking » | Sur-titre « Notre expertise » ; « Corporate / Banking » 118 px ; **panneau en verre dépoli réel** (flou d'arrière-plan des tours) : Gestion de trésorerie, Commerce international, Financements structurés | **expertise** 37.27 : la skyline s'assombrit, le panneau glisse depuis la droite ; **Corporate** 37.89 / **Banking** 38.33 : lignes de services en cascade, icônes tracées | — |
| 13c | 00:38.80 → 00:40.88<br>img 1164–1226 | 2,08 s | « et nos solutions de financement sur-mesure. » | Module « Financement » : curseurs Montant / Durée qui s'ajustent ; puce rouge « Sur-mesure » | **solutions** 39.03 : les curseurs se règlent (le financement s'ajuste) ; **sur-mesure** 40.29 : puce « ✓ Sur-mesure » | Tout se dissout ; le **fil rouge** renaît au centre et s'étire (40.83 → 41.30) |

### Séquence 5 — SIGNATURE & PACK-SHOT (00:40.78 → 00:51.00)

| # | Timecode | Durée | Voix-off | Visuel associé | Animation (déclencheurs) | Transition |
|---|---|---|---|---|---|---|
| 14 | 00:41.30 → 00:42.14<br>img 1239–1264 | 0,84 s | « UBA Tchad, » | **Bloc-marque UBA** au centre exact de l'écran | **UBA** 41.30 : le trait rouge se condense en bloc, les lettres montent ; **Tchad** 41.72 : la signature « United Bank for Africa — TCHAD » se dévoile tandis que le bloc glisse à gauche ; impact grave + carillon | — |
| 15 | 00:42.31 → 00:43.93<br>img 1269–1318 | 1,62 s | « la banque globale de l'Afrique. » | « La banque **globale** de l'Afrique » ; **globe filaire** en rotation lente | **la** 42.31 : signature verbale mot à mot ; **banque** 42.50 : le globe apparaît ; liaisons rouges depuis N'Djaména vers Lagos, Dakar, Abidjan, Kinshasa, Nairobi, Londres, Paris, Dubaï, New York ; l'Afrique passe face caméra sur **l'Afrique** 43.37 | — |
| 16 | 00:44.20 → 00:47.06<br>img 1326–1412 | 2,86 s | « Rejoignez-nous dès aujourd'hui sur ubachad.com. » | « Rejoignez-nous dès aujourd'hui » ; bouton rouge **Ouvrir un compte →** ; barre d'adresse | **Rejoignez-nous** 44.20 : le bouton apparaît (pulsation lumineuse) ; 45.4 : la barre d'adresse s'ouvre ; **ubachad.com** 46.02 : l'URL se tape lettre à lettre | — |
| 17 | 00:47.06 → 00:51.00<br>img 1412–1530 | 3,94 s | *(silence — pack-shot)* | Pack-shot complet : logo, signature, globe, CTA | 47.36 : reflet lumineux qui balaie la signature ; respiration lente de l'ensemble (×1,03) ; habillage sonore résolu sur l'accord final | Fondu au noir 50.30 → 51.00 |

---

## 4. Direction artistique

| Domaine | Choix |
|---|---|
| Palette | Rouge UBA `#E31720` (accents, lumière), rouge profond `#A80F16` (dégradés), noir `#060607`, anthracite `#16181C`, graphite `#1F2228`, blanc pur `#FFFFFF` (UI) |
| Lumière | Un halo rouge unique suit l'action d'une scène à l'autre (keyframes interpolés : aucun saut de lumière aux raccords), contre-jour froid très discret, vignettage, grain fixe anti-banding |
| Typographie | Montserrat 600–800 pour le titrage (interlettrage serré −0,025 em), Inter 400–700 pour les interfaces ; révélations mot à mot par masque |
| Glassmorphism | Verre dépoli réel (`backdrop-filter: blur(28px) saturate(140%)`) sur les calques 2D ; verre simulé (dégradés + liseré + reflet spéculaire) dans les espaces 3D, où le flou d'arrière-plan serait aplati |
| Fausse 3D isométrique | Projection orthographique `rotateX(58°) rotateZ(−42°)` ; volumes à faces réelles ; `isoProject()` reproduit la matrice CSS pour accrocher libellés et courbes au pixel près |
| Courbes d'animation | Entrées `cubic-bezier(0.16, 1, 0.3, 1)` (attaque franche, atterrissage long) ; sorties `(0.7, 0, 0.84, 0)` ; caméra `(0.65, 0, 0.35, 1)` ; ressorts sans rebond (amortissement 200) sauf le bloc UBA (léger rebond) |
| Transitions | Raccords « invisibles » : dalle de verre → plateau iso, carte → zoom-through, anneau → smartphone, smartphone à plat → sol des tours, fil rouge → bloc-marque |
| Son | Nappe par séquence (ré add9 → si m7 → sol maj7 → la sus → ré majeur), ducking automatique sous la voix, pulsation grave à 100 BPM sur les séquences digitale et corporate, whooshes de transition, ticks d'interface, impact + carillon sur le logo |

---

## 5. Points à valider avant diffusion

1. **Logo officiel UBA** (SVG fond transparent) → `public/brand/`, puis `BRAND.logo` dans `src/brand.ts`.
2. **Avatar officiel de Léo** → `BRAND.leoAvatar`.
3. **Couleur exacte et police propriétaire** de la charte UBA → `src/theme.ts` / `src/fonts.ts`.
4. **Mentions produit** issues du site public, à faire confirmer par UBA Tchad : « ≈ 4 minutes » (formulaire
   en ligne), « Acceptée dans +200 pays » (Visa prépayée), « Magic Banking *919# », libellés des services
   Corporate (catégories génériques).
5. **Données d'interface fictives** : titulaire « A. MAHAMAT », « Amina », « Moussa », solde 1 250 000 FCFA,
   montants de financement — purement illustratifs.
6. **Musique** : l'habillage procédural peut être remplacé par une musique sous licence au même chemin
   (`public/audio/sound-design.mp3`).

---

## Sources

- [Ouvrir un compte en ligne — UBA Tchad](https://www.ubachad.com/home/ouvrir-compte-en-ligne/)
- [Banque digitale — UBA Tchad](https://www.ubachad.com/digital-banking/)
- [Nos produits digitaux — UBA Tchad](https://www.ubachad.com/nos-produits-digitaux/)
- [Cartes prépayées — UBA Tchad](https://www.ubachad.com/personal-banking/cards/prepaid-cards/)
- [Cartes de débit — UBA Tchad](https://www.ubachad.com/cards/debit-card/)
- [Compte courant — UBA Tchad](https://www.ubachad.com/current-account/)
- [Compte épargne — UBA Tchad](https://ubachad.com/personal-banking/savings-account)
- [Léo devient le premier chatbot d'Afrique à permettre les paiements transfrontaliers — UBA Tchad](https://www.ubachad.com/leo-devient-le-premier-chatbot-dafrique-a-permettre-les-paiements-transfrontaliers/)
- [À propos de nous — UBA Tchad](https://www.ubachad.com/about-us/)
- [Customer Service Week 2024 : UBA Tchad — Tchadinfos](https://tchadinfos.com/2024/10/13/customer-service-week-2024-uba-tchad-place-le-client-au-coeur-de-tout-et-reaffirme-son-engagement-a-sameliorer-constamment/)
- [United Bank for Africa Plc Logo — WhatTheLogo](https://whatthelogo.com/logo/united-bank-for-africa-plc/110196) (référence couleur indicative)
