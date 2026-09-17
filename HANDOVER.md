# DiagTerritoire — Fiche de préparation à la remise

Statut : préparation ; aucune réception ni mise en production prononcée.
Référence : issue #52.
Ce modèle public reste sans secrets ni coordonnées personnelles.
Compléter la fiche nominative hors du dépôt public.

## 1. Version et destination

| Élément | Référence |
| --- | --- |
| Dépôt | diagterritoire-founder/diagterritoire-oss |
| Release historique | v0.4.0 — 12 septembre 2026 |
| SHA technique qualifié par la PR #66 | 7a6f3ea0c09bbf28b7eb6fe386e0b5963c82ce84 |
| Cible proposée | Pilote existant — à confirmer |
| Collectivité destinataire | À renseigner |
| URL et environnement de remise | À renseigner hors dépôt public |
| SHA installé sur le pilote OVH le 17 septembre 2026 | 55efadaec7769fa1594a322b09e76df21f130af6 |
| Version/tag et SHA finalement remis | À renseigner après qualification et fusion finales |
| Date et décision de réception | À renseigner après recette |

Le SHA technique qualifié par la PR #66 est postérieur à v0.4.0. Il constitue la base technique de cette préparation documentaire, mais pas encore le SHA final de remise. Le tag existant ne doit pas être déplacé. Le build Codespaces qualifié ne constitue pas un artefact de production à remettre.

## 2. Documents de référence

- DELIVERY.md : guides, rôles, limites et preuves de qualification.
- PROVISIONING.md : ouverture initiale paramétrable d'un workspace.
- DEPLOYMENT.md : installation, exploitation et qualification historique.
- SUPPORT.md : signalement et limites des engagements de support.
- SECURITY.md : canal privé de signalement des vulnérabilités.
- MAINTENANCE.md : versions et mises à jour.

## 3. Acquis réutilisables

| Domaine | Preuve disponible | Portée |
| --- | --- | --- |
| Ouverture initiale | Provisionnement, rollback, rejeu et collisions testés | Bases locales isolées |
| Comptes et rôles | Connexion contributeur et validateur, parcours distincts | Recette Pamandzi |
| Parcours métier | Brouillon, modification, soumission, examen, validation, publication et rejet | Navigateur, données fictives |
| Consolidation | Inclusion des publiées, exclusion des non-publiées et rejetées | Navigateur et tests |
| Contrôles de droits | 13 tests workflow/consolidation et test supplémentaire de modification par un tiers | Services applicatifs |
| Déconnexion | Accès direct, actualisation et navigation testés renvoient à Connexion | Deux rôles ; réserve de retour arrière |
| Reprise PostgreSQL | Dump, checksum, restauration, sept tables identiques et lecture applicative | Copie locale isolée |
| Installation reproductible | Installation neuve, migrations, provisionnement, build, systemd, Caddy, sauvegarde/restauration, timer et redémarrages qualifiés | Ubuntu 24.04 éphémère ; PR #66 ; hors DNS/TLS public et VPS réel |
| Administration courante | Affectations de services, désactivation et réinitialisation des mots de passe qualifiées | CLI dédiée ; PR #64 |
| Confidentialité du dépôt | Recherche de fichiers secrets usuels, clés/tokens à forte confiance, IBAN et suites numériques suspectes ; historique Git contrôlé | SHA `f3a1e096b2d9e7ee192028d967a3295aaa442b57` ; aucun motif retenu |
| CI de la PR #59 | Quatre contrôles réussis avant fusion | Ne vaut pas recette de l'instance cible |

Les sections 14 à 19 de DELIVERY.md précisent les versions, environnements
et limites. Aucun contrôle n'est présenté comme exécuté sur l'instance
de remise lorsqu'il a été réalisé uniquement dans Codespaces.

## 4. Conditions restantes avant remise

| Condition | Action attendue |
| --- | --- |
| Instance cible | Confirmer destination, URL HTTPS, SHA installé et configuration réelle |
| Secrets | AUTH_SECRET durable et secrets hors Git ; session pilote désactivée |
| Comptes réels | Approuver rôles et services ; transmettre les accès par canal sécurisé |
| Exploitation | Désigner responsable métier, administrateur, exploitant et contact support |
| Sauvegarde durable | Fixer stockage protégé hors machine, rétention, surveillance et responsables |
| Reprise cible | Définir perte de données et interruption admissibles ; vérifier la procédure adaptée à la cible |
| Qualification finale | Rattacher contrôles techniques et parcours authentifiés au SHA et à l'instance remis |
| Réserves | Corriger ou faire accepter explicitement les limites applicables |

Les coordonnées et choix propres au destinataire sont conservés dans
la fiche interne. Aucun SLA ni astreinte n'est présumé.

## 5. Réserves et limites

- Après déconnexion, le retour arrière peut réafficher l'ancienne page
  Finances. L'actualisation et la navigation testées exigent une connexion.
  L'affichage résiduel reste à traiter ou à accepter explicitement.
- Les essais des services ne prouvent pas à eux seuls tous les refus HTTP.
- L'administration courante couvre les affectations de services,
  la désactivation et la réinitialisation des mots de passe.
  La réactivation d'un compte reste hors de cette procédure.
- Les modules affichés « en préparation » restent hors du parcours livré.
- La reprise isolée ne qualifie pas la perte complète d'un hôte,
  la haute disponibilité ni des objectifs contractuels de reprise.
- Les tests de provisionnement .mjs ont des résultats séparés ;
  leur exécution ne doit pas être déduite de la seule CI existante.

## 6. Décision

Décision actuelle : remise non prononcée ; issue #52 ouverte.

À compléter dans la fiche interne :
- responsable ayant vérifié chaque condition ;
- références des preuves sur l'instance cible ;
- réserves, décision et responsable de leur traitement ;
- accord du destinataire, date, version et SHA acceptés.

Cette fiche n'élargit pas le périmètre fonctionnel.

La mise à jour du pilote OVH et les contrôles des deux rôles sont consignés dans DELIVERY.md, section 18. Cette preuve ne vaut pas réception par une collectivité destinataire.
