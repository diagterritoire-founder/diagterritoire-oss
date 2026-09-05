import {
  TerritorialAnalysisService,
} from "./services";

import {
  MayotteStaticDataSource,
} from "./data-sources";

import {
  ExecutiveDashboardService,
  type ExecutiveDashboardInput,
  type ExecutiveDashboardResult,
} from "./engines/ExecutiveDashboardService";

import {
  TERRITORIAL_INTELLIGENCE_VERSION,
  TerritorialIntelligenceValidator,
  type TerritorialIntelligenceRequest,
  type TerritorialIntelligenceResponse,
} from "./contracts";

export type {
  TerritorialIntelligenceRequest,
  TerritorialIntelligenceResponse,
  TerritorialIntelligenceResult,
} from "./contracts";

export class PlatformIntelligenceLayer {
  private readonly analysisService =
    new TerritorialAnalysisService(
      new MayotteStaticDataSource(),
    );

  async analyzeTerritory(
    territoryId: string,
    question?: string,
  ) {
    return this.analysisService.analyze(
      territoryId,
      question,
    );
  }

  generateExecutiveDashboard(
    input: ExecutiveDashboardInput,
  ): ExecutiveDashboardResult {
    return ExecutiveDashboardService.generate(
      input,
    );
  }

  async buildTerritorialIntelligence(
    request: TerritorialIntelligenceRequest,
  ): Promise<TerritorialIntelligenceResponse> {
    const startedAt = Date.now();

    const analysis =
      await this.analyzeTerritory(
        request.territoryId,
        request.question,
      );

    const dashboard =
      request.dashboardInput
        ? this.generateExecutiveDashboard(
            request.dashboardInput,
          )
        : undefined;

    const response: TerritorialIntelligenceResponse = {
      version: TERRITORIAL_INTELLIGENCE_VERSION,
      territoryId: request.territoryId,
      territoryName: analysis.territory.name,
      generatedAt: new Date().toISOString(),
      executionTimeMs: Date.now() - startedAt,
      analysis,
      dashboard,
      metadata: {
        source: "PlatformIntelligenceLayer",
        question: request.question,
        dashboardGenerated: dashboard !== undefined,
      },
    };

    return TerritorialIntelligenceValidator.validate(
      response,
    );
  }
}
