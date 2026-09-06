# Journal des modifications

Ce fichier recense les changements significatifs publiés dans les versions
Open Source de DiagTerritoire.

## Non publié

### Intégration continue

- ajout d'un workflow GitHub Actions de validation de livraison sur les Pull Requests et les pushes vers `main` ;
- validation avec Node.js 22 et PostgreSQL 16 éphémère : `npm ci`, initialisation Prisma du pilote, tests automatisés, build de production et `npm audit` ;
- documentation explicite des prérequis et de la dette ESLint existante, sans masquer les échecs réels.

### Environnement de développement

- ajout d'un Dev Container Docker Compose avec une instance PostgreSQL 16 réelle et persistante pour le développement ;
- configuration automatique de la `DATABASE_URL` locale du service applicatif vers PostgreSQL ;
- documentation du fonctionnement avec et sans Dev Container, sans secret de production versionné ;

### Base de données pilote

- ajout d'un chemin reproductible d'initialisation du pilote fondé sur les migrations Prisma versionnées ;
- ajout d'un runner explicite pour appliquer les seeds PostgreSQL du workspace Dzaoudzi-Labattoir et de ses utilisateurs pilotes ;
- ajout des commandes `db:migrate`, `db:seed-pilot` et `db:init-pilot` tout en conservant `db:check-pilot` pour la vérification ;
- séparation documentée entre création du schéma par migrations, mise à niveau du schéma et application des données pilotes ;

### Documentation

- cadrage de `v0.3.0` autour de la livrabilité opérationnelle du pilote : environnement reproductible, base PostgreSQL, CI, build, runtime et déploiement documenté ;

## 0.2.0 — 2026-09-05

### Contrats territoriaux

- centralisation de la version publique du contrat territorial, maintenue en `1.0` ;
- validation déterministe des réponses produites par la couche d'intelligence territoriale ;
- ajout de la catégorie d'erreur stable `TERRITORY_NOT_FOUND` ;
- suppression de la dépendance au texte libre des erreurs dans les routes territoriales ;
- conservation des comportements HTTP existants : `401` sans authentification, `404` pour un territoire inexistant et `500` pour une erreur inattendue.

### Parcours territorial de référence

- validation automatisée du parcours `territoire → analyse → diagnostic → prospective → restitution` ;
- couverture du département de Mayotte, des 5 EPCI et des 17 communes pilotes ;
- caractérisation de Mayotte, CADEMA et Mamoudzou ainsi que du cas territoire inconnu ;
- contrôle du raccordement des restitutions territoire, rapport, prospective et API ;
- le rendu visuel final et le `next build` complet restent des contrôles d'environnement ; aucune `DATABASE_URL` fictive n'est injectée.

### Moteur de diagnostic

- ajout de tests de caractérisation du moteur de diagnostic ;
- consolidation de `core/engines/DiagnosticEngine.ts` comme implémentation de référence ;
- suppression de l'ancienne implémentation dupliquée `core/DiagnosticEnigine.ts`.

### Tests

- ajout d'une commande `npm test` fondée sur le runner natif Node.js via `tsx` ;
- ajout des premiers tests automatisés du moteur territorial.

### Documentation

- ajout de la feuille de route et cadrage du périmètre candidat pour `v0.2.0`.

## 0.1.1 — 2026-09-05

### Sécurité

- mise à jour forcée de `mysql2` vers `3.24.3` ;
- mise à jour forcée de `deepmerge-ts` vers `8.0.2` ;
- maintien de Prisma en `7.9.1` après vérification de compatibilité ;
- validation de l'installation avec `npm ci` ;
- validation de `prisma generate` ;
- validation de `npm audit` sans vulnérabilité connue au moment de la publication ;
- validation Dependabot sans alerte ouverte ;
- analyse CodeQL du commit publié terminée avec succès.

### Gouvernance

- ajout d'une politique publique de sécurité ;
- ajout de `CODEOWNERS` ;
- ajout des modèles de Pull Request et d'Issues ;
- activation d'un canal privé pour les signalements de vulnérabilités.

### Version

- alignement des métadonnées du projet sur `0.1.1`.

## 0.1.0 — 2026-09-05

Première publication Open Source de DiagTerritoire sous licence
`AGPL-3.0-only`.

Cette version constitue le snapshot public initial du projet.
