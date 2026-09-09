import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";

import {
  PUBLISHED_CONTRIBUTION_ORDER,
  WorkspaceContributionConsolidationService,
} from "../core/services/WorkspaceContributionConsolidationService";
import { prisma } from "../lib/prisma";
import type {
  ContributionStatus,
} from "../types/workspace";

const WORKSPACE_ID =
  "workspace-dzaoudzi-labattoir";

const FINANCE_SERVICE_ID =
  "service-finances";

const EDUCATION_SERVICE_ID =
  "service-education";

const CONTRIBUTOR_ID =
  "user-pilot-finances-contributor";

const TEST_TITLE_PREFIX =
  "[test #42 consolidation]";

const RUN_ID =
  `test-42-${randomUUID()}`;

const TEMP_WORKSPACE_ID =
  `${RUN_ID}-workspace`;

const TEMP_SERVICE_ID =
  `${RUN_ID}-service`;

const TEMP_USER_ID =
  `${RUN_ID}-user`;

const OTHER_TERRITORY_ID =
  `${RUN_ID}-territory`;

const publishedIds = {
  older: `${RUN_ID}-published-older`,
  tieA: `${RUN_ID}-published-tie-a`,
  tieB: `${RUN_ID}-published-tie-b`,
  newer: `${RUN_ID}-published-newer`,
  education: `${RUN_ID}-published-education`,
  wrongTerritory:
    `${RUN_ID}-published-wrong-territory`,
  wrongWorkspace:
    `${RUN_ID}-published-wrong-workspace`,
};

let territoryId = "";
let organizationId = "";
let authorDisplayName = "";
let authorTitle: string | undefined;

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
    "Tests consolidation #42 refuses : la base cible n'est pas locale.",
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
      id: TEMP_USER_ID,
    },
  });

  await prisma.workspaceService.deleteMany({
    where: {
      id: TEMP_SERVICE_ID,
    },
  });

  await prisma.workspace.deleteMany({
    where: {
      id: TEMP_WORKSPACE_ID,
    },
  });
}

