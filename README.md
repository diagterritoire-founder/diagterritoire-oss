# DiagTerritoire

DiagTerritoire est une plateforme d'intelligence territoriale conçue pour aider les collectivités et les acteurs publics à observer, comprendre et piloter leur territoire.

Le projet relie progressivement :

**données territoriales → observation → diagnostic → analyse → prospective → restitution → aide à la décision**

Le pilote actuel est construit autour de Mayotte et de ses différents niveaux territoriaux.

## Objectifs

DiagTerritoire vise notamment à :

- structurer des indicateurs territoriaux ;
- produire des diagnostics lisibles ;
- identifier les enjeux et priorités d'action publique ;
- comparer des territoires de même niveau institutionnel ;
- organiser des plans d'action territoriaux ;
- explorer des scénarios prospectifs ;
- produire des restitutions utiles à la décision ;
- intégrer progressivement une intelligence territoriale assistée par IA.

## Périmètre pilote

Le périmètre actuel comprend notamment :

- Mayotte ;
- les 5 EPCI ;
- les 17 communes ;
- les indicateurs territoriaux ;
- le diagnostic ;
- le pilotage territorial ;
- la prospective ;
- la cartographie ;
- la comparaison interterritoriale ;
- la veille ;
- les rapports territoriaux ;
- l'assistant territorial.

La comparaison est actuellement limitée aux territoires de même niveau : EPCI avec EPCI et commune avec commune.

## Technologies principales

DiagTerritoire utilise notamment :

- Next.js 16 ;
- React 19 ;
- TypeScript ;
- Prisma 7 ;
- PostgreSQL ;
- Auth.js ;
- Leaflet ;
- Tailwind CSS ;

La cartographie utilise directement Leaflet 1.9.4.

## Déploiement

