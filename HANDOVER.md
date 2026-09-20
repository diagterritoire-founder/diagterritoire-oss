# DiagTerritoire — Fiche de préparation à la remise

Statut : qualification technique finale du pilote achevée le 20 septembre 2026 ; paquet de remise prêt.
Référence : issue #52.
Ce document public ne contient ni secret ni coordonnée personnelle. Les éléments nominatifs et les modalités de réception restent consignés hors du dépôt public.

## 1. Version et destination

| Élément | Référence |
| --- | --- |
| Dépôt | diagterritoire-founder/diagterritoire-oss |
| Release historique | v0.4.0 — 12 septembre 2026 |
| SHA technique qualifié par la PR #66 | 7a6f3ea0c09bbf28b7eb6fe386e0b5963c82ce84 |
| SHA applicatif remis sur le pilote | f6cb39a71976a7ce82cdea1c2ca7030cf381f57e |
| PR correspondant au dernier correctif applicatif | #70 — support des Server Actions dans Codespaces |
| Cible qualifiée | Pilote Dzaoudzi-Labattoir |
| URL publique qualifiée | https://dzaoudzi-labattoir.diagterritoire.fr |
| Date de qualification finale du pilote | 20 septembre 2026 |

Le SHA applicatif ci-dessus est celui effectivement installé et contrôlé sur le pilote au moment de la qualification finale. Le tag `v0.4.0` reste un repère historique et ne doit pas être déplacé. La documentation peut évoluer après cette remise sans modifier rétroactivement le SHA applicatif remis.

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
| Comptes et rôles | Connexion contributeur et validateur, parcours distincts | Recettes navigateur et pilote |
| Parcours métier | Brouillon, soumission, examen, validation, publication et rejet | Navigateur, données fictives |
| Consolidation | Inclusion des publiées, exclusion des non-publiées et rejetées | Navigateur et tests |
| Contrôles de droits | Tests workflow/consolidation et contrôle d'un brouillon tiers | Services applicatifs |
| Déconnexion | Retour vers Connexion et protection des pages après déconnexion | Deux rôles |
| Reprise PostgreSQL | Dump, checksum, restauration isolée et lecture applicative | Copie locale isolée |
| Installation reproductible | Installation, migrations, provisionnement, build, systemd, Caddy, sauvegarde/restauration et timer | Ubuntu 24.04 éphémère ; PR #66 |
| Administration courante | Affectations de services, désactivation et réinitialisation de mot de passe | CLI dédiée ; PR #64 |
| Confidentialité du dépôt | Contrôles de secrets usuels, clés/tokens à forte confiance, IBAN et suites numériques suspectes | Dépôt versionné |
| Validation CI du dernier correctif applicatif | Delivery validation réussie sur la PR #70 ; 43 tests réussis et build réussi consignés dans la PR | Correctif `next.config.ts` |

## 4. Qualification finale du pilote — 20 septembre 2026

Les contrôles suivants ont été réalisés sur l'instance réellement servie par le VPS pilote :

- dépôt applicatif propre au SHA `f6cb39a71976a7ce82cdea1c2ca7030cf381f57e` ;
- service `diagterritoire.service` actif ;
- Caddy actif ;
- PostgreSQL actif ;
- `AUTH_SECRET` défini sans affichage de sa valeur ;
- `AUTH_URL` défini ;
- `AUTH_TRUST_HOST=true` ;
- `DT_ALLOW_PILOT_SESSION=false` ;
- contrôle runtime réussi : connexion PostgreSQL, `/connexion` en HTTP 200, redirections protégées attendues, endpoint de session accessible et API territoriale refusée en HTTP 401 sans authentification ;
- parcours contributeur puis validateur rejoué jusqu'à publication sur le service Finances ;
- lecture consolidée vérifiée avec la contribution publiée ;
- migration de l'ancien service technique vers le service canonique `Services techniques` réalisée après sauvegarde ;
- deux utilisateurs du service et leurs credentials conservés ;
- deux contributions historiques conservées, dont une publiée et une rejetée ;
- accès navigateur du contributeur et du validateur au service migré confirmé ;
- 14 services canoniques présents après nettoyage ;
- sauvegarde finale créée le 20 septembre 2026 avec checksum ;
- timer de sauvegarde actif ;
- aucune unité systemd en échec après nettoyage des unités temporaires de contrôle.

Ces vérifications qualifient l'état du pilote au moment indiqué. Elles ne constituent pas un engagement de disponibilité future ni une réception contractuelle par une collectivité destinataire.

## 5. Conditions de remise et éléments à conserver hors dépôt

| Condition | État au 20 septembre 2026 |
| --- | --- |
| Instance pilote, URL HTTPS et SHA installé | Validés |
| Secrets hors Git et session pilote désactivée | Validés sur la cible par contrôles de présence uniquement |
| Comptes contributeur et validateur | Validés fonctionnellement ; liste nominative à conserver hors dépôt public |
| Parcours contribution de bout en bout | Validé en production pilote |
| Sauvegarde PostgreSQL et checksum | Validés ; timer actif |
| Procédure de restauration | Vérifiée sur copie isolée ; à adapter aux objectifs de reprise du destinataire |
| Exploitation et contacts | À renseigner dans la fiche interne de chaque destinataire |
| Stockage de sauvegarde hors machine | À définir selon l'organisation du destinataire |
| RPO, RTO, haute disponibilité | Non contractuels et non qualifiés par le pilote |

## 6. Réserves et limites connues

- L'administration courante couvre les affectations de services, la désactivation et la réinitialisation individuelle des mots de passe ; la réactivation d'un compte n'est pas couverte par cette procédure.
- Les modules affichés « en préparation » restent hors du parcours livré.
- La restauration vérifiée sur copie isolée ne qualifie pas la perte complète d'un hôte ni une architecture de haute disponibilité.
- La présence d'un timer de sauvegarde sur le VPS ne remplace pas une politique de copie hors machine définie par l'exploitant.
- Les coordonnées, comptes nominatifs, secrets et décisions de réception d'un destinataire restent hors du dépôt public.

## 7. Décision de remise

Le périmètre technique défini par l'issue #52 est qualifié pour remise : instance opérationnelle, comptes et rôles testés, services et territoire initialisés, procédures d'administration disponibles, sauvegarde et reprise documentées, parcours contributeur/validateur validés et SHA remis identifié.

La réception contractuelle, la désignation des responsables et les engagements d'exploitation restent propres à chaque collectivité destinataire et doivent être consignés dans sa fiche interne.

Cette fiche n'élargit pas le périmètre fonctionnel de DiagTerritoire.
