import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  WorkspaceAccessEngine,
} from "../core/engines/WorkspaceAccessEngine";
import type {
  WorkspaceRole,
  WorkspaceUser,
} from "../types/workspace";

function userWithRole(role: WorkspaceRole): WorkspaceUser {
  return {
    id: "user-security-test",
    workspaceId: "workspace-security-test",
    email: "security-test@example.invalid",
    displayName: "Security Test",
    serviceIds: ["service-finances"],
    roles: [role],
    permissions: [],
    status: "active",
    createdAt: "2026-11-07T00:00:00.000Z",
    updatedAt: "2026-11-07T00:00:00.000Z",
  };
}

test("council roles separate view from manage", () => {
  for (const role of ["contributor", "validator", "observer"] as const) {
    const user = userWithRole(role);
    assert.equal(WorkspaceAccessEngine.can(user, "decision:view"), true);
    assert.equal(WorkspaceAccessEngine.can(user, "decision:manage"), false);
  }

  for (const role of ["general_management", "administrator"] as const) {
    const user = userWithRole(role);
    assert.equal(WorkspaceAccessEngine.can(user, "decision:view"), true);
    assert.equal(WorkspaceAccessEngine.can(user, "decision:manage"), true);
  }
});

test("council PATCH requires decision:manage before reading or writing", () => {
  const route = readFileSync(
    new URL("../app/api/conseil-municipal/[territoryId]/state/route.ts", import.meta.url),
    "utf8",
  );

  const [prefix, patch, remainder] = route.split("export async function PATCH(");
  assert.ok(prefix);
  assert.ok(patch);
  assert.equal(remainder, undefined);

  const guard = patch.indexOf('"decision:manage"');
  const bodyRead = patch.indexOf("await request.json()");
  const write = patch.indexOf("prisma.councilPreparationState.upsert");

  assert.ok(guard >= 0, "permission decision:manage missing from PATCH");
  assert.ok(bodyRead > guard, "permission guard must run before body parsing");
  assert.ok(write > bodyRead, "database write must run after authorization");

  const guardSegment = patch.slice(
    patch.indexOf("if (!WorkspaceSessionService.can("),
    bodyRead,
  );

  assert.match(guardSegment, /authorization\.session/);
  assert.match(guardSegment, /"decision:manage"/);
  assert.match(guardSegment, /status:\s*403/);
});
