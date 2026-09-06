# Déploiement de référence

Ce document décrit le chemin de déploiement de référence actuellement validé pour le pilote DiagTerritoire.

Il ne présente comme validés que les mécanismes effectivement présents et vérifiés dans le dépôt.

## 1. Portée et statut

Le chemin de référence validé pour le pilote repose sur un runtime Node.js/Next.js et une base PostgreSQL réelle. Il reste indépendant d’un fournisseur d’hébergement particulier.

Vercel n’est pas présenté comme un chemin validé tant qu’un déploiement de bout en bout n’a pas été exécuté et contrôlé sur cette plateforme.

Aucun secret de production ne doit être stocké dans le dépôt, dans la documentation ou dans un fichier versionné.

## 2. Chemin de référence validé

Depuis un clone frais du dépôt :

1. se placer sur la version ou le commit à déployer ;
2. installer les dépendances avec `npm ci` ;
3. disposer d’une instance PostgreSQL réelle et accessible ;
4. configurer les variables d’environnement requises ;
5. initialiser la base pilote avec `npm run db:init-pilot` ;
6. exécuter les tests avec `npm test` ;
7. produire le build avec `npm run build` ;
8. contrôler le build avec `npm run runtime:check` ;
9. démarrer l’application dans l’environnement cible avec `npm start`.

`npm run runtime:check` est un contrôle préalable reproductible. Il démarre temporairement le build, vérifie plusieurs réponses HTTP puis arrête le processus qu’il a lancé.

## 3. Prérequis

Le chemin de référence a été validé avec :

- Node.js 22 ;
- npm et le fichier `package-lock.json` versionné ;
- PostgreSQL 16 ;
- un environnement capable d’exécuter `bash` et `curl` pour le contrôle du runtime ;
- un accès réseau à la base PostgreSQL cible.

Les versions Node.js 22 et PostgreSQL 16 constituent les versions de référence utilisées par le Dev Container et la CI. Ce document ne qualifie pas d’autres versions comme équivalentes tant qu’elles n’ont pas été validées.

Docker n’est pas requis pour un déploiement hors Dev Container si une instance PostgreSQL compatible est déjà disponible.

## 4. Variables d’environnement

### 4.1 Variables obligatoires

- `DATABASE_URL` : URL de connexion vers une instance PostgreSQL réelle et accessible. Elle est utilisée par Prisma, les migrations, le seed et les contrôles du pilote.
- `AUTH_SECRET` : secret d’authentification Auth.js à fournir pour un déploiement réel. Le secret éphémère généré par `npm run runtime:check` est réservé au smoke test et ne doit pas être utilisé comme secret de production.

### 4.2 Variables optionnelles

- `NEXT_PUBLIC_API_BASE_URL` : URL de base de l’API exposée au code client. Une valeur vide est acceptée par la configuration actuelle.
- `OMNIROUTE_BASE_URL` : URL du service OmniRoute. En son absence, le service utilise sa valeur de repli locale.
- `OMNIROUTE_MODEL` : modèle OmniRoute demandé. En son absence, la valeur `auto` est utilisée.

Ces variables ne doivent être renseignées que lorsque l’environnement cible nécessite de remplacer les valeurs de repli prévues par l’application.

### 4.3 Secrets

`DATABASE_URL` peut contenir des identifiants d’accès à PostgreSQL et doit donc être traitée comme une information sensible.

`AUTH_SECRET` est un secret applicatif. Sa valeur ne doit jamais être stockée dans le dépôt, le README, ce document ou un fichier versionné.

Les valeurs réelles doivent être injectées par le mécanisme de gestion des variables ou secrets de l’environnement cible.

### 4.4 Paramètres du pilote

- `DT_ALLOW_PILOT_SESSION` : active uniquement lorsqu’elle vaut `true` la session pilote de repli en l’absence de session Auth.js. Sa valeur par défaut documentée est `false`.
- `DT_PILOT_USER_ID` : identifiant du compte pilote utilisé lorsque la session pilote est activée. S’il est absent, l’application utilise l’identifiant pilote par défaut prévu dans le code.

Pour un environnement qui ne doit pas utiliser la session pilote de repli, conserver `DT_ALLOW_PILOT_SESSION=false`.

## 5. PostgreSQL

DiagTerritoire nécessite une base PostgreSQL réelle. PostgreSQL 16 constitue la version de référence utilisée par le Dev Container et la CI.

La base cible doit exister avant l’initialisation applicative. DiagTerritoire applique les migrations et les données pilotes, mais ne crée pas le serveur PostgreSQL ni l’instance de base elle-même.

La variable `DATABASE_URL` doit pointer vers cette base et fournir les informations de connexion nécessaires à l’environnement cible.

Les identifiants présents dans `.devcontainer/docker-compose.yml` sont exclusivement destinés au développement local. Ils ne doivent jamais être réutilisés dans un environnement réel.

