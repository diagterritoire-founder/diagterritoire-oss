# Provisionnement initial — lot #52

Lot intégré par la PR #55. Base historique du code étudié :
`3f23981c62394acda1c1da9258c634b5ecc520c5`.
Les preuves isolées sont consignées ci-dessous et dans DELIVERY.md ;
elles ne constituent pas un déploiement sur l'instance de remise.

## Installation du lot

Les fichiers scripts, tests et examples de ce lot sont intégrés au dépôt.
Utiliser un checkout du SHA approuvé contenant la PR #55 et installer les
dépendances verrouillées avec npm ci. Aucune archive supplémentaire n'est nécessaire.

Le script `.mjs` doit être lancé avec le `tsx` déjà installé dans le dépôt, car la CLI
importe le référentiel territorial TypeScript. Les commandes utilisent directement
`./node_modules/.bin/tsx` pour éviter tout téléchargement implicite.

## Recette isolée

Commandes de qualification isolée, depuis un checkout contenant le lot :

```bash
node --test tests/provision-workspace.test.mjs
./node_modules/.bin/tsx --test tests/provision-workspace-postgresql.test.mjs
git diff --check
git status -sb
```

Le second test dérive une connexion locale de DATABASE_URL, ciblant exclusivement
`diagterritoire_provisioning_test_52`. La variable du terminal reste inchangée. Il exige
une base sans workspace et les migrations déjà appliquées. Il crée un trigger de test
temporaire sur WorkspaceCredential, puis le retire dans un finally pour vérifier une
annulation réelle de transaction après insertion partielle. Ne pas interrompre ce test.
En cas d'interruption, examiner la cible et son trigger avant nouvelle exécution.

Il vérifie : mode lecture sans écriture ; mauvaise confirmation ; secrets absents ;
rollback effectif ; création ; vérification bcrypt ; rejeu sans changement des lignes,
dates et hashes ; refus des modifications de rôles ; collisions territoire et email.
Les données de recette restent en place et les secrets aléatoires ne sont pas affichés.
Un second lancement refuse cette base non vide : ne pas supprimer une base pour le
faire passer sans vérifier son contenu. La recette navigateur reste distincte ; les
secrets éphémères du test ne constituent pas des comptes utilisables durablement.

## Contrat du fichier de configuration

L'exemple concerne Pamandzi uniquement pour la recette locale, sans activation d'une
collectivité réelle. Adapter une copie JSON externe à Git pour l'exploitation.
Le workspace désigne une commune ou un EPCI actif déjà présent dans le référentiel.
Les identifiants de services et utilisateurs commencent par l'identifiant workspace
suivi de `-`. Les parents doivent appartenir à la configuration, sans cycle.
Les rôles sont ceux du moteur existant ; aucune permission explicite supplémentaire
n'est accordée. Les emails sont normalisés en minuscules et les collisions sont refusées
sur toute la base, y compris avec des comptes inactifs, par précaution d'exploitation.

Chaque utilisateur désigne une variable de secret `DT_PROVISION_...` distincte.
Aucun mot de passe en clair n'est accepté dans le JSON. Les nouveaux secrets doivent
compter au moins 12 caractères et au plus 72 octets UTF-8 (limite bcrypt).
Conserver les configurations nominatives et les secrets hors du dépôt et des journaux.

## Vérification et application

Avec DATABASE_URL fournie par la gestion de secrets, le mode par défaut vérifie la
configuration et les collisions dans une transaction PostgreSQL en lecture seule :

```bash
./node_modules/.bin/tsx scripts/provision-workspace.mjs /chemin/externe/collectivite.json --check
```

Ce chemin est à remplacer par le chemin réel de configuration. Le bilan ne contient
ni email, ni mot de passe, ni chaîne de connexion. Le mode check ne prouve pas la
présence des secrets ni le droit d'insertion ; il ne réserve pas les identifiants.

Après revue du bilan, sauvegarde de la base utilisée et injection des variables de
mot de passe, fournir `DT_PROVISION_CONFIRM_DATABASE` égal au nom réel de la base,
puis exécuter la même commande avec `--apply`. Toute écriture refait les vérifications
dans une transaction, avec verrouillage des quatre tables de provisionnement.
Prévoir une fenêtre d'exploitation : ce verrou bloque temporairement leurs autres
écritures, avec timeout de prise de verrou de cinq secondes. Aucun retry automatique.

Une configuration strictement identique déjà appliquée ne modifie aucune ligne et
n'exige pas de secrets. Tout écart de comptes/services, droits, nom ou credential manquant
est refusé : ce lot couvre l'ouverture initiale, pas la gestion courante ni la réparation.
Il ne réactive pas les comptes et ne réinitialise pas les mots de passe.

L'application est atomique : création entière ou rollback. Après coupure réseau pendant
COMMIT, le résultat peut être incertain côté client : relancer --check avant décision.
Ne pas corriger directement en SQL sans diagnostic. Les erreurs brutes du pilote pg
ne sont pas affichées pour éviter de révéler des valeurs sensibles.

## Qualification restante

Les tests purs, la recette PostgreSQL et le lint ciblé disposent des résultats
ci-dessous. La PR #55 a passé ses contrôles CI avant fusion. Les parcours
navigateur et leurs réserves sont consignés dans DELIVERY.md, sections 14 à 17.
Les tests .mjs restent exécutés séparément de npm test ; une CI verte ne prouve
pas leur exécution. La qualification de l'instance cible reste à réaliser.
L'issue #52 reste ouverte.
Une ouverture avec comptes réels demande une validation connexion, accès aux services,
contribution, validation/publication et déconnexion, sur l'instance cible.

## Résultats de qualification — 13 septembre 2026

- Tests de validation : 7/7 réussis.
- Recette PostgreSQL isolée : création, rollback, rejeu et collisions vérifiés.
- Lint ciblé : aucune erreur sur les trois fichiers JavaScript.
- CLI --check : workspace inchangé, aucune création, applied: false.

Les données de recette sont conservées dans la base isolée.
Aucun déploiement de production effectué.
Au 13 septembre, la recette navigateur et les contrôles CI restaient à réaliser.
Les résultats ultérieurs sont référencés dans la section Qualification restante
et dans DELIVERY.md. Voir HANDOVER.md pour les conditions actuelles de remise.
