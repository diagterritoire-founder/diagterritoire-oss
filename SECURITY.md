# Politique de sécurité

La sécurité de DiagTerritoire concerne notamment l'authentification, les données, les comptes, les API, la base de données, les dépendances et les services externes.

## Signalement privé d'une vulnérabilité

Une vulnérabilité de sécurité ne doit pas être publiée dans une issue, une discussion ou une Pull Request publique.

DiagTerritoire utilise le mécanisme de signalement privé des vulnérabilités de GitHub.

Pour effectuer un signalement confidentiel :

https://github.com/diagterritoire-founder/diagterritoire-oss/security/advisories/new

Le signalement devrait préciser autant que possible :

- la zone ou le composant concerné ;
- les étapes de reproduction ;
- l'impact potentiel ;
- les versions ou commits concernés ;
- une proposition de correction éventuelle.

Les secrets, données personnelles ou informations sensibles réelles ne doivent pas être inclus lorsqu'ils ne sont pas indispensables à l'analyse.

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

## Contrôles de sécurité du dépôt public

Le dépôt public utilise notamment :

- CodeQL pour l'analyse statique du code ;
- GitHub Secret Scanning ;
- la protection contre le push de secrets ;
- les alertes Dependabot ;
- les mises à jour de sécurité Dependabot.

Ces mécanismes complètent les revues humaines et ne remplacent pas l'analyse des modifications proposées.

## Dépendances

Les alertes concernant les dépendances doivent être analysées avant toute mise à jour automatique majeure.

Les corrections susceptibles d'introduire des changements cassants ne doivent pas être appliquées sans examen préalable.

### Dépendances transitives et chaîne de build

Certaines vulnérabilités peuvent concerner des dépendances transitives utilisées pendant l'installation, la génération du client Prisma ou le processus de build.

La présence d'une dépendance dans une portée de développement ne suffit pas à conclure à une exposition du runtime, mais ne justifie pas non plus d'ignorer une alerte de sécurité.

L'état courant des vulnérabilités connues est suivi au moyen de GitHub Dependabot.

Lorsqu'une version corrigée stable et compatible est disponible, sa mise à jour doit être examinée et testée dans un changement distinct.

Les downgrades, remplacements transitifs forcés, overrides ou versions majeures non stables ne doivent pas être utilisés uniquement pour faire disparaître une alerte sans analyse de compatibilité.

## Versions prises en charge

DiagTerritoire est actuellement en développement actif avant la version `1.0`.

La dernière version publique publiée constitue la référence prise en charge en priorité pour les corrections de sécurité.

Les anciennes versions peuvent ne plus recevoir de correctif une fois une version plus récente publiée.
