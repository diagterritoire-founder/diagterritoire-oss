import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { pathToFileURL } from 'node:url';

const roles = ['executive', 'general_management', 'service_manager', 'contributor', 'validator', 'observer', 'administrator'];
const categories = ['general_management', 'finance', 'technical_services', 'urban_planning', 'land_management', 'education', 'school_fund', 'culture', 'extracurricular_activities', 'social', 'ccas', 'associations', 'city_policy', 'economic_development', 'environment', 'human_resources', 'public_procurement', 'other'];
function check(condition, message) { if (!condition) throw new Error(message); }
function object(value, keys) {
  check(value && typeof value === 'object' && !Array.isArray(value), 'Objet attendu.');
  check(Object.keys(value).every(key => keys.includes(key)), 'Champ inconnu : configuration refusée.');
}
function text(value) {
  check(typeof value === 'string' && value === value.trim() && value.length > 0 && value.length <= 250, 'Texte absent ou invalide.');
  return value;
}
function key(value) {
  text(value);
  check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), 'Identifiant invalide.');
  return value;
}
function list(value) { check(Array.isArray(value) && value.length > 0 && value.length <= 100, 'Liste vide ou trop longue.'); return value; }
function unique(values) { check(new Set(values).size === values.length, 'Doublon dans la configuration.'); }

export function validateConfig(input, territories) {
  object(input, ['workspace', 'services', 'users']);
  const w = input.workspace;
  object(w, ['id', 'organizationId', 'territoryId', 'name', 'slug']);
  key(w.id); key(w.organizationId); key(w.slug); text(w.name); text(w.territoryId);
  check(territories.some(t => t.id === w.territoryId && t.status === 'active' && ['commune', 'epci'].includes(t.level)), 'Territoire commune/EPCI actif inconnu.');
  const services = list(input.services).map(s => {
    object(s, ['id', 'name', 'slug', 'category', 'parentServiceId']);
    key(s.id); key(s.slug); text(s.name);
    check(s.id.startsWith(`${w.id}-`), 'Identifiant de service hors namespace du workspace.');
    check(categories.includes(s.category), 'Catégorie inconnue.');
    if (s.parentServiceId !== undefined) key(s.parentServiceId);
    return { id: s.id, workspaceId: w.id, organizationId: w.organizationId, name: s.name, slug: s.slug, category: s.category, parentServiceId: s.parentServiceId ?? null, description: null, managerUserId: null, status: 'active' };
  });
  unique(services.map(s => s.id)); unique(services.map(s => s.slug));
  const ordered = [];
  const pending = [...services];
  while (pending.length) {
    const i = pending.findIndex(s => s.parentServiceId === null || ordered.some(p => p.id === s.parentServiceId));
    check(i !== -1, 'Parent absent ou cycle dans les services.');
    ordered.push(...pending.splice(i, 1));
  }
  const users = list(input.users).map(u => {
    object(u, ['id', 'email', 'displayName', 'roles', 'serviceIds', 'passwordEnv']);
    key(u.id); text(u.email); text(u.displayName);
    check(u.id.startsWith(`${w.id}-`), 'Identifiant utilisateur hors namespace du workspace.');
    const email = u.email.toLowerCase();
    check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Email invalide.');
    list(u.roles); unique(u.roles); check(u.roles.every(r => roles.includes(r)), 'Rôle inconnu.');
    check(Array.isArray(u.serviceIds) && u.serviceIds.every(id => services.some(s => s.id === id)), 'Affectation hors workspace.');
    unique(u.serviceIds);
    check(u.serviceIds.length > 0 || u.roles.some(r => ['administrator', 'executive', 'general_management'].includes(r)), 'Affectation de service manquante.');
    check(typeof u.passwordEnv === 'string' && /^DT_PROVISION_[A-Z0-9_]+$/.test(u.passwordEnv), 'Variable de secret invalide.');
    return { id: u.id, workspaceId: w.id, email, displayName: u.displayName, title: null, roles: [...u.roles].sort(), serviceIds: [...u.serviceIds].sort(), permissions: [], status: 'active', passwordEnv: u.passwordEnv };
  });
  unique(users.map(u => u.id)); unique(users.map(u => u.email)); unique(users.map(u => u.passwordEnv));
  return { workspace: { ...w, status: 'active' }, services: ordered, users };
}

function matches(row, desired) {
  return Object.entries(desired).every(([k, value]) => {
    if (k === 'passwordEnv') return true;
    const actual = Array.isArray(row[k]) ? [...row[k]].sort() : row[k];
    return isDeepStrictEqual(actual, value);
  });
}

