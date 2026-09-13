# DiagTerritoire — Dossier de remise aux collectivités

Version documentaire : projet du 13 septembre 2026 — issue #52.
Statut : prêt pour revue documentaire ; ne vaut pas procès-verbal de recette.
Destination proposée : `DELIVERY.md`, à la racine de la branche `docs/52-dossier-remise`.

## 1. Objet et références de version

Ce dossier rassemble les procédures existantes et les compléments nécessaires à la remise. Le périmètre fonctionnel reste celui de v0.4.0, complété par la déconnexion explicite de #50. Il ne crée aucune fonctionnalité ni engagement de service.

| Référence | Valeur et portée |
| --- | --- |
| Dépôt | `diagterritoire-founder/diagterritoire-oss` |
| Release publiée | `v0.4.0`, 12 septembre 2026 |
| Commit du tag | `33b208b46456c7870fec926986060df64d7cb986` |
| Candidat fonctionnel qualifié dans #44 | `2ce5be410e6a0a8e00c42380c0ad4853ebbbcf5f` |
| Base de lecture de ce dossier | `040eff6ea3fc0e51a6b1edd1e7d2a5e5ad18e7f1` |
| Correctif intégré à cette base | PR #53, déconnexion explicite, issue #50 fermée |
| Version effectivement remise | À renseigner lors de la recette : tag éventuel et SHA complet |

Le commit de base est postérieur au tag v0.4.0. Une instance qui exécute seulement ce tag ne bénéficie pas du bouton ajouté par #53. Ne pas déplacer le tag existant. Toute publication corrective suit MAINTENANCE.md, avec cohérence de package.json et package-lock.json.

## 2. Documents réutilisés

Les liens suivants figent les sources examinées. Les documents techniques restent les références détaillées ; les sections ci-dessous en organisent l'utilisation.

