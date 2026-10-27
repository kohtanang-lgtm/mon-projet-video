# 03 — Architecture technique

Statut : **proposition**, à confirmer au début de la phase 2.

## Principes non négociables

1. **Hors connexion d'abord.** Toute opération est enregistrée d'abord sur le téléphone, puis envoyée au serveur dès que le réseau revient.
   Une coupure ne doit jamais bloquer le commerçant ni faire perdre une donnée.
2. **On ne modifie et on ne supprime jamais une opération.** Une erreur se corrige par une opération inverse
   (une « contre-écriture »), comme en comptabilité. Résultat : un historique complet et vérifiable, et la fraude interne devient visible.
3. **Montants en nombres entiers de francs CFA.** Jamais de nombres à virgule pour l'argent : ils produisent des erreurs d'arrondi.
4. **Chaque opération reçoit un identifiant unique créé sur le téléphone.** Si une opération est envoyée deux fois
   (réseau instable), le serveur ne la compte qu'une seule fois.
5. **Les mêmes règles de calcul partout.** Les calculs (soldes, totaux, validations) sont écrits une seule fois
   et partagés entre l'application et le serveur. Pas de risque que le téléphone et le serveur affichent des montants différents.
6. **Le serveur fait foi.** Pour les paiements, seule une confirmation vérifiée venant de l'opérateur fait passer un paiement à « payé ».
7. **Sécurité par défaut** : chiffrement des échanges et des données, rôles et permissions, journal de qui a fait quoi et quand.
8. **Collecter le minimum.** On ne stocke que les données nécessaires. Pas de numéro de carte d'identité nationale, par exemple.
9. **Tout ce qui touche à l'argent est testé automatiquement** avant chaque mise en ligne.

## Technologies proposées

| Brique | Choix | Pourquoi |
|---|---|---|
| Langage | **TypeScript** partout | Un seul langage pour l'application, le serveur et le site, avec des types qui détectent beaucoup d'erreurs avant l'exécution. Il est très répandu, donc facile de recruter des développeurs |
| Applications mobiles | **React Native avec Expo** | Un seul code pour Android (priorité) et iPhone (plus tard). Mises à jour rapides. Fonctionne bien sur les téléphones d'entrée de gamme |
| Stockage sur le téléphone | **SQLite**, chiffré | Une vraie base de données locale pour le fonctionnement hors connexion |
| Espace web des écoles | **React** | Pour la direction et la comptabilité sur ordinateur, avec le même langage et les mêmes règles |
| Serveur | **Node.js avec NestJS** | Structuré et adapté à une équipe qui grandit. Les règles métier sont partagées avec l'application |
| Base de données | **PostgreSQL** | Fiable, gratuite, solide pour les données financières (transactions, contraintes) |
| Hébergement | Cloud géré, avec sauvegardes automatiques | Le choix de la région (Afrique du Sud ou Europe) se fera avec l'avocat : un hébergement hors du Tchad impose d'informer l'ANSICE |
| SMS | Fournisseur d'envoi de SMS couvrant le Tchad | Codes de connexion, reçus et rappels |
| WhatsApp | V1 : message prérempli envoyé depuis le téléphone du commerçant. Plus tard : l'API officielle WhatsApp Business | La V1 ne coûte rien et ne demande aucun contrat |

**Alternative étudiée : Flutter** (langage Dart). Il est aussi très bon, un peu plus léger sur les petits téléphones.
On a écarté cette option parce qu'elle oblige à utiliser deux langages (Dart pour l'application, un autre pour le serveur)
et empêche de partager les règles de calcul entre les deux.

## Vue d'ensemble

```
 Téléphone du commerçant          Téléphone ou PC de l'école        Téléphone du parent
 ┌──────────────────────┐        ┌──────────────────────┐          (SMS / WhatsApp,
 │ App Carnet           │        │ App/Web École        │           sans appli obligatoire)
 │ base locale SQLite   │        │                      │                  ▲
 └──────────┬───────────┘        └──────────┬───────────┘                  │
            │ synchronisation chiffrée      │                              │
            ▼                               ▼                              │
 ┌───────────────────────────────────────────────────────┐                │
 │ API (Node.js / NestJS)                                │── SMS, WhatsApp ┘
 │  comptes et rôles · registre d'opérations · synchro    │
 │  reçus · rappels · journal d'audit                     │
 └──────────┬─────────────────────────────┬──────────────┘
            ▼                             ▼ (phase 5)
 ┌──────────────────────┐     ┌──────────────────────────────┐
 │ PostgreSQL           │     │ Opérateur / agrégateur agréé │
 │ sauvegardes chiffrées│     │ (Airtel Money, Moov Money)   │
 └──────────────────────┘     └──────────────────────────────┘
```

## Organisation du code (prévue)

```
apps/
  carnet-mobile/      application Carnet commerçant
  ecole-mobile/       application Gestion scolaire
  ecole-web/          espace web des écoles
services/
  api/                serveur
packages/
  core/               règles métier partagées (argent, registre, validations)
  ui/                 composants d'interface communs (boutons, champs de montant…)
  i18n/               textes en français et en arabe
docs/                 cette documentation
```

## Circuit d'un paiement (phase 5)

1. Le parent choisit de payer : dans l'application, par un lien reçu par SMS, ou par un code USSD de l'opérateur.
2. Notre serveur crée une demande de paiement avec un identifiant unique, au statut **« initié »**.
3. L'opérateur ou l'agrégateur agréé débite le parent et crédite **directement le compte marchand de l'école**.
4. L'opérateur envoie une confirmation signée à notre serveur. Le serveur vérifie la signature et le montant,
   puis fait passer le paiement à **« confirmé »**. Une confirmation reçue deux fois n'est comptée qu'une fois.
5. Le reçu est envoyé au parent, et le solde de l'élève est mis à jour.
6. Chaque jour, un rapprochement automatique compare nos paiements aux relevés de l'opérateur. Tout écart déclenche une alerte.

Statuts possibles : initié → en attente → confirmé / échoué / expiré → (éventuellement) remboursé.
Un paiement n'est **jamais** marqué « confirmé » sur la seule parole du téléphone.

## Environnements

| Environnement | Usage | Données |
|---|---|---|
| Développement | Écrire et tester le code | Fictives |
| Test (préproduction) | Bêta, démonstrations, tests de paiement en mode test | Fictives ou de test |
| Production | Utilisateurs réels | Réelles, chiffrées, sauvegardées |
