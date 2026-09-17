import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const ACTIONS = [
  'set-services',
  'deactivate',
  'reset-password',
];

const GLOBAL_SERVICE_ROLES = [
  'administrator',
  'executive',
  'general_management',
];

function check(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function object(value, allowedKeys) {
  check(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value),
    'Objet attendu.',
  );

  check(
    Object.keys(value).every(
      (key) => allowedKeys.includes(key),
    ),
    'Champ inconnu : opération refusée.',
  );
}

function text(value) {
  check(
    typeof value === 'string' &&
      value === value.trim() &&
      value.length > 0 &&
      value.length <= 250,
    'Texte absent ou invalide.',
  );

  return value;
}

function key(value) {
  text(value);

  check(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    'Identifiant invalide.',
  );

  return value;
}

function unique(values) {
  check(
    new Set(values).size === values.length,
    'Doublon dans la configuration.',
  );
}

function stringArray(value, message) {
  check(
    Array.isArray(value) &&
      value.every(
        (item) => typeof item === 'string',
      ),
    message,
  );

  return value;
}

function normalizedArray(value, message) {
  return stringArray(value, message)
    .slice()
    .sort();
}

function arraysEqual(left, right) {
  return (
    left.length === right.length &&
    left.every(
      (value, index) =>
        value === right[index],
    )
  );
}

export function validateOperation(input) {
  object(input, [
    'workspaceId',
    'userId',
    'action',
    'serviceIds',
    'passwordEnv',
  ]);

  const workspaceId =
    key(input.workspaceId);

  const userId =
    key(input.userId);

  const action =
    text(input.action);

  check(
    ACTIONS.includes(action),
    'Action inconnue.',
  );

  if (action === 'set-services') {
    check(
      input.passwordEnv === undefined,
      'passwordEnv interdit pour cette action.',
    );

    check(
      Array.isArray(input.serviceIds) &&
        input.serviceIds.length <= 100,
      'Liste de services invalide ou trop longue.',
    );

    const serviceIds =
      input.serviceIds.map(
        (serviceId) => key(serviceId),
      );

    unique(serviceIds);

    return {
      workspaceId,
      userId,
      action,
      serviceIds,
    };
  }

  if (action === 'deactivate') {
    check(
      input.serviceIds === undefined &&
        input.passwordEnv === undefined,
      'Paramètre inutile pour la désactivation.',
    );

    return {
      workspaceId,
      userId,
      action,
    };
  }

  check(
    input.serviceIds === undefined,
    'serviceIds interdit pour cette action.',
  );

  check(
    typeof input.passwordEnv === 'string' &&
      /^DT_ADMIN_[A-Z0-9_]+$/.test(
        input.passwordEnv,
      ),
    'Variable de secret invalide.',
  );

  return {
    workspaceId,
    userId,
    action,
    passwordEnv: input.passwordEnv,
  };
}

