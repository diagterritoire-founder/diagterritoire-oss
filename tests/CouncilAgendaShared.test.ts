import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { sanitizeCouncilAgenda } from "../lib/council-agenda";

test("l'ordre du jour accepte une sélection vide ou des identifiants valides", () => {
  assert.deepEqual(sanitizeCouncilAgenda([]), []);
  assert.deepEqual(sanitizeCouncilAgenda(["  voirie  ", "eau"]), ["voirie", "eau"]);
});

test("l'ordre du jour refuse les payloads invalides ou doublonnés", () => {
  const invalid: unknown[] = [null, {}, "eau", ["ok", 12], [""], [" ", "ok"], ["a", " a "], ["x".repeat(201)], Array(21).fill("id")];
  for (const payload of invalid) {
    assert.throws(() => sanitizeCouncilAgenda(payload));
  }
});

test("l'API partagée reste protégée avant toute écriture", () => {
  const source = readFileSync(
    new URL("../app/api/conseil-municipal/[territoryId]/state/route.ts", import.meta.url),
    "utf8",
  );
  const patch = source.split("export async function PATCH(")[1];
  assert.ok(patch);
  assert.ok(patch.indexOf('"decision:manage"') < patch.indexOf("await request.json()"));
  assert.ok(patch.indexOf("sanitizeCouncilAgenda(body.agenda)") < patch.indexOf("prisma.councilPreparationState.upsert"));
  assert.match(patch, /expectedAgendaRevision/);
  assert.match(patch, /agendaRevision: expectedRevision/);
  assert.match(patch, /agendaRevision: \{ increment: 1 \}/);
  assert.match(patch, /status: 409/);
  assert.match(source, /canManage/);
});

test("la page du conseil municipal présente l'ordre du jour partagé", () => {
  const source = readFileSync(
    new URL("../app/conseil-municipal/[territoryId]/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /<CouncilAgenda/);
});
