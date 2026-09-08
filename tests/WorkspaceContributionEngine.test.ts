import assert from "node:assert/strict";
import test from "node:test";

import {
  WorkspaceContributionEngine,
} from "../core/engines/WorkspaceContributionEngine";

const baseInput = {
  id: "contribution-test-1",
  workspaceId: "workspace-test",
  serviceId: "service-test",
  territoryId: "territory-test",
  organizationId: "organization-test",
  authorUserId: "user-test",
  type: "observation" as const,
  title: "  Situation métier  ",
  description: "  Description initiale  ",
  source: "  Service pilote  ",
  referencePeriod: "  2026  ",
  createdAt: "2026-09-08T18:00:00.000Z",
};

test(
  "create produit un brouillon normalisé",
  () => {
    const contribution =
      WorkspaceContributionEngine.create(
        baseInput,
      );

    assert.equal(
      contribution.status,
      "draft",
    );
    assert.equal(
      contribution.title,
      "Situation métier",
    );
    assert.equal(
      contribution.description,
      "Description initiale",
    );
    assert.equal(
      contribution.source,
      "Service pilote",
    );
    assert.equal(
      contribution.authorUserId,
      "user-test",
    );
    assert.equal(
      contribution.referencePeriod,
      "2026",
    );
  },
);

test(
  "create refuse un titre vide",
  () => {
    assert.throws(
      () =>
        WorkspaceContributionEngine.create({
          ...baseInput,
          title: "   ",
        }),
      /titre de la contribution est obligatoire/i,
    );
  },
);

test(
  "updateDraft modifie et normalise un brouillon",
  () => {
    const contribution =
      WorkspaceContributionEngine.create(
        baseInput,
      );

    const updated =
      WorkspaceContributionEngine.updateDraft(
        contribution,
        {
          type: "alert",
          title: "  Nouvelle situation  ",
          description: "  Mise à jour  ",
          source: "",
          referencePeriod: "  2026-T3  ",
          updatedAt:
            "2026-09-08T19:00:00.000Z",
        },
      );

    assert.equal(updated.type, "alert");
    assert.equal(
      updated.title,
      "Nouvelle situation",
    );
    assert.equal(
      updated.description,
      "Mise à jour",
    );
    assert.equal(
      updated.source,
      undefined,
    );
    assert.equal(
      updated.referencePeriod,
      "2026-T3",
    );
    assert.equal(
      updated.updatedAt,
      "2026-09-08T19:00:00.000Z",
    );
  },
);

test(
  "updateDraft refuse une contribution non brouillon",
  () => {
    const contribution =
      WorkspaceContributionEngine.create(
        baseInput,
      );

    const submitted = {
      ...contribution,
      status: "submitted" as const,
    };

    assert.throws(
      () =>
        WorkspaceContributionEngine.updateDraft(
          submitted,
          {
            type: "observation",
            title: "Modification interdite",
          },
        ),
      /seul un brouillon peut être modifié/i,
    );
  },
);
