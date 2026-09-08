import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";

import {
  WorkspaceContributionEngine,
} from "../core/engines/WorkspaceContributionEngine";
import {
  WorkspaceContributionRepository,
} from "../core/repositories/WorkspaceContributionRepository";
import {
  WorkspaceContributionService,
} from "../core/services/WorkspaceContributionService";
import {
  WorkspaceSessionService,
  type WorkspaceSession,
} from "../core/session/WorkspaceSession";
import { prisma } from "../lib/prisma";
import type {
  ContributionHistoryEntry,
} from "../types/workspace";

const WORKSPACE_ID =
  "workspace-dzaoudzi-labattoir";

const FINANCE_SERVICE_ID =
  "service-finances";

const OUT_OF_SCOPE_SERVICE_ID =
  "service-education";

const CONTRIBUTOR_ID =
  "user-pilot-finances-contributor";

const VALIDATOR_ID =
  "user-pilot-finances-validator";

const OTHER_CONTRIBUTOR_ID =
  "user-test-workflow-41-contributor";

const TEST_TITLE_PREFIX =
  "[test #41 workflow]";

function assertLocalDatabase() {
  const value = process.env.DATABASE_URL;

  assert.ok(
    value,
    "DATABASE_URL absente.",
  );

  const host =
    new URL(value).hostname.toLowerCase();

  const allowedHosts = new Set([
    "localhost",
    "127.0.0.1",
    "::1",
    "postgres",
    "db",
    "database",
  ]);

  assert.ok(
    allowedHosts.has(host),
    "Tests workflow #41 refuses : la base cible n'est pas locale.",
  );
}

async function cleanupTestData() {
  await prisma.workspaceContribution.deleteMany({
    where: {
      title: {
        startsWith: TEST_TITLE_PREFIX,
      },
    },
  });

  await prisma.workspaceUser.deleteMany({
    where: {
      id: OTHER_CONTRIBUTOR_ID,
    },
  });
}

async function requireSession(
  userId: string,
): Promise<WorkspaceSession> {
  const session =
    await WorkspaceSessionService.createForUser(
      userId,
    );

  assert.ok(
    session,
    `Session introuvable : ${userId}`,
  );

  return session;
}

async function requireWorkspace() {
  const workspace =
    await prisma.workspace.findUnique({
      where: {
        id: WORKSPACE_ID,
      },
    });

  assert.ok(
    workspace,
    "Workspace pilote introuvable.",
  );

  return workspace;
}

async function createFinanceDraft(
  label: string,
) {
  const workspace =
    await requireWorkspace();

  const contributor =
    await requireSession(
      CONTRIBUTOR_ID,
    );

  const contribution =
    await WorkspaceContributionService.createDraft(
      contributor,
      {
        territoryId:
          workspace.territoryId,
        serviceId:
          FINANCE_SERVICE_ID,
        type: "observation",
        title:
          `${TEST_TITLE_PREFIX} ${label}`,
        description:
          "Contribution temporaire de validation du workflow #41.",
        referencePeriod:
          "2026-T3",
        source:
          "Tests automatisés DiagTerritoire",
      },
    );

  return {
    workspace,
    contributor,
    contribution,
  };
}

async function createDirectDraft(
  label: string,
  serviceId: string,
  territoryId: string,
) {
  const workspace =
    await requireWorkspace();

  const contributor =
    await requireSession(
      CONTRIBUTOR_ID,
    );

  const contribution =
    WorkspaceContributionEngine.create({
      id: randomUUID(),
      workspaceId:
        workspace.id,
      serviceId,
      territoryId,
      organizationId:
        workspace.organizationId,
      authorUserId:
        contributor.user.id,
      type: "observation",
      title:
        `${TEST_TITLE_PREFIX} ${label}`,
      description:
        "Contribution temporaire créée directement pour tester un périmètre interdit.",
    });

  return WorkspaceContributionRepository.create(
    contribution,
  );
}

async function assertUnchanged(
  contributionId: string,
  expectedStatus: string,
  expectedHistoryLength: number,
) {
  const reloaded =
    await WorkspaceContributionRepository.findById(
      contributionId,
    );

  assert.ok(
    reloaded,
    "Contribution de test introuvable.",
  );

  assert.equal(
    reloaded.contribution.status,
    expectedStatus,
  );

  assert.equal(
    reloaded.history.length,
    expectedHistoryLength,
  );
}

