# mon-projet-video

Projet de création et montage vidéo automatisé (Remotion) pour le concours national « EXPRIME TON TALENT » (Tchad 2026).

## Vidéo : « Tahwiil – Un transfert, un sourire » (#AstuceTahwiil)

Proposition créative (non sollicitée) pour **Tahwiil Transfert d'argent**. La vidéo transforme leur carrousel « Avant un transfert, avez-vous pensé à ces 3 points ? » en film publicitaire de motion design, entièrement calé sur la voix off.

| | |
|---|---|
| Durée | 59,5 s |
| Formats | 9:16 (1080 × 1920) pour Reels, TikTok et statut WhatsApp · 1:1 (1080 × 1080) pour le fil Facebook / Instagram |
| Son | voix off ElevenLabs traitée, musique originale afro-pop, bruitages synchronisés, normalisé à −14 LUFS |
| Sous-titres | incrustés et synchronisés : le mot prononcé s'allume en jaune |
| Rendus | `rendus/astuce-tahwiil-3-points-9x16.mp4` et `rendus/astuce-tahwiil-3-points-1x1.mp4` (haute qualité) · `rendus/astuce-tahwiil-3-points-9x16-leger.mp4` (720p, pour l'envoi sur WhatsApp) |

### Déroulé (calé sur la voix)

1. **Accroche** : « Quand on envoie de l'argent… on envoie bien plus. Avez-vous pensé à ces 3 points ? »
2. **Le trajet** : « Ahmat, lui, y pense » : carte du Tchad, de N'Djamena à Abéché.
3. **Point 1** : la loupe trouve le chiffre « de travers », le transfert se bloque, puis tout est « vérifié, validé ».
4. **Point 2** : au guichet, chaque question (frais, délais, pièce d'identité, lieu de retrait) apparaît quand elle est prononcée ; WhatsApp 24h/24, 7j/7.
5. **Point 3** : le reçu enregistré, le faux message, le tampon « JAMAIS ! » (avec coupure de la musique), le cadenas.
6. **Un transfert, un sourire** : la flèche du logo se retourne et devient un sourire.
7. **Fin** : le visage devient le cercle du logo et le sourire redevient la flèche (raccord), puis Simple · Rapide · Sécurisé, Envoyez · Payez · Retirez, l'appli, la mention agréée COBAC/BEAC, les contacts et l'appel « Faites comme Ahmat : téléchargez Tahwiil ! ».

Transition signature : une grande flèche Tahwiil balaie l'écran de bas en haut et la scène suivante apparaît dans son encoche.

## Utilisation

```bash
npm install
npm run studio          # aperçu interactif dans le navigateur
npm run rendu           # bande-son + rendu des deux formats + finalisation dans rendus/
```

Étapes séparées :

```bash
npm run bande-son       # voix traitée, musique et bruitages (Python 3 + numpy + ffmpeg)
npm run rendu:vertical  # rendu brut 9:16 dans out/brut/
npm run rendu:carre     # rendu brut 1:1 dans out/brut/
npm run finaliser       # son à -14 LUFS, encodage diffusion, version légère → rendus/
```

Si Chrome est déjà installé sur la machine, on peut l'indiquer avec la variable `REMOTION_CHROME` (chemin de l'exécutable) ; sinon Remotion télécharge le sien.

Aperçus fixes : `node scripts/apercus.mjs AstuceTahwiil-9x16 out/apercus 110 400 900` (numéros d'images à 30 i/s).

## Modifier la vidéo

- **Textes, noms, ville, montant, sous-titres** : `src/histoire.ts`. Les données du scénario (noms, numéro, référence) sont fictives.
- **Timeline** : `src/data/voixOff.json`. On y trouve les repères de chaque mot clé de la voix (en secondes), le début des scènes et les plages de parole. Toutes les animations, la musique et les bruitages en dépendent.
- **Changer de voix off** :
  1. Remplacer `public/audio/voix-off-originale.mp3`.
  2. Lancer `python3 scripts/aligner-voix-off.py <fichier.mp3> <sortie.json>` pour retrouver les phrases. Le texte du script est inclus dans le fichier.
  3. Mettre à jour les repères dans `voixOff.json`, puis lancer `npm run rendu`.
- **Ville d'arrivée** : `villeArrivee` dans `src/histoire.ts`, parmi les villes de `src/data/carteTchad.ts`. À remplacer par une ville réellement desservie par Tahwiil.
- **Musique** : `scripts/bande-son.py` (composition originale). Pour utiliser une musique sous licence, remplacer `public/audio/musique.wav` par un fichier de 59,5 s ; la baisse automatique sous la voix est réglée dans `src/Video.tsx`.
- **Couleurs et polices** : `src/theme.ts`.
- **Filigrane « Proposition créative · non officielle »** : propriété `filigrane` des compositions dans `src/Root.tsx`. À garder tant que Tahwiil n'a pas validé la vidéo.

## Organisation

```
src/
  data/voixOff.json     timeline de la voix off (repères, scènes, parole)
  voixOff.ts            conversion des repères en images de la vidéo
  histoire.ts           textes, sous-titres, données du scénario
  theme.ts              charte (couleurs relevées sur les visuels Tahwiil, polices)
  miseEnPage.tsx        placement des zones selon le format 9:16 ou 1:1
  Video.tsx             enchaînement des scènes, transitions, mixage
  scenes/               les 7 scènes
  components/           logo animé, texte cinétique, téléphone, sous-titres, bruitages…
  transitions/          balayage en forme de flèche Tahwiil
  data/carteTchad.ts    tracé du Tchad (généré par `npm run carte`)
public/
  audio/                voix (originale et traitée), musique, bruitages (sfx/)
  brand/                logo Tahwiil découpé (lettres, flèche, arabe) en versions orange et blanche
  fonts/                Nunito, Montserrat, Baloo Bhaijaan 2 (licence SIL OFL)
  textures/grain.png    grain léger du fond
scripts/
  aligner-voix-off.py   repère les phrases du script dans l'enregistrement
  bande-son.py          traitement de la voix, musique et bruitages
  finaliser.py          normalisation du son et encodage de diffusion
```

## Crédits et précautions

- Logo et charte : propriété de Tahwiil. Usage limité à cette maquette de démonstration, à présenter en privé.
- Voix off : générée avec ElevenLabs par l'auteur du projet (vérifier que l'offre utilisée autorise l'usage commercial avant une diffusion officielle).
- Musique et bruitages : compositions originales synthétisées par `scripts/bande-son.py`, sans échantillon externe.
- Polices : Nunito, Montserrat et Baloo Bhaijaan 2 (Google Fonts, licence SIL Open Font License), via les paquets Fontsource.
- Carte : Natural Earth (domaine public), via le paquet `world-atlas`.
- Icônes : Lucide (licence ISC).
