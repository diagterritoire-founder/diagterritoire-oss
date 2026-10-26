# DiagTerritoire — Test contrôlé de notification GitHub (#91)

## Pourquoi

L'échec d'une sonde GitHub Actions est visible dans le dépôt et les préférences
du compte destinataire peuvent demander un email. Toutefois, un paramètre
coché ne prouve pas que le message est effectivement délivré.

## Champ du test

Fichier : `.github/workflows/notification-delivery-drill.yml`.

Ce workflow est **manuel uniquement** (`workflow_dispatch`) :
- aucune planification périodique ;
- aucun accès SSH, HTTP ou PostgreSQL ;
- aucun accès aux secrets GitHub ;
- aucune écriture dans le dépôt ;
- aucun redémarrage du VPS.

Il ne vérifie pas la disponibilité du site : il vérifie exclusivement le
**canal GitHub Actions vers la messagerie de l'utilisateur**.

## Exécution depuis le compte devant recevoir les notifications

1. Dans le dépôt `diagterritoire-founder/diagterritoire-oss`, choisir
   `Watch` (ou `Custom` permettant les notifications Actions), et vérifier
   que le compte est abonné aux notifications du dépôt.
2. Dans les paramètres GitHub `Settings → Notifications → System → Actions`,
   sélectionner `On GitHub`, `Email` et `Failed workflows only`.
3. Dans `Actions`, choisir
   **Notification delivery drill (manual only)** puis `Run workflow`.
4. Conserver `main` et saisir exactement **SIMULER_ALERTE** dans
   `confirm`, puis lancer le workflow depuis le compte destinataire.
5. Attendre la fin : le job doit apparaître volontairement **Failed** avec
   la mention `TEST ALERTE DIAGTERRITOIRE`.
6. Vérifier qu'une notification est visible sur GitHub et qu'un email est
   effectivement reçu à l'adresse de réception configurée. Vérifier au
   besoin les courriers indésirables et les filtres de messagerie.
7. Consigner seulement le succès ou l'échec de la réception, sans publier
   d'adresse privée, de capture de boite mail ni d'en-tête du message.

Si `confirm` est différent de `SIMULER_ALERTE`, le workflow réussit et
**ne teste pas la notification d'échec**.

## Interprétation

Une exécution rouge **est attendue** pour ce test et ne correspond à aucune
panne réelle. Cette opération ne valide pas le rythme du cron, ni l'envoi
d'une alerte de sauvegarde locale hors VPS.

Le workflow peut rester dans le dépôt pour les exercices ponctuels ; il
n'engendre aucune exécution spontanée et n'affecte pas la CI habituelle.

## Suite : échecs des sauvegardes

Le service systemd de vérification des sauvegardes écrit dans journald.
Une alerte hors VPS suppose un transport supplémentaire à étudier et
qualifier séparément, sans mettre d'identifiants ou de dumps dans les
journaux ni dans le dépôt public.