export async function administerWorkspaceUser(
  client,
  operation,
  {
    apply = false,
    confirmDatabase,
    secrets = process.env,
  } = {},
) {
  await client.query(
    apply
      ? 'BEGIN'
      : 'BEGIN READ ONLY',
  );

  try {
    await client.query(
      "SET LOCAL lock_timeout = '5s'",
    );

    await client.query(
      "SET LOCAL statement_timeout = '30s'",
    );

    const database =
      (
        await client.query(
          'SELECT current_database() AS name',
        )
      ).rows[0].name;

    check(
      !apply ||
        confirmDatabase === database,
      'Confirmation de base incorrecte.',
    );

    const userResult =
      await client.query(
        `SELECT
           "id",
           "status",
           "roles",
           "serviceIds"
         FROM "WorkspaceUser"
         WHERE "id" = $1
           AND "workspaceId" = $2${
             apply
               ? ' FOR UPDATE'
               : ''
           }`,
        [
          operation.userId,
          operation.workspaceId,
        ],
      );

    check(
      userResult.rowCount === 1,
      'Compte introuvable dans ce workspace.',
    );

    const user =
      userResult.rows[0];

    check(
      user.status !== 'archived',
      'Compte archivé : action refusée.',
    );

    let changed = false;

    if (
      operation.action ===
      'set-services'
    ) {
      const roles =
        normalizedArray(
          user.roles,
          'Rôles du compte invalides.',
        );

      const currentServiceIds =
        normalizedArray(
          user.serviceIds,
          'Affectations actuelles invalides.',
        );

      const desiredServiceIds =
        operation.serviceIds
          .slice()
          .sort();

      if (
        desiredServiceIds.length === 0
      ) {
        check(
          roles.some(
            (role) =>
              GLOBAL_SERVICE_ROLES.includes(
                role,
              ),
          ),
          'Un compte sans rôle global doit conserver au moins un service.',
        );
      } else {
        const services =
          await client.query(
            `SELECT "id"
             FROM "WorkspaceService"
             WHERE "workspaceId" = $1
               AND "status" = 'active'
               AND "id" = ANY($2::text[])${
                 apply
                   ? ' FOR SHARE'
                   : ''
               }`,
            [
              operation.workspaceId,
              desiredServiceIds,
            ],
          );

        check(
          services.rowCount ===
            desiredServiceIds.length,
          'Service absent, inactif ou hors workspace.',
        );
      }

      changed =
        !arraysEqual(
          currentServiceIds,
          desiredServiceIds,
        );

      if (apply && changed) {
        const result =
          await client.query(
            `UPDATE "WorkspaceUser"
             SET "serviceIds" = $3::jsonb,
                 "updatedAt" = NOW()
             WHERE "id" = $1
               AND "workspaceId" = $2`,
            [
              operation.userId,
              operation.workspaceId,
              JSON.stringify(
                desiredServiceIds,
              ),
            ],
          );

        check(
          result.rowCount === 1,
          'Mise à jour des affectations non appliquée.',
        );
      }
    }

    if (
      operation.action ===
      'deactivate'
    ) {
      check(
        ['active', 'inactive'].includes(
          user.status,
        ),
        'Statut de compte non géré.',
      );

      changed =
        user.status === 'active';

      if (apply && changed) {
        const result =
          await client.query(
            `UPDATE "WorkspaceUser"
             SET "status" = 'inactive',
                 "updatedAt" = NOW()
             WHERE "id" = $1
               AND "workspaceId" = $2`,
            [
              operation.userId,
              operation.workspaceId,
            ],
          );

        check(
          result.rowCount === 1,
          'Désactivation non appliquée.',
        );
      }
    }

    if (
      operation.action ===
      'reset-password'
    ) {
      check(
        user.status === 'active',
        'Réinitialisation refusée pour un compte non actif.',
      );

      const credential =
        await client.query(
          `SELECT "userId"
           FROM "WorkspaceCredential"
           WHERE "userId" = $1${
             apply
               ? ' FOR UPDATE'
               : ''
           }`,
          [operation.userId],
        );

      check(
        credential.rowCount === 1,
        'Credential absent : réparation séparée requise.',
      );

      changed = true;

      if (apply) {
        const password =
          secrets[
            operation.passwordEnv
          ];

        check(
          typeof password === 'string' &&
            password.length >= 12 &&
            Buffer.byteLength(
              password,
              'utf8',
            ) <= 72,
          'Secret absent ou longueur invalide (12 caractères minimum, 72 octets maximum).',
        );

        const { hash } =
          await import('bcryptjs');

        const passwordHash =
          await hash(
            password,
            12,
          );

        const result =
          await client.query(
            `UPDATE "WorkspaceCredential"
             SET "passwordHash" = $2,
                 "updatedAt" = NOW()
             WHERE "userId" = $1`,
            [
              operation.userId,
              passwordHash,
            ],
          );

        check(
          result.rowCount === 1,
          'Réinitialisation non appliquée.',
        );
      }
    }

    await client.query(
      apply
        ? 'COMMIT'
        : 'ROLLBACK',
    );

    return {
      database,
      action: operation.action,
      account: 'trouvé',
      changed,
      applied: apply,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  const [
    file,
    mode = '--check',
    ...extra
  ] = process.argv.slice(2);

  check(
    file &&
      ['--check', '--apply'].includes(
        mode,
      ) &&
      extra.length === 0,
    'Usage : tsx scripts/manage-workspace-user.mjs CONFIG.json [--check|--apply]',
  );

  const operation =
    validateOperation(
      JSON.parse(
        await readFile(
          file,
          'utf8',
        ),
      ),
    );

  check(
    process.env.DATABASE_URL,
    'DATABASE_URL absente.',
  );

  const { default: pg } =
    await import('pg');

  const client =
    new pg.Client({
      connectionString:
        process.env.DATABASE_URL,
    });

  try {
    await client.connect();

    console.log(
      await administerWorkspaceUser(
        client,
        operation,
        {
          apply:
            mode === '--apply',
          confirmDatabase:
            process.env
              .DT_ADMIN_CONFIRM_DATABASE,
        },
      ),
    );
  } finally {
    await client.end();
  }
}

if (
  process.argv[1] &&
  import.meta.url ===
    pathToFileURL(
      process.argv[1],
    ).href
) {
  main().catch(() => {
    console.error(
      'Administration refusée ou interrompue. Vérifier cible, compte, affectations, secret, confirmation et connexion. Aucune erreur brute publiée.',
    );

    process.exitCode = 1;
  });
}
