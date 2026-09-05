export type DiagnosticStatus =
  | "favorable"
  | "vigilance"
  | "critique";

export type DiagnosticIndicator = {
  id: string;
  name: string;
  value: number;
  target?: number;
  weight?: number;
  direction?: "higher-is-better" | "lower-is-better";
};

export type DiagnosticFinding = {
  indicatorId: string;
  indicatorName: string;
  score: number;
  message: string;
};

export type DiagnosticResult = {
  score: number;
  status: DiagnosticStatus;
  strengths: DiagnosticFinding[];
  weaknesses: DiagnosticFinding[];
  alerts: DiagnosticFinding[];
  recommendations: string[];
};

export class DiagnosticEngine {
  static analyze(
    indicators: DiagnosticIndicator[],
  ): DiagnosticResult {
    if (indicators.length === 0) {
      return {
        score: 0,
        status: "critique",
        strengths: [],
        weaknesses: [],
        alerts: [],
        recommendations: [
          "Ajouter des indicateurs pour établir un diagnostic.",
        ],
      };
    }

    const findings = indicators.map((indicator) =>
      this.evaluateIndicator(indicator),
    );

    const totalWeight = indicators.reduce(
      (sum, indicator) => sum + (indicator.weight ?? 1),
      0,
    );

    const weightedScore = findings.reduce(
      (sum, finding, index) =>
        sum +
        finding.score *
          (indicators[index].weight ?? 1),
      0,
    );

    const score =
      totalWeight === 0
        ? 0
        : Math.round(weightedScore / totalWeight);

    const strengths = findings.filter(
      (finding) => finding.score >= 70,
    );

    const weaknesses = findings.filter(
      (finding) =>
        finding.score >= 40 &&
        finding.score < 70,
    );

    const alerts = findings.filter(
      (finding) => finding.score < 40,
    );

    return {
      score,
      status: this.getStatus(score),
      strengths,
      weaknesses,
      alerts,
      recommendations: this.buildRecommendations(
        weaknesses,
        alerts,
      ),
    };
  }

  private static evaluateIndicator(
    indicator: DiagnosticIndicator,
  ): DiagnosticFinding {
    if (
      indicator.target === undefined ||
      indicator.target === 0
    ) {
      return {
        indicatorId: indicator.id,
        indicatorName: indicator.name,
        score: 50,
        message:
          "Aucune valeur cible n’est définie pour cet indicateur.",
      };
    }

    const direction =
      indicator.direction ?? "higher-is-better";

    const rawScore =
      direction === "higher-is-better"
        ? (indicator.value / indicator.target) * 100
        : (indicator.target / indicator.value) * 100;

    const score = Math.max(
      0,
      Math.min(100, Math.round(rawScore)),
    );

    return {
      indicatorId: indicator.id,
      indicatorName: indicator.name,
      score,
      message: this.buildMessage(
        indicator,
        score,
      ),
    };
  }

  private static getStatus(
    score: number,
  ): DiagnosticStatus {
    if (score >= 70) {
      return "favorable";
    }

    if (score >= 40) {
      return "vigilance";
    }

    return "critique";
  }

  private static buildMessage(
    indicator: DiagnosticIndicator,
    score: number,
  ): string {
    if (score >= 70) {
      return `${indicator.name} présente une situation favorable.`;
    }

    if (score >= 40) {
      return `${indicator.name} nécessite une vigilance particulière.`;
    }

    return `${indicator.name} présente une fragilité importante.`;
  }

  private static buildRecommendations(
    weaknesses: DiagnosticFinding[],
    alerts: DiagnosticFinding[],
  ): string[] {
    const recommendations: string[] = [];

    for (const alert of alerts) {
      recommendations.push(
        `Traiter en priorité la fragilité concernant : ${alert.indicatorName}.`,
      );
    }

    for (const weakness of weaknesses) {
      recommendations.push(
        `Mettre en place un suivi renforcé pour : ${weakness.indicatorName}.`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Maintenir le suivi des indicateurs et consolider les résultats obtenus.",
      );
    }

    return recommendations;
  }
}