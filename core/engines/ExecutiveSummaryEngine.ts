import type {
  Indicator,
  Project,
  TerritorialEvent,
  Territory,
} from "@/types/domain";

export type ExecutiveSummary = {
  territory: string;
  generatedAt: string;
  overview: string;
  keyFigures: {
    indicators: number;
    projects: number;
    events: number;
  };
  alerts: string[];
};

export class ExecutiveSummaryEngine {

  static generate(
    territory: Territory,
    indicators: Indicator[],
    projects: Project[],
    events: TerritorialEvent[],
  ): ExecutiveSummary {

    const delayedProjects = projects.filter(
      p => p.status === "delayed",
    ).length;

    const criticalEvents = events.filter(
      e => e.severity === "critical",
    ).length;

    const alerts: string[] = [];

    if (delayedProjects > 0) {
      alerts.push(
        `${delayedProjects} projet(s) en retard`,
      );
    }

    if (criticalEvents > 0) {
      alerts.push(
        `${criticalEvents} événement(s) critique(s)`,
      );
    }

    return {

      territory: territory.name,

      generatedAt: new Date().toISOString(),

      overview:
        `Synthèse automatique du territoire ${territory.name}.`,

      keyFigures: {
        indicators: indicators.length,
        projects: projects.length,
        events: events.length,
      },

      alerts,

    };

  }

}