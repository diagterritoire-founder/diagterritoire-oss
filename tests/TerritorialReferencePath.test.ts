import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  PlatformIntelligenceLayer,
} from "../core/PlatformIntelligenceLayer";

import {
  TERRITORIAL_INTELLIGENCE_VERSION,
  TerritorialIntelligenceError,
} from "../core/contracts";

import {
  mayotteTerritories,
} from "../data/mayotte-territories";

type TerritorialResponse = Awaited<
  ReturnType<
    PlatformIntelligenceLayer[
      "buildTerritorialIntelligence"
    ]
  >
>;

type ReferenceCase = {
  label: string;
  id: string;
  name: string;
  level: "department" | "epci" | "commune";
  score: number;
};

const referenceCases: ReferenceCase[] = [
  {
    label: "departement",
    id: "territory-mayotte",
    name: "Mayotte",
    level: "department",
    score: 59,
  },
  {
    label: "EPCI",
    id: "territory-epci-cadema",
    name:
      "Communauté d’agglomération de Dembéni-Mamoudzou",
    level: "epci",
    score: 56,
  },
  {
    label: "commune",
    id: "territory-commune-mamoudzou",
    name: "Mamoudzou",
    level: "commune",
    score: 57,
  },
];

function assertReferenceResponse(
  response: TerritorialResponse,
  expected: ReferenceCase,
) {
  assert.equal(
    response.version,
    TERRITORIAL_INTELLIGENCE_VERSION,
  );

  assert.equal(
    response.territoryId,
    expected.id,
  );

  assert.equal(
    response.territoryName,
    expected.name,
  );

  assert.equal(
    response.analysis.territory.id,
    expected.id,
  );

  assert.equal(
    response.analysis.territory.level,
    expected.level,
  );

  assert.equal(
    response.analysis.indicators.length,
    8,
  );

  assert.equal(
    response.analysis.diagnosticIndicators.length,
    5,
  );

  assert.equal(
    response.analysis.diagnostic.status,
    "vigilance",
  );

  assert.equal(
    response.analysis.diagnostic.score,
    expected.score,
  );

  assert.equal(
    response.analysis.projections.length,
    1,
  );

  assert.equal(
    response.analysis.alerts.length,
    3,
  );

  assert.ok(
    response.analysis.assistant,
  );

  assert.equal(
    response.metadata.source,
    "PlatformIntelligenceLayer",
  );

  assert.ok(
    !Number.isNaN(
      Date.parse(response.generatedAt),
    ),
  );

  assert.ok(
    Number.isFinite(
      response.executionTimeMs,
    ),
  );
}

for (const reference of referenceCases) {
  test(
    `valide le parcours de reference pour ${reference.label}`,
    async () => {
      const platform =
        new PlatformIntelligenceLayer();

      const response =
        await platform
          .buildTerritorialIntelligence({
            territoryId: reference.id,
            question:
              "Validation du parcours territorial de reference.",
          });

      assertReferenceResponse(
        response,
        reference,
      );
    },
  );
}

test(
  "valide le parcours pour tous les territoires pilotes supportes",
  async () => {
    const supported =
      mayotteTerritories.filter(
        (territory) =>
          territory.level === "department" ||
          territory.level === "epci" ||
          territory.level === "commune",
      );

    const counts =
      supported.reduce(
        (result, territory) => {
          result[territory.level] =
            (result[territory.level] ?? 0) + 1;

          return result;
        },
        {} as Record<string, number>,
      );

    assert.deepEqual(
      counts,
      {
        department: 1,
        epci: 5,
        commune: 17,
      },
    );

    const platform =
      new PlatformIntelligenceLayer();

    for (const territory of supported) {
      const response =
        await platform
          .buildTerritorialIntelligence({
            territoryId: territory.id,
          });

      assert.equal(
        response.analysis.territory.id,
        territory.id,
      );

      assert.equal(
        response.analysis.territory.level,
        territory.level,
      );

      assert.equal(
        response.analysis.indicators.length,
        8,
      );

      assert.equal(
        response.analysis.diagnosticIndicators.length,
        5,
      );

      assert.ok(
        response.analysis.diagnostic,
      );

      assert.equal(
        response.analysis.projections.length,
        1,
      );

      assert.equal(
        response.analysis.alerts.length,
        3,
      );

      assert.ok(
        response.analysis.assistant,
      );
    }
  },
);

test(
  "rejette explicitement un territoire inconnu",
  async () => {
    const platform =
      new PlatformIntelligenceLayer();

    await assert.rejects(
      () =>
        platform.buildTerritorialIntelligence({
          territoryId: "territory-inconnu",
        }),
      (error: unknown) => {
        assert.ok(
          error instanceof
            TerritorialIntelligenceError,
        );

        assert.equal(
          error.code,
          "TERRITORY_NOT_FOUND",
        );

        assert.equal(
          error.field,
          "territoryId",
        );

        return true;
      },
    );
  },
);

test(
  "conserve le raccordement des restitutions pages et API",
  () => {
    const expectations = [
      {
        path:
          "app/territoires/[territoryId]/page.tsx",
        tokens: [
          "buildTerritorialIntelligence",
          "result.diagnostic",
          "result.projections",
          "result.alerts",
          "/rapport/",
        ],
      },
      {
        path:
          "app/rapport/[territoryId]/page.tsx",
        tokens: [
          "buildTerritorialIntelligence",
          "Rapport territorial",
          "result.diagnostic",
          "result.projections",
          "result.alerts",
        ],
      },
      {
        path:
          "app/prospective/page.tsx",
        tokens: [
          "buildTerritorialIntelligence",
          "response.analysis.projections[0]",
        ],
      },
      {
        path:
          "app/api/territorial-analysis/[territoryId]/route.ts",
        tokens: [
          "buildTerritorialIntelligence",
          "Response.json(result)",
        ],
      },
    ];

    for (const expectation of expectations) {
      const source =
        readFileSync(
          expectation.path,
          "utf8",
        );

      for (const token of expectation.tokens) {
        assert.ok(
          source.includes(token),
          `${expectation.path}: ${token} absent`,
        );
      }
    }
  },
);
