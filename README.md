# mon-projet-video

Projet de création et montage vidéo automatisé (Remotion) pour le concours national « EXPRIME TON TALENT » (Tchad 2026).

## Vidéo en cours : « Astuce Tahwiil – Un transfert, un sourire »

Proposition créative (non sollicitée) pour **Tahwiil Transfert d'argent**. La vidéo reprend leur carrousel « Avant un transfert, avez-vous pensé à ces 3 points ? » sous la forme d'une mini-histoire en motion design.

| | |
|---|---|
| Durée | environ 48 s |
| Formats | 9:16 (1080 × 1920) pour Reels, TikTok et statut WhatsApp · 1:1 (1080 × 1080) pour le fil Facebook / Instagram |
| Langue | français, sous-titres incrustés (voix off à ajouter) |
| Rendus | `rendus/astuce-tahwiil-3-points-9x16.mp4` et `rendus/astuce-tahwiil-3-points-1x1.mp4` (haute qualité) · `rendus/astuce-tahwiil-3-points-9x16-leger.mp4` (720p, environ 4 Mo, pour l'envoi sur WhatsApp) |

### Déroulé

1. **Accroche** : « Avant un transfert, avez-vous pensé à ces 3 points ? » et logo animé.
2. **Le trajet** : Ahmat envoie de l'argent à sa maman, de N'Djamena à Abéché (carte du Tchad).
3. **Point 1** : vérifier les informations du bénéficiaire (erreur repérée à la loupe puis corrigée dans l'appli).
4. **Point 2** : se renseigner auprès d'un agent (guichet, questions frais / délais / pièce d'identité / lieu de retrait, WhatsApp 24h/7j).
5. **Point 3** : conserver le justificatif et protéger ses informations (reçu enregistré, faux message demandant le code PIN, tampon « JAMAIS ! »).
6. **Un transfert, un sourire** : maman reçoit l'argent ; la flèche du logo se retourne et devient un sourire (« تحويل… ابتسامة »).
7. **Fin** : logo, Simple · Rapide · Sécurisé (avec l'arabe correctement aligné), appli, contacts, appel à commenter, mention COBAC / BEAC.

Transition signature : une grande flèche Tahwiil balaie l'écran de bas en haut et la scène suivante apparaît dans son encoche.

## Utilisation

```bash
npm install
npm run studio          # aperçu interactif dans le navigateur
npm run rendu           # rend les deux formats dans rendus/
npm run rendu:vertical  # 9:16 seulement
npm run rendu:carre     # 1:1 seulement
```

Si Chrome est déjà installé sur la machine, on peut l'indiquer avec la variable `REMOTION_CHROME` (chemin de l'exécutable) ; sinon Remotion télécharge le sien.

Aperçus fixes : `node scripts/apercus.mjs AstuceTahwiil-9x16 out/apercus 110 400 900` (numéros d'images à 30 i/s).

## Modifier la vidéo

- **Textes, noms, ville, montant, durées** : `src/histoire.ts` (un seul fichier). Les données du scénario (noms, numéro, référence) sont fictives.
- **Ville d'arrivée** : `villeArrivee` dans `src/histoire.ts`, parmi les villes de `src/data/carteTchad.ts` (Abéché, Moundou, Sarh, Mongo, Bol, Faya-Largeau). À remplacer par une ville réellement desservie par Tahwiil.
- **Couleurs et polices** : `src/theme.ts`.
- **Filigrane « Proposition créative · non officielle »** : propriété `filigrane` des compositions dans `src/Root.tsx`. À garder tant que Tahwiil n'a pas validé la vidéo.
- **Voix off et musique** : voir `docs/script-voix-off.md` ; ajouter les fichiers dans `public/audio/` puis un composant `<Audio>` dans `src/Video.tsx`.

## Organisation

```
src/
  histoire.ts           textes, durées, données du scénario
  theme.ts              charte (couleurs relevées sur les visuels Tahwiil, polices)
  miseEnPage.tsx        placement des zones selon le format 9:16 ou 1:1
  Video.tsx             enchaînement des scènes et transitions
  scenes/               les 7 scènes
  components/           logo animé, texte cinétique, téléphone, sous-titres, fond…
  transitions/          balayage en forme de flèche Tahwiil
  data/carteTchad.ts    tracé du Tchad (généré par `npm run carte`)
public/
  brand/                logo Tahwiil découpé (lettres, flèche, arabe) en versions orange et blanche
  fonts/                Nunito, Montserrat, Baloo Bhaijaan 2 (licence SIL OFL)
  textures/grain.png    grain léger du fond
```

## Crédits et précautions

- Logo et charte : propriété de Tahwiil. Usage limité à cette maquette de démonstration, à présenter en privé.
- Polices : Nunito, Montserrat et Baloo Bhaijaan 2 (Google Fonts, licence SIL Open Font License), via les paquets Fontsource.
- Carte : Natural Earth (domaine public), via le paquet `world-atlas`.
- Icônes : Lucide (licence ISC).
