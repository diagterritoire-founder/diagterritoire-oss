import type {
  Indicator,
  Territory,
} from "@/types/domain";

import {
  TerritorialIntelligenceError,
} from "../contracts/TerritorialIntelligenceError";

import {
  AIAssistantEngine,
  AlertEngine,
  DiagnosticEngine,
  IndicatorEngine,
  ProspectiveEngine,
  TerritoryEngine,
  type AlertObservation,
  type AlertResult,
  type AlertRule,
  type AssistantResponse,
  type DiagnosticIndicator,
  type DiagnosticResult,
  type ProjectionInput,
  type ProjectionResult,
} from ".";

export type EngineOrchestratorInput = {
  territories: Territory[];
  indicators: Indicator[];
  diagnosticIndicators: DiagnosticIndicator[];
  projectionInputs?: ProjectionInput[];
  alertRules?: AlertRule[];
  alertObservations?: AlertObservation[];
  territoryId: string;
  question?: string;
};

export type EngineOrchestratorResult = {
  territory: Territory;
  indicators: Indicator[];
  diagnosticIndicators: DiagnosticIndicator[];
  diagnostic: DiagnosticResult;
  projections: ProjectionResult[];
  alerts: AlertResult[];
  assistant: AssistantResponse;
  generatedAt: string;
};

export class EngineOrchestrator {
  static run(
    input: EngineOrchestratorInput,
  ): EngineOrchestratorResult {
    const territory =
      TerritoryEngine.findById(
        input.territories,
        input.territoryId,
      ) ??
      TerritoryEngine.findBySlug(
        input.territories,
        input.territoryId,
      );

    if (!territory) {
      throw new TerritorialIntelligenceError(
        "TERRITORY_NOT_FOUND",
        `Territoire introuvable : ${input.territoryId}`,
        "territoryId",
      );
    }

    const indicators =
      IndicatorEngine.filterByTerritory(
        input.indicators,
        territory.id,
      );

    const diagnostic =
      DiagnosticEngine.analyze(
        input.diagnosticIndicators,
      );

    const projections = (
      input.projectionInputs ?? []
    ).map((projectionInput) =>
      ProspectiveEngine.project(projectionInput),
    );

    const alerts = AlertEngine.evaluateMany(
      input.alertRules ?? [],
      input.alertObservations ?? [],
    );

    const assistant =
      AIAssistantEngine.generate({
        question:
          input.question ??
          "Produire une analyse complète du territoire.",
        territoryName: territory.name,
        diagnostic,
        projections,
        alerts,
      });

    return {
      territory,
      indicators,
      diagnosticIndicators: input.diagnosticIndicators,
      diagnostic,
      projections,
      alerts,
      assistant,
      generatedAt: new Date().toISOString(),
    };
  }
}