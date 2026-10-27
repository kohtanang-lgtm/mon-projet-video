# Projet « Carnet commerçant » et « Gestion scolaire » — N'Djamena

Deux applications pour le Tchad, construites sur un même socle technique :

1. **Carnet commerçant** : un carnet numérique pour noter ventes, dépenses et crédits clients, avec rappels de paiement.
2. **Gestion scolaire** : suivi de la scolarité, des impayés, reçus et messages aux parents, puis paiement par mobile money.

Premier marché : **N'Djamena**. Ensuite, les autres villes du Tchad, puis la zone CEMAC.

> Ce dossier est provisoire : il vit pour l'instant dans le dépôt du projet vidéo.
> Il sera déplacé dans un dépôt dédié dès que celui-ci sera créé.

## Où en est-on ?

**Phase 0 : fondations et terrain** (novembre 2026). Voir la [feuille de route](docs/02-feuille-de-route.md).

## Documents

| Document | Contenu |
|---|---|
| [01 — Vision et stratégie](docs/01-vision-et-strategie.md) | Les deux produits, le socle commun, l'ordre de construction, le modèle économique |
| [02 — Feuille de route](docs/02-feuille-de-route.md) | Les phases, les dates indicatives, qui fait quoi, le budget à prévoir |
| [03 — Architecture technique](docs/03-architecture-technique.md) | Les principes non négociables, les technologies choisies, le circuit des paiements |
| [04 — Sécurité, conformité et risques](docs/04-securite-conformite-risques.md) | Le cadre juridique (Tchad, CEMAC), les mesures de sécurité, le registre des risques |
| [05 — Guide des entretiens terrain](docs/05-guide-entretiens-terrain.md) | Les questions à poser aux commerçants, aux écoles et aux parents |
| [06 — Journal des décisions](docs/06-journal-des-decisions.md) | Chaque décision importante, avec sa date et sa raison |

## Comment on travaille

- Ce dossier est la **mémoire du projet**. Chaque décision, chaque spécification, chaque choix technique y est écrit.
  Une nouvelle session de travail repart de ces documents.
- On avance **étape par étape** : on ne passe à la phase suivante que lorsque les critères de la phase en cours sont remplis.
- Tout ce qui touche à l'**argent** ou aux **données personnelles** est couvert par des tests automatiques,
  puis vérifié par un professionnel externe avant la mise en production.
