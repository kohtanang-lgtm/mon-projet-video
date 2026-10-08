# Spot Motion Design — Département de Communication (FALSH · Université de Ngaoundéré)

**Phase 1 : concept créatif, script voix off validé, storyboard technique**
Statut : **en attente de votre validation** (aucun code d'animation ne sera écrit avant votre feu vert).

---

## 0. En bref : ce qui change par rapport au brief

| Sujet | Brief | Proposition | Pourquoi |
|---|---|---|---|
| Durée | 25 s | **30 s** (master 16:9 + 9:16) | Le script d'origine compte environ 100 mots. Lu sur un ton « posé, très articulé », il dure entre 40 et 45 s. Le hook seul (32 mots en 6 s) demanderait 5,3 mots/s, soit le double d'un débit institutionnel. Le format 30 s est le standard du spot publicitaire, et la version proposée (60 mots) laisse la place aux pauses demandées. |
| Script | Texte intégral | Texte resserré et corrigé (détail en §2) | Garder un message par phrase, corriger trois tournures et laisser respirer l'animation. |
| Texte écran | 3 blocs | Mêmes textes, redistribués selon la voix | Le texte à l'écran tombe au moment où la voix porte le même sujet. |
| Framework | HyperFrames / Remotion | **HyperFrames** (v0.8.141, Apache-2.0, vérifié sur npm) | HTML, CSS et GSAP : typographie native (Syne/Inter), masques SVG, rendu image par image à 60 fps. Un seul code sert les deux formats. Node 22 et FFmpeg sont déjà disponibles dans l'environnement. |

> Si vous tenez au texte intégral, il faut passer à **45 s** (version longue corrigée en §2.4).
> Si **25 s** est imposé par un créneau de diffusion, je retire « des amphis au Média Lab » et « à Dang » (ils restent écrits à l'écran), je superpose le compteur et la carte, et je réduis le plan final à 1 s.

---

## 1. Concept créatif : « LA PRISE DE PAROLE »

### 1.1 L'idée

Le logo du Département contient déjà toute une grammaire de la communication : **des guillemets** (la parole), **une bulle** (le dialogue), **des ondes** (la diffusion), **trois points** (« quelqu'un écrit… »), **un mortier** (l'académique) et **un livre** (le savoir).

**Le film est une prise de parole.** Il s'ouvre sur un guillemet ouvrant “ et se ferme sur le guillemet fermant ” du logo. Entre les deux, chaque motif graphique rencontré par le spectateur est une pièce du logo. À la fin, toutes les pièces convergent pour former la marque. Le spectateur comprend sans qu'on le lui dise que ce département maîtrise son image de bout en bout.

**Fil narratif :** *Avant l'antenne* (noir de studio, point REC) → *On diffuse* (les ondes) → *On forme* (amphi → Média Lab) → *On transmet* (le secret, le parcours) → *On rayonne* (Ngaoundéré → +10 000) → *La lumière* (fond blanc, logo, « votre histoire commence ici »).

### 1.2 Les 5 motifs : système visuel (chaque forme a une fonction)

| Motif | Origine dans le logo | Rôles successifs dans le film |
|---|---|---|
| **Le Point** • | Les « … » du C, le voyant REC | Ouvre le film (REC) → devient le guillemet → centre de la jauge 100 % → épingle sur Ngaoundéré → les 3 points du logo |
| **L'Onde** ))) | Arcs du « C » + ondes jaunes | Propagation du signal (hook) → jauge circulaire → wipe radial de transition → rayonnement de la communauté (+10 000) |
| **Les Guillemets** “ ” | Guillemets noirs du logo | Serre-livres du film : “ à 0:01, ” au logo final |
| **Le Losange** ◆ | Plateau du mortier vu de dessus | Transition « excellence » (S2→S3) → masques d'images inclinés à −12° (triptyque) → mortier posé sur MASTER puis sur le logo |
| **Le Trait** — | Contour de la bulle | Soulignement des labels → barrure de « NAISSENT » → trajectoire Licence → Master → route vers Ngaoundéré → dessine la bulle du logo |

Règle : **aucun élément n'entre « pour meubler »**. Tout élément visible est un de ces 5 motifs, un texte, une image ou le logo.

### 1.3 Palette et rôles (vérifiée sur le logo fourni)

| Token | Hex | Rôle (règle stricte) |
|---|---|---|
| `studio` | `#0D1117` | Fond principal : le plateau « avant l'antenne » |
| `vert-institution` | `#006837` | Aplats pleins, champs de couleur (logo mesuré : `#006C30` ✔) |
| `vert-signal` | `#00A859` | Traits, guillemets, accents sur fond sombre |
| `jaune-onde` | `#FFD100` | Ondes, chiffres-clés, **1 mot d'emphase max par scène** |
| `rouge-rec` | `#E31E24` | **Uniquement** le point REC / l'épingle (« en direct, action ») |
| `gris-ellipse` | `#9C9C9C` | Labels secondaires, inactifs (mesuré sur l'ellipse du logo) |
| `blanc-papier` | `#F7F7F5` | Fond du plan final (le logo officiel contient du noir et du gris) |

Note : le jaune du logo DC est plus citron (≈ `#FCF000`) que `#FFD100`. Je garde `#FFD100`, comme dans le brief, parce qu'il fait le lien avec l'or du logo FALSH. Le logo officiel n'est jamais recoloré.

Ratio : environ 70 % sombre/vert, 20 % blanc, 10 % accents.

### 1.4 Typographie

| Usage | Police | 16:9 | 9:16 | Réglages |
|---|---|---|---|---|
| Titres chocs | Syne Bold | 168 px | 120 px | Capitales, tracking −2 %, interligne 0,92, 3 mots max/ligne |
| Chiffres | Syne Bold | 220–280 px | 200 px | Chiffres tabulaires (pas de saut de largeur au défilement) |
| Labels / chapitres | Inter Regular | 22 px | 30 px | Capitales, tracking +20 %, blanc 70 % |
| Lower-thirds | Inter Regular | 28 px | 34 px | Sur barre `vert-institution` |

Mise en page : grille de 12 colonnes, marges de 120 px (16:9) et de 80 px (9:16), baseline de 8 px. Un **« bug » de chapitre** en haut à gauche change d'une scène à l'autre (roulement vertical) : UNIVERSITÉ DE NGAOUNDÉRÉ · FALSH → EXCELLENCE ACADÉMIQUE → NOTRE MÉTHODE → NOUS REJOINDRE.

### 1.5 Langage de mouvement (tokens d'easing)

| Token | Courbe | Usage |
|---|---|---|
| `signal-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Reveals, masques, entrées de texte |
| `glide` | `cubic-bezier(0.76, 0, 0.24, 1)` | Transitions, mouvements de caméra |
| `press` | `cubic-bezier(0.7, 0, 0.84, 0)` | Sorties rapides, chutes |
| `land` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Poses avec overshoot subtil (≤ 6 %) : chiffres, pièces du logo |
| `tassel` | Ressort amorti (2–3 oscillations) | Gland du mortier uniquement |

**Grille rythmique :** musique à 120 BPM, soit **1 temps = 0,5 s = 30 images @ 60 fps** et 1 mesure = 2 s. Les coupes et impacts tombent sur cette grille, mais la **voix off reste prioritaire** : un reveal anticipe le mot de 2 à 4 images.

Règles :
- Pas de simple fondu : le seul fondu du film est la rangée de logos d'endossement.
- Tout ce qui entre a une sortie chorégraphiée.
- Au maximum 2 points d'attention en mouvement simultanés.
- Une seule secousse de caméra, réservée à l'apparition du nom.

### 1.6 Caméra virtuelle et texture

- La scène est une « caméra » virtuelle composée de 3 couches de parallaxe : fond ×0,3, plan médian ×0,6, premier plan ×1,0.
- Une légère poussée continue (1,00 → 1,04 par scène) évite tout plan mort, sauf le plan final, qui est fixe.
- Un grain fin (3 %) et un léger vignettage s'appliquent aux graphismes **et** aux images, pour les souder.
- Les B-rolls passent toutes par une seule LUT : ombres vert-bleu, hautes lumières chaudes, saturation −15 %.

---

## 2. Script voix off : version validée (30 s)

### 2.1 Corrections apportées au texte d'origine

| Passage d'origine | Problème | Décision |
|---|---|---|
| « Chaque année. » | Fragment isolé, sens peu clair | Retiré |
| « Pas une théorie dans le vide. » | Redondant avec « 100 % pratique » | Retiré (porté par l'image amphi → Média Lab) |
| « 100 % d'immersion pratique » + « des amphis » | Affirmation forte, en apparente tension avec « amphis » | **Conservé, à confirmer** (sinon : « La théorie en amphi. La pratique en studio. ») |
| « Bienvenue au Département de Communication » (hook) | Allonge le hook | Remplacé par un **silence** pendant lequel le nom s'écrit à l'écran (pause stratégique). Le nom est prononcé en signature. |
| « …qui savent **la** communication entre de bonnes mains » | Construction incorrecte | Corrigé en « …qui savent **leur** communication… » (version longue) ; en 30 s, l'idée passe par le texte écran DES TALENTS PRÊTS POUR LE MARCHÉ |
| « Tout est réuni pour impacter. » | « Impacter » sans complément est un anglicisme critiqué, peu adapté au registre institutionnel | Retiré (version longue : « pour faire la différence ») |
| « Votre avenir mérite l'excellence. » | Formule générique, et « excellence » est déjà le chapitre de S2 | Retiré : la signature respire mieux |
| « Licence Pro Journalisme Numérique » | Votre fiche indique « Journalisme & **Culture** Numérique » | **Intitulé officiel à confirmer** |

### 2.2 Script final 30 s (60 mots), calé à l'image

| Timecode | Voix off | Intention / direction de jeu | Texte écran |
|---|---|---|---|
| 00:00.50 – 04.30 | « À l'Université de Ngaoundéré, un département fait parler de lui. » | Assurance, une pointe de malice sur « fait parler de lui ». Appui : *Ngaoundéré*, *parler* | UNIVERSITÉ DE NGAOUNDÉRÉ · FALSH / UN DÉPARTEMENT / FAIT PARLER / DE LUI. |
| 00:04.30 – 06.00 | *(silence voix — impact musical)* | — | • • • → DÉPARTEMENT DE COMMUNICATION |
| 00:06.10 – 08.90 | « Cent pour cent d'immersion pratique, des amphis au Média Lab. » | Affirmatif, rythmique. Appui : *cent pour cent*, *Média Lab* | 100 % IMMERSION PRATIQUE / AMPHI \| MÉDIA LAB & STUDIOS |
| 00:09.30 – 11.90 | « Les professionnels de demain ne naissent pas : ils se forment. » | Micro-pause après « pas ». Descendre sur « forment » : c'est une vérité, pas une question | NE ~~NAISSENT~~ PAS / ILS SE FORMENT. / DES TALENTS PRÊTS POUR LE MARCHÉ |
| 00:12.70 – 13.40 | « Notre secret ? » | Confidentiel : plus près du micro, presque murmuré, suivi de 0,6 s de silence | NOTRE SECRET ? |
| 00:14.00 – 15.70 | « Des enseignants-chercheurs qualifiés, » | Reprise d'énergie sur le « drop » musical | 01 · ENSEIGNANTS-CHERCHEURS / JOURNALISME NUMÉRIQUE |
| 00:15.90 – 17.00 | « un matériel de pointe, » | Énumération montante | 02 · MATÉRIEL DE POINTE / PRODUCTION AUDIOVISUELLE |
| 00:17.20 – 18.70 | « un suivi personnalisé, » | | 03 · SUIVI PERSONNALISÉ / STRATÉGIE DIGITALE |
| 00:18.90 – 20.60 | « de la Licence Pro jusqu'au Master. » | Conclusif sur « Master » | LICENCE PRO → MASTER |
| 00:21.20 – 23.20 | « Rejoignez-nous à Dang, à Ngaoundéré. » | Invitation chaleureuse, on entend le sourire | CAMPUS DE DANG — NGAOUNDÉRÉ |
| 00:23.20 – 24.60 | *(silence voix)* | — | +10 000 ABONNÉS |
| 00:24.80 – 26.60 | « Département de Communication : » | Autorité, posé, chaque syllabe articulée | (construction du logo) |
| 00:27.00 – 28.60 | « votre histoire commence ici. » | Chaleur, léger ralenti, « ici » posé et tenu | VOTRE HISTOIRE COMMENCE ICI. |
| 00:28.60 – 30.00 | *(signature sonore)* | — | Logo + UN · FALSH |

Le débit moyen est de 2 mots/s, avec 3 silences voulus (nom, secret, compteur). Les timecodes définitifs seront **recalés sur l'enregistrement réel** : toute l'animation est pilotée par un fichier de repères (`config/timeline.json`), donc recaler revient à changer des nombres, pas des animations.

### 2.3 Fiche de casting et d'enregistrement de la voix off

- **Voix** : grave et chaleureuse (baryton ou alto), 30 à 50 ans, débit maîtrisé, sourire audible sur les invitations. Je recommande **une voix professionnelle camerounaise francophone**. Elle est plus authentique pour ce public et prononce correctement les noms locaux.
- **Prononciations à valider par le département avant la séance** : *Ngaoundéré* (N'ga-oun-dé-ré), *Dang*, *Média Lab*.
- **Livraison** : WAV 48 kHz / 24 bits, mono, voix sèche (sans musique ni effet), crête ≤ −1 dBTP, 2 prises par phrase avec des intentions différentes, phrases séparées par 1 s de blanc.
- **Mix final** : −14 LUFS intégré pour le web (YouTube, Facebook, LinkedIn), musique en *ducking* d'environ −12 dB sous la voix. Pour un usage télévisé, une version à −23 LUFS (EBU R128) est possible.

### 2.4 Version longue (≈ 45 s), si vous préférez garder tout le texte

> « À l'Université de Ngaoundéré, un département fait parler de lui. Cent pour cent d'immersion pratique : pas de théorie dans le vide. Des amphis au Média Lab, bienvenue au Département de Communication. Ici, les professionnels de demain ne naissent pas : ils se forment. Des étudiants aguerris, et des partenaires rassurés qui savent leur communication entre de bonnes mains. Notre secret ? Des enseignants-chercheurs qualifiés, un matériel de pointe et un suivi personnalisé, de la Licence Pro Journalisme et Culture numérique jusqu'au Master. Tout est réuni pour faire la différence. Rejoignez-nous à Dang, à Ngaoundéré. Votre avenir mérite l'excellence. Département de Communication : votre histoire commence ici. »

---

## 3. Storyboard technique (master 16:9 · 1920×1080 · 60 fps · 30 s = 1 800 images)

Vue d'ensemble :

| # | Scène | Timecode | Images | Durée |
|---|---|---|---|---|
| S1 | Le Signal (hook) | 00:00.00 – 06.00 | 0 – 359 | 6,0 s |
| S2 | La Pratique (preuve / valeur) | 00:06.00 – 12.50 | 360 – 749 | 6,5 s |
| S3 | Le Secret (différenciation) | 00:12.50 – 21.00 | 750 – 1259 | 8,5 s |
| S4 | Le Rendez-vous (CTA + preuve sociale) | 00:21.00 – 24.60 | 1260 – 1475 | 3,6 s |
| S5 | La Signature (logo + promesse) | 00:24.60 – 30.00 | 1476 – 1799 | 5,4 s |

Structure musicale : intro texturée (0–5 s) → groove (5–12,9 s) → coupure filtrée sur « Notre secret ? » → **drop à 14,00 s** (début de la mesure 8) → montée (21–25 s) → résolution sur « ici » → queue de réverbération.

---

### S1 — « LE SIGNAL » (hook)

| Élément | Détail |
|---|---|
| **Timecode / Durée** | 00:00.00 → 00:06.00 · 6,0 s · images 0–359 · 3 mesures |
| **Message** | Créer l'intrigue et identifier l'émetteur : une université, une faculté, un département dont on parle. |
| **Visuel** | **1a (0,00–0,80)** Fond `studio` granuleux. Un point rouge (Ø 28 px) s'allume au centre et clignote une fois comme un voyant REC. Trois arcs jaunes (géométrie du « C ») se propagent depuis le point.<br>**1b (0,50–4,30)** Le point s'étire et devient un guillemet ouvrant “ `vert-signal`, fidèle à la forme de ceux du logo, qui glisse en haut à gauche et y reste comme ancre. Un trait trace la ligne de base du label. Le titre se compose sur trois lignes, « DE LUI. » en jaune.<br>**1c (4,30–6,00)** Silence de la voix. Le titre sort par le haut. Trois points « • • • » clignotent comme un indicateur de saisie (« quelqu'un va parler »). Sur l'impact de 5,00 s, un aplat `vert-institution` envahit l'écran par un wipe radial depuis les points, et le nom s'écrit. |
| **Texte écran** | UNIVERSITÉ DE NGAOUNDÉRÉ · FALSH (label)<br>UN DÉPARTEMENT / FAIT PARLER / DE LUI.<br>DÉPARTEMENT DE / COMMUNICATION |
| **Animation** | Point : scale 0 → 1,15 → 1 (`land`, 18 im.), extinction de 2 images à l'image 24 (clignement REC).<br>Arcs : tracé du contour 0 → 100 %, scale 0,6 → 1,6, opacité 1 → 0, décalage de 6 im. entre arcs (`signal-out`, 40 im.).<br>Morphing point → “ : morph de tracé SVG (`glide`, 20 im.), puis translation vers l'ancre (36 im.) avec rotation −4° → 0°.<br>Titre : masque de bas en haut par ligne (`signal-out`, 28 im., décalage de 5 im.), calé sur les syllabes toniques (dé-**PAR**-te-ment, **PAR**-ler, **LUI**).<br>« • • • » : apparition sur des croches (15 im. d'intervalle), léger rebond.<br>Wipe : `clip-path: circle(0 → 150 %)` (`glide`, 30 im.).<br>Nom : lettres en glissement vertical, 1 im. d'écart par lettre (`signal-out`, 24 im.). |
| **Transition → S2** | Le nom se comprime horizontalement jusqu'à un point jaune (`press`, 14 im.). L'aplat vert se referme en iris dans ce point. Le point devient le centre de la jauge de S2 (raccord par la forme). |
| **Son / SFX** | 0,00 : sub-drop discret et bip REC (1 kHz, 40 ms). Arcs : trois *pings* filtrés décroissants. Morphing : micro-whoosh aigu. Titre : aucun effet, la voix porte. « • • • » : trois clics d'interface. **5,00 s : impact (kick et « tambour d'appel », voir §4) et entrée du groove.** Musique : nappe d'intro et pulsation filtrée. |
| **Caméra** | Poussée continue 1,00 → 1,04 (`glide`). Parallaxe : guillemet ×1,15, titre ×1,0, fond ×0,3. Unique secousse du film à 5,00 s (4 px, 6 im.), réservée au nom. |
| **Direction artistique** | Plateau noir « avant l'antenne ». Une seule couleur vive à la fois (rouge → jaune → vert). Titre Syne Bold 168 px aligné sur la colonne 2. |
| **Justification** | Le spot s'ouvre comme une prise d'antenne : le point REC dit « on enregistre », l'onde « on diffuse », le guillemet « on prend la parole ». En 6 s, on sait qui parle. Le nom arrive pendant un silence de la voix : c'est la pause stratégique, et l'image la plus mémorisable du hook. |
| **Adaptation 9:16** | Titre sur 4 lignes à 120 px, bloc centré entre y 520 et y 1300. Guillemet sous la zone d'interface (y ≥ 280). Nom sur 2 lignes à 96 px. |

---

### S2 — « LA PRATIQUE » (proposition de valeur)

| Élément | Détail |
|---|---|
| **Timecode / Durée** | 00:06.00 → 00:12.50 · 6,5 s · images 360–749 |
| **Message** | Ici, on apprend en faisant. Les diplômés sont prêts pour le marché (pour les étudiants **et** pour les employeurs et partenaires). |
| **Visuel** | **2a (6,00–7,50)** Le point jaune devient le centre d'une jauge circulaire. Un arc se trace de 0 à 360° pendant qu'un compteur passe de 0 à 100. Label IMMERSION PRATIQUE. Le chapitre devient EXCELLENCE ACADÉMIQUE.<br>**2b (7,50–9,30)** La jauge devient un masque circulaire qui s'ouvre sur la B-roll « amphi ». Le trait vert descend et coupe l'écran en deux : AMPHI à gauche (étalonnage plus froid), MÉDIA LAB à droite (caméra, studio, étalonnage chaud). Côté droit, un viseur de caméra (4 coins, REC rouge, timecode qui défile) cadre l'image. Puis le panneau droit pousse le gauche hors champ : on entre dans le Média Lab.<br>**2c (9,30–12,50)** Retour sur fond studio. Le label LES PROFESSIONNELS DE DEMAIN, puis « NE NAISSENT PAS ». Le trait vient **barrer « NAISSENT »** sur l'accent de la voix. Ensuite « ILS SE FORMENT. » se construit lettre par lettre : les lettres « se forment » littéralement. Un lower-third suit. |
| **Texte écran** | 100 % · IMMERSION PRATIQUE<br>AMPHI \| MÉDIA LAB & STUDIOS<br>NE ~~NAISSENT~~ PAS / ILS SE FORMENT.<br>DES TALENTS PRÊTS POUR LE MARCHÉ (lower-third) |
| **Animation** | Jauge : tracé 0 → 100 % en 84 im. (courbe qui ralentit sur les 10 derniers %). Le compteur suit la même courbe, en chiffres tabulaires. À 100 : `land` (scale 1 → 1,06 → 1, 14 im.) et flash blanc de l'arc pendant 2 im.<br>Iris : `circle()` du diamètre de la jauge jusqu'au plein cadre (`glide`, 30 im.).<br>Split : trait scaleY 0 → 1 (`signal-out`, 18 im.), panneaux en glissement opposé (24 im.), image intérieure en parallaxe à 0,5×.<br>Viseur : les coins se rétractent vers le sujet (`land`, 16 im.), REC clignote à 1 Hz.<br>Barrure : scaleX 0 → 1 (`press`, 12 im.), le mot passe à 40 % d'opacité.<br>« ILS SE FORMENT. » : chaque lettre arrive en deux demi-blocs (haut et bas) qui se rejoignent, 2 im. d'écart, `land`.<br>Lower-third : barre en wipe (18 im.), texte qui monte 6 im. après. |
| **Transition → S3** | Le trait de barrure pivote de 0° à −24° et devient l'arête du **losange du mortier**. Ce losange (aplat `vert-institution`, transformation 2D par skew, sans 3D) s'agrandit jusqu'à couvrir l'écran (`glide`, 30 im.). On passe de « l'école » à « l'excellence ». |
| **Son / SFX** | Jauge : clics d'interface qui accélèrent et montent en hauteur, puis impact sec à 100. Split : whoosh court et claquement de clap. Viseur : bip REC. Barrure : trait de feutre. Lettres : micro-impacts mats. Musique : groove complet (kick et percussions organiques), première montée. |
| **Caméra** | Pan latéral de 40 px (gauche → droite) pendant le split, pour accompagner le passage de l'amphi au Média Lab. Poussée 1,00 → 1,03 sur 2c. |
| **Direction artistique** | Jaune réservé au « 100 ». Rouge réservé au REC. Toutes les B-rolls passent par la LUT commune et reçoivent le grain des graphismes. |
| **Justification** | La preuve vient avant la promesse : un chiffre, puis le chemin en images (amphi → studio), puis la phrase-manifeste. La barrure rend visible la figure rhétorique « ne naissent pas : ils se forment ». Le lower-third parle aux partenaires sans allonger la voix. |
| **Adaptation 9:16** | Split horizontal (amphi en haut, Média Lab en bas). Jauge de Ø 560 px. « ILS SE / FORMENT. » sur 2 lignes à 128 px. Lower-third au-dessus de y 1480. |

---

### S3 — « LE SECRET » (éléments différenciants)

| Élément | Détail |
|---|---|
| **Timecode / Durée** | 00:12.50 → 00:21.00 · 8,5 s · images 750–1259 |
| **Message** | Ce qui fait la différence : l'encadrement, l'équipement, le suivi, et un parcours complet de la Licence Pro au Master. |
| **Visuel** | **3a (12,50–14,00)** Sur l'aplat vert : « NOTRE SECRET ? » en petit (64 px) au centre, entouré par le **contour de bulle du logo**, qui se dessine. Le « ? » est en jaune. Le chapitre devient NOTRE MÉTHODE.<br>**3b (14,00–18,90)** La caméra plonge **dans la bulle**. Un triptyque apparaît : trois panneaux-losanges (parallélogrammes inclinés à −12°, la géométrie du mortier), chacun servant de masque à une B-roll.<br>• 01 : enseignant(e) guidant des étudiants en salle de rédaction<br>• 02 : gros plan sur caméra, console et micro<br>• 03 : échange en tête-à-tête devant un tableau de statistiques des réseaux sociaux<br>Chaque panneau entre sur sa phrase de voix off. Le panneau actif est plein, les autres reculent (scale 0,94, luminosité −40 %).<br>**3c (18,90–21,00)** Les panneaux se resserrent. Le trait trace une trajectoire avec deux nœuds : LICENCE PRO (sous-titre : JOURNALISME & CULTURE NUMÉRIQUE) → MASTER. Le nœud MASTER reçoit le mortier, dont le gland se balance. |
| **Texte écran** | NOTRE SECRET ?<br>01 · ENSEIGNANTS-CHERCHEURS / **JOURNALISME NUMÉRIQUE**<br>02 · MATÉRIEL DE POINTE / **PRODUCTION AUDIOVISUELLE**<br>03 · SUIVI PERSONNALISÉ / **STRATÉGIE DIGITALE**<br>LICENCE PRO → MASTER |
| **Animation** | Bulle : tracé du contour (`signal-out`, 36 im.). « NOTRE SECRET ? » : le tracking passe de +40 % à +8 % (le mot se resserre comme une confidence).<br>Plongée : scale de caméra 1 → 9 vers l'intérieur de la bulle (`glide`, 30 im.), flou de bougé directionnel, **exactement sur le drop de 14,00 s**.<br>Panneaux : `clip-path` parallélogramme ouvert de 0 à pleine largeur (`signal-out`, 24 im.), image en contre-parallaxe à 0,5×. Le numéro roule comme une machine à sous ; le titre monte mot par mot.<br>Focus : passage actif/inactif en `glide` (20 im.).<br>Trajectoire : tracé du trait (`glide`, 48 im.). Les nœuds apparaissent quand le trait les atteint (`land`, 14 im.). Gland : ressort amorti, 2 oscillations (40 im.). |
| **Transition → S4** | Le trait dépasse MASTER et sort du cadre. La caméra le suit (pan à droite et dézoom), et le trait devient l'itinéraire qui se pose sur la carte du Cameroun : le parcours académique devient un chemin vers Ngaoundéré (30 im.). |
| **Son / SFX** | Bulle : trait de feutre. **12,9–14,0 s : la musique passe sous un filtre passe-bas, puis silence.** 14,00 s : drop (retour du plein spectre et impact). Panneaux : trois *swipes* texturés, montant d'un demi-ton à chaque fois. Trajectoire : balayage continu. MASTER : tambour d'appel (même motif qu'à 5,00 s). |
| **Caméra** | La plongée dans la bulle est le seul mouvement spectaculaire du film, placé sur le drop. Ensuite, caméra quasi fixe (micro-dérive de 3 px/s) pour que le triptyque reste lisible. Pan et dézoom en sortie. |
| **Direction artistique** | Fond `vert-institution`. Panneaux bordés d'un filet blanc de 2 px. Numéros en jaune. Titres en Syne 72 px, labels en Inter 20 px. L'inclinaison de −12° est commune à tous les masques, par cohérence avec le mortier. |
| **Justification** | « Notre secret ? » est une rupture : la voix baisse, la musique se coupe, la caméra entre dans la bulle, et le spectateur entre dans la confidence. Le triptyque superpose deux lectures : **la voix dit comment** on forme (encadrement, équipement, suivi), **l'écran dit quoi** (les trois spécialités de votre brief). Si vous préférez que l'écran répète la voix mot pour mot, les titres reprennent simplement les mots de la voix off. |
| **Adaptation 9:16** | Triptyque en trois bandes empilées (inclinées à −8°), entrée de haut en bas. Trajectoire verticale : Licence en bas, Master en haut (on « monte »). Bulle de Ø 760 px. |

---

### S4 — « LE RENDEZ-VOUS » (appel à l'action et rayonnement)

| Élément | Détail |
|---|---|
| **Timecode / Durée** | 00:21.00 → 00:24.60 · 3,6 s · images 1260–1475 |
| **Message** | Où nous trouver (campus de Dang, Ngaoundéré), et la preuve que le département fait rayonner l'institution (+10 000 abonnés). |
| **Visuel** | **4a (21,00–23,20)** Fond studio. Silhouette du Cameroun en trait vert fin (contours Natural Earth, domaine public). L'itinéraire arrive par le sud et se pose sur Ngaoundéré (Adamaoua). **Le point rouge du début revient** : c'est l'épingle. Label CAMPUS DE DANG — NGAOUNDÉRÉ. Le chapitre devient NOUS REJOINDRE.<br>**4b (23,20–24,60)** Depuis l'épingle, les ondes jaunes couvrent le pays puis débordent du cadre. Le compteur « +10 000 » apparaît avec ABONNÉS, et le sous-label SUR NOS RÉSEAUX. |
| **Texte écran** | CAMPUS DE DANG — NGAOUNDÉRÉ<br>+10 000 ABONNÉS · SUR NOS RÉSEAUX |
| **Animation** | Carte : tracé du contour (`glide`, 40 im.), synchronisé avec l'arrivée de l'itinéraire.<br>Épingle : chute de −40 px à 0 (`land`, 16 im.) sur le mot « Dang », avec une onde.<br>Ondes : 5 arcs concentriques, 5 im. d'écart, scale 0 → 3 (`signal-out`, 50 im.), opacité décroissante.<br>Compteur : 0 → 10 000 en 50 im. (expo-out, espace insécable, chiffres tabulaires). Le « + » arrive en dernier (`land`). |
| **Transition → S5** | Les ondes se rétractent vers le point. Le point rouge se divise en trois points « • • • », qui partent prendre leur place dans le logo (24 im.). |
| **Son / SFX** | Arrivée sur la carte : whoosh grave. Épingle : *drop* et *ping*. Ondes : nappe montante. Compteur : clics rapides puis son de notification à 10 000. Musique : montée vers la résolution. |
| **Caméra** | Léger zoom sur Ngaoundéré (1,0 → 1,15), puis dézoom rapide (1,15 → 0,9) quand les ondes partent : on passe du local au rayonnement. |
| **Direction artistique** | Carte minimaliste : un trait seul, sans relief ni texture. Le rouge revient pour la première fois depuis l'ouverture, et c'est le même point : la boucle narrative se referme. |
| **Justification** | L'appel à l'action doit être concret et géographique (où ?). Le compteur transforme un chiffre en image : l'onde qui part de Ngaoundéré et couvre le pays montre littéralement le rayonnement de l'institution. |
| **Adaptation 9:16** | Le Cameroun, plus haut que large, remplit naturellement le format vertical (h 1100 px). Le compteur se place sous la carte, au-dessus de y 1480. |

---

### S5 — « LA SIGNATURE » (logo et promesse)

| Élément | Détail |
|---|---|
| **Timecode / Durée** | 00:24.60 → 00:30.00 · 5,4 s · images 1476–1799 |
| **Message** | Qui nous sommes, et la promesse : « votre histoire commence ici ». |
| **Visuel** | **5a (24,60–26,60)** Le logo se construit à partir des motifs du film. Les trois points se placent, les arcs rouges du « C » se tracent, les ondes jaunes apparaissent, puis le « D » vert et l'ellipse grise. Le mortier tombe et son gland se balance. Le trait dessine la bulle, **le guillemet ouvrant du début et le guillemet fermant** prennent leur place, et le livre s'ouvre. Le fond passe du noir au **blanc papier** par un wipe radial depuis le logo (la lumière se fait). Un fondu enchaîné de 8 im. remplace ensuite la reconstruction par **le logo officiel**, pour garantir une fidélité au pixel.<br>**5b (26,60–28,60)** Le logo remonte et la tagline apparaît dessous.<br>**5c (28,60–30,00)** Plan fixe. En bas, une rangée d'endossement : logo Université de Ngaoundéré · logo FALSH · nom de la page. |
| **Texte écran** | VOTRE HISTOIRE COMMENCE **ICI.**<br>Université de Ngaoundéré · FALSH · [nom de la page Facebook, à confirmer] |
| **Animation** | Pièces du logo : entrée en `land` (overshoot ≤ 6 %), à peu près une pièce par temps fort de « Dé-par-te-ment de Com-mu-ni-ca-tion » (120 im. au total).<br>Mortier : chute de −200 px à 0 (`press`, 14 im.) avec rebond. Gland en `tassel` (3 oscillations, 50 im.).<br>Fond : wipe radial du noir au blanc papier (24 im.).<br>Tagline : masque mot par mot (6 im. d'écart), « ICI. » en `vert-institution`, tracking qui se resserre de −1 % pendant la tenue.<br>Endossement : fondu et glissement de 12 px, le seul fondu du film. |
| **Transition** | Aucune : plan fixe final de 1,4 s, une image propre pour la miniature et la dernière image du lecteur. |
| **Son / SFX** | Pièces du logo : micro-impacts accordés (marimba). **Les 3 points = 3 notes, c'est la signature sonore.** Mortier : impact mat. Résolution musicale sur « ici » (accord tenu et dernier tambour d'appel). La réverbération s'éteint naturellement, sans coupure sèche. |
| **Caméra** | Léger recul (1,06 → 1,00) pendant la construction, puis caméra totalement fixe à partir de 28,60 s. |
| **Direction artistique** | Fond blanc papier : le logo officiel contient du noir et du gris, qui disparaîtraient sur fond sombre. Hiérarchie : logo DC (h 520 px) > tagline (Syne 72 px) > rangée UN + FALSH (h 110 px). |
| **Justification** | C'est le payoff : chaque motif vu pendant 25 s était une pièce du logo. Le passage du noir (avant l'antenne) au blanc (la lumière) incarne « votre histoire commence ici ». Les guillemets referment la prise de parole ouverte à 0:00. |
| **Adaptation 9:16** | Logo de 640 px de haut, entre y 380 et y 1020. Tagline sur 3 lignes (VOTRE HISTOIRE / COMMENCE / ICI.). Endossement au-dessus de y 1480. |

---

## 4. Sound design et musique

- **Musique** : électronique moderne et institutionnelle à 120 BPM, avec des percussions organiques. Il faut une piste **sous licence** couvrant les réseaux sociaux et les écrans (banque type Artlist, Epidemic Sound, Musicbed) ou une composition originale. Je ne peux pas produire une musique de qualité diffusable dans cet environnement.
- **Proposition de signature sonore : le « tambour d'appel ».** En Afrique, les tambours parlants ont été parmi les premiers médias. Un coup de tambour d'appel sur les trois temps forts (le nom à 5 s, MASTER, la résolution finale) relie la communication ancestrale au signal numérique. C'est une identité sonore locale, sans cliché.
- **SFX** : les effets temporaires de l'animatique peuvent être synthétisés ici (bips, ticks, whooshes). Les effets finaux viendront d'une banque sous licence.
- **Sous-titres** : environ 80 % des vidéos sociales sont vues sans le son. Je recommande des **sous-titres incrustés en 9:16** et un fichier `.srt` pour YouTube, LinkedIn et Facebook.

## 5. Format vertical 9:16 : principes

- **Recomposer, pas recadrer** : chaque scène a sa propre mise en page (voir les lignes « Adaptation 9:16 »).
- **Zone de sécurité** (1080×1920) : textes entre x 90 et x 990 et entre y 260 et y 1480. On évite le haut (barre d'état), le bas (légendes et boutons) et la colonne d'actions à droite de TikTok et Reels.
- Titres de 12 caractères maximum par ligne. Mêmes timecodes : l'audio est commun aux deux formats.

## 6. Plan technique (pour la Phase 2, rien n'est codé à ce stade)

- **Projet** : `spot-dept-communication/`, isolé du reste du dépôt. Le README racine décrit un autre projet (le concours « Exprime ton talent »), donc je n'y touche pas.
- **Arborescence** : celle de votre brief (`src/components`, `src/scenes`, `src/config`, `src/utils`, `assets/{brand,fonts,audio,images}`, `output/`).
- **Configuration séparée de l'animation** :
  - `config/brand` : couleurs et typographies
  - `config/script.fr.json` : textes de la voix off et de l'écran
  - `config/timeline.json` : repères en images à 60 fps
  - `config/formats` : 16:9 et 9:16, zones de sécurité

  Changer un texte, une couleur ou un timing ne demande donc jamais de réécrire une animation.
- **Exports** :
  - H.264 High, 1920×1080 à 60 fps, environ 20 Mb/s, AAC 48 kHz à 320 kb/s, −14 LUFS
  - Même chose en 1080×1920
  - Master ProRes en option
- **Étapes** :
  1. Phase 2 : système graphique et **animatique** (blocage des mouvements sur voix témoin), à valider avant la finition.
  2. Phase 3 : animation finale 16:9, intégration de la voix, de la musique et des effets.
  3. Phase 4 : déclinaison 9:16, mixage, exports, contrôle qualité.

## 7. Ce dont j'ai besoin : questions à valider

**Bloquant pour la Phase 2**

1. **Durée** : 30 s (recommandé), 45 s (texte intégral) ou 25 s imposé ?
2. **Affirmations à confirmer** : « 100 % d'immersion pratique » ; le chiffre exact d'abonnés au moment de la diffusion ; l'intitulé officiel de la Licence Pro (« Journalisme & Culture Numérique » ?) ; le nom exact du « Média Lab ».
3. **Voix off** : enregistrement par un comédien professionnel (vous me fournissez le WAV), voix de synthèse (il faut un compte sur un service type ElevenLabs), ou une voix témoin pour l'animatique en attendant ?
4. **Images et B-roll** : avez-vous des vidéos ou des photos de l'amphi, du Média Lab, du studio, d'enseignants avec des étudiants et du campus de Dang ?
   - Idéalement : vidéo 4K ou 1080p tournée en 50/60 i/s, plans stables de 3 à 6 s, cadrés large pour permettre le recadrage vertical.
   - Les personnes reconnaissables doivent avoir donné leur accord (droit à l'image).
   - Sans images, je conçois une version 100 % graphique.
5. **Logos en haute définition** : les logos DC et FALSH fournis font 500 px. C'est insuffisant pour le plan final, où le logo DC s'affiche sur 520 à 640 px de haut, et il faut un fichier propre pour reconstruire ses pièces. Il me faudrait un **SVG, AI ou PDF vectoriel**, ou à défaut un PNG de 2 000 px ou plus. Le logo de l'Université (2 000 px) suffit.

**Non bloquant**

6. **Musique** : avez-vous une piste sous licence, ou je propose une sélection en banque ?
7. **Page Facebook** : quel nom exact afficher sur le plan final ? Je n'ai pas pu ouvrir la page depuis mon environnement (accès réseau bloqué), et l'adresse `profile.php?id=…` n'est pas mémorisable.
8. **Version anglaise** : le logo est bilingue. Une version anglaise est-elle prévue ? Cela influe sur la longueur des textes à l'écran.

---

*Ressources fournies, rangées dans `assets/brand/` : `logo_dc.png` (504×495), `logo_falsh.png` (500×495), `logo_universite_ngaoundere.webp` (2000×2000).*