Le chemin de déploiement de référence du pilote, ses prérequis, ses variables d’environnement, les opérations PostgreSQL et les limites de validation sont documentés dans [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Installation locale

### Environnement de référence : Dev Container / Codespaces

L'environnement de développement de référence utilise Docker Compose via
le Dev Container.

Il démarre deux services :

- `app` : environnement Node.js 22 de DiagTerritoire ;
- `db` : instance PostgreSQL 16 dédiée au développement.

Le service `app` reçoit automatiquement une `DATABASE_URL` réelle
pointant vers le service PostgreSQL `db`.

Les identifiants PostgreSQL présents dans le fichier Compose sont des
identifiants locaux de développement. Ils ne constituent pas des secrets
de production et ne doivent pas être réutilisés pour un déploiement réel.

Après ouverture ou reconstruction du Dev Container :

```bash
npm ci
```

La présence de PostgreSQL ne crée pas automatiquement le schéma métier ni
les données pilotes. Leur initialisation reste une opération explicite.

### Initialisation de la base pilote

La base PostgreSQL cible doit exister et être désignée par une vraie `DATABASE_URL`.
DiagTerritoire distingue ensuite quatre opérations :

- `npm run db:migrate` : applique les migrations Prisma versionnées. Sur une base vide, elles créent le schéma ; sur une base existante, seules les migrations en attente sont appliquées ;
- `npm run db:seed-pilot` : applique explicitement les données du workspace pilote Dzaoudzi-Labattoir et ses utilisateurs pilotes, sans gérer le schéma ;
- `npm run db:check-pilot` : contrôle que le workspace pilote attendu est accessible dans la base configurée ;
- `npm run db:init-pilot` : génère le client Prisma, applique les migrations, exécute le seed pilote puis lance le contrôle.

Le seed pilote est conçu pour pouvoir être rejoué sans créer de doublons sur les données actuellement versionnées.


### Exécution hors Dev Container

Installer les dépendances :

```bash
npm ci
```

Créer ensuite un fichier local non versionné :

```bash
cp .env.example .env
```

Renseigner dans ce fichier une vraie `DATABASE_URL` PostgreSQL adaptée à
l'environnement utilisé.

Les fichiers `.env` sont ignorés par Git et ne doivent jamais contenir de
secret versionné.

## Commandes principales

- `npm run dev` : développement local ;
- `npm run build` : build de production ;
- `npm run runtime:check` : démarre le build de production et exécute le smoke test HTTP du runtime ;
- `npm run lint` : contrôle ESLint ;
- `npm test` : exécution des tests automatisés ;
- `npm run db:migrate` : application des migrations Prisma versionnées ;
- `npm run db:seed-pilot` : application explicite des données pilotes ;
- `npm run db:check-pilot` : contrôle du workspace pilote ;
- `npm run db:init-pilot` : initialisation complète et reproductible du pilote.

## Validation continue

La validation de livraison est automatisée par GitHub Actions sur les Pull Requests et sur les pushes vers `main`.

Le workflow utilise un environnement éphémère composé de Node.js 22 et PostgreSQL 16. La `DATABASE_URL` du workflow pointe réellement vers ce service PostgreSQL de CI. Les identifiants utilisés sont propres à cette instance temporaire et ne constituent pas des secrets de production.

La séquence de validation est :

- `npm ci` : installation reproductible des dépendances ;
- `npm run db:init-pilot` : génération Prisma, migrations, seed pilote et contrôle de la base ;
- `npm test` : tests automatisés ;
- `npm run build` : build Next.js de production ;
- `npm run runtime:check` : démarrage du build et smoke test HTTP du runtime de production ;
- `npm audit` : contrôle des vulnérabilités connues des dépendances.

Chaque étape est bloquante : une commande qui retourne un code non nul fait échouer le job. Aucun secret de production ni variable fictive n'est injecté pour contourner un contrôle.

Le lint reste disponible avec `npm run lint`, mais n'est pas actuellement un contrôle bloquant de cette CI en raison d'erreurs préexistantes sur `main`. Elles ne sont ni masquées ni converties artificiellement en succès.

CodeQL et Dependabot restent des contrôles complémentaires.

### Contrôle du runtime de production

Après un build réussi, le runtime peut être contrôlé avec :

```bash
npm run runtime:check
```

Le contrôle exige une vraie `DATABASE_URL` accessible et une base pilote initialisée. Il vérifie au préalable que les données pilotes attendues sont accessibles, puis démarre le résultat de `next build` avec `next start` sur une adresse locale. S’il n’existe pas déjà, un `AUTH_SECRET` aléatoire et éphémère est généré uniquement pour la durée du smoke test ; sa valeur n’est ni affichée ni versionnée. Le contrôle fixe également son URL Auth.js sur l’instance locale testée afin de ne pas dépendre du nom d’hôte du Codespace ou du runner CI.

Le smoke test vérifie la disponibilité de la page de connexion, les redirections des routes racine et protégée, la réponse de session Auth.js et le refus attendu d’une API territoriale sans authentification. Il échoue aussi si Auth.js journalise une erreur pendant ces contrôles.

Ce contrôle reste volontairement limité : il ne valide pas une connexion utilisateur complète, les parcours métier authentifiés, le rendu dans un navigateur, un reverse proxy, TLS, un nom de domaine public ni la configuration des secrets d’un déploiement réel. Ces éléments relèvent de la validation de déploiement de l’environnement cible.

## Organisation du dépôt

- `app/` : application Next.js et routes ;
- `components/` : composants d'interface ;
- `config/` : configuration ;
- `core/` : services et logique métier ;
- `data/` : référentiels et données territoriales ;
- `lib/` : services techniques ;
- `prisma/` : modèle et migrations ;
- `public/` : ressources publiques ;
- `scripts/` : scripts d'exploitation et de contrôle.

## Données et ressources territoriales

Les données, GeoJSON, emblèmes, logos et autres ressources institutionnelles ne doivent pas être considérés automatiquement comme couverts par la licence AGPL-3.0-only applicable au code.

Leur provenance, leur régime de réutilisation et les éventuelles obligations d'attribution sont documentés dans `THIRD_PARTY_NOTICES.md`.

Les ressources dont les droits de redistribution n'ont pas pu être établis ont été exclues de la distribution publique lors de la préparation Open Source.

## Sécurité, contribution et maintenance

- les règles de contribution sont décrites dans `CONTRIBUTING.md` ;
- les signalements de sécurité sont encadrés par `SECURITY.md` ;
- les règles de maintenance et de version sont décrites dans `MAINTENANCE.md` ;
- les modalités de support figurent dans `SUPPORT.md` ;
- les changements publiés sont suivis dans `CHANGELOG.md` ;
- la feuille de route du projet est décrite dans `ROADMAP.md` ;
- les composants et ressources tiers sont documentés dans `THIRD_PARTY_NOTICES.md`.

## Licence

Le code source de DiagTerritoire est distribué sous GNU Affero General Public License version 3 uniquement (`AGPL-3.0-only`).

Le texte complet de la licence figure dans le fichier `LICENSE`.

Les données, emblèmes, logos et autres ressources tierces conservent leurs licences ou droits propres, documentés dans `THIRD_PARTY_NOTICES.md`.

## Statut

DiagTerritoire est en développement actif, avec une priorité donnée à la stabilisation, à la fiabilisation et à la livraison progressive de fonctionnalités directement utilisables par les collectivités.

**DiagTerritoire — transformer la donnée territoriale en capacité d'action publique.**
