import type { Territory } from "@/types/domain";

export type DecisionPriority =
  | "low"
  | "moderate"
  | "high"
  | "critical";

export type DecisionFinding = {
  id: string;
  title: string;
  description: string;
  urgency: number;
  impact: number;
  feasibility: number;
  confidence?: number;
};

export type DecisionRecommendation = {
  findingId: string;
  title: string;
  description: string;
  priority: DecisionPriority;
  score: number;
  rationale: string;
};

export type DecisionRequest = {
  territory: Territory;
  findings: DecisionFinding[];
};

export type DecisionResult = {
  territoryId: string;
  territoryName: string;
  generatedAt: string;
  recommendations: DecisionRecommendation[];
  topPriority?: DecisionRecommendation;
};

export class DecisionEngine {
  private static normalizeScore(value: number): number {
    return Math.min(100, Math.max(0, value));
  }

  private static calculateScore(
    finding: DecisionFinding,
  ): number {
    const urgency =
      this.normalizeScore(finding.urgency);

    const impact =
      this.normalizeScore(finding.impact);

    const feasibility =
      this.normalizeScore(finding.feasibility);

    const confidence =
      this.normalizeScore(
        finding.confidence ?? 100,
      );

    const weightedScore =
      urgency * 0.35 +
      impact * 0.35 +
      feasibility * 0.2 +
      confidence * 0.1;

    return Math.round(weightedScore);
  }

  private static resolvePriority(
    score: number,
  ): DecisionPriority {
    if (score >= 80) {
      return "critical";
    }

    if (score >= 60) {
      return "high";
    }

    if (score >= 40) {
      return "moderate";
    }

    return "low";
  }

  private static buildRationale(
    finding: DecisionFinding,
    score: number,
  ): string {
    return [
      `Urgence : ${finding.urgency}/100.`,
      `Impact territorial : ${finding.impact}/100.`,
      `Faisabilité : ${finding.feasibility}/100.`,
      `Score décisionnel : ${score}/100.`,
    ].join(" ");
  }

  static analyze(
    request: DecisionRequest,
  ): DecisionResult {
    const recommendations =
      request.findings
        .map((finding) => {
          const score =
            this.calculateScore(finding);

          return {
            findingId: finding.id,
            title: finding.title,
            description: finding.description,
            priority:
              this.resolvePriority(score),
            score,
            rationale:
              this.buildRationale(
                finding,
                score,
              ),
          };
        })
        .sort(
          (first, second) =>
            second.score - first.score,
        );

    return {
      territoryId: request.territory.id,
      territoryName: request.territory.name,
      generatedAt: new Date().toISOString(),
      recommendations,
      topPriority: recommendations[0],
    };
  }
}