import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";

import { Client } from "pg";

const SAFE_DATABASES = new Set([
  "diagterritoire_ci",
  "diagterritoire_evolution86_qualification",
]);

function qualificationDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  assert.ok(raw, "DATABASE_URL absente : test base refusé.");

  const url = new URL(raw);
  const databaseName = decodeURIComponent(url.pathname.slice(1));
  assert.ok(
    ["127.0.0.1", "localhost"].includes(url.hostname) &&
      SAFE_DATABASES.has(databaseName),
    "Base non autorisée pour les écritures de qualification.",
  );

  // Prisma accepte ?schema=public mais le pilote pg n'en a pas besoin.
  url.searchParams.delete("schema");
  return url.toString();
}

test("agenda partagé : versionnage atomique et isolation du workspace (ROLLBACK)", { skip: process.env.DT_RUN_AGENDA_DB_TEST !== "1" }, async () => {
  const client = new Client({
    connectionString: qualificationDatabaseUrl(),
  });

  await client.connect();
  try {
    await client.query("BEGIN");

    const workspace = await client.query(
      'SELECT "id" FROM "Workspace" WHERE "id" = $1',
      ["workspace-dzaoudzi-labattoir"],
    );
    assert.equal(workspace.rowCount, 1, "Workspace pilote absent.");

    const id = randomUUID();
    const territoryId = `qualif-agenda-106-${id}`;
    const workspaceId = workspace.rows[0].id as string;

    await client.query(
      `INSERT INTO "CouncilPreparationState"
      ("id", "workspaceId", "territoryId", "agendaRevision", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 0, NOW(), NOW())`,
      [id, workspaceId, territoryId],
    );

    async function updateWithRevision(
      revision: number,
      agenda: string[],
      targetWorkspace = workspaceId,
    ) {
      return client.query(
        `UPDATE "CouncilPreparationState"
        SET "agenda" = $1::jsonb,
            "agendaRevision" = "agendaRevision" + 1,
            "updatedAt" = NOW()
        WHERE "id" = $2
          AND "workspaceId" = $3
          AND "territoryId" = $4
          AND "agendaRevision" = $5
        RETURNING "agendaRevision", "agenda"`,
        [JSON.stringify(agenda), id, targetWorkspace, territoryId, revision],
      );
    }

    const first = await updateWithRevision(0, ["eau"]);
    assert.equal(first.rowCount, 1);
    assert.equal(first.rows[0].agendaRevision, 1);
    assert.deepEqual(first.rows[0].agenda, ["eau"]);

    const stale = await updateWithRevision(0, ["voirie"]);
    assert.equal(stale.rowCount, 0, "Une version obsolète ne doit pas écraser.");

    const foreignWorkspace = await updateWithRevision(
      1, ["voirie"], "workspace-non-autorise",
    );
    assert.equal(foreignWorkspace.rowCount, 0);

    const second = await updateWithRevision(1, ["eau", "voirie"]);
    assert.equal(second.rowCount, 1);
    assert.equal(second.rows[0].agendaRevision, 2);
    assert.deepEqual(second.rows[0].agenda, ["eau", "voirie"]);

    const saved = await client.query(
      'SELECT "agenda", "agendaRevision" FROM "CouncilPreparationState" WHERE "id" = $1',
      [id],
    );
    assert.deepEqual(saved.rows[0].agenda, ["eau", "voirie"]);
    assert.equal(saved.rows[0].agendaRevision, 2);
  } finally {
    // Ne laisse aucune ligne de test dans la base de qualification.
    try {
      await client.query("ROLLBACK");
    } finally {
      await client.end();
    }
  }
});
