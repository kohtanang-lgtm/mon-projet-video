# 04 — Sécurité, conformité et risques

> Ce document n'est pas un avis juridique. Chaque point du cadre légal doit être confirmé par un avocat tchadien
> avant la mise en production.

## Cadre juridique identifié

| Texte | Ce qu'il implique pour nous |
|---|---|
| **Loi n° 007/PR/2015** sur la protection des données à caractère personnel (Tchad) | Déclarer nos traitements de données à l'**ANSICE**. Une autorisation est nécessaire pour certaines catégories (biométrie, numéros d'identification nationale, infractions) : on évite de les collecter. Il faut aussi informer l'ANSICE avant tout transfert de données à l'étranger, y compris un hébergement hors du Tchad. Les sanctions prévues incluent des amendes |
| **Loi n° 006/PR/2015** créant l'ANSICE | L'agence de sécurité informatique et de certification électronique est l'interlocuteur pour la sécurité et les données |
| **Règlement n° 04/18/CEMAC/UMAC/COBAC** du 21 décembre 2018 sur les services de paiement | Seuls les établissements de crédit, de microfinance et de paiement **agréés** peuvent fournir des services de paiement. D'où notre règle : **on ne détient jamais les fonds**, on passe par un opérateur ou un agrégateur agréé |
| **Droit OHADA** des sociétés commerciales | Forme de la société (SARL, SAS…), immatriculation au RCCM via le guichet unique de l'ANIE |
| **Données des élèves (mineurs)** | Prudence maximale : collecter le minimum, limiter les accès, obtenir le consentement des parents |

### Documents juridiques à faire rédiger ou relire par un avocat

- Conditions générales d'utilisation de chaque application.
- Politique de confidentialité, en français et en arabe, en langage clair.
- Contrat de service avec les écoles. L'école est responsable des données de ses élèves et nous les traitons pour son compte : les responsabilités de chacun doivent être écrites.
- Avis écrit sur notre statut au regard de la réglementation des paiements.
- Contrat avec l'opérateur ou l'agrégateur de paiement.

## Mesures de sécurité prévues

**Accès**
- Connexion par numéro de téléphone avec un code reçu par SMS, puis un code PIN sur l'appareil.
- Des rôles distincts : propriétaire, employé ou caissier ; directeur, comptable, enseignant.
  Chacun ne voit et ne fait que ce que son rôle permet.
- Un appareil perdu ou volé peut être déconnecté à distance.

**Données**
- Échanges chiffrés (HTTPS/TLS) ; données chiffrées sur le serveur et sur le téléphone.
- Sauvegardes automatiques chiffrées, avec des tests de restauration réguliers.
- Journal d'audit : qui a fait quoi, quand et depuis quel appareil. Il n'est pas modifiable.
- Opérations jamais supprimées ; corrections tracées.

**Développement**
- Tests automatiques obligatoires sur les calculs d'argent, la synchronisation et les permissions.
- Aucun mot de passe ni aucune clé secrète dans le code.
- Mises à jour régulières des composants pour corriger les failles connues.
- Relecture de chaque changement avant sa mise en ligne.

**Exploitation**
- Surveillance du serveur, avec des alertes en cas de panne ou d'activité anormale.
- Procédure écrite en cas d'incident : qui prévenir, comment réagir, comment informer les clients.
- **Audit de sécurité externe** (test d'intrusion) avant l'ouverture des paiements, puis chaque année.

## Registre des risques

Gravité et probabilité : Faible / Moyenne / Élevée.

| # | Risque | Gravité | Probabilité | Mesures |
|---|---|---|---|---|
| R1 | Erreur de calcul d'un solde | Élevée | Moyenne | Montants entiers, règles de calcul partagées, tests automatiques, historique complet |
| R2 | Opération comptée deux fois après une coupure réseau | Élevée | Élevée | Identifiant unique par opération, synchronisation sans doublon |
| R3 | Paiement marqué « payé » alors qu'il ne l'est pas | Élevée | Moyenne | Seule une confirmation signée de l'opérateur compte, rapprochement quotidien |
| R4 | Fraude interne (un employé efface une vente ou un paiement) | Élevée | Moyenne | Effacement impossible, journal d'audit, rôles limités |
| R5 | Téléphone perdu ou volé | Moyenne | Élevée | Code PIN, données chiffrées, déconnexion à distance, sauvegarde sur le serveur |
| R6 | Fuite de données personnelles | Élevée | Faible | Chiffrement, accès minimum, audit externe, données minimales |
| R7 | Non-conformité à la réglementation des paiements | Élevée | Moyenne | Aucune détention de fonds, avis juridique, partenaire agréé |
| R8 | Non-conformité à la loi sur les données | Élevée | Moyenne | Déclaration à l'ANSICE, politique de confidentialité, consentement, information avant hébergement à l'étranger |
| R9 | Coupures d'internet ou d'électricité | Moyenne | Élevée | Hors connexion d'abord, application légère, faible consommation |
| R10 | Dépendance à un seul opérateur de paiement | Moyenne | Moyenne | Prévoir Airtel Money et Moov Money dès la conception |
| R11 | Application jugée trop compliquée | Élevée | Moyenne | Tests terrain des maquettes, français et arabe, icônes, accompagnement sur place |
| R12 | Faible adoption ou personne ne paie | Élevée | Moyenne | Entretiens avant le code, pilotes, faire payer dès le pilote |
| R13 | Panne du serveur | Moyenne | Faible | Hébergement géré, sauvegardes, surveillance. L'application continue de fonctionner hors connexion |
| R14 | Projet trop dépendant d'une seule personne ou de l'IA | Moyenne | Élevée | Documentation complète, tests, relecture externe, recrutement d'un développeur à terme |

Ce registre est revu à chaque fin de phase.
