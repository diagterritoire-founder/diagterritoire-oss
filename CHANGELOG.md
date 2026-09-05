# Journal des modifications

Ce fichier recense les changements significatifs publiés dans les versions
Open Source de DiagTerritoire.

## Non publié

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