// Exported for isolated PostgreSQL tests. The caller owns the connection.
export async function provision(client, config, { apply = false, confirmDatabase, secrets = process.env } = {}) {
  await client.query(apply ? 'BEGIN' : 'BEGIN READ ONLY');
  try {
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    if (apply) {
      // Serialize provisioning and block other writers while uniqueness is checked.
      // Ordinary SELECTs remain possible. Provision only in a maintenance window.
      await client.query('LOCK TABLE "Workspace", "WorkspaceService", "WorkspaceUser", "WorkspaceCredential" IN SHARE ROW EXCLUSIVE MODE');
    }
    const db = (await client.query('SELECT current_database() AS name')).rows[0].name;
    check(!apply || confirmDatabase === db, 'Confirmation de base incorrecte.');
    const w = config.workspace;
    const candidates = (await client.query('SELECT * FROM "Workspace" WHERE "id"=$1 OR "slug"=$2 OR ("territoryId"=$3 AND "status"=\'active\')', [w.id, w.slug, w.territoryId])).rows;
    check(candidates.length === 0 || (candidates.length === 1 && candidates[0].id === w.id && matches(candidates[0], w)), 'Workspace existant incompatible ou territoire déjà utilisé.');
    const existingWorkspace = candidates.length === 1;
    const rows = [];
    for (const s of config.services) {
      const existing = (await client.query('SELECT * FROM "WorkspaceService" WHERE "id"=$1 OR ("workspaceId"=$2 AND "slug"=$3)', [s.id, w.id, s.slug])).rows;
      check(existing.length <= 1 && (!existing.length || matches(existing[0], s)), 'Service existant incompatible.');
      rows.push({ table: 'WorkspaceService', desired: s, exists: existing.length === 1 });
    }
    for (const u of config.users) {
      const existing = (await client.query('SELECT * FROM "WorkspaceUser" WHERE "id"=$1 OR lower(trim("email"))=$2', [u.id, u.email])).rows;
      check(existing.length <= 1 && (!existing.length || matches(existing[0], u)), 'Utilisateur existant incompatible ou email déjà utilisé.');
      if (existing.length) {
        const credential = await client.query('SELECT 1 FROM "WorkspaceCredential" WHERE "userId"=$1', [u.id]);
        check(credential.rowCount === 1, 'Compte existant sans credential : réparation séparée requise.');
      }
      rows.push({ table: 'WorkspaceUser', desired: u, exists: existing.length === 1 });
    }
    // Replays must match the entire initial configuration, not silently extend it.
    if (existingWorkspace) {
      const counts = (await client.query('SELECT (SELECT count(*)::int FROM "WorkspaceService" WHERE "workspaceId"=$1) AS services, (SELECT count(*)::int FROM "WorkspaceUser" WHERE "workspaceId"=$1) AS users', [w.id])).rows[0];
      check(rows.every(r => r.exists) && counts.services === config.services.length && counts.users === config.users.length, 'Configuration existante différente : gestion courante séparée requise.');
    }
    const summary = { database: db, workspace: existingWorkspace ? 'inchangé' : 'à créer', servicesToCreate: rows.filter(r => r.table === 'WorkspaceService' && !r.exists).length, usersToCreate: rows.filter(r => r.table === 'WorkspaceUser' && !r.exists).length, applied: apply };
    if (apply && !existingWorkspace) {
      const { hash } = await import('bcryptjs');
      const hashes = new Map();
      for (const u of config.users) {
        const password = secrets[u.passwordEnv];
        check(typeof password === 'string' && password.length >= 12 && Buffer.byteLength(password, 'utf8') <= 72, 'Secret absent ou longueur invalide (12 caractères minimum, 72 octets maximum).');
        hashes.set(u.id, await hash(password, 12));
      }
      async function insert(table, desired) {
        const data = Object.fromEntries(Object.entries(desired).filter(([k]) => k !== 'passwordEnv'));
        const keys = Object.keys(data);
        const values = Object.values(data).map(v => Array.isArray(v) ? JSON.stringify(v) : v);
        // Table and columns originate exclusively from normalized records above.
        await client.query(`INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(',')}, "createdAt", "updatedAt") VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}, NOW(), NOW())`, values);
      }
      await insert('Workspace', w);
      for (const row of rows) {
        await insert(row.table, row.desired);
        if (row.table === 'WorkspaceUser') {
          const { id } = row.desired;
          await insert('WorkspaceCredential', { id: `credential-${id}`, userId: id, passwordHash: hashes.get(id) });
        }
      }
    }
    await client.query(apply ? 'COMMIT' : 'ROLLBACK');
    return summary;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  const [file, mode = '--check', ...extra] = process.argv.slice(2);
  check(file && ['--check', '--apply'].includes(mode) && extra.length === 0, 'Usage : tsx scripts/provision-workspace.mjs CONFIG.json [--check|--apply]');
  const { mayotteTerritories } = await import('../data/mayotte-territories.ts');
  const config = validateConfig(JSON.parse(await readFile(file, 'utf8')), mayotteTerritories);
  check(process.env.DATABASE_URL, 'DATABASE_URL absente.');
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log(await provision(client, config, { apply: mode === '--apply', confirmDatabase: process.env.DT_PROVISION_CONFIRM_DATABASE }));
  } finally { await client.end(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    // Driver errors can contain connection details, emails or SQL values.
    console.error('Provisionnement refusé ou interrompu. Vérifier configuration, collisions, secrets, confirmation et connexion. Aucune erreur brute publiée.');
    process.exitCode = 1;
  });
}
