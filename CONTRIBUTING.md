# Contribuer à DiagTerritoire

Merci de l'intérêt porté à DiagTerritoire.

Le projet privilégie des évolutions limitées, compréhensibles et directement utiles aux collectivités.

## Principes de contribution

Toute contribution doit :

- répondre à un besoin clairement identifié ;
- préserver l'architecture existante lorsqu'elle répond déjà au besoin ;
- éviter les refontes générales sans justification fonctionnelle ;
- limiter le nombre de fichiers modifiés ;
- conserver la compatibilité avec les parcours existants ;
- ne jamais introduire de secret dans le dépôt ;
- documenter toute nouvelle dépendance ;
- vérifier la provenance et les droits des ressources tierces ajoutées.

## Installation

Installer les dépendances :

`npm install`

Créer ensuite l'environnement local à partir du modèle public :

`cp .env.example .env.local`

Le fichier `.env.local` ne doit jamais être versionné.

## Validation

Avant de proposer une modification, exécuter :

- `npm run lint`
- `npm run build`
- `git diff --check`

Une nouvelle dépendance ne doit être ajoutée que lorsqu'elle est réellement nécessaire.

## Données territoriales

Toute nouvelle donnée territoriale doit être documentée autant que possible avec :

- sa source ;
- sa période de référence ;
- son niveau territorial ;
- sa définition ;
- son unité ;
- ses éventuelles limites méthodologiques.

Une donnée départementale ne doit pas être présentée comme une donnée communale ou intercommunale.

## Ressources graphiques et institutionnelles

Ne pas ajouter de logo, blason, emblème, carte, photographie ou autre ressource sans vérifier :

- sa provenance ;
- son régime de réutilisation ;
- sa licence lorsqu'elle existe ;
- les éventuelles obligations d'attribution.

## Dépendances et Open Source

Avant d'ajouter une dépendance, vérifier au minimum :

- sa licence ;
- son usage réel dans DiagTerritoire ;
- sa maintenance ;
- son impact sur la future distribution Open Source du projet.

Les composants imposant des restrictions d'usage incompatibles avec une distribution Open Source classique doivent être évités.

## Sécurité

Les vulnérabilités ne doivent pas être publiées dans une issue publique.

Les modalités de signalement sont décrites dans `SECURITY.md`.

## Licence des contributions

Le code de DiagTerritoire est distribué sous licence `AGPL-3.0-only`.

Toute contribution acceptée au code du projet doit pouvoir être distribuée sous cette licence. Les éléments tiers intégrés dans une contribution doivent conserver une provenance et une licence clairement documentées.
