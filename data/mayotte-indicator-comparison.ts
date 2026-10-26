import {
  getMayotteIndicators,
  getMayotteIndicatorValues,
} from "./mayotte-indicators";
import {
  getMayotteIndicatorProvenance,
  type MayotteIndicatorProvenance,
} from "./mayotte-indicator-provenance";
import {
  indicatorTerritories,
  resolveMayotteIndicatorTerritory,
} from "./mayotte-indicator-territories";

export type IndicatorComparisonRow = {
  indicatorId: string;
  name: string;
  category: string;
  unit: string;
  source: string;
  provenance?: MayotteIndicatorProvenance;
  leftValue: number | undefined;
  rightValue: number | undefined;
  leftPeriod: string | undefined;
  rightPeriod: string | undefined;
  difference: number | undefined;
  differenceUnit: string;
};

export type MayotteIndicatorComparison = {
  left: { id: string; name: string };
  right: { id: string; name: string };
  rows: IndicatorComparisonRow[];
};

export function getComparableIndicatorTerritories(identifier: string) {
  const selected = resolveMayotteIndicatorTerritory(identifier);

  if (
    !selected ||
    (selected.level !== "commune" && selected.level !== "epci")
  ) {
    return [];
  }

  return indicatorTerritories.filter(
    (territory) =>
      territory.level === selected.level &&
      territory.id !== selected.id,
  );
}

/**
 * Compares observations, never diagnosis scores.
 * Difference means A minus B (percentage points for rates).
 * Values with missing or different reference periods cannot be compared.
 */
export function compareMayotteIndicatorValues(
  leftId: string,
  rightId: string,
): MayotteIndicatorComparison | undefined {
  const left = resolveMayotteIndicatorTerritory(leftId);
  const right = resolveMayotteIndicatorTerritory(rightId);

  if (
    !left ||
    !right ||
    left.id === right.id ||
    left.level !== right.level ||
    (left.level !== "commune" && left.level !== "epci")
  ) {
    return undefined;
  }

  const definitions = getMayotteIndicators(left.id);
  const rightDefinitions = new Map(
    getMayotteIndicators(right.id).map(
      (indicator) => [indicator.id, indicator],
    ),
  );
  const leftValues = new Map(
    getMayotteIndicatorValues(left.id).map(
      (value) => [value.indicatorId, value],
    ),
  );
  const rightValues = new Map(
    getMayotteIndicatorValues(right.id).map(
      (value) => [value.indicatorId, value],
    ),
  );

  const rows = definitions.map((indicator): IndicatorComparisonRow => {
    const leftObservation = leftValues.get(indicator.id);
    const rightObservation = rightValues.get(indicator.id);
    const rightDefinition = rightDefinitions.get(indicator.id);

    const leftValue = leftObservation?.numericValue;
    const rightValue = rightObservation?.numericValue;
    const comparable =
      leftValue !== undefined &&
      rightValue !== undefined &&
      Number.isFinite(leftValue) &&
      Number.isFinite(rightValue) &&
      leftObservation?.referencePeriod === rightObservation?.referencePeriod &&
      indicator.unit === rightDefinition?.unit &&
      indicator.valueType === rightDefinition?.valueType &&
      indicator.source === rightDefinition?.source;

    const rawDifference = comparable ? leftValue - rightValue : undefined;
    const difference =
      rawDifference === undefined
        ? undefined
        : Math.round(rawDifference * 10) / 10;

    return {
      indicatorId: indicator.id,
      name: indicator.name,
      category: indicator.category,
      unit: indicator.unit ?? "",
      source: indicator.source ?? "Non renseignée",
      provenance: getMayotteIndicatorProvenance(indicator.id, left.level),
      leftValue,
      rightValue,
      leftPeriod: leftObservation?.referencePeriod,
      rightPeriod: rightObservation?.referencePeriod,
      difference,
      differenceUnit:
        indicator.valueType === "percentage"
          ? "points"
          : indicator.unit ?? "",
    };
  });

  return {
    left: { id: left.id, name: left.name },
    right: { id: right.id, name: right.name },
    rows,
  };
}
