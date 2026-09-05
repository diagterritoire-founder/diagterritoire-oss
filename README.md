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
- Vercel.

La cartographie utilise directement Leaflet 1.9.4.

## Installation locale

Installer les dépendances avec `npm install`.

Créer ensuite un fichier `.env.local` à partir de `.env.example` et renseigner uniquement les variables nécessaires à l'environnement local.

Aucun secret ni fichier `.env.local` ne doit être versionné.

## Commandes principales

- `npm run dev` : développement local ;
- `npm run build` : build de production ;
- `npm run lint` : contrôle ESLint ;
- `npm run db:check-pilot` : contrôle du seed pilote.

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
- les composants et ressources tiers sont documentés dans `THIRD_PARTY_NOTICES.md`.

## Licence

Le code source de DiagTerritoire est distribué sous GNU Affero General Public License version 3 uniquement (`AGPL-3.0-only`).

Le texte complet de la licence figure dans le fichier `LICENSE`.

Les données, emblèmes, logos et autres ressources tierces conservent leurs licences ou droits propres, documentés dans `THIRD_PARTY_NOTICES.md`.

## Statut

DiagTerritoire est en développement actif, avec une priorité donnée à la stabilisation, à la fiabilisation et à la livraison progressive de fonctionnalités directement utilisables par les collectivités.

**DiagTerritoire — transformer la donnée territoriale en capacité d'action publique.**
