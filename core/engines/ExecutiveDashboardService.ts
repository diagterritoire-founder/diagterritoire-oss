import type {
  Indicator,
  Project,
  TerritorialEvent,
  Territory,
} from "@/types/domain";

import {
  ExecutiveSummaryEngine,
  IntelligenceDashboardEngine,
  type DashboardMetrics,
  type ExecutiveSummary,
} from "../engines";

export type ExecutiveDashboardInput = {
  territory: Territory;
  territories: Territory[];
  indicators: Indicator[];
  projects: Project[];
  events: TerritorialEvent[];
};

export type ExecutiveDashboardResult = {
  territoryId: string;
  generatedAt: string;
  metrics: DashboardMetrics;
  summary: ExecutiveSummary;
  recentProjects: Project[];
  recentEvents: TerritorialEvent[];
};

export class ExecutiveDashboardService {
  static generate(
    input: ExecutiveDashboardInput,
  ): ExecutiveDashboardResult {
    const metrics =
      IntelligenceDashboardEngine.buildMetrics(
        input.territories,
        input.indicators,
        input.projects,
        input.events,
      );

    const summary =
      ExecutiveSummaryEngine.generate(
        input.territory,
        input.indicators,
        input.projects,
        input.events,
      );

    return {
      territoryId: input.territory.id,
      generatedAt: new Date().toISOString(),
      metrics,
      summary,
      recentProjects:
        IntelligenceDashboardEngine.recentProjects(
          input.projects,
        ),
      recentEvents:
        IntelligenceDashboardEngine.recentEvents(
          input.events,
        ),
    };
  }
}