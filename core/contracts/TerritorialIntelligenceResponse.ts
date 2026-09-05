import type {
  EngineOrchestratorResult,
} from "../engines";

import type {
  ExecutiveDashboardInput,
  ExecutiveDashboardResult,
} from "../engines/ExecutiveDashboardService";

import {
  TERRITORIAL_INTELLIGENCE_VERSION,
} from "./TerritorialIntelligenceVersion";

export {
  TERRITORIAL_INTELLIGENCE_VERSION,
} from "./TerritorialIntelligenceVersion";

export type TerritorialIntelligenceRequest = {
  territoryId: string;
  question?: string;
  dashboardInput?: ExecutiveDashboardInput;
};

export type TerritorialIntelligenceMetadata = {
  source: "PlatformIntelligenceLayer";
  question?: string;
  dashboardGenerated: boolean;
};

export type TerritorialIntelligenceResponse = {
  version: typeof TERRITORIAL_INTELLIGENCE_VERSION;
  territoryId: string;
  territoryName: string;
  generatedAt: string;
  executionTimeMs: number;
  analysis: EngineOrchestratorResult;
  dashboard?: ExecutiveDashboardResult;
  metadata: TerritorialIntelligenceMetadata;
};

/**
 * Alias temporaire pour conserver
 * la compatibilité pendant la migration.
 */
export type TerritorialIntelligenceResult =
  TerritorialIntelligenceResponse;
