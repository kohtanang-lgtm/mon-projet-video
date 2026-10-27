# 01 — Vision et stratégie

## Vision

Donner aux commerçants et aux écoles de N'Djamena des outils numériques **simples, fiables et dignes de confiance**
pour gérer leur argent et leurs relations avec leurs clients ou leurs familles. Ces outils doivent fonctionner
même sans connexion, sur des téléphones d'entrée de gamme, en français et en arabe.

## Les deux produits

### Carnet commerçant

| | |
|---|---|
| **Pour qui** | Boutiquiers, commerçants des marchés, grossistes, petites PME de N'Djamena |
| **Le problème** | Ventes et crédits clients notés dans un cahier ou de tête : dettes oubliées, disputes, aucune vision de ce que la boutique gagne |
| **La promesse** | « Tu sais à tout moment qui te doit combien, et tu récupères ton argent plus vite. » |
| **Première version (hypothèse à valider sur le terrain)** | Clients et crédits, remboursements, rappel par WhatsApp ou SMS, caisse du jour (ventes et dépenses), sauvegarde automatique |

### Gestion scolaire

| | |
|---|---|
| **Pour qui** | Écoles privées de N'Djamena (direction, comptabilité) et parents d'élèves |
| **Le problème** | Paiements en espèces, files d'attente, reçus papier, impayés relancés à la main, parents mal informés |
| **La promesse** | « L'école encaisse mieux et plus vite, les parents paient sans se déplacer et restent informés. » |
| **Version 1** | Élèves, classes et frais ; enregistrement des paiements reçus ; reçus numériques ; liste des impayés ; rappels et messages aux parents |
| **Version 2** | Paiement intégré par Airtel Money et Moov Money, versé directement sur le compte de l'école |

## Un socle commun pour deux applications

Les deux produits répondent à la même question : **qui doit combien à qui, qu'est-ce qui a été payé, et comment le rappeler ?**
On construit donc une seule fois les briques communes :

- comptes, connexion par numéro de téléphone, rôles et sécurité ;
- un **registre d'opérations** fiable (crédits, paiements, corrections) ;
- le fonctionnement **hors connexion** et la synchronisation ;
- les rappels et messages (WhatsApp, SMS) ;
- les reçus numériques ;
- l'interface en français et en arabe ;
- plus tard, le module de paiement mobile money.

Un socle mieux testé, c'est moins de travail et moins d'erreurs.

## Ordre de construction, et pourquoi

1. **Le carnet commerçant d'abord.**
   - Aucun argent ne transite par l'application : le risque juridique et financier est faible.
   - Il permet de construire et d'éprouver le socle (hors-ligne, registre, rappels) avec de vrais utilisateurs.
   - Chaque commerçant peut l'adopter seul : on a des retours vite.
2. **La gestion scolaire version 1 ensuite, sans paiement intégré.**
   - C'est un « carnet de scolarité » : l'école enregistre ce qu'elle reçoit et l'application gère reçus, impayés et rappels.
   - On gagne la confiance des écoles sans toucher aux flux d'argent.
3. **Le paiement intégré en dernier**, une fois réunies toutes les conditions suivantes :
   - un contrat signé avec un opérateur ou un agrégateur agréé ;
   - un avis juridique ;
   - un audit de sécurité externe ;
   - des tests réels sur de petits montants.

Pendant que le carnet est en développement, on prépare déjà le volet scolaire : entretiens avec les écoles,
conception, démarches auprès des opérateurs.

## Règle d'or des paiements

> **Nous ne détenons jamais l'argent de nos clients.**

L'argent va directement du parent au compte marchand de l'école, via un opérateur ou un agrégateur agréé.
Notre système transmet la demande, reçoit la confirmation, établit le reçu et fait les rapprochements.
Nos propres revenus sont facturés à part, sous forme d'abonnement : on ne prélève rien au passage.
Ainsi, on reste hors du champ des « services de paiement », réservés aux établissements agréés par la réglementation CEMAC
(voir le [document 04](04-securite-conformite-risques.md)). Ce point doit être confirmé par un avocat.

## Ce qui nous rendra crédibles

- **Fiabilité** : une opération enregistrée ne disparaît jamais ; toute correction laisse une trace.
- **Hors connexion** : l'application continue de fonctionner pendant les coupures.
- **Simplicité** : grands boutons, icônes, montants lisibles, français et arabe, aide en présentiel.
- **Transparence** : le client ou le parent reçoit un reçu ou un relevé clair.
- **Sécurité vérifiée** : audit externe avant toute gestion de paiements, conformité déclarée auprès de l'ANSICE.
- **Présence locale** : une équipe à N'Djamena qui forme, accompagne et répond.

## Modèle économique (hypothèses à tester)

| Produit | Hypothèse |
|---|---|
| Carnet commerçant | Gratuit pour l'essentiel. Version payante : plusieurs appareils ou employés, rapports détaillés, rappels SMS envoyés automatiquement, export comptable. Plus tard : partenariats avec des fournisseurs et des institutions de microfinance |
| Gestion scolaire | Abonnement annuel payé par l'école, calculé par élève. Le prix sera fixé après les entretiens et le pilote |

Règle : faire payer quelque chose **dès le pilote**, même un montant symbolique, pour vérifier que quelqu'un est prêt à payer.

## Cibles géographiques

1. N'Djamena (marchés, quartiers commerçants, écoles privées).
2. Moundou, Sarh, Abéché.
3. Zone CEMAC : Cameroun, Centrafrique, Congo, Gabon, Guinée équatoriale. Même monnaie (FCFA) et même réglementation des paiements.
