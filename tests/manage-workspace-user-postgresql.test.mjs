import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import pg from 'pg';
import { compare } from 'bcryptjs';

import {
  mayotteTerritories,
} from '../data/mayotte-territories.ts';

import {
  provision,
  validateConfig,
} from '../scripts/provision-workspace.mjs';

import {
  administerWorkspaceUser,
  validateOperation,
} from '../scripts/manage-workspace-user.mjs';

const TEST_DATABASE =
  'diagterritoire_admin_test_52';

test(
  'recette PostgreSQL #52 : administration courante des comptes',
  async () => {
    const source =
      process.env.DATABASE_URL;

    assert.ok(
      source,
      'DATABASE_URL absente',
    );

    const target =
      new URL(source);

    assert.ok(
      [
        'db',
        'localhost',
        '127.0.0.1',
        '[::1]',
      ].includes(target.hostname),
      'La recette PostgreSQL doit rester locale.',
    );

    target.pathname =
      `/${TEST_DATABASE}`;

    const client =
      new pg.Client({
        connectionString:
          target.toString(),
      });

    await client.connect();

    try {
      const actualDatabase =
        (
          await client.query(
            'SELECT current_database() AS name',
          )
        ).rows[0].name;

      assert.equal(
        actualDatabase,
        TEST_DATABASE,
      );

      const initialWorkspaceCount =
        (
          await client.query(
            `SELECT count(*)::int AS n
             FROM "Workspace"`,
          )
        ).rows[0].n;

      assert.equal(
        initialWorkspaceCount,
        0,
        'La recette exige une base isolée vide ; aucune suppression automatique.',
      );

      const raw =
        JSON.parse(
          await readFile(
            new URL(
              '../examples/workspace-test-52.json',
              import.meta.url,
            ),
            'utf8',
          ),
        );

      const config =
        validateConfig(
          raw,
          mayotteTerritories,
        );

      const provisionSecrets =
        Object.fromEntries(
          config.users.map(
            (user) => [
              user.passwordEnv,
              randomBytes(24)
                .toString('hex'),
            ],
          ),
        );

      await provision(
        client,
        config,
        {
          apply: true,
          confirmDatabase:
            TEST_DATABASE,
          secrets:
            provisionSecrets,
        },
      );

      const workspaceId =
        config.workspace.id;

      const contributor =
        config.users.find(
          (user) =>
            user.roles.includes(
              'contributor',
            ),
        );

      assert.ok(contributor);

      const financeServiceId =
        config.services[0].id;

      const secondServiceId =
        `${workspaceId}-technical-services`;

      await client.query(
        `INSERT INTO "WorkspaceService" (
           "id",
           "workspaceId",
           "organizationId",
           "parentServiceId",
           "name",
           "slug",
           "category",
           "description",
           "managerUserId",
           "status",
           "createdAt",
           "updatedAt"
         )
         VALUES (
           $1,
           $2,
           $3,
           NULL,
           'Services techniques',
           'technical-services',
           'technical_services',
           NULL,
           NULL,
           'active',
           NOW(),
           NOW()
         )`,
        [
          secondServiceId,
          workspaceId,
          config.workspace
            .organizationId,
        ],
      );

      const getUser =
        async () =>
          (
            await client.query(
              `SELECT
                 "status",
                 "serviceIds"
               FROM "WorkspaceUser"
               WHERE "id" = $1`,
              [contributor.id],
            )
          ).rows[0];

      const originalUser =
        await getUser();

      assert.equal(
        originalUser.status,
        'active',
      );

      assert.deepEqual(
        originalUser.serviceIds,
        [financeServiceId],
      );

      const setServices =
        validateOperation({
          workspaceId,
          userId:
            contributor.id,
          action:
            'set-services',
          serviceIds: [
            secondServiceId,
          ],
        });

      const checkPlan =
        await administerWorkspaceUser(
          client,
          setServices,
        );

      assert.equal(
        checkPlan.applied,
        false,
      );

      assert.equal(
        checkPlan.changed,
        true,
      );

      assert.deepEqual(
        (await getUser()).serviceIds,
        [financeServiceId],
        '--check ne doit pas écrire',
      );

      await assert.rejects(
        administerWorkspaceUser(
          client,
          setServices,
          {
            apply: true,
            confirmDatabase:
              'incorrect',
          },
        ),
      );

      assert.deepEqual(
        (await getUser()).serviceIds,
        [financeServiceId],
        'Une confirmation incorrecte ne doit rien modifier',
      );

      const appliedServices =
        await administerWorkspaceUser(
          client,
          setServices,
          {
            apply: true,
            confirmDatabase:
              TEST_DATABASE,
          },
        );

      assert.equal(
        appliedServices.applied,
        true,
      );

      assert.equal(
        appliedServices.changed,
        true,
      );

      assert.deepEqual(
        (await getUser()).serviceIds,
        [secondServiceId],
      );

      const repeatedServices =
        await administerWorkspaceUser(
          client,
          setServices,
          {
            apply: true,
            confirmDatabase:
              TEST_DATABASE,
          },
        );

      assert.equal(
        repeatedServices.changed,
        false,
        'Une affectation identique doit être rejouable sans modification.',
      );

      const resetPassword =
        validateOperation({
          workspaceId,
          userId:
            contributor.id,
          action:
            'reset-password',
          passwordEnv:
            'DT_ADMIN_TEST_PASSWORD',
        });

      const passwordCheck =
        await administerWorkspaceUser(
          client,
          resetPassword,
        );

      assert.equal(
        passwordCheck.applied,
        false,
      );

      const beforeHash =
        (
          await client.query(
            `SELECT "passwordHash"
             FROM "WorkspaceCredential"
             WHERE "userId" = $1`,
            [contributor.id],
          )
        ).rows[0].passwordHash;

      await assert.rejects(
        administerWorkspaceUser(
          client,
          resetPassword,
          {
            apply: true,
            confirmDatabase:
              TEST_DATABASE,
            secrets: {},
          },
        ),
      );

      const afterMissingSecret =
        (
          await client.query(
            `SELECT "passwordHash"
             FROM "WorkspaceCredential"
             WHERE "userId" = $1`,
            [contributor.id],
          )
        ).rows[0].passwordHash;

      assert.equal(
        afterMissingSecret,
        beforeHash,
        'Secret absent : aucun changement de hash.',
      );

      await client.query(`
        CREATE FUNCTION
          pg_temp.reject_admin_password_52()
        RETURNS trigger
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RAISE EXCEPTION
            'test rollback admin 52';
        END
        $$
      `);

      await client.query(`
        CREATE TRIGGER
          test_52_reject_admin_password
        BEFORE UPDATE
        ON "WorkspaceCredential"
        FOR EACH ROW
        EXECUTE FUNCTION
          pg_temp.reject_admin_password_52()
      `);

      const rollbackSecret =
        randomBytes(24)
          .toString('hex');

      try {
        await assert.rejects(
          administerWorkspaceUser(
            client,
            resetPassword,
            {
              apply: true,
              confirmDatabase:
                TEST_DATABASE,
              secrets: {
                DT_ADMIN_TEST_PASSWORD:
                  rollbackSecret,
              },
            },
          ),
        );
      } finally {
        await client.query(`
          DROP TRIGGER
            test_52_reject_admin_password
          ON "WorkspaceCredential"
        `);
      }

      const afterRollback =
        (
          await client.query(
            `SELECT "passwordHash"
             FROM "WorkspaceCredential"
             WHERE "userId" = $1`,
            [contributor.id],
          )
        ).rows[0].passwordHash;

      assert.equal(
        afterRollback,
        beforeHash,
        'Échec SQL : la transaction doit être annulée.',
      );

      const newPassword =
        randomBytes(24)
          .toString('hex');

      const resetApplied =
        await administerWorkspaceUser(
          client,
          resetPassword,
          {
            apply: true,
            confirmDatabase:
              TEST_DATABASE,
            secrets: {
              DT_ADMIN_TEST_PASSWORD:
                newPassword,
            },
          },
        );

      assert.equal(
        resetApplied.applied,
        true,
      );

      const newHash =
        (
          await client.query(
            `SELECT "passwordHash"
             FROM "WorkspaceCredential"
             WHERE "userId" = $1`,
            [contributor.id],
          )
        ).rows[0].passwordHash;

      assert.notEqual(
        newHash,
        beforeHash,
      );

      assert.equal(
        await compare(
          newPassword,
          newHash,
        ),
        true,
      );

      assert.equal(
        await compare(
          provisionSecrets[
            contributor.passwordEnv
          ],
          newHash,
        ),
        false,
      );

      const deactivate =
        validateOperation({
          workspaceId,
          userId:
            contributor.id,
          action:
            'deactivate',
        });

      const deactivateCheck =
        await administerWorkspaceUser(
          client,
          deactivate,
        );

      assert.equal(
        deactivateCheck.changed,
        true,
      );

      assert.equal(
        (await getUser()).status,
        'active',
        '--check de désactivation ne doit pas écrire.',
      );

      const deactivateApplied =
        await administerWorkspaceUser(
          client,
          deactivate,
          {
            apply: true,
            confirmDatabase:
              TEST_DATABASE,
          },
        );

      assert.equal(
        deactivateApplied.changed,
        true,
      );

      assert.equal(
        (await getUser()).status,
        'inactive',
      );

      const repeatedDeactivate =
        await administerWorkspaceUser(
          client,
          deactivate,
          {
            apply: true,
            confirmDatabase:
              TEST_DATABASE,
          },
        );

      assert.equal(
        repeatedDeactivate.changed,
        false,
        'Une désactivation répétée doit être sans effet.',
      );

      await assert.rejects(
        administerWorkspaceUser(
          client,
          resetPassword,
          {
            apply: true,
            confirmDatabase:
              TEST_DATABASE,
            secrets: {
              DT_ADMIN_TEST_PASSWORD:
                randomBytes(24)
                  .toString('hex'),
            },
          },
        ),
      );

      console.log(
        'Recette administration #52 réussie : données conservées dans la base isolée ; aucun secret affiché.',
      );
    } finally {
      await client.end();
    }
  },
);