test.before(async () => {
  assertLocalDatabase();

  await cleanupTestData();

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

  territoryId = workspace.territoryId;
  organizationId =
    workspace.organizationId;

  const author =
    await prisma.workspaceUser.findUnique({
      where: {
        id: CONTRIBUTOR_ID,
      },
    });

  assert.ok(
    author,
    "Auteur pilote introuvable.",
  );

  authorDisplayName =
    author.displayName;

  authorTitle =
    author.title ?? undefined;

  const now =
    new Date(
      "2026-09-09T08:00:00.000Z",
    );

  await prisma.workspace.create({
    data: {
      id: TEMP_WORKSPACE_ID,
      organizationId:
        `${RUN_ID}-organization`,
      territoryId,
      name:
        "Workspace temporaire test #42",
      slug:
        `${RUN_ID}-workspace`,
      status: "inactive",
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.workspaceService.create({
    data: {
      id: TEMP_SERVICE_ID,
      workspaceId:
        TEMP_WORKSPACE_ID,
      organizationId:
        `${RUN_ID}-organization`,
      name:
        "Service temporaire test #42",
      slug:
        `${RUN_ID}-service`,
      category: "other",
      status: "inactive",
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.workspaceUser.create({
    data: {
      id: TEMP_USER_ID,
      workspaceId:
        TEMP_WORKSPACE_ID,
      email:
        `${RUN_ID}@diagterritoire.test`,
      displayName:
        "Auteur temporaire test #42",
      title:
        "Utilisateur de test",
      serviceIds: [
        TEMP_SERVICE_ID,
      ],
      roles: [
        "contributor",
      ],
      permissions: [],
      status: "inactive",
      createdAt: now,
      updatedAt: now,
    },
  });

  const base = {
    workspaceId:
      WORKSPACE_ID,
    territoryId,
    organizationId,
    authorUserId:
      CONTRIBUTOR_ID,
    type: "observation",
    description:
      "Description de consolidation #42",
    source:
      "Source métier #42",
    referencePeriod:
      "2026-T3",
    createdAt: now,
    updatedAt: now,
  };

  await prisma.workspaceContribution.createMany({
    data: [
      {
        ...base,
        id: publishedIds.older,
        serviceId:
          FINANCE_SERVICE_ID,
        title:
          `${TEST_TITLE_PREFIX} older`,
        status: "published",
        publishedAt:
          new Date(
            "2026-09-09T10:00:00.000Z",
          ),
      },
      {
        ...base,
        id: publishedIds.tieA,
        serviceId:
          FINANCE_SERVICE_ID,
        title:
          `${TEST_TITLE_PREFIX} tie a`,
        status: "published",
        publishedAt:
          new Date(
            "2026-09-09T11:00:00.000Z",
          ),
      },
      {
        ...base,
        id: publishedIds.tieB,
        serviceId:
          FINANCE_SERVICE_ID,
        title:
          `${TEST_TITLE_PREFIX} tie b`,
        status: "published",
        publishedAt:
          new Date(
            "2026-09-09T11:00:00.000Z",
          ),
      },
      {
        ...base,
        id: publishedIds.newer,
        serviceId:
          FINANCE_SERVICE_ID,
        title:
          `${TEST_TITLE_PREFIX} newer`,
        status: "published",
        publishedAt:
          new Date(
            "2026-09-09T12:00:00.000Z",
          ),
      },
      {
        ...base,
        id: publishedIds.education,
        serviceId:
          EDUCATION_SERVICE_ID,
        title:
          `${TEST_TITLE_PREFIX} education`,
        status: "published",
        publishedAt:
          new Date(
            "2026-09-09T09:00:00.000Z",
          ),
      },
      {
        ...base,
        id:
          publishedIds.wrongTerritory,
        serviceId:
          FINANCE_SERVICE_ID,
        territoryId:
          OTHER_TERRITORY_ID,
        title:
          `${TEST_TITLE_PREFIX} mauvais territoire`,
        status: "published",
        publishedAt:
          new Date(
            "2026-09-09T13:00:00.000Z",
          ),
      },
      {
        id:
          publishedIds.wrongWorkspace,
        workspaceId:
          TEMP_WORKSPACE_ID,
        serviceId:
          TEMP_SERVICE_ID,
        territoryId,
        organizationId:
          `${RUN_ID}-organization`,
        authorUserId:
          TEMP_USER_ID,
        type: "observation",
        title:
          `${TEST_TITLE_PREFIX} autre workspace`,
        description:
          "Contribution autre workspace",
        status: "published",
        source:
          "Source autre workspace",
        referencePeriod:
          "2026-T3",
        createdAt: now,
        updatedAt: now,
        publishedAt:
          new Date(
            "2026-09-09T14:00:00.000Z",
          ),
      },
    ],
  });

  const excludedStatuses: readonly ContributionStatus[] = [
    "draft",
    "submitted",
    "in_review",
    "validated",
    "rejected",
    "archived",
  ];

  await prisma.workspaceContribution.createMany({
    data: excludedStatuses.map(
      (status, index) => ({
        ...base,
        id:
          `${RUN_ID}-excluded-${index}`,
        serviceId:
          FINANCE_SERVICE_ID,
        title:
          `${TEST_TITLE_PREFIX} excluded ${status}`,
        status,
        publishedAt: null,
      }),
    ),
  });
});

test.after(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

test(
  "la consolidation territoriale retourne uniquement les contributions publiees du bon workspace et territoire",
  async () => {
    const result =
      await WorkspaceContributionConsolidationService.readPublished(
        {
          workspaceId:
            WORKSPACE_ID,
          territoryId,
        },
      );

    assert.equal(
      result.contributions.length,
      5,
    );

    assert.ok(
      result.contributions.every(
        (contribution) =>
          contribution.status ===
          "published",
      ),
    );

    const ids =
      result.contributions.map(
        (contribution) =>
          contribution.id,
      );

    assert.ok(
      !ids.includes(
        publishedIds.wrongTerritory,
      ),
    );

    assert.ok(
      !ids.includes(
        publishedIds.wrongWorkspace,
      ),
    );
  },
);

test(
  "le filtre service exclut les contributions publiees des autres services",
  async () => {
    const result =
      await WorkspaceContributionConsolidationService.readPublished(
        {
          workspaceId:
            WORKSPACE_ID,
          territoryId,
          serviceId:
            FINANCE_SERVICE_ID,
        },
      );

    assert.equal(
      result.contributions.length,
      4,
    );

    assert.ok(
      result.contributions.every(
        (contribution) =>
          contribution.serviceId ===
          FINANCE_SERVICE_ID,
      ),
    );

    assert.ok(
      !result.contributions.some(
        (contribution) =>
          contribution.id ===
          publishedIds.education,
      ),
    );
  },
);

test(
  "les metadonnees utiles au pilotage sont conservees",
  async () => {
    const result =
      await WorkspaceContributionConsolidationService.readPublished(
        {
          workspaceId:
            WORKSPACE_ID,
          territoryId,
          serviceId:
            FINANCE_SERVICE_ID,
        },
      );

    const contribution =
      result.contributions.find(
        (candidate) =>
          candidate.id ===
          publishedIds.newer,
      );

    assert.ok(contribution);

    assert.equal(
      contribution.type,
      "observation",
    );

    assert.equal(
      contribution.description,
      "Description de consolidation #42",
    );

    assert.equal(
      contribution.referencePeriod,
      "2026-T3",
    );

    assert.equal(
      contribution.source,
      "Source métier #42",
    );

    assert.equal(
      contribution.author.id,
      CONTRIBUTOR_ID,
    );

    assert.equal(
      contribution.author.displayName,
      authorDisplayName,
    );

    assert.equal(
      contribution.author.title,
      authorTitle,
    );

    assert.equal(
      contribution.publishedAt,
      "2026-09-09T12:00:00.000Z",
    );
  },
);

test(
  "l'ordre est stable : publication descendante puis id ascendant",
  async () => {
    const result =
      await WorkspaceContributionConsolidationService.readPublished(
        {
          workspaceId:
            WORKSPACE_ID,
          territoryId,
          serviceId:
            FINANCE_SERVICE_ID,
        },
      );

    assert.deepEqual(
      result.order,
      PUBLISHED_CONTRIBUTION_ORDER,
    );

    assert.deepEqual(
      result.contributions.map(
        (contribution) =>
          contribution.id,
      ),
      [
        publishedIds.newer,
        publishedIds.tieA,
        publishedIds.tieB,
        publishedIds.older,
      ],
    );
  },
);

test(
  "un perimetre sans contribution publiee retourne un resultat vide previsible",
  async () => {
    const byService =
      await WorkspaceContributionConsolidationService.readPublished(
        {
          workspaceId:
            WORKSPACE_ID,
          territoryId,
          serviceId:
            `${RUN_ID}-service-vide`,
        },
      );

    assert.deepEqual(
      byService.contributions,
      [],
    );

    const byTerritory =
      await WorkspaceContributionConsolidationService.readPublished(
        {
          workspaceId:
            WORKSPACE_ID,
          territoryId:
            `${RUN_ID}-territoire-vide`,
        },
      );

    assert.deepEqual(
      byTerritory.contributions,
      [],
    );
  },
);