Le choix du fournisseur PostgreSQL, de l’hébergement, de la sauvegarde et de la politique de haute disponibilité relève de l’environnement cible et n’est pas imposé par le dépôt.

## 6. Initialisation de la base

Une fois `DATABASE_URL` configurée vers la base cible, exécuter :

```bash
npm run db:init-pilot
```

Cette commande applique, dans cet ordre :

1. `prisma generate` : génère le client Prisma ;
2. `npm run db:migrate` : exécute `prisma migrate deploy` et applique les migrations versionnées en attente ;
3. `npm run db:seed-pilot` : applique les données nécessaires au workspace pilote ;
4. `npm run db:check-pilot` : vérifie que les données pilotes attendues sont accessibles.

Le déploiement utilise les migrations déjà versionnées. Il ne génère pas de nouvelle migration avec `prisma migrate dev`.

Sur une base déjà initialisée, `prisma migrate deploy` n’applique que les migrations encore en attente. Le seed pilote versionné est conçu pour pouvoir être rejoué sur les données actuellement prises en charge.

L’initialisation de la base doit réussir avant le build et avant le démarrage du runtime.

## 7. Build de production

Après l’initialisation réussie de la base et avec les variables d’environnement requises disponibles, produire le build de production avec :

```bash
npm run build
```

Cette commande exécute `prisma generate` puis `next build`.

Le build doit se terminer avec un code de sortie nul. Le résultat Next.js est généré dans `.next` et constitue le build utilisé ensuite par `npm start` et par `npm run runtime:check`.

Aucune `DATABASE_URL` fictive ne doit être introduite uniquement pour faire réussir le build.

## 8. Démarrage et contrôle du runtime

Après un build réussi, exécuter le contrôle reproductible du runtime :

```bash
npm run runtime:check
```

Ce contrôle exige une `DATABASE_URL` réelle, un build `.next` existant et une base pilote déjà initialisée. Il exécute d’abord `npm run db:check-pilot`.

Le script démarre temporairement `next start` sur `127.0.0.1`. Le port de contrôle vaut `3100` par défaut et peut être remplacé uniquement pour ce smoke test avec `DT_RUNTIME_PORT`.

S’il n’existe pas déjà, le script génère un `AUTH_SECRET` aléatoire et éphémère. Il fixe aussi `AUTH_URL` et `AUTH_TRUST_HOST` pour l’instance locale du contrôle. Ces valeurs techniques du smoke test ne constituent pas des secrets ou paramètres de production à réutiliser.

Le contrôle vérifie notamment la page de connexion, les redirections des routes racine et protégée, la session Auth.js et le refus attendu d’une API territoriale sans authentification. Il échoue également si Auth.js journalise une erreur.

Après validation du smoke test, configurer les secrets réels de l’environnement cible puis démarrer le processus applicatif avec :

```bash
npm start
```

`npm start` exécute `next start`. Le smoke test n’est pas le processus de production permanent : il lance sa propre instance temporaire puis l’arrête.

## 9. Vercel

Vercel n’est pas, à ce stade, le chemin de déploiement de référence validé pour le pilote DiagTerritoire.

Le dépôt est basé sur Next.js et reste techniquement compatible avec une étude de déploiement sur Vercel, mais aucun déploiement Vercel de bout en bout n’a encore été qualifié dans le cadre de cette version.

En particulier, cette documentation ne suppose ni fournisseur PostgreSQL associé, ni configuration de domaine, ni politique de secrets propre à Vercel.

Un futur chemin Vercel ne pourra être présenté comme validé qu’après contrôle réel de la base PostgreSQL, des migrations, des variables d’environnement, de l’authentification et du runtime sur cette plateforme.

## 10. Limites et validation de l’environnement cible

Le mécanisme de référence valide l’installation des dépendances, PostgreSQL, l’initialisation du pilote, les tests automatisés, le build Next.js et le démarrage contrôlé du runtime.

Il ne constitue pas à lui seul une qualification complète d’un environnement public de production.

Avant une mise en service réelle, l’environnement cible doit notamment valider :

- la gestion durable et sécurisée de `DATABASE_URL` et `AUTH_SECRET` ;
- la connectivité et les droits de la base PostgreSQL ;
- la stratégie de sauvegarde et de restauration de la base ;
- le nom de domaine public et TLS ;
- le reverse proxy ou la couche d’exposition réseau lorsqu’ils existent ;
- le comportement Auth.js avec l’hôte public retenu ;
- une connexion utilisateur réelle et les principaux parcours authentifiés ;
- les éventuels services externes activés, notamment OmniRoute ;
- les journaux, la supervision et la politique de redémarrage du processus applicatif.

`npm run runtime:check` reste un smoke test local reproductible. Il ne remplace pas ces contrôles propres à l’environnement réellement déployé.

Le déploiement est considéré conforme à ce chemin de référence uniquement lorsque les étapes documentées ont été exécutées sans variable fictive, sans secret versionné et avec une base PostgreSQL réelle.
