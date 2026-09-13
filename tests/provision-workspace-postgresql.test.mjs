import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { compare } from 'bcryptjs';
import { mayotteTerritories } from '../data/mayotte-territories.ts';
import { provision, validateConfig } from '../scripts/provision-workspace.mjs';

test('recette PostgreSQL #52 : check, rollback, création, rejeu et collisions', async () => {
  const source = process.env.DATABASE_URL;
  assert.ok(source, 'DATABASE_URL absente');
  const target = new URL(source);
  assert.ok(['db', 'localhost', '127.0.0.1', '[::1]'].includes(target.hostname));
  target.pathname = '/diagterritoire_provisioning_test_52';
  const client = new pg.Client({ connectionString: target.toString() });
  await client.connect();
  try {
    assert.equal((await client.query('SELECT current_database() AS name')).rows[0].name, 'diagterritoire_provisioning_test_52');
    const count = async () => (await client.query('SELECT count(*)::int AS n FROM "Workspace"')).rows[0].n;
    assert.equal(await count(), 0, 'La recette exige une base métier vide ; aucune suppression automatique.');
    const raw = JSON.parse(await readFile(new URL('../examples/workspace-test-52.json', import.meta.url), 'utf8'));
    const c = validateConfig(raw, mayotteTerritories);
    const secrets = Object.fromEntries(c.users.map(u => [u.passwordEnv, randomBytes(24).toString('hex')]));
    const options = { apply: true, confirmDatabase: 'diagterritoire_provisioning_test_52', secrets };
    const plan = await provision(client, c);
    assert.equal(plan.usersToCreate, 2); assert.equal(await count(), 0);
    await assert.rejects(provision(client, c, { ...options, confirmDatabase: 'incorrect' }));
    await assert.rejects(provision(client, c, { ...options, secrets: {} }));
    assert.equal(await count(), 0);

    // A temporary trigger causes a real failure after earlier transaction inserts.
    await client.query(`CREATE FUNCTION pg_temp.reject_credential_52() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test rollback 52'; END $$`);
    await client.query('CREATE TRIGGER test_52_reject_credential BEFORE INSERT ON "WorkspaceCredential" FOR EACH ROW EXECUTE FUNCTION pg_temp.reject_credential_52()');
    try {
      await assert.rejects(provision(client, c, options));
      assert.equal(await count(), 0);
      assert.equal((await client.query('SELECT count(*)::int AS n FROM "WorkspaceUser"')).rows[0].n, 0);
      assert.equal((await client.query('SELECT count(*)::int AS n FROM "WorkspaceService"')).rows[0].n, 0);
    } finally {
      await client.query('DROP TRIGGER test_52_reject_credential ON "WorkspaceCredential"');
    }
    await provision(client, c, options);
    const snapshot = async () => JSON.stringify((await client.query(`SELECT jsonb_build_object(
      'workspaces', (SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM "Workspace" t),
      'services', (SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM "WorkspaceService" t),
      'users', (SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM "WorkspaceUser" t),
      'credentials', (SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM "WorkspaceCredential" t)
    ) AS state`)).rows[0].state);
    const before = await snapshot();
    const repeat = await provision(client, c, { ...options, secrets: {} });
    assert.equal(repeat.workspace, 'inchangé'); assert.equal(await snapshot(), before);
    for (const u of c.users) {
      const row = (await client.query('SELECT "passwordHash" FROM "WorkspaceCredential" WHERE "userId"=$1', [u.id])).rows[0];
      assert.equal(await compare(secrets[u.passwordEnv], row.passwordHash), true);
    }
    const changed = structuredClone(c); changed.users[0].roles = ['administrator'];
    await assert.rejects(provision(client, changed, options));
    const collision = structuredClone(c);
    collision.workspace.id = 'workspace-other-52'; collision.workspace.slug = 'other-52';
    await assert.rejects(provision(client, collision, options));
    const emailCollision = structuredClone(c);
    emailCollision.workspace.id = 'workspace-other-52'; emailCollision.workspace.slug = 'other-52';
    emailCollision.workspace.territoryId = 'territory-commune-sada';
    emailCollision.services = c.services.map(s => ({ ...s, id: 'workspace-other-52-finances', workspaceId: 'workspace-other-52' }));
    emailCollision.users = c.users.map((u, i) => ({ ...u, id: `workspace-other-52-user-${i}`, workspaceId: 'workspace-other-52', serviceIds: ['workspace-other-52-finances'] }));
    await assert.rejects(provision(client, emailCollision, options));
    assert.equal(await snapshot(), before);
    console.log('Recette #52 : données conservées dans la base isolée ; secrets éphémères non affichés.');
  } finally { await client.end(); }
});
