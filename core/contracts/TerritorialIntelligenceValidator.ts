import { TERRITORIAL_INTELLIGENCE_VERSION } from "./TerritorialIntelligenceVersion";
import { TerritorialIntelligenceError } from "./TerritorialIntelligenceError";
import type { TerritorialIntelligenceResponse } from "./TerritorialIntelligenceResponse";

export class TerritorialIntelligenceValidator {
  static validate(
    response: TerritorialIntelligenceResponse,
  ): TerritorialIntelligenceResponse {
    if (!response || typeof response !== "object") {
      throw new TerritorialIntelligenceError(
        "INVALID_ANALYSIS",
        "La réponse territoriale est invalide.",
      );
    }

    if (response.version !== TERRITORIAL_INTELLIGENCE_VERSION) {
      throw new TerritorialIntelligenceError(
        "INVALID_VERSION",
        `Version de contrat incompatible : ${response.version}`,
        "version",
      );
    }

    if (!response.territoryId) {
      throw new TerritorialIntelligenceError(
        "INVALID_TERRITORY_ID",
        "L'identifiant du territoire est invalide.",
        "territoryId",
      );
    }

    if (!response.territoryName) {
      throw new TerritorialIntelligenceError(
        "INVALID_TERRITORY_NAME",
        "Le nom du territoire est invalide.",
        "territoryName",
      );
    }

    if (!response.analysis) {
      throw new TerritorialIntelligenceError(
        "INVALID_ANALYSIS",
        "L'analyse territoriale est absente.",
        "analysis",
      );
    }

    if (
      !response.generatedAt ||
      Number.isNaN(Date.parse(response.generatedAt))
    ) {
      throw new TerritorialIntelligenceError(
        "INVALID_GENERATED_AT",
        "La date de génération est invalide.",
        "generatedAt",
      );
    }

    if (
      !Number.isFinite(response.executionTimeMs) ||
      response.executionTimeMs < 0
    ) {
      throw new TerritorialIntelligenceError(
        "INVALID_EXECUTION_TIME",
        "Le temps d'exécution est invalide.",
        "executionTimeMs",
      );
    }

    if (!response.metadata) {
      throw new TerritorialIntelligenceError(
        "INVALID_METADATA",
        "Les métadonnées sont absentes.",
        "metadata",
      );
    }

    return response;
  }
}