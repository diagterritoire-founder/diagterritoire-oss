import type {
  Indicator,
  Project,
  TerritorialEvent,
  Territory,
} from "@/types/domain";

export type DashboardMetrics = {
  territories: number;
  indicators: number;
  projects: number;
  events: number;
  delayedProjects: number;
  criticalEvents: number;
};

export class IntelligenceDashboardEngine {

  static buildMetrics(
    territories: Territory[],
    indicators: Indicator[],
    projects: Project[],
    events: TerritorialEvent[],
  ): DashboardMetrics {

    return {

      territories: territories.length,

      indicators: indicators.length,

      projects: projects.length,

      events: events.length,

      delayedProjects: projects.filter(
        project =>
          project.status === "delayed",
      ).length,

      criticalEvents: events.filter(
        event =>
          event.severity === "critical",
      ).length,

    };

  }

  static recentProjects(
    projects: Project[],
    limit = 5,
  ) {
    return [...projects]
      .sort(
        (a, b) =>
          (b.updatedAt ?? "")
            .localeCompare(
              a.updatedAt ?? "",
            ),
      )
      .slice(0, limit);
  }

  static recentEvents(
    events: TerritorialEvent[],
    limit = 5,
  ) {
    return [...events]
      .sort(
        (a, b) =>
          b.startDate.localeCompare(
            a.startDate,
          ),
      )
      .slice(0, limit);
  }

}