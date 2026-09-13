import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateConfig } from '../scripts/provision-workspace.mjs';

const fixture = JSON.parse(await readFile(new URL('../examples/workspace-test-52.json', import.meta.url), 'utf8'));
const territories = [{ id: fixture.workspace.territoryId, level: 'commune', status: 'active' }];
function config() { return structuredClone(fixture); }

test('normalise les emails et fixe les permissions explicites à vide', () => {
  const c = config(); c.users[0].email = c.users[0].email.toUpperCase();
  const result = validateConfig(c, territories);
  assert.equal(result.users[0].email, fixture.users[0].email);
  assert.deepEqual(result.users[0].permissions, []);
});
test('refuse territoire inconnu', () => assert.throws(() => validateConfig(config(), [])));
test('refuse email dupliqué après normalisation', () => {
  const c = config(); c.users[1].email = c.users[0].email.toUpperCase();
  assert.throws(() => validateConfig(c, territories));
});
test('refuse affectation extérieure', () => {
  const c = config(); c.users[0].serviceIds = ['autre-service'];
  assert.throws(() => validateConfig(c, territories));
});
test('refuse secret en clair et champ non prévu', () => {
  const c = config(); c.users[0].password = 'never-accepted';
  assert.throws(() => validateConfig(c, territories));
});
test('refuse cycle hiérarchique', () => {
  const c = config(); c.services[0].parentServiceId = c.services[0].id;
  assert.throws(() => validateConfig(c, territories));
});
test('refuse rôle inconnu et identifiant réutilisé du pilote', () => {
  const c = config(); c.users[0].roles = ['superadmin'];
  assert.throws(() => validateConfig(c, territories));
  const d = config(); d.services[0].id = 'service-finances';
  assert.throws(() => validateConfig(d, territories));
});
