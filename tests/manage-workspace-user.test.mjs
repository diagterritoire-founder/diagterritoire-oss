import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateOperation,
} from '../scripts/manage-workspace-user.mjs';

const base = {
  workspaceId:
    'workspace-test-52-pamandzi',
  userId:
    'workspace-test-52-pamandzi-contributor',
};

test(
  'accepte une modification d affectations',
  () => {
    const result =
      validateOperation({
        ...base,
        action: 'set-services',
        serviceIds: [
          'workspace-test-52-pamandzi-finances',
        ],
      });

    assert.equal(
      result.action,
      'set-services',
    );

    assert.deepEqual(
      result.serviceIds,
      [
        'workspace-test-52-pamandzi-finances',
      ],
    );
  },
);

test(
  'accepte une désactivation sans paramètre supplémentaire',
  () => {
    const result =
      validateOperation({
        ...base,
        action: 'deactivate',
      });

    assert.equal(
      result.action,
      'deactivate',
    );
  },
);

test(
  'accepte une réinitialisation par variable d environnement',
  () => {
    const result =
      validateOperation({
        ...base,
        action: 'reset-password',
        passwordEnv:
          'DT_ADMIN_TEST_PASSWORD',
      });

    assert.equal(
      result.passwordEnv,
      'DT_ADMIN_TEST_PASSWORD',
    );
  },
);

test(
  'refuse un mot de passe en clair',
  () => {
    assert.throws(() =>
      validateOperation({
        ...base,
        action: 'reset-password',
        passwordEnv:
          'DT_ADMIN_TEST_PASSWORD',
        password:
          'secret-interdit',
      }),
    );
  },
);

test(
  'refuse les affectations dupliquées',
  () => {
    assert.throws(() =>
      validateOperation({
        ...base,
        action: 'set-services',
        serviceIds: [
          'workspace-test-52-pamandzi-finances',
          'workspace-test-52-pamandzi-finances',
        ],
      }),
    );
  },
);

test(
  'refuse une variable de secret hors namespace administration',
  () => {
    assert.throws(() =>
      validateOperation({
        ...base,
        action: 'reset-password',
        passwordEnv:
          'DT_PROVISION_TEST_PASSWORD',
      }),
    );
  },
);

test(
  'refuse des paramètres inutiles lors de la désactivation',
  () => {
    assert.throws(() =>
      validateOperation({
        ...base,
        action: 'deactivate',
        serviceIds: [],
      }),
    );
  },
);

test(
  'refuse une action inconnue',
  () => {
    assert.throws(() =>
      validateOperation({
        ...base,
        action: 'delete-user',
      }),
    );
  },
);
