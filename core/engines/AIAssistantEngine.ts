import type {
  AlertResult,
  DiagnosticResult,
  ProjectionResult,
} from "./index";

export type AssistantAudience =
  | "technique"
  | "executif"
  | "citoyen";

export type AssistantRequest = {
  question: string;
  territoryName?: string;
  audience?: AssistantAudience;
  diagnostic?: DiagnosticResult;
  projections?: ProjectionResult[];
  alerts?: AlertResult[];
};

export type AssistantSection = {
  title: string;
  content: string;
};

export type AssistantResponse = {
  question: string;
  territoryName?: string;
  audience: AssistantAudience;
  summary: string;
  sections: AssistantSection[];
  priorities: string[];
  generatedAt: string;
};

export class AIAssistantEngine {
  static generate(
    request: AssistantRequest,
  ): AssistantResponse {
    const audience =
      request.audience ?? "executif";

    const activeAlerts = (
      request.alerts ?? []
    ).filter(
      (alert) =>
        alert.level !== "information",
    );

    const sections: AssistantSection[] = [];

    if (request.diagnostic) {
      sections.push({
        title: "Diagnostic",
        content:
          this.formatDiagnostic(
            request.diagnostic,
          ),
      });
    }

    if (
      request.projections &&
      request.projections.length > 0
    ) {
      sections.push({
        title: "Prospective",
        content:
          this.formatProjections(
            request.projections,
          ),
      });
    }

    if (activeAlerts.length > 0) {
      sections.push({
        title: "Alertes",
        content:
          this.formatAlerts(activeAlerts),
      });
    }

    if (sections.length === 0) {
      sections.push({
        title: "Données disponibles",
        content:
          "Aucun diagnostic, scénario prospectif ou signal d’alerte n’a été transmis pour cette analyse.",
      });
    }

    return {
      question: request.question,
      territoryName:
        request.territoryName,
      audience,
      summary: this.buildSummary(
        request,
        activeAlerts,
      ),
      sections,
      priorities: this.buildPriorities(
        request.diagnostic,
        activeAlerts,
      ),
      generatedAt:
        new Date().toISOString(),
    };
  }

  static answer(
    request: AssistantRequest,
  ): string {
    const response =
      this.generate(request);

    const territoryText =
      response.territoryName
        ? `Territoire : ${response.territoryName}\n\n`
        : "";

    const sectionsText =
      response.sections
        .map(
          (section) =>
            `${section.title}\n${section.content}`,
        )
        .join("\n\n");

    const prioritiesText =
      response.priorities.length > 0
        ? `\n\nPriorités\n${response.priorities
            .map(
              (priority, index) =>
                `${index + 1}. ${priority}`,
            )
            .join("\n")}`
        : "";

    return (
      `${territoryText}` +
      `${response.summary}\n\n` +
      `${sectionsText}` +
      `${prioritiesText}`
    );
  }

  private static buildSummary(
    request: AssistantRequest,
    activeAlerts: AlertResult[],
  ): string {
    const territory =
      request.territoryName
        ? ` pour ${request.territoryName}`
        : "";

    if (
      activeAlerts.some(
        (alert) =>
          alert.level === "critique",
      )
    ) {
      return `L’analyse${territory} met en évidence au moins une situation critique nécessitant une attention immédiate.`;
    }

    if (
      request.diagnostic?.status ===
      "critique"
    ) {
      return `Le diagnostic${territory} fait ressortir une situation globale critique.`;
    }

    if (
      request.diagnostic?.status ===
      "vigilance" ||
      activeAlerts.length > 0
    ) {
      return `L’analyse${territory} met en évidence plusieurs éléments nécessitant une vigilance renforcée.`;
    }

    if (
      request.diagnostic?.status ===
      "favorable"
    ) {
      return `La situation globale${territory} apparaît favorable, sous réserve du maintien d’un suivi régulier.`;
    }

    return `L’analyse${territory} repose sur les éléments actuellement disponibles.`;
  }

  private static formatDiagnostic(
    diagnostic: DiagnosticResult,
  ): string {
    return [
      `Score global : ${diagnostic.score}/100.`,
      `Statut : ${diagnostic.status}.`,
      `Points forts : ${diagnostic.strengths.length}.`,
      `Fragilités : ${diagnostic.weaknesses.length}.`,
      `Alertes diagnostiques : ${diagnostic.alerts.length}.`,
    ].join(" ");
  }

  private static formatProjections(
    projections: ProjectionResult[],
  ): string {
    return projections
      .map(
        (projection) =>
          `${projection.indicatorId} : ${projection.currentValue} → ${projection.projectedValue} sur ${projection.years} an(s), scénario ${projection.scenario}.`,
      )
      .join(" ");
  }

  private static formatAlerts(
    alerts: AlertResult[],
  ): string {
    return alerts
      .map(
        (alert) =>
          `[${alert.level.toUpperCase()}] ${alert.message}`,
      )
      .join(" ");
  }

  private static buildPriorities(
    diagnostic?: DiagnosticResult,
    alerts: AlertResult[] = [],
  ): string[] {
    const priorities: string[] = [];

    for (const alert of alerts) {
      priorities.push(
        alert.recommendation,
      );
    }

    if (diagnostic) {
      priorities.push(
        ...diagnostic.recommendations,
      );
    }

    return [
      ...new Set(priorities),
    ].slice(0, 5);
  }
}