# Politique de sécurité

La sécurité de DiagTerritoire concerne notamment l'authentification, les données, les comptes, les API, la base de données et les services externes.

## Secrets

Aucun secret ne doit être ajouté au dépôt.

Sont notamment exclus du versionnement :

- mots de passe ;
- clés API ;
- jetons d'accès ;
- chaînes de connexion réelles ;
- secrets d'authentification ;
- fichiers `.env.local` ou équivalents.

Seul `.env.example` est destiné à être versionné et il ne doit contenir aucune valeur sensible réelle.

## Signalement d'une vulnérabilité

Une vulnérabilité de sécurité ne doit pas être publiée dans une issue publique.

Avant l'ouverture publique de DiagTerritoire, les signalements doivent être transmis au mainteneur du dépôt par un canal privé.

Un mécanisme permanent de signalement privé devra être configuré avant la publication Open Source du projet.

## Contenu d'un signalement

Un signalement devrait préciser autant que possible :

- la zone concernée ;
- les étapes de reproduction ;
- l'impact potentiel ;
- les versions ou commits concernés ;
- une proposition de correction éventuelle.

Les secrets ou données personnelles réelles ne doivent pas être inclus lorsqu'ils ne sont pas indispensables à l'analyse.

## Dépendances

Les alertes concernant les dépendances doivent être analysées avant toute mise à jour automatique majeure.

Les corrections forcées susceptibles d'introduire des changements cassants ne doivent pas être appliquées sans examen préalable.

### Risque résiduel lié à la chaîne Prisma

Lors de l'audit DT-OSS-005, quatre alertes de sévérité élevée restent associées à la chaîne Prisma 7.9.1 : `prisma`, `@prisma/config`, `mysql2` et `deepmerge-ts`.

Ces composants apparaissent dans l'arbre d'installation npm. Lors du contrôle de l'artefact de production généré pour Vercel, ils n'ont toutefois pas été retrouvés dans les fonctions déployées ; seul `@prisma/client` y est référencé.

Ces alertes sont donc suivies comme un risque résiduel de chaîne d'installation et de build, et non comme des composants identifiés dans le runtime web déployé lors de ce contrôle.

Aucun downgrade, remplacement transitif forcé ou passage à une version candidate majeure de Prisma ne doit être effectué uniquement pour supprimer ces alertes. La situation devra être réévaluée dès qu'une version stable de Prisma apportera une correction compatible.

## Versions prises en charge

DiagTerritoire est actuellement en développement actif.

La politique de support des versions sera formalisée avant la première publication Open Source stable.
