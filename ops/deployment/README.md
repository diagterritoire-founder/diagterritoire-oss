# Installation sur une instance neuve — lot #52

Statut : procédure et modèles à qualifier sur une instance neuve.
La qualification historique du pilote figure dans DEPLOYMENT.md.
La présence de ces fichiers ne prouve pas leur exécution par un tiers.

Cette procédure concerne une machine dédiée neuve. Ne pas appliquer
ces modèles directement sur le pilote existant : son service utilise
un complément systemd et un dossier de release distinct.

Exécuter chaque étape séparément et arrêter au premier échec.

## 1. Prérequis à préparer

L'exploitant fournit :

- Linux avec systemd, accès sudo et authentification SSH par clé ;
- Node.js 22 et npm accessibles aux services système ;
- Git, Bash, curl et les utilitaires GNU utilisés par les scripts ;
- PostgreSQL 16 et ses clients psql, pg_dump et pg_restore ;
- Caddy installé comme service système ;
- une base dédiée vide et un rôle applicatif propriétaire de cette base,
  sans privilèges superutilisateur, création de bases ou création de rôles ;
- un domaine réel dont les enregistrements DNS pointent vers cette machine ;
- un pare-feu autorisant HTTPS, HTTP pour ACME et les accès SSH administratifs.

PostgreSQL reste local pour cette architecture. Les ports 3000 et 5432
ne doivent pas être exposés publiquement.
Conserver un accès SSH fonctionnel pendant la configuration du pare-feu.

Consigner les versions effectivement installées et le SHA approuvé.
L'installation des paquets système et la création du rôle PostgreSQL
relèvent de la préparation de l'hôte ; elles doivent être tracées.

## 2. Compte système et dossiers

Sur la machine neuve, vérifier que le compte et les chemins ne sont pas
déjà utilisés avant de les créer :

```bash
sudo useradd --system --user-group \
  --home-dir /srv/diagterritoire --create-home \
  --shell /usr/sbin/nologin diagterritoire

sudo install -d -o diagterritoire -g diagterritoire -m 0750 \
  /srv/diagterritoire

sudo install -d -o root -g diagterritoire -m 0750 \
  /etc/diagterritoire

sudo install -d -o diagterritoire -g diagterritoire -m 0700 \
  /var/backups/diagterritoire
```

Cloner le dépôt et sélectionner le SHA complet approuvé :

```bash
sudo -u diagterritoire git clone \
  https://github.com/diagterritoire-founder/diagterritoire-oss.git \
  /srv/diagterritoire/app
```

Remplacer SHA_APPROUVE avant cette commande :

```bash
sudo -u diagterritoire git -C /srv/diagterritoire/app \
  checkout --detach SHA_APPROUVE

sudo -u diagterritoire git -C /srv/diagterritoire/app rev-parse HEAD

sudo -u diagterritoire bash -c \
  'cd /srv/diagterritoire/app && npm ci --include=dev'
```

Le SHA retenu doit contenir ces modèles. Ne pas utiliser automatiquement
la dernière révision de main comme version approuvée.

## 3. Environnement externe à Git

Installer le modèle uniquement si le fichier cible est absent :

```bash
sudo test ! -e /etc/diagterritoire/diagterritoire.env &&
sudo install -o root -g diagterritoire -m 0640 \
  /srv/diagterritoire/app/ops/deployment/diagterritoire.env.example \
  /etc/diagterritoire/diagterritoire.env
```

Compléter le fichier avec sudoedit, sans publier son contenu :

```bash
sudoedit /etc/diagterritoire/diagterritoire.env
```

Renseigner DATABASE_URL, un AUTH_SECRET aléatoire durable et AUTH_URL
avec le domaine HTTPS réel. Encoder correctement les caractères réservés
des identifiants dans DATABASE_URL.
Conserver les trois options de recette/session pilote à false.

Le fichier suit la syntaxe EnvironmentFile de systemd, sans export.
Il n'est pas un script shell : ne pas le charger avec source.
AUTH_TRUST_HOST=true suppose le proxy contrôlé et le runtime local
décrits ici. Aucun joker Server Actions n'est nécessaire.

Les mots de passe de provisionnement sont fournis séparément pendant
l'initialisation. Ne pas les conserver dans ce fichier de runtime.

## 4. Migrations et ouverture de la collectivité

Sur la base neuve confirmée, appliquer les migrations :

```bash
sudo systemd-run --wait --pipe --collect \
  --property=User=diagterritoire \
  --property=Group=diagterritoire \
  --property=WorkingDirectory=/srv/diagterritoire/app \
  --property=EnvironmentFile=/etc/diagterritoire/diagterritoire.env \
  /usr/bin/env npm run db:migrate
```

Préparer la configuration nominative hors Git et suivre PROVISIONING.md :
contrôle --check, revue du périmètre, injection des secrets, confirmation
du nom de base puis --apply.

Ne pas utiliser db:init-pilot ou db:seed-pilot pour initialiser une autre
collectivité. Ne pas exécuter npm test sur une base métier : certains
tests créent et suppriment leurs données de recette.

## 5. Build de production

Après provisionnement réussi :

