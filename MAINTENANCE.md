# Maintenance de DiagTerritoire

Ce document décrit les règles de maintenance du dépôt public DiagTerritoire.

## Branche de référence

`main` constitue la branche publique de référence.

Elle doit rester protégée et recevoir les changements par Pull Request.

Les branches de travail sont supprimées après leur fusion.

## Politique de versions

Tant que DiagTerritoire reste en version `0.x`, le projet applique les
principes suivants :

- une version corrective `0.x.y` est destinée aux corrections, à la sécurité,
  à la documentation et aux mises à jour compatibles ;
- une version mineure `0.x.0` correspond à un périmètre fonctionnel
  explicitement cadré avant son développement ;
- aucun changement volontairement incompatible ne doit être introduit
  silencieusement ;
- tout changement incompatible doit être documenté avant publication.

Le numéro de version doit être aligné dans `package.json` et
`package-lock.json` avant la création d'un tag de publication.

## Cycle d'une modification

Une évolution publique suit normalement ce cycle :

1. besoin identifié ;
2. branche dédiée ;
3. changement limité au périmètre prévu ;
4. Pull Request ;
5. revue du diff ;
6. validations techniques adaptées au changement ;
7. fusion contrôlée dans `main` ;
8. vérification du nouveau `main` ;
9. création éventuelle d'un tag et d'une GitHub Release.

Un tag de version ne doit pas être créé avant la validation du commit destiné
à être publié.

## Validation

Selon la nature du changement, les contrôles peuvent inclure :

- `git diff --check` ;
- `npm ci` ;
- `npm run lint` ;
- `npm run build` ;
- `prisma generate` ;
- `npm audit` ;
- Dependabot ;
- CodeQL.

Un contrôle non applicable ou impossible dans l'environnement utilisé doit
être indiqué explicitement plutôt que contourné artificiellement.

Aucune variable d'environnement fictive ne doit être inventée uniquement pour
faire réussir une validation.

## Dépendances

Une dépendance ou un override ne doit être ajouté que lorsqu'il existe un
besoin identifié et documenté.

Les corrections de sécurité doivent préserver autant que possible la
compatibilité du projet.

Une alerte ne doit pas être masquée par un downgrade, une version instable ou
un remplacement forcé sans analyse de compatibilité.

## Sécurité

Les vulnérabilités potentielles ne doivent pas être publiées dans une Issue
publique.

Les modalités de signalement sont définies dans `SECURITY.md`.

Dependabot et CodeQL font partie du dispositif de surveillance du dépôt.

## Historique Git

Le dépôt privilégie un historique linéaire et les fusions par squash.

Les force-pushes et suppressions de `main` doivent rester interdits.

L'historique public publié ne doit pas être réécrit pour des raisons
cosmétiques.

## Identité et confidentialité des commits

Les commits publics créés localement doivent utiliser l'identité
`diagterritoire-founder` avec l'adresse GitHub `noreply`.

Avant toute fusion GitHub susceptible de créer un commit squash, le mainteneur
doit vérifier que la confidentialité de son adresse de commit est activée dans
son compte GitHub.

Aucun secret, jeton, adresse privée volontairement masquée ou donnée
confidentielle ne doit être ajouté au dépôt.
