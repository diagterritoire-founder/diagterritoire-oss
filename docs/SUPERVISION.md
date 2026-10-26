# Supervision de DiagTerritoire — Évolution #90

## Objectif et limites

L'incident OVH du 26 octobre 2026 a provoqué un arrêt complet du VPS. Les
journaux Ubuntu mentionnaient un arrêt initié par l'hyperviseur, sans identifier
le demandeur de cet arrêt. Une surveillance uniquement locale ne peut pas
détecter de manière fiable une machine complètement arrêtée.

Cette première version est composée de deux contrôles indépendants :
- GitHub Actions surveille la page publique HTTPS depuis l'extérieur du VPS.
- Un script local contrôle la disponibilité et la fraîcheur des archives
  de sauvegarde PostgreSQL, sans accéder à la base ni modifier les dumps.

Aucun secret ni identifiant de production ne figure dans ces outils.

## 1. Disponibilité publique (hors VPS)

Le workflow de surveillance se trouve dans
.github/workflows/production-availability.yml.

Il contrôle toutes les 15 minutes (minutes 07, 22, 37, 52 UTC) l'adresse :
https://dzaoudzi-labattoir.diagterritoire.fr/connexion

Trois tentatives sont réalisées, avec délai et timeout bornés. Seul HTTP 200
est considéré comme un succès : les erreurs TLS/DNS, les codes 3xx/4xx/5xx,
les timeouts et les échecs de connexion produisent un échec de workflow.
Aucune réponse HTTP, cookie ou donnée personnelle n'est conservée.

Le workflow planifié n'est actif qu'après fusion sur la branche principale.
Une exécution manuelle (workflow_dispatch) est également prévue.

### Notifications

Un job GitHub Actions en échec constitue un signal consultable dans l'onglet
Actions, **pas automatiquement un email**. Le mainteneur doit vérifier les
préférences GitHub Settings > Notifications > System > Actions, activer la
réception web ou email des échecs, et tester le canal réellement utilisé.

GitHub Actions peut retarder ou omettre des exécutions programmées ;
sur les dépôts publics inactifs 60 jours, les exécutions planifiées peuvent
être désactivées. La cadence de 15 minutes ne représente pas un SLA.

Le contrôle HTTP 200 valide la page de connexion publique, mais pas le
parcours authentifié, ni le bon fonctionnement de PostgreSQL.

Test manuel depuis un clone : 

    bash scripts/monitor-public-availability.sh

Le succès affiche AVAILABILITY-OK, l'échec AVAILABILITY-FAIL.

## 2. Intégrité des sauvegardes locales

Script : scripts/check-backup-health.sh

- Vérifie que diagterritoire-backup.timer est actif et que le dernier
  résultat de diagterritoire-backup.service est success.
- Vérifie qu'il existe un fichier diagterritoire-*.dump récent dans
  /var/backups/diagterritoire (36 heures maximum par défaut).
- Vérifie le fichier .sha256 correspondant avec sha256sum.
- Vérifie la lisibilité de l'archive avec pg_restore --list.
- N'effectue ni restauration ni modification de PostgreSQL.

Le dump validé localement n'est pas pour autant une garantie de récupération
hors site : la sauvegarde rclone doit être surveillée séparément, et une
restauration réelle doit être qualifiée dans une base vide et isolée.

Variables : DT_MONITOR_BACKUP_DIR (défaut /var/backups/diagterritoire),
DT_MONITOR_MAX_AGE_HOURS (défaut 36, autorisé 1 à 168),
DT_MONITOR_SYSTEMD_CHECKS (défaut 1 ; 0 réservé aux tests isolés).

### Installation OVH après qualification

Ces étapes sont **distinctes** du déploiement applicatif #90. Ne pas les
exécuter avant l'examen des tests et du service de sauvegarde existant.
Depuis une release vérifiée :

    sudo install -D -o root -g root -m 0755 scripts/check-backup-health.sh /usr/local/libexec/diagterritoire/check-backup-health.sh
    sudo install -o root -g root -m 0644 ops/systemd/diagterritoire-backup-health.service /etc/systemd/system/diagterritoire-backup-health.service
    sudo install -o root -g root -m 0644 ops/systemd/diagterritoire-backup-health.timer /etc/systemd/system/diagterritoire-backup-health.timer
    sudo systemctl daemon-reload
    sudo systemctl start diagterritoire-backup-health.service
    sudo systemctl status diagterritoire-backup-health.service --no-pager

Uniquement si ce premier contrôle réussit :

    sudo systemctl enable --now diagterritoire-backup-health.timer
    sudo systemctl list-timers --all | grep diagterritoire-backup-health

Le timer exécute le contrôle toutes les heures vers la minute 17.
Le compte diagterritoire doit pouvoir lire le dossier des sauvegardes.
En cas d'échec, consulter :

    sudo journalctl -u diagterritoire-backup-health.service --since "24 hours ago" --no-pager

Un échec de ce service n'envoie pas automatiquement d'email. Un canal
d'alerte hors machine pour les sauvegardes devra être étudié et testé
séparément avant de promettre une notification.

## 3. Procédure d'incident

1. Vérifier HTTPS depuis un autre réseau et consigner les heures UTC.
2. Distinguer les ports SSH et HTTPS puis consulter le statut OVHcloud.
3. Avant un redémarrage, relever les événements et opérations OVHcloud.
   Ne pas activer le mode rescue pour un démarrage normal. Ne pas réinstaller.
4. Après retour du VPS, vérifier Next.js, PostgreSQL, les sauvegardes,
   les réponses HTTPS et les parcours utilisateurs authentifiés.
5. Pour les sauvegardes, vérifier rétention, droits du dossier, résultats du
   service et intégrité. Ne pas effacer les archives pour masquer une alerte.
6. Consigner la cause établie et les limites des preuves disponibles.

## 4. Qualification

Les tests automatisés de #90 vérifient : HTTP 200, retries, refus de 3xx et
5xx, configuration invalide, absence ou corruption d'un checksum, archive
ancienne, timer inactif, service de sauvegarde en échec.

Contrôle de syntaxe :

    bash -n scripts/monitor-public-availability.sh scripts/check-backup-health.sh

La CI, le build et l'audit doivent réussir avant fusion. Le service
applicatif de production #89 reste inchangé durant les essais.
