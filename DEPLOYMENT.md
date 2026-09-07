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
- les utilitaires clients PostgreSQL 16 (`psql`, `pg_dump` et `pg_restore`) pour les opérations de sauvegarde et de restauration ;
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

### 5.1 Sauvegarde logique

Le dépôt fournit une sauvegarde logique PostgreSQL avec `npm run db:backup`.

La commande utilise `pg_dump` au format `custom`, génère un contrôle SHA-256 et applique des permissions restrictives aux fichiers produits.

Pour le pilote, la stratégie de référence prévoit une sauvegarde logique quotidienne avec une rétention locale de 7 jours. Par défaut, les sauvegardes sont écrites dans `/var/backups/diagterritoire`. `BACKUP_DIR` permet de changer le répertoire et `RETENTION_DAYS` la durée de rétention.

Les sauvegardes doivent rester hors du dépôt Git. Le script refuse explicitement d’écrire un dump dans le dépôt.

### 5.2 Sauvegarde avant migration

Avant toute migration d’une base déjà utilisée, exécuter une sauvegarde immédiatement avant.

Exécuter `npm run db:backup`, puis `npm run db:migrate`.

La migration ne doit pas être lancée si la sauvegarde échoue.

Le dump et son checksum doivent être conservés jusqu’à validation du fonctionnement de l’application après migration.


### 5.3 Restauration contrôlée

Le dépôt fournit une restauration PostgreSQL contrôlée avec `npm run db:restore`.

La restauration exige un dump existant, son fichier `.sha256`, une base cible déjà créée et vide, ainsi qu’une confirmation explicite du nom réel de la base cible.

Les variables `BACKUP_FILE`, `TARGET_DATABASE_URL` et `RESTORE_CONFIRM_DATABASE` doivent être définies avant l’exécution.

Le script vérifie le checksum, refuse une confirmation incorrecte et refuse de restaurer dans une base non vide.

`TARGET_DATABASE_URL` peut contenir des identifiants PostgreSQL et doit rester hors du dépôt et de toute documentation contenant des valeurs réelles.


### 5.4 Qualification de la restauration

Le mécanisme de sauvegarde et de restauration a été validé avec PostgreSQL 16 en restaurant un dump dans une base isolée.

Le contrôle a vérifié le checksum du dump, le refus d’une confirmation incorrecte, le refus d’une base non vide et la restauration effective dans une base vide.

Après restauration, `npm run db:check-pilot` et `npx prisma migrate status` ont confirmé que les données pilotes étaient accessibles et que les migrations versionnées étaient à jour.

La base de restauration isolée a ensuite été supprimée.

Cette validation qualifie le mécanisme, mais pas encore l’instance PostgreSQL du pilote réellement déployé. Le test devra être rejoué sur cet environnement avant sa qualification définitive.


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

## 11. Qualification du pilote OVHcloud Public Cloud

### 11.1 Environnement qualifié

Une première qualification réelle du chemin de déploiement a été exécutée le 7 septembre 2026 sur OVHcloud Public Cloud Compute, dans la région Paris `EU-WEST-PAR`.

L'environnement utilisé pour cette qualification repose sur :

- une instance Compute Optimized `c3-8` ;
- 4 vCore ;
- 8 Go de mémoire vive ;
- 100 Go de stockage NVMe ;
- Ubuntu 26.04 LTS ;
- Node.js 22.22.1 ;
- PostgreSQL 16.15 ;
- un pare-feu hôte actif avec politique entrante restrictive ;
- une authentification SSH par clé publique, sans authentification SSH par mot de passe.

Aucune adresse IP publique, aucun identifiant de projet ou d'instance du fournisseur et aucun secret réel ne sont conservés dans le dépôt.

La révision applicative initialement qualifiée est le commit `5a0e803453fcf5cc0841bb71ed9735d95685c47e`.

### 11.2 PostgreSQL du pilote

PostgreSQL 16 est exécuté sur l'instance du pilote et reste lié à l'interface locale `127.0.0.1` sur le port 5432.

Le compte applicatif PostgreSQL :

- dispose du droit de connexion ;
- n'est pas superutilisateur ;
- ne peut pas créer de base ;
- ne peut pas créer de rôle ;
- ne dispose pas du droit de réplication.

La base applicative est possédée par ce compte afin de permettre l'application des migrations versionnées nécessaires à DiagTerritoire sans lui accorder de privilèges d'administration du cluster PostgreSQL.

Les secrets applicatifs sont conservés hors du dépôt dans un fichier d'environnement système lisible uniquement par `root` et le groupe du service DiagTerritoire. Les valeurs réelles de `DATABASE_URL` et `AUTH_SECRET` ne sont ni documentées ni versionnées.

### 11.3 Initialisation et migrations réelles

Le dépôt a été cloné sur l'instance puis verrouillé sur la révision qualifiée.

Les contrôles suivants ont réussi sur l'environnement réel :

- `npm ci` ;
- génération du client Prisma ;
- `prisma migrate deploy` ;
- application des deux migrations versionnées présentes à cette révision ;
- application du seed pilote ;
- `npm run db:check-pilot` ;
- `npx prisma migrate status`.

Le contrôle du seed a retrouvé le workspace pilote attendu et ses 14 services.

Prisma a confirmé que le schéma de la base réelle est à jour.

### 11.4 Sauvegarde quotidienne

La sauvegarde logique fournie par `npm run db:backup` a été exécutée avec succès sur la base réelle du pilote.

Le contrôle a validé :

- la création d'un dump PostgreSQL au format `custom` ;
- la lisibilité du dump par `pg_restore` ;
- le contrôle SHA-256 associé ;
- des permissions restrictives sur le dump et son checksum ;
- le stockage hors du dépôt Git.

Pour le pilote, la sauvegarde est automatisée par un timer systemd :

- fréquence : quotidienne ;
- horaire de référence : 02:30 UTC ;
- délai aléatoire maximal : 15 minutes ;
- exécution persistante après indisponibilité temporaire de la machine ;
- rétention : 7 jours ;
- répertoire : `/var/backups/diagterritoire`.

Le service de sauvegarde est exécuté sous le compte système DiagTerritoire et utilise le fichier de secrets externe à Git.

### 11.5 Qualification de la restauration sur l'instance réelle

Le dump produit sur l'instance réelle a été restauré dans une base PostgreSQL isolée et temporaire.

La qualification a vérifié successivement :

1. le checksum du dump ;
2. la restauration complète dans une base vide ;
3. la connexion avec le compte applicatif limité ;
4. la présence du workspace pilote et de ses données attendues avec `npm run db:check-pilot` ;
5. l'état des migrations avec `npx prisma migrate status` ;
6. la suppression de la base temporaire après validation.

La restauration a réussi et Prisma a confirmé que le schéma restauré est à jour.

Cette validation qualifie la base PostgreSQL réelle du pilote ainsi que le mécanisme de sauvegarde et de restauration sur cet environnement.

### 11.6 Éléments restant à qualifier

Cette qualification ne constitue pas encore la validation complète de l'environnement public DiagTerritoire.

Restent notamment à réaliser :

- le choix et la configuration du nom d'hôte public ;
- le reverse proxy ;
- l'ouverture contrôlée des ports HTTP et HTTPS ;
- la mise en place et le contrôle TLS ;
- le service permanent de l'application et sa politique de redémarrage ;
- la supervision et les journaux ;
- la validation Auth.js sur l'hôte public ;
- les parcours authentifiés de bout en bout.

Aucun de ces éléments n'est présenté comme validé tant que son contrôle réel n'a pas été effectué.
