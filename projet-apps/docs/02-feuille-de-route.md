# 02 — Feuille de route

Les dates sont indicatives. On ne passe à une phase que lorsque les **critères de passage** de la précédente sont remplis.
Mieux vaut une semaine de retard qu'une erreur sur l'argent ou les données.

## Vue d'ensemble

| Phase | Période indicative | Carnet commerçant | Gestion scolaire |
|---|---|---|---|
| 0. Fondations et terrain | novembre 2026 | Entretiens commerçants | Entretiens écoles et parents |
| 1. Conception | décembre 2026 | Parcours, spécifications, maquettes testées | — |
| 2. Socle et développement | janvier – mars 2027 | Socle technique et carnet V1 | Conception et maquettes (janvier – février) |
| 3. Bêta | mars – avril 2027 | Bêta fermée avec 20 à 30 commerçants | Développement de la V1 sans paiement intégré |
| 4. Lancement et pilote | mai – juin 2027 | Lancement public sur le Play Store | Pilote dans 2 à 3 écoles |
| 5. Paiements | mai – août 2027 | Améliorations | Paiement mobile money intégré et audit de sécurité |
| 6. Lancement école | rentrée 2027 (septembre – octobre) | Croissance | Lancement avec paiements |

En parallèle, dès novembre 2026 : création de la société, contact avec un avocat, premiers échanges avec les opérateurs de paiement.

## Détail des phases

### Phase 0 — Fondations et terrain (novembre 2026)

**Objectif** : vérifier les besoins réels avant d'écrire une ligne de code.

- 15 entretiens avec des commerçants (boutiques de quartier, marchés, grossistes).
- 8 entretiens dans des écoles (directeurs, promoteurs, comptables), en variant les profils : primaire et secondaire, petites et grandes, francophones et bilingues.
- 15 entretiens avec des parents.
- Photos des cahiers de crédit, reçus et registres actuels (avec permission).
- Démarrage de la création de la société et recherche d'un avocat d'affaires.

**Livrable** : une synthèse terrain, rédigée ensemble à partir de tes notes.

**Critères de passage** : la liste des fonctions de la V1 du carnet est confirmée par les entretiens.
Au moins 5 commerçants acceptent d'être testeurs.

### Phase 1 — Conception du carnet (décembre 2026)

- Les parcours utilisateurs : ce que le commerçant fait, écran par écran.
- Le cahier des charges détaillé de chaque fonction.
- Des maquettes interactives qu'on peut cliquer sur un téléphone.
- Un test de ces maquettes avec 5 à 8 commerçants. On observe où ils hésitent.

**Critères de passage** : les commerçants testés réussissent les tâches principales sans aide (noter un crédit, un remboursement, envoyer un rappel).

### Phase 2 — Socle technique et carnet V1 (janvier – mars 2027)

- Mise en place du code : application mobile, serveur, base de données.
- Comptes et sécurité, registre d'opérations, hors-ligne et synchronisation.
- Les fonctions de la V1 du carnet.
- Tests automatiques sur tous les calculs d'argent et sur la synchronisation.

**Critères de passage** : tous les tests passent. L'application fonctionne sur un téléphone Android d'entrée de gamme,
hors connexion. Aucune perte de données lors des tests de coupure.

### Phase 3 — Bêta du carnet (mars – avril 2027)

- 20 à 30 commerçants dans un ou deux marchés de N'Djamena.
- Accompagnement sur place : installation, formation, collecte des retours.
- Corrections et améliorations chaque semaine.
- Test fermé sur le Play Store. Pour un compte développeur personnel, Google exige actuellement au moins 12 testeurs pendant 14 jours (règle à revérifier au moment voulu).

**Critères de passage** : plus de la moitié des testeurs utilisent encore l'application après 4 semaines.
Aucun bug grave ouvert. Aucune perte de données.

### Phase 4 — Lancement du carnet et pilote école (mai – juin 2027)

- Publication du carnet sur le Play Store.
- Pilote de la gestion scolaire V1 dans 2 à 3 écoles, au troisième trimestre.

### Phase 5 — Paiements intégrés (mai – août 2027)

Conditions préalables, toutes obligatoires :

- un contrat avec un opérateur (Airtel Money, Moov Money) ou un agrégateur agréé ;
- un avis juridique écrit sur notre statut (nous ne détenons jamais les fonds) ;
- la déclaration des traitements de données à l'ANSICE.

Travaux :

- intégration technique, d'abord en environnement de test puis avec de vrais petits montants ;
- rapprochement automatique quotidien avec les relevés de l'opérateur ;
- **audit de sécurité par un professionnel externe** avant l'ouverture.

### Phase 6 — Lancement école avec paiements (rentrée 2027)

Lancement au moment où tous les parents paient l'inscription : c'est le meilleur moment pour l'adoption.

## Qui fait quoi

| Toi (fondateur) | Claude (ici) | Professionnels externes |
|---|---|---|
| Entretiens et observations terrain | Préparer les guides d'entretien, synthétiser les résultats | **Avocat d'affaires** : statuts, conditions d'utilisation, politique de confidentialité, contrats avec les écoles, avis sur les paiements |
| Création de la société (guichet unique de l'ANIE) | Rédiger les spécifications et les maquettes | **Comptable** : fiscalité, facturation |
| Relations avec écoles, commerçants, opérateurs | Écrire le code, les tests et la documentation | **Auditeur sécurité** : test d'intrusion avant les paiements |
| Créer les comptes (Google Play, hébergement, SMS) | Préparer les mises en ligne | **Développeur expérimenté** (à terme) : relecture du code, puis renfort de l'équipe |
| Tester sur ton téléphone et faire tester | Corriger, améliorer, expliquer chaque étape | |
| Décider (prix, priorités, partenaires) | Proposer des options et une recommandation | |

## Limites à connaître

- Je ne garde pas de mémoire entre les sessions, en dehors de ce qui est écrit dans ce dossier. D'où l'importance des documents.
- Je peux me tromper. D'où les tests automatiques, la relecture, et l'audit externe obligatoire avant les paiements.
- Je ne peux pas signer de contrats, créer de comptes à ton nom, ni aller sur le terrain : ces étapes sont les tiennes.

## Budget à prévoir (à chiffrer ensemble)

- Création de la société et frais administratifs.
- Avocat (documents juridiques, avis sur les paiements), comptable.
- Compte Google Play Developer : 25 USD, payé une fois. Apple plus tard, si une version iPhone est justifiée (99 USD par an).
- Nom de domaine et hébergement : quelques dizaines de dollars par mois au départ.
- Envoi de SMS : coût par message, à négocier.
- Deux ou trois téléphones Android d'entrée de gamme pour les tests : ils représentent le vrai public.
- Audit de sécurité externe avant les paiements : la dépense la plus importante, et non négociable.