```bash
sudo systemd-run --wait --pipe --collect \
  --property=User=diagterritoire \
  --property=Group=diagterritoire \
  --property=WorkingDirectory=/srv/diagterritoire/app \
  --property=EnvironmentFile=/etc/diagterritoire/diagterritoire.env \
  /usr/bin/env NODE_ENV=production \
  CODESPACES=false DT_CODESPACES_RECIPE=false \
  DT_ALLOW_PILOT_SESSION=false npm run build
```

Exiger un code de sortie nul. Ne pas réutiliser un build Codespaces.
runtime:check dépend des données pilotes ; il n'est pas un contrôle
générique d'une collectivité nouvellement provisionnée.

## 6. Installation des services

Sur la machine neuve, vérifier l'absence d'unités DiagTerritoire existantes
et de compléments systemd avant toute copie. Si elles existent, utiliser
une procédure de mise à jour adaptée, pas cette installation neuve.

```bash
sudo install -o root -g root -m 0644 \
  /srv/diagterritoire/app/ops/deployment/diagterritoire.service \
  /srv/diagterritoire/app/ops/deployment/diagterritoire-backup.service \
  /srv/diagterritoire/app/ops/deployment/diagterritoire-backup.timer \
  /etc/systemd/system/

sudo systemd-analyze verify \
  /etc/systemd/system/diagterritoire.service \
  /etc/systemd/system/diagterritoire-backup.service \
  /etc/systemd/system/diagterritoire-backup.timer
```

Corriger toute erreur avant activation :

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now diagterritoire.service

systemctl show diagterritoire.service --no-pager \
  -p ActiveState -p SubState -p WorkingDirectory

curl --noproxy '*' --retry 5 --retry-connrefused --retry-delay 1 \
  --connect-timeout 3 --max-time 10 \
  -fsS -o /dev/null -w 'HTTP %{http_code}\n' \
  http://127.0.0.1:3000/connexion
```

Exiger un service actif et HTTP 200.

## 7. Proxy et HTTPS

Adapter Caddyfile.example avec le domaine réel correspondant à AUTH_URL.
Intégrer ce bloc dans /etc/caddy/Caddyfile avec sudoedit.
Préserver les éventuelles autres configurations présentes.

```bash
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

Après validation seulement :

```bash
sudo systemctl enable --now caddy
sudo systemctl reload caddy
```

Vérifier depuis un autre poste : HTTP redirige vers HTTPS, certificat
valide et /connexion répond HTTP 200.
Confirmer que les ports 3000 et 5432 restent inaccessibles de l'extérieur.

## 8. Sauvegarde et exploitation

Exécuter une première sauvegarde et vérifier son résultat :

```bash
sudo systemctl start diagterritoire-backup.service
systemctl show diagterritoire-backup.service --no-pager \
  -p Result -p ExecMainStatus -p ExecMainExitTimestamp
```

Vérifier le checksum et le catalogue du dump créé, puis réaliser une
restauration dans une base vide isolée selon DEPLOYMENT.md.
Ne pas assimiler un catalogue lisible à une restauration réussie.

Après succès :

```bash
sudo systemctl enable --now diagterritoire-backup.timer
systemctl list-timers --all --no-pager diagterritoire-backup.timer
```

La programmation prévoit 02:30 UTC avec un décalage aléatoire maximal
de 15 minutes et un rattrapage après indisponibilité.

La rétention locale utilise RETENTION_DAYS et la sélection par âge du
script existant ; elle ne garantit pas un nombre exact de sauvegardes.
Prévoir séparément copie protégée hors machine, surveillance des échecs,
responsable, rétention et exercice de reprise.

## 9. Qualification avant remise

Consigner dans la fiche interne :

- SHA installé, versions, configuration et résultats des commandes ;
- connexion des comptes distincts et contrôle de leurs services ;
- création, modification, soumission, validation, publication et rejet ;
- refus hors périmètre et absence de mutation lors des refus ;
- consolidation limitée aux contributions publiées ;
- déconnexion, accès direct, actualisation et retour arrière ;
- sauvegarde/restauration et lecture de la copie restaurée ;
- redémarrage de l'hôte et reprise des services et du timer ;
- contacts d'exploitation et réserves acceptées.

Une page Connexion HTTP 200 ne suffit pas à qualifier ces parcours.
HANDOVER.md reste le document de décision de remise.
L'issue #52 demeure ouverte tant que ses conditions ne sont pas satisfaites.

## 10. Vérification des modèles — 17 septembre 2026

Modèles examinés au commit 239f8d0e4e9eb3a8baa4138381c6b83227ada629,
extraits dans un dossier temporaire sur l'hôte du pilote OVH.

- systemd 259.5 : vérification des deux services et du timer réussie.
- Le chemin de recherche des unités excluait les compléments locaux
  de /etc/systemd/system.
- Caddy 2.11.4 : validation du modèle réussie (« Valid configuration »).
- Un avertissement de mise en forme du Caddyfile a été signalé.
- Aucune installation des modèles, activation ou recharge de service
  n'a été effectuée pendant ce contrôle.

Ces résultats vérifient les configurations dans cet environnement.
Ils ne prouvent ni une installation neuve, ni l'obtention d'un certificat,
ni le fonctionnement des services à partir de ces modèles.
La qualification décrite en section 9 reste à réaliser.
