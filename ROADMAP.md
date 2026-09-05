# Feuille de route DiagTerritoire

## v0.2.0 — Consolidation du parcours territorial

**Statut : publiée le 5 septembre 2026**

La version `v0.2.0` vise à consolider les capacités déjà présentes dans
DiagTerritoire afin de disposer d'un parcours territorial cohérent,
testable et reproductible.

Cette version ne vise pas à augmenter le nombre de modules de la plateforme.

## Objectif principal

Transformer les briques déjà disponibles en un parcours territorial de
référence dont le comportement peut être vérifié automatiquement avant
publication.

Le parcours cible est :

**territoire → analyse → diagnostic → prospective → restitution**

## Périmètre

### 1. Parcours territorial de référence

Consolider le chemin fonctionnel permettant :

- de sélectionner un territoire ;
- d'afficher sa fiche territoriale ;
- de produire son analyse ;
- d'obtenir son diagnostic ;
- d'exposer ses projections et alertes ;
- de générer sa restitution ou son rapport.

Le parcours doit conserver les niveaux territoriaux actuellement pris en
charge sans élargissement géographique dans cette version.

### 2. Tests automatisés

Introduire un premier socle de tests reproductibles portant prioritairement
sur les éléments métier critiques.

Les premiers tests doivent couvrir notamment :

- le moteur de diagnostic ;
- l'orchestration de l'intelligence territoriale ;
- l'analyse d'un territoire connu ;
- le traitement d'un territoire inconnu ;
- les principaux cas limites identifiés pendant la consolidation.

Les outils déjà présents dans le projet doivent être privilégiés avant
l'introduction d'une nouvelle dépendance de test.

### 3. Cohérence du moteur métier

Identifier l'implémentation canonique du moteur de diagnostic.

Les implémentations anciennes ou dupliquées ne doivent être supprimées
qu'après vérification de leurs références et de leur comportement.

Les contrats utilisés par les pages, services et API doivent rester cohérents.

### 4. Contrats et erreurs

Stabiliser les comportements observables des services et API utilisés par le
parcours territorial de référence.

Les erreurs doivent être explicites et prévisibles, notamment pour :

- un territoire inexistant ;
- une donnée indisponible ;
- une requête non autorisée ;
- une impossibilité de produire l'analyse demandée.

### 5. Validation de publication

La version `v0.2.0` ne pourra être publiée qu'après validation adaptée du
commit destiné à être tagué.

Les contrôles comprennent selon leur applicabilité :

- installation reproductible ;
- tests automatisés ;
- contrôle du diff ;
- génération Prisma ;
- audit des dépendances ;
- Dependabot ;
- CodeQL.

Aucune variable d'environnement fictive ne doit être créée uniquement pour
faire réussir une validation.

## Hors périmètre de v0.2.0

Ne font pas partie de cette version :

- l'ajout d'un nouveau grand module métier ;
- l'extension du pilote à une nouvelle région ou un nouveau département ;
- une refonte générale de l'interface ;
- une réécriture globale de l'architecture ;
- le remplacement de la pile technique existante ;
- l'ajout d'une dépendance sans besoin démontré ;
- une refonte complète de l'authentification ;
- l'intégration massive de nouvelles sources de données.

Les fonctionnalités déjà présentes hors du parcours de référence doivent
rester compatibles, mais leur extension n'est pas un critère de sortie de
`v0.2.0`.

## Critères de sortie

La version pourra être considérée comme candidate à publication lorsque :

1. le parcours territorial de référence fonctionne de manière cohérente ;
2. les comportements métier critiques disposent de tests automatisés ;
3. le moteur de diagnostic ne présente plus d'implémentation ambiguë ;
4. les erreurs principales sont couvertes et documentées ;
5. aucune régression connue bloquante n'est introduite ;
6. les dépendances de sécurité sont dans un état acceptable et documenté ;
7. CodeQL est validé sur le commit candidat ;
8. le changelog décrit précisément les changements effectivement livrés.

