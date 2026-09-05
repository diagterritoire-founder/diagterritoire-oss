import {
  EngineOrchestrator,
  type EngineOrchestratorResult,
} from "../engines";

import type {
  TerritorialDataSource,
} from "../data-sources";

import {
  LoggerFactory,
} from "./logging";

export class TerritorialAnalysisService {
  private readonly logger = LoggerFactory.getLogger();

  constructor(
    private readonly dataSource: TerritorialDataSource,
  ) {}

  async analyze(
    territoryId: string,
    question?: string,
  ): Promise<EngineOrchestratorResult> {
    const startedAt = Date.now();

    this.logger.info(
      "Démarrage de l'analyse territoriale",
      {
        territoryId,
      },
    );

    try {
      const [
        territories,
        indicators,
        diagnosticIndicators,
        projectionInputs,
        alertRules,
        alertObservations,
      ] = await Promise.all([
        this.dataSource.getTerritories(),
        this.dataSource.getIndicators(territoryId),
        this.dataSource.getDiagnosticIndicators(territoryId),
        this.dataSource.getProjectionInputs(territoryId),
        this.dataSource.getAlertRules(territoryId),
        this.dataSource.getAlertObservations(territoryId),
      ]);

      const result = EngineOrchestrator.run({
        territories,
        indicators,
        diagnosticIndicators,
        projectionInputs,
        alertRules,
        alertObservations,
        territoryId,
        question,
      });

      this.logger.info(
        "Analyse territoriale terminée",
        {
          territoryId,
          executionTimeMs: Date.now() - startedAt,
        },
      );

      return result;
    } catch (error) {
      this.logger.error(
        "Échec de l'analyse territoriale",
        {
          territoryId,
          executionTimeMs: Date.now() - startedAt,
          error,
        },
      );

      throw error;
    }
  }
}