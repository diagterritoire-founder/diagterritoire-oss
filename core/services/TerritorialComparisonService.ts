import type {
  TerritorialIntelligenceResponse,
} from "../contracts";

import type {
  DiagnosticFinding,
  DiagnosticStatus,
} from "../engines/DiagnosticEngine";

export type TerritorialPriority =
  | "forte"
  | "consolider"
  | "preserver"
  | "unknown";

export type TerritorialComparisonIndicator = {
  indicatorId: string;
  indicatorName: string;
  leftScore?: number;
  rightScore?: number;
  difference?: number;
  leftPriority: TerritorialPriority;
  rightPriority: TerritorialPriority;
  advantage:
    | "left"
    | "right"
    | "equal"
    | "unknown";
};

export type TerritorialComparisonResult = {
  left: {
    territoryId: string;
    territoryName: string;
    score: number;
    status: DiagnosticStatus;
  };
  right: {
    territoryId: string;
    territoryName: string;
    score: number;
    status: DiagnosticStatus;
  };
  scoreDifference: number;
  overallAdvantage:
    | "left"
    | "right"
    | "equal";
  indicators: TerritorialComparisonIndicator[];
  generatedAt: string;
};

export class TerritorialComparisonService {
  static compare(
    left: TerritorialIntelligenceResponse,
    right: TerritorialIntelligenceResponse,
  ): TerritorialComparisonResult {
    const leftDiagnostic =
      left.analysis.diagnostic;

    const rightDiagnostic =
      right.analysis.diagnostic;

    const leftFindings =
      this.buildFindingMap(leftDiagnostic);

    const rightFindings =
      this.buildFindingMap(rightDiagnostic);

    const indicatorIds = new Set([
      ...leftFindings.keys(),
      ...rightFindings.keys(),
    ]);

    const indicators =
      Array.from(indicatorIds).map(
        (indicatorId) => {
          const leftFinding =
            leftFindings.get(indicatorId);

          const rightFinding =
            rightFindings.get(indicatorId);

          const leftScore =
            leftFinding?.score;

          const rightScore =
            rightFinding?.score;

          const difference =
            leftScore !== undefined &&
            rightScore !== undefined
              ? leftScore - rightScore
              : undefined;

          return {
            indicatorId,
            indicatorName:
              leftFinding?.indicatorName ??
              rightFinding?.indicatorName ??
              indicatorId,
            leftScore,
            rightScore,
            difference,
            leftPriority:
              this.resolvePriority(leftScore),
            rightPriority:
              this.resolvePriority(rightScore),
            advantage:
              this.resolveAdvantage(
                leftScore,
                rightScore,
              ),
          };
        },
      );

    const scoreDifference =
      leftDiagnostic.score -
      rightDiagnostic.score;

    return {
      left: {
        territoryId: left.territoryId,
        territoryName:
          left.territoryName,
        score: leftDiagnostic.score,
        status: leftDiagnostic.status,
      },
      right: {
        territoryId: right.territoryId,
        territoryName:
          right.territoryName,
        score: rightDiagnostic.score,
        status: rightDiagnostic.status,
      },
      scoreDifference,
      overallAdvantage:
        scoreDifference > 0
          ? "left"
          : scoreDifference < 0
            ? "right"
            : "equal",
      indicators,
      generatedAt:
        new Date().toISOString(),
    };
  }

  private static buildFindingMap(
    diagnostic: {
      strengths: DiagnosticFinding[];
      weaknesses: DiagnosticFinding[];
      alerts: DiagnosticFinding[];
    },
  ): Map<string, DiagnosticFinding> {
    return new Map(
      [
        ...diagnostic.strengths,
        ...diagnostic.weaknesses,
        ...diagnostic.alerts,
      ].map((finding) => [
        finding.indicatorId,
        finding,
      ]),
    );
  }

  private static resolvePriority(
    score?: number,
  ): TerritorialPriority {
    if (score === undefined) {
      return "unknown";
    }

    if (score < 40) {
      return "forte";
    }

    if (score < 70) {
      return "consolider";
    }

    return "preserver";
  }

  private static resolveAdvantage(
    leftScore?: number,
    rightScore?: number,
  ):
    | "left"
    | "right"
    | "equal"
    | "unknown" {
    if (
      leftScore === undefined ||
      rightScore === undefined
    ) {
      return "unknown";
    }

    if (leftScore > rightScore) {
      return "left";
    }

    if (rightScore > leftScore) {
      return "right";
    }

    return "equal";
  }
}