export type AlertLevel =
  | "information"
  | "vigilance"
  | "alerte"
  | "critique";

export type AlertDirection =
  | "higher-is-risk"
  | "lower-is-risk";

export type AlertRule = {
  id: string;
  indicatorId: string;
  territoryId?: string;
  name: string;
  warningThreshold: number;
  criticalThreshold: number;
  direction?: AlertDirection;
  recommendation?: string;
};

export type AlertObservation = {
  indicatorId: string;
  territoryId?: string;
  value: number;
  previousValue?: number;
  observedAt: string;
};

export type AlertResult = {
  ruleId: string;
  indicatorId: string;
  territoryId?: string;
  level: AlertLevel;
  value: number;
  previousValue?: number;
  variation?: number;
  message: string;
  recommendation: string;
  detectedAt: string;
};

export class AlertEngine {
  static evaluate(
    rule: AlertRule,
    observation: AlertObservation,
  ): AlertResult {
    const direction =
      rule.direction ?? "higher-is-risk";

    const level = this.getLevel(
      observation.value,
      rule.warningThreshold,
      rule.criticalThreshold,
      direction,
    );

    const variation = this.calculateVariation(
      observation.value,
      observation.previousValue,
    );

    return {
      ruleId: rule.id,
      indicatorId: observation.indicatorId,
      territoryId:
        observation.territoryId ?? rule.territoryId,
      level,
      value: observation.value,
      previousValue: observation.previousValue,
      variation,
      message: this.buildMessage(
        rule,
        observation,
        level,
        variation,
      ),
      recommendation:
        rule.recommendation ??
        this.buildRecommendation(level),
      detectedAt: observation.observedAt,
    };
  }

  static evaluateMany(
    rules: AlertRule[],
    observations: AlertObservation[],
  ): AlertResult[] {
    return rules
      .map((rule) => {
        const observation = observations.find(
          (item) =>
            item.indicatorId === rule.indicatorId &&
            (!rule.territoryId ||
              item.territoryId === rule.territoryId),
        );

        if (!observation) {
          return undefined;
        }

        return this.evaluate(rule, observation);
      })
      .filter(
        (result): result is AlertResult =>
          result !== undefined,
      );
  }

  static getActiveAlerts(
    alerts: AlertResult[],
  ): AlertResult[] {
    return alerts.filter(
      (alert) => alert.level !== "information",
    );
  }

  static getCriticalAlerts(
    alerts: AlertResult[],
  ): AlertResult[] {
    return alerts.filter(
      (alert) => alert.level === "critique",
    );
  }

  static sortByPriority(
    alerts: AlertResult[],
  ): AlertResult[] {
    const priority: Record<AlertLevel, number> = {
      critique: 4,
      alerte: 3,
      vigilance: 2,
      information: 1,
    };

    return [...alerts].sort(
      (first, second) =>
        priority[second.level] -
        priority[first.level],
    );
  }

  private static getLevel(
    value: number,
    warningThreshold: number,
    criticalThreshold: number,
    direction: AlertDirection,
  ): AlertLevel {
    if (direction === "lower-is-risk") {
      if (value <= criticalThreshold) {
        return "critique";
      }

      if (value <= warningThreshold) {
        return "vigilance";
      }

      return "information";
    }

    if (value >= criticalThreshold) {
      return "critique";
    }

    if (value >= warningThreshold) {
      return "vigilance";
    }

    return "information";
  }

  private static calculateVariation(
    currentValue: number,
    previousValue?: number,
  ): number | undefined {
    if (
      previousValue === undefined ||
      previousValue === 0
    ) {
      return undefined;
    }

    return Number(
      (
        ((currentValue - previousValue) /
          previousValue) *
        100
      ).toFixed(2),
    );
  }

  private static buildMessage(
    rule: AlertRule,
    observation: AlertObservation,
    level: AlertLevel,
    variation?: number,
  ): string {
    const variationText =
      variation === undefined
        ? ""
        : ` Variation observée : ${variation} %.`;

    if (level === "critique") {
      return `${rule.name} atteint un niveau critique avec une valeur de ${observation.value}.${variationText}`;
    }

    if (level === "vigilance") {
      return `${rule.name} nécessite une vigilance avec une valeur de ${observation.value}.${variationText}`;
    }

    return `${rule.name} reste dans une situation maîtrisée avec une valeur de ${observation.value}.${variationText}`;
  }

  private static buildRecommendation(
    level: AlertLevel,
  ): string {
    if (level === "critique") {
      return "Engager une analyse immédiate et préparer des mesures correctives prioritaires.";
    }

    if (level === "vigilance") {
      return "Renforcer le suivi de l’indicateur et vérifier les causes de son évolution.";
    }

    return "Maintenir le suivi régulier de l’indicateur.";
  }
}