| Source | Réutilisation |
| --- | --- |
| [DEPLOYMENT.md](https://github.com/diagterritoire-founder/diagterritoire-oss/blob/040eff6ea3fc0e51a6b1edd1e7d2a5e5ad18e7f1/DEPLOYMENT.md) | Prérequis, variables, migrations, runtime ; sauvegarde et restauration ; qualifications du pilote |
| [README.md](https://github.com/diagterritoire-founder/diagterritoire-oss/blob/040eff6ea3fc0e51a6b1edd1e7d2a5e5ad18e7f1/README.md) | Installation locale, commandes, limites du smoke test et de la CI |
| [MAINTENANCE.md](https://github.com/diagterritoire-founder/diagterritoire-oss/blob/040eff6ea3fc0e51a6b1edd1e7d2a5e5ad18e7f1/MAINTENANCE.md) | Versions, PR, squash, validation, confidentialité des commits |
| [SUPPORT.md](https://github.com/diagterritoire-founder/diagterritoire-oss/blob/040eff6ea3fc0e51a6b1edd1e7d2a5e5ad18e7f1/SUPPORT.md) | Signalement d'incident, informations utiles, absence de délai contractuel garanti |
| [Issue #44](https://github.com/diagterritoire-founder/diagterritoire-oss/issues/44) | Qualification métier historique, limites du périmètre qualifié |
| [Issue #52](https://github.com/diagterritoire-founder/diagterritoire-oss/issues/52) | Critères de sortie de livraison |

SECURITY.md reste la référence pour les signalements privés ; CONTRIBUTING.md pour contribuer au code ; CHANGELOG.md pour les changements publiés. Le contributeur métier décrit ici est un utilisateur de l'application, distinct d'un contributeur au dépôt.

## 3. Fiche de remise à compléter hors du dépôt public

Consigner : collectivité destinataire ; territoire et identifiant ; workspace et identifiant ; services actifs ; URL cible ; version et SHA installés ; date ; responsable métier ; administrateur applicatif ; exploitant système ; contact support ; lieu protégé de conservation des preuves ; décision de recette et réserves.

Conserver séparément la liste nominative des comptes, leurs rôles et services autorisés. Transmettre les secrets par le canal sécurisé de la collectivité. Aucun mot de passe, dump, chaîne de connexion ou donnée personnelle sensible ne doit figurer dans le dossier public.

## 4. Rôles et droits du parcours de contribution

Matrice des permissions par défaut, lue dans WorkspaceAccessEngine. Les permissions explicites et les rôles multiples s'additionnent : vérifier les droits effectifs, pas seulement l'intitulé du rôle. Un compte doit être actif. Les contrôles du service imposent aussi la cohérence du workspace et du territoire.

| Rôle technique | Services accessibles | Créer | Modifier/soumettre son brouillon | Examiner/valider/rejeter | Publier |
| --- | --- | --- | --- | --- | --- |
| contributor | Services affectés | Oui | Oui | Non | Non |
| validator | Services affectés | Non | Non | Oui | Oui |
| service_manager | Services affectés | Oui | Oui | Oui | Non |
| general_management | Accès global aux services du workspace | Oui | Oui | Oui | Oui |
| administrator | Accès global aux services du workspace | Oui | Oui | Oui | Oui |
| executive | Accès global aux services du workspace | Non | Non | Non | Non |
| observer | Services affectés | Non | Non | Non | Non |

L'accès global n'autorise pas les autres workspaces. Même un administrateur ne peut modifier ou soumettre le brouillon d'un autre auteur par le service actuel. Une permission nommée dans le moteur ne prouve pas l'existence d'un écran de gestion correspondant. Ce dossier ne promet pas de console d'administration des comptes.

## 5. Guide contributeur métier

1. Ouvrir l'URL remise, puis `/connexion`. Utiliser le compte personnel provisionné pour le workspace.
2. Accéder à l'Espace Métiers, au territoire puis à un service autorisé. Si le service manque, contacter l'administrateur ; ne pas utiliser un autre compte pour élargir son accès.
3. Ouvrir les contributions et créer un brouillon. Renseigner le type et un titre ; préciser la description, la période de référence et la source métier selon le besoin. Les types proposés incluent indicateur, projet, action, document, événement, alerte, observation et autre. Le type « Document » ne constitue pas une promesse de téléversement de pièce jointe.
4. Ouvrir la contribution enregistrée. Vérifier son rattachement au bon territoire et service. Modifier si nécessaire, puis sélectionner « Enregistrer le brouillon ».
5. Après relecture, sélectionner « Soumettre ». Vérifier le statut « Soumis » et l'historique. La modification du contenu est réservée à l'auteur tant que le statut reste « Brouillon ».
6. Suivre le traitement. Une validation seule n'est pas une publication. Seules les contributions publiées alimentent la lecture consolidée.
7. Si la contribution est rejetée, contacter le validateur pour connaître la suite métier. Le parcours actuel ne fournit pas de bouton de retour en brouillon ; ne pas annoncer une correction et une resoumission automatiques.
8. Sélectionner « Déconnexion » dans l'en-tête pour le commit intégrant #53. Vérifier le retour à `/connexion`. Si l'opération ne termine pas correctement, ne pas considérer la session comme fermée et signaler l'incident.

## 6. Guide validateur

1. Se connecter avec son propre compte et ouvrir le service autorisé.
2. Sélectionner une contribution « Soumis ». Examiner son contenu, sa source et sa période ; consulter l'historique.
3. Sélectionner « Prendre en examen » : le statut devient « En examen ».
4. Sélectionner « Valider » pour accepter une contribution en examen. « Rejeter » est disponible depuis « Soumis » ou « En examen » pour un compte autorisé.
5. Après validation, sélectionner explicitement « Publier ». Vérifier le statut et la présence dans la vue des contributions publiées.
6. Vérifier qu'un brouillon ou un rejet n'apparaît pas dans cette consolidation. Se déconnecter en fin de session.

Les boutons dépendent du statut et des droits. En cas de modification concurrente, recharger la page et examiner le nouvel état avant de recommencer. Ne pas modifier directement le statut en base pour forcer un traitement. La séparation entre personnes qui contribuent et valident doit être organisée par la collectivité ; la matrice additive ne garantit pas à elle seule une séparation automatique des fonctions.

## 7. Guide administrateur et exploitation courante

À la prise en charge, vérifier la fiche de remise, les comptes, leurs statuts actifs, les rôles cumulés et les affectations aux services. Tester les accès attendus et les refus hors périmètre. Distinguer le rôle applicatif administrator des privilèges système de l'exploitant.

Le provisionnement générique, la modification des droits et la réinitialisation individuelle des identifiants restent à formaliser et qualifier avant une remise autonome. Le seed existant est spécifique au pilote et réapplique les mots de passe des deux comptes pilotes : ne pas l'utiliser comme outil de gestion courante d'une autre collectivité.

Sur le pilote utilisant les noms de services documentés, l'exploitant habilité peut consulter :

```bash
systemctl status diagterritoire.service --no-pager
systemctl status caddy --no-pager
systemctl status postgresql --no-pager
journalctl -u diagterritoire.service --since '1 hour ago' --no-pager
systemctl --failed
```

Les journaux restent internes et doivent être expurgés avant partage. Vérifier régulièrement l'accès HTTPS, le dernier résultat de sauvegarde et l'espace disponible. La fréquence d'exploitation et le destinataire des alertes doivent être consignés pour l'instance remise.

Pour une interruption planifiée, prévenir les utilisateurs et arrêter l'application avec `sudo systemctl stop diagterritoire.service`. Démarrer avec `sudo systemctl start diagterritoire.service` ; redémarrer avec `sudo systemctl restart diagterritoire.service`. Contrôler ensuite le service, `/connexion` et un parcours authentifié. Ces commandes supposent le service réellement installé ; elles ne constituent pas son installation.

| Incident | Action initiale |
| --- | --- |
| Connexion refusée | Vérifier l'URL, le compte actif et le provisionnement ; ne pas communiquer de mot de passe dans une issue |
| Service ou contribution introuvable | Vérifier workspace, territoire, affectation et rôle ; une absence peut traduire un refus d'accès |
| Action indisponible | Vérifier statut, qualité d'auteur et permission effective |
| Modification concurrente | Recharger et examiner l'état enregistré avant nouvelle action |
| Application indisponible | Vérifier services, journaux, base et proxy ; conserver les éléments d'incident |
| Sauvegarde en échec | Vérifier stockage, permissions et connexion ; ne pas lancer une migration prévue tant que la sauvegarde préalable échoue |
| Déconnexion incertaine | Vérifier la session et l'accès protégé ; ne pas assimiler une fermeture d'onglet à une déconnexion |

## 8. Déploiement et ouverture d'une collectivité

Référence validée : Node.js 22, PostgreSQL 16, npm avec lockfile ; bash, curl et clients PostgreSQL 16. Le pilote utilise Node.js/Next.js, systemd et Caddy sur OVHcloud. Les qualifications historiques de DEPLOYMENT.md ne constituent pas une qualification de toute nouvelle instance.

Injecter une vraie DATABASE_URL et un AUTH_SECRET durable hors Git. Maintenir DT_ALLOW_PILOT_SESSION=false pour l'authentification réelle. Les deux variables DT_PILOT_CONTRIBUTOR_PASSWORD et DT_PILOT_VALIDATOR_PASSWORD concernent l'initialisation pilote. Pour le proxy public qualifié, AUTH_URL correspond à l'URL publique et AUTH_TRUST_HOST=true repose sur le proxy contrôlé : valider cette configuration sur la cible. Les paramètres OmniRoute et NEXT_PUBLIC_API_BASE_URL restent conditionnels aux services utilisés.

Pour une instance pilote neuve exclusivement, après sélection du SHA approuvé et injection des secrets :

```bash
npm ci
npm run db:init-pilot
npm test
npm run build
npm run runtime:check
```

Exécuter les étapes séparément, contrôler leur succès et arrêter au premier échec. Le smoke test démarre puis arrête un processus temporaire ; le service systemd reste nécessaire au fonctionnement permanent. Tester ensuite HTTPS et les comptes réels. Ne pas utiliser les tests et seeds pilotes sur une base métier en service.

Pour une autre collectivité, collecter organisation, territoire existant dans le référentiel, workspace, services et comptes ; vérifier l'unicité des identifiants et la cohérence des rattachements. L'ouverture paramétrable sans modification du code n'est pas établie par les scripts pilotes examinés. La recette #52 exige une procédure exécutable et testée pour cette étape : c'est un écart de livraison restant, pas une fonctionnalité réputée disponible.

Il reste également à fournir les configurations d'installation du service permanent, du proxy, du fichier d'environnement et du timer adaptées à la cible, avec leurs droits et commandes de mise en place. Les descriptions historiques du pilote ne suffisent pas à prouver qu'un tiers installe seul une instance neuve.

## 9. Sauvegarde et reprise

Réutiliser les scripts versionnés. `npm run db:backup` produit un dump custom, vérifie sa lisibilité et crée un checksum SHA-256 ; les fichiers ont des permissions restrictives. Le répertoire par défaut est `/var/backups/diagterritoire`, hors Git, avec rétention de référence de 7 jours. Le pilote documente un timer quotidien à 02:30 UTC avec délai aléatoire maximal de 15 minutes. Le script seul ne programme pas ce timer.

Avant migration sur une base utilisée : lancer `npm run db:backup`, contrôler le résultat, puis seulement `npm run db:migrate`. Conserver dump et checksum jusqu'à validation de la mise à jour.

Procédure de reprise :

1. Identifier l'incident, le dernier dump utilisable et son SHA applicatif compatible ; consigner la perte de données potentielle depuis ce point.
2. Préparer une base de restauration vide et isolée, déjà créée par l'exploitant habilité. Conserver la base d'origine.
3. Fournir hors Git BACKUP_FILE, TARGET_DATABASE_URL et RESTORE_CONFIRM_DATABASE, ce dernier égal au nom réel de la base cible.
4. Exécuter `npm run db:restore`. Le script exige le checksum, vérifie le dump, refuse une confirmation incorrecte et une cible contenant des objets dans le schéma public.
5. En cas d'échec partiel, ne pas relancer aveuglément sur cette cible : conserver les traces et préparer une nouvelle cible vide.
6. Sur la copie restaurée, configurer DATABASE_URL vers cette copie ; vérifier les migrations avec `npx prisma migrate status`. Pour la copie pilote, exécuter `npm run db:check-pilot`. Pour une autre collectivité, vérifier ses propres comptes, services, contributions et historiques avec les contrôles définis lors du provisionnement.
7. Démarrer une instance isolée utilisant cette copie et le code compatible. Vérifier connexion, droits, contributions publiées et données attendues ; ne pas rejouer le seed.
8. Après validation et accord de reprise, arrêter les écritures sur l'instance d'origine, basculer la configuration selon la procédure d'exploitation locale, redémarrer puis contrôler l'URL et les parcours. Consigner l'heure de reprise et les réserves.

La sauvegarde/restauration réelle du pilote est déjà qualifiée dans DEPLOYMENT.md §11.5. Ne pas la remettre artificiellement au statut « à construire ». Restent à arrêter pour la collectivité : copie hors machine, stockage protégé, responsables, surveillance, durée maximale d'interruption et perte de données admissible. Un dump logique ne conserve pas à lui seul les secrets, le code, les unités systemd ni la configuration du proxy. La reprise après perte complète de l'hôte doit couvrir ces éléments et faire l'objet d'un exercice distinct.

## 10. Support et mise à jour

Le référent local reçoit les demandes des utilisateurs et vérifie version, contexte, droits et reproductibilité. L'exploitant traite les incidents d'instance. Un défaut reproductible du logiciel est signalé selon SUPPORT.md, après recherche d'un sujet existant. Consigner SHA, versions techniques, date, étapes, attendu et observé, avec journaux expurgés. Toute vulnérabilité suit SECURITY.md et son canal privé.

Le dépôt public ne garantit aucun délai contractuel ni rétroportage. Inscrire dans la fiche de remise le contact réel et les éventuelles dispositions convenues ; ne pas inventer d'astreinte ou de SLA.

Pour une mise à jour : lire les changements et compatibilités ; identifier le SHA cible ; valider sur une copie adaptée ; planifier l'interruption ; sauvegarder ; installer les dépendances verrouillées ; appliquer les migrations versionnées ; produire le build ; redémarrer et qualifier les parcours. Les validations techniques doivent utiliser un environnement adapté, notamment lorsque les scripts supposent des données pilotes. En cas d'échec, choisir un retour compatible code/base ; ne pas supposer qu'un retour Git annule une migration. Toute restauration suit la section précédente.

## 11. Limites connues et hors périmètre

- Le bouton de déconnexion de #53 est intégré au commit de base, pas à la release v0.4.0. Son test navigateur avec les deux rôles et les refus après fermeture de session doit être conservé comme preuve distincte du smoke test anonyme.
- L'ouverture générique et l'administration autonome des comptes ne sont pas qualifiées par le seed pilote.
- Les droits s'additionnent ; l'organisation doit contrôler les cumuls.
- Le service courant ne propose pas le retour au brouillon ni l'archivage via ses cibles de transition, même si des statuts existent dans le modèle.
- Le smoke test local ne qualifie ni le navigateur authentifié, ni TLS, ni le proxy ou les secrets publics.
- Le README signale un lint non bloquant en CI à cause d'erreurs préexistantes. Ne pas assimiler CI verte et lint global réussi ; clarifier la portée du lint annoncé pour #53.
- Les écarts d'affichage historiques décrits dans DEPLOYMENT.md §11.8 doivent être revérifiés sur la version remise avant d'être déclarés présents ou corrigés.
- Tests de charge à grande échelle, haute disponibilité, extension géographique hors pilote, activation complète d'autres modules et certification générale de production restent hors de la qualification #44.
- Vercel n'est pas un chemin qualifié dans la documentation examinée. Aucun changement d'hébergeur n'est requis par ce dossier.

## 12. Qualification et décision de remise

Les résultats antérieurs sont des preuves historiques, pas des essais exécutés pendant la rédaction de ce document. La release mentionne 42/42 tests PostgreSQL, build, runtime, Delivery validation et CodeQL réussis. Les sorties communiquées pour #53 montrent des contrôles PR réussis et sa fusion. Il reste à conserver les résultats du SHA effectivement remis et de son instance cible.

| Critère #52 | Existant réutilisable | Preuve ou action restante |
| --- | --- | --- |
| 1. Installation neuve | DEPLOYMENT.md et commandes pilotes | Exécution par un tiers sur instance neuve avec toutes les configurations d'exploitation |
| 2. Initialisation collectivité sans code | Modèle workspace/services ; seed pilote | Procédure paramétrable exécutée pour une collectivité cible |
| 3. Comptes sans secret versionné | Credentials pilotes injectés par environnement | Provisionnement des comptes cibles et vérification des droits effectifs |
| 4. Sauvegarde/restauration | Scripts et qualification réelle du pilote | Exercice de reprise documenté pour l'instance remise |
| 5. Parcours contributeur/validateur | Qualification #44 ; guides présents ici | Recette des guides et déconnexion #53 avec comptes distincts |
| 6. Administration courante | Guide présent ici et exploitation historique | Contacts, configurations et procédures de gestion des comptes complétés |
| 7. Contrôles techniques | Résultats release et PR | Résultats sur SHA remis ; portée lint explicitée ; runtime cible vérifié |
| 8. Confidentialité | Règles existantes | Contrôle du diff et des pièces de remise, sans secrets ni données sensibles |
| 9. Version et commit | Références distinctes consignées | SHA réellement installé et éventuel tag final inscrits |
| 10. Limites | Section 11 | Réserves confirmées et acceptées par le destinataire |

Fiche de recette à reproduire pour chaque contrôle : identifiant ; prérequis ; acteur/rôle ; version/SHA ; environnement ; date ; étapes ; résultat attendu ; résultat observé ; lien de preuve interne ; décision et réserve.

Scénarios minimaux : installation neuve ; connexion de chaque rôle ; création/modification/soumission par l'auteur ; refus de modification par un tiers ; examen puis validation et publication ; rejet d'une seconde contribution ; exclusion des non-publiées de la consolidation ; refus hors service/workspace ; historique inchangé lors d'un refus ; déconnexion puis accès direct et retour navigateur vers une page protégée ; sauvegarde/restauration isolée ; redémarrage et contrôle de persistance.

La remise est prononcée uniquement lorsque les dix critères disposent de preuves acceptées. À ce stade, #52 demeure ouverte. Ce document ne certifie ni le déploiement du correctif sur le pilote public ni la réalisation des essais restants.

## 13. Sources du comportement applicatif

Lecture au commit `040eff6ea3fc0e51a6b1edd1e7d2a5e5ad18e7f1` :

- `core/engines/WorkspaceAccessEngine.ts` : permissions et périmètre des services.
- `core/services/WorkspaceContributionService.ts` : auteur, transitions exposées, cohérence du contexte et concurrence.
- `app/espace-metiers/[territoryId]/[serviceId]/contributions/[contributionId]/page.tsx` : boutons et champs proposés.
- `types/workspace.ts` : rôles et statuts du modèle.
- `scripts/seed-pilot.ts` : seeds fixes et réapplication des credentials pilotes.
- `scripts/backup-postgresql.sh` et `scripts/restore-postgresql.sh` : garanties et limites des opérations PostgreSQL.

Vérification documentaire : cohérence des guides avec ces sources et distinction des qualifications historiques. Aucun test applicatif, déploiement, sauvegarde ou restauration n'a été exécuté pour produire ce dossier.