test.before(async () => {
  assertLocalDatabase();

  await cleanupTestData();

  const now = new Date();

  await prisma.workspaceUser.upsert({
    where: {
      id: OTHER_CONTRIBUTOR_ID,
    },
    update: {
      workspaceId:
        WORKSPACE_ID,
      email:
        "workflow-41-other-contributor@diagterritoire.test",
      displayName:
        "Contributeur test workflow #41",
      title:
        "Utilisateur temporaire de test",
      serviceIds: [
        FINANCE_SERVICE_ID,
      ],
      roles: [
        "contributor",
      ],
      permissions: [],
      status: "active",
      updatedAt: now,
    },
    create: {
      id: OTHER_CONTRIBUTOR_ID,
      workspaceId:
        WORKSPACE_ID,
      email:
        "workflow-41-other-contributor@diagterritoire.test",
      displayName:
        "Contributeur test workflow #41",
      title:
        "Utilisateur temporaire de test",
      serviceIds: [
        FINANCE_SERVICE_ID,
      ],
      roles: [
        "contributor",
      ],
      permissions: [],
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
  });
});

test.after(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

test(
  "workflow autorise draft -> submitted -> in_review -> validated -> published",
  async () => {
    const {
      contributor,
      contribution,
    } =
      await createFinanceDraft(
        "parcours complet",
      );

    const validator =
      await requireSession(
        VALIDATOR_ID,
      );

    const submitted =
      await WorkspaceContributionService.transition(
        contributor,
        contribution.id,
        "submitted",
        "Soumission test #41",
      );

    assert.ok(submitted);
    assert.equal(
      submitted.contribution.status,
      "submitted",
    );
    assert.equal(
      submitted.history.length,
      1,
    );

    await assert.rejects(
      () =>
        WorkspaceContributionService.transition(
          contributor,
          contribution.id,
          "in_review",
        ),
      /Permission refusée : contribution:validate/i,
    );

    await assertUnchanged(
      contribution.id,
      "submitted",
      1,
    );

    const inReview =
      await WorkspaceContributionService.transition(
        validator,
        contribution.id,
        "in_review",
        "Prise en revue test #41",
      );

    assert.ok(inReview);
    assert.equal(
      inReview.contribution.status,
      "in_review",
    );

    const validated =
      await WorkspaceContributionService.transition(
        validator,
        contribution.id,
        "validated",
        "Validation test #41",
      );

    assert.ok(validated);
    assert.equal(
      validated.contribution.status,
      "validated",
    );

    await assert.rejects(
      () =>
        WorkspaceContributionService.transition(
          contributor,
          contribution.id,
          "published",
        ),
      /Permission refusée : contribution:publish/i,
    );

    await assertUnchanged(
      contribution.id,
      "validated",
      3,
    );

    const published =
      await WorkspaceContributionService.transition(
        validator,
        contribution.id,
        "published",
        "Publication test #41",
      );

    assert.ok(published);

    assert.equal(
      published.contribution.status,
      "published",
    );

    assert.equal(
      published.contribution.validatorUserId,
      validator.user.id,
    );

    const transitions =
      published.history
        .map(
          (entry) =>
            `${entry.fromStatus}->${entry.toStatus}`,
        )
        .sort();

    assert.deepEqual(
      transitions,
      [
        "draft->submitted",
        "submitted->in_review",
        "in_review->validated",
        "validated->published",
      ].sort(),
    );

    const submission =
      published.history.find(
        (entry) =>
          entry.toStatus ===
          "submitted",
      );

    assert.ok(submission);

    assert.equal(
      submission.actorUserId,
      contributor.user.id,
    );

    for (
      const status of [
        "in_review",
        "validated",
        "published",
      ] as const
    ) {
      const entry:
        | ContributionHistoryEntry
        | undefined =
        published.history.find(
          (candidate) =>
            candidate.toStatus === status,
        );

      assert.ok(entry);

      assert.equal(
        entry.actorUserId,
        validator.user.id,
      );
    }
  },
);

test(
  "submitted -> rejected est autorise pour un validateur",
  async () => {
    const {
      contributor,
      contribution,
    } =
      await createFinanceDraft(
        "rejet submitted",
      );

    const validator =
      await requireSession(
        VALIDATOR_ID,
      );

    await WorkspaceContributionService.transition(
      contributor,
      contribution.id,
      "submitted",
    );

    const rejected =
      await WorkspaceContributionService.transition(
        validator,
        contribution.id,
        "rejected",
        "Rejet depuis submitted",
      );

    assert.ok(rejected);

    assert.equal(
      rejected.contribution.status,
      "rejected",
    );

    assert.equal(
      rejected.history.length,
      2,
    );

    assert.ok(
      rejected.history.some(
        (entry) =>
          entry.fromStatus ===
            "submitted" &&
          entry.toStatus ===
            "rejected",
      ),
    );
  },
);

test(
  "in_review -> rejected est autorise pour un validateur",
  async () => {
    const {
      contributor,
      contribution,
    } =
      await createFinanceDraft(
        "rejet in review",
      );

    const validator =
      await requireSession(
        VALIDATOR_ID,
      );

    await WorkspaceContributionService.transition(
      contributor,
      contribution.id,
      "submitted",
    );

    await WorkspaceContributionService.transition(
      validator,
      contribution.id,
      "in_review",
    );

    const rejected =
      await WorkspaceContributionService.transition(
        validator,
        contribution.id,
        "rejected",
        "Rejet depuis in_review",
      );

    assert.ok(rejected);

    assert.equal(
      rejected.contribution.status,
      "rejected",
    );

    assert.equal(
      rejected.history.length,
      3,
    );

    assert.ok(
      rejected.history.some(
        (entry) =>
          entry.fromStatus ===
            "in_review" &&
          entry.toStatus ===
            "rejected",
      ),
    );
  },
);

test(
  "une transition incoherente avec le statut courant est refusee sans historique",
  async () => {
    const {
      contribution,
    } =
      await createFinanceDraft(
        "statut incoherent",
      );

    const validator =
      await requireSession(
        VALIDATOR_ID,
      );

    await assert.rejects(
      () =>
        WorkspaceContributionService.transition(
          validator,
          contribution.id,
          "validated",
        ),
      /Transition impossible : draft vers validated/i,
    );

    await assertUnchanged(
      contribution.id,
      "draft",
      0,
    );
  },
);

test(
  "un autre contributeur ne peut pas soumettre le brouillon de son auteur",
  async () => {
    const {
      contribution,
    } =
      await createFinanceDraft(
        "mauvais auteur",
      );

    const otherContributor =
      await requireSession(
        OTHER_CONTRIBUTOR_ID,
      );

    await assert.rejects(
      () =>
        WorkspaceContributionService.transition(
          otherContributor,
          contribution.id,
          "submitted",
        ),
      /Seul l'auteur peut soumettre/i,
    );

    await assertUnchanged(
      contribution.id,
      "draft",
      0,
    );
  },
);

test(
  "une session d'un autre workspace ne peut pas muter la contribution",
  async () => {
    const {
      contributor,
      contribution,
    } =
      await createFinanceDraft(
        "mauvais workspace",
      );

    const wrongWorkspaceSession: WorkspaceSession = {
      ...contributor,
      workspaceId:
        "workspace-test-autre",
    };

    await assert.rejects(
      () =>
        WorkspaceContributionService.transition(
          wrongWorkspaceSession,
          contribution.id,
          "submitted",
        ),
      /inaccessible dans cet espace/i,
    );

    await assertUnchanged(
      contribution.id,
      "draft",
      0,
    );
  },
);

test(
  "une contribution d'un service hors perimetre est refusee",
  async () => {
    const workspace =
      await requireWorkspace();

    const contributor =
      await requireSession(
        CONTRIBUTOR_ID,
      );

    const contribution =
      await createDirectDraft(
        "service hors perimetre",
        OUT_OF_SCOPE_SERVICE_ID,
        workspace.territoryId,
      );

    await assert.rejects(
      () =>
        WorkspaceContributionService.transition(
          contributor,
          contribution.id,
          "submitted",
        ),
      /Accès interdit à ce service/i,
    );

    await assertUnchanged(
      contribution.id,
      "draft",
      0,
    );
  },
);

test(
  "un territoire incoherent est refuse avant toute mutation",
  async () => {
    const contributor =
      await requireSession(
        CONTRIBUTOR_ID,
      );

    const contribution =
      await createDirectDraft(
        "territoire incoherent",
        FINANCE_SERVICE_ID,
        "territory-test-invalide",
      );

    await assert.rejects(
      () =>
        WorkspaceContributionService.transition(
          contributor,
          contribution.id,
          "submitted",
        ),
      /Contexte de contribution invalide ou inaccessible/i,
    );

    await assertUnchanged(
      contribution.id,
      "draft",
      0,
    );
  },
);
