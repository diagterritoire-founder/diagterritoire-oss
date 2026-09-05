import assert from "node:assert/strict";
import test from "node:test";

import {
  PlatformIntelligenceLayer,
} from "../core/PlatformIntelligenceLayer";

import {
  isTerritoryNotFoundError,
  TerritorialIntelligenceError,
} from "../core/contracts";

import type {
  TerritorialIntelligenceResponse,
} from "../core/contracts/TerritorialIntelligenceResponse";

import {
  TerritorialIntelligenceValidator,
} from "../core/contracts/TerritorialIntelligenceValidator";

import {
  TERRITORIAL_INTELLIGENCE_VERSION,
} from "../core/contracts/TerritorialIntelligenceVersion";

import {
  EngineOrchestrator,
} from "../core/engines/EngineOrchestrator";

function validResponse(): TerritorialIntelligenceResponse {
  return {
    version: TERRITORIAL_INTELLIGENCE_VERSION,
    territoryId: "territory-mayotte",
    territoryName: "Mayotte",
    generatedAt: "2026-09-05T00:00:00.000Z",
    executionTimeMs: 10,
    analysis: {
      territory: {
        name: "Mayotte",
      },
    } as TerritorialIntelligenceResponse["analysis"],
    metadata: {
      source: "PlatformIntelligenceLayer",
      dashboardGenerated: false,
    },
  };
}

test("accepte un contrat territorial valide", () => {
  const response = validResponse();

  const validated =
    TerritorialIntelligenceValidator.validate(
      response,
    );

  assert.equal(validated, response);
});

test("rejette une version de contrat incompatible", () => {
  const response = validResponse();

  (
    response as unknown as {
      version: string;
    }
  ).version = "9.9";

  assert.throws(
    () =>
      TerritorialIntelligenceValidator.validate(
        response,
      ),
    (error: unknown) => {
      assert.ok(
        error instanceof TerritorialIntelligenceError,
      );

      assert.equal(
        error.code,
        "INVALID_VERSION",
      );

      assert.equal(
        error.field,
        "version",
      );

      return true;
    },
  );
});

test("rejette une date de generation invalide", () => {
  const response = validResponse();
  response.generatedAt = "date-invalide";

  assert.throws(
    () =>
      TerritorialIntelligenceValidator.validate(
        response,
      ),
    (error: unknown) => {
      assert.ok(
        error instanceof TerritorialIntelligenceError,
      );

      assert.equal(
        error.code,
        "INVALID_GENERATED_AT",
      );

      assert.equal(
        error.field,
        "generatedAt",
      );

      return true;
    },
  );
});

test("categorise un territoire inexistant", () => {
  assert.throws(
    () =>
      EngineOrchestrator.run({
        territories: [],
        indicators: [],
        diagnosticIndicators: [],
        territoryId: "territory-inconnu",
      }),
    (error: unknown) => {
      assert.ok(
        error instanceof TerritorialIntelligenceError,
      );

      assert.equal(
        error.code,
        "TERRITORY_NOT_FOUND",
      );

      assert.equal(
        error.field,
        "territoryId",
      );

      assert.equal(
        error.message,
        "Territoire introuvable : territory-inconnu",
      );

      return true;
    },
  );
});

test("fait passer la reponse de plateforme par le validateur", async () => {
  const platform =
    new PlatformIntelligenceLayer();

  platform.analyzeTerritory = async () =>
    ({
      territory: {
        name: "Mayotte",
      },
    }) as Awaited<
      ReturnType<
        PlatformIntelligenceLayer["analyzeTerritory"]
      >
    >;

  const originalValidate =
    TerritorialIntelligenceValidator.validate;

  let validationCalls = 0;

  TerritorialIntelligenceValidator.validate = (
    response,
  ) => {
    validationCalls += 1;
    return originalValidate(response);
  };

  try {
    const result =
      await platform.buildTerritorialIntelligence({
        territoryId: "territory-mayotte",
      });

    assert.equal(validationCalls, 1);
    assert.equal(
      result.version,
      TERRITORIAL_INTELLIGENCE_VERSION,
    );
    assert.equal(
      result.territoryName,
      "Mayotte",
    );
  } finally {
    TerritorialIntelligenceValidator.validate =
      originalValidate;
  }
});

test("reconnait une erreur territoriale typee", () => {
  const error =
    new TerritorialIntelligenceError(
      "TERRITORY_NOT_FOUND",
      "Message libre volontairement different.",
      "territoryId",
    );

  assert.equal(
    isTerritoryNotFoundError(error),
    true,
  );
});

test("ne classe pas une erreur generique selon son texte", () => {
  const error =
    new Error(
      "Territoire introuvable : territory-inconnu",
    );

  assert.equal(
    isTerritoryNotFoundError(error),
    false,
  );
});