Le tag `v0.2.0` ne doit être créé qu'après validation du commit final sur
`main`.


---

## v0.3.0 — Livrabilité opérationnelle du pilote

**Statut : cadrage**

La version `v0.3.0` vise à transformer le socle fonctionnel consolidé
dans `v0.2.0` en un pilote exécutable, vérifiable et déployable de
manière reproductible.

Cette version ne vise pas à ajouter un nouveau grand module métier.

## Objectif principal v0.3.0

Permettre à un contributeur ou mainteneur de partir d'un clone frais du
dépôt et d'obtenir un environnement DiagTerritoire opérationnel selon un
chemin documenté, reproductible et vérifiable.

## Périmètre v0.3.0

### 1. Environnement d'exécution reproductible

Définir un chemin de référence permettant :

- d'installer les dépendances de manière reproductible ;
- de disposer d'une instance PostgreSQL réelle pour le développement et
  les validations ;
- de documenter précisément les variables d'environnement nécessaires ;
- d'éviter tout secret versionné ;
- de ne jamais utiliser de variable fictive uniquement pour faire réussir
  un contrôle.

### 2. Initialisation de la base pilote

Définir et versionner une procédure reproductible permettant :

- de créer ou mettre à niveau le schéma attendu par Prisma ;
- d'appliquer les données pilotes nécessaires ;
- de vérifier le workspace pilote ;
- de documenter clairement la différence entre création du schéma,
  migration et seed.

### 3. Validation automatisée de livraison

Introduire une validation CI adaptée au projet permettant, dans un
environnement réellement configuré, de contrôler notamment :

- `npm ci` ;
- les tests automatisés ;
- Prisma ;
- le build de production ;
- le contrôle du diff et les dépendances selon leur applicabilité.

CodeQL et Dependabot restent parties intégrantes des contrôles de sécurité.

### 4. Validation du runtime

Définir un contrôle de démarrage et de bon fonctionnement permettant de
vérifier que l'application produite peut réellement être lancée après le
build.

Les parcours représentatifs doivent être contrôlés sans transformer cette
étape en suite de tests fonctionnels exhaustive.

### 5. Documentation de déploiement

Documenter le chemin de déploiement de référence compatible avec la pile
actuelle, notamment PostgreSQL et Vercel lorsque ce chemin est retenu.

La documentation doit distinguer explicitement :

- les variables obligatoires ;
- les variables optionnelles ;
- les secrets ;
- les paramètres du pilote ;
- les opérations de base de données nécessaires avant démarrage.

## Hors périmètre de v0.3.0

Ne font pas partie de cette version :

- l'ajout d'un nouveau grand module métier ;
- l'extension du pilote à une nouvelle région ou un nouveau département ;
- une refonte générale de l'interface ;
- une réécriture globale de l'architecture ;
- une refonte complète de l'authentification ;
- l'intégration massive de nouvelles sources de données ;
- une modification fonctionnelle sans lien direct avec la livrabilité du
  pilote.

## Critères de sortie v0.3.0

La version pourra être considérée comme candidate à publication lorsque :

1. un clone frais peut suivre une procédure documentée jusqu'à un
   environnement opérationnel ;
2. PostgreSQL est utilisé dans les validations qui nécessitent réellement
   une base de données ;
3. la création ou mise à niveau du schéma et le seed pilote sont
   reproductibles ;
4. les tests automatisés restent au vert ;
5. un build de production est validé dans un environnement correctement
   configuré ;
6. le runtime produit peut être démarré et contrôlé ;
7. la CI reproduit les contrôles de livraison retenus ;
8. aucun secret ni variable fictive n'est introduit ;
9. Dependabot et CodeQL sont dans un état acceptable sur le commit
   candidat ;
10. le changelog et la documentation décrivent exactement ce qui est
    livré.

Le tag `v0.3.0` ne doit être créé qu'après validation du commit final sur
`main`.
