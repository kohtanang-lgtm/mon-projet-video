# 06 — Journal des décisions

Chaque décision importante est notée ici : date, décision, raison. Pour revenir sur une décision,
on ajoute une nouvelle entrée qui l'annule, sans effacer l'ancienne.

| # | Date | Décision | Raison | Statut |
|---|---|---|---|---|
| D-001 | 2026-10-27 | Deux produits (carnet commerçant, gestion scolaire) construits sur un **socle technique commun** | Les deux gèrent « qui doit combien, ce qui est payé, comment le rappeler ». Construire une fois, tester une fois | Adoptée |
| D-002 | 2026-10-27 | **Le carnet commerçant est développé en premier** | Pas de flux d'argent, donc un risque faible. Il éprouve le socle avec de vrais utilisateurs et donne des retours rapides | Adoptée |
| D-003 | 2026-10-27 | Gestion scolaire V1 **sans paiement intégré** (registre, reçus, impayés, rappels). Le paiement mobile money vient en V2 | Il exige un contrat avec un partenaire agréé, un avis juridique et un audit de sécurité | Adoptée |
| D-004 | 2026-10-27 | **Nous ne détenons jamais les fonds** : l'argent va directement sur le compte marchand de l'école via un opérateur ou un agrégateur agréé | Règlement CEMAC n° 04/18 : les services de paiement sont réservés aux établissements agréés | Adoptée, à confirmer par un avocat |
| D-005 | 2026-10-27 | Hors connexion d'abord, opérations jamais modifiées ni supprimées (contre-écritures), montants en entiers FCFA, identifiants uniques créés sur l'appareil | Fiabilité des montants, traçabilité, synchronisation sans doublon malgré un réseau instable | Adoptée |
| D-006 | 2026-10-27 | Technologies : TypeScript, React Native avec Expo, SQLite, NestJS, PostgreSQL | Un seul langage et des règles de calcul partagées entre l'application et le serveur | Proposée, à confirmer en phase 2 |
| D-007 | 2026-10-27 | Premier marché **N'Djamena** ; interface **français et arabe** dès la V1 ; Android en priorité | Les langues officielles. Android domine le marché | Adoptée. La forme de l'arabe sera précisée après les entretiens |
| D-008 | 2026-10-27 | Pas de code avant la fin des entretiens terrain (phase 0) | Construire ce dont les gens ont réellement besoin | Adoptée |
