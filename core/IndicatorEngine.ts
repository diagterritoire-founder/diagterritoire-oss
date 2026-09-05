import type {
  Indicator,
  IndicatorObservation,
} from "@/types/domain";

export class IndicatorEngine {
  static findById(
    indicators: Indicator[],
    id: string,
  ): Indicator | undefined {
    return indicators.find(
      (indicator) => indicator.id === id,
    );
  }

  static findByCode(
    indicators: Indicator[],
    code: string,
  ): Indicator | undefined {
    const normalizedCode = code.trim().toLowerCase();

    return indicators.find(
      (indicator) =>
        indicator.code.trim().toLowerCase() === normalizedCode,
    );
  }

  static filterByCategory(
    indicators: Indicator[],
    category: string,
  ): Indicator[] {
    const normalizedCategory = this.normalize(category);

    return indicators.filter(
      (indicator) =>
        this.normalize(indicator.category) === normalizedCategory,
    );
  }

  static filterByTerritory(
    indicators: Indicator[],
    territoryId: string,
  ): Indicator[] {
    return indicators.filter(
      (indicator) =>
        indicator.territoryIds?.includes(territoryId),
    );
  }

  static filterByOrganization(
    indicators: Indicator[],
    organizationId: string,
  ): Indicator[] {
    return indicators.filter(
      (indicator) =>
        indicator.organizationIds?.includes(organizationId),
    );
  }

  static search(
    indicators: Indicator[],
    query: string,
  ): Indicator[] {
    const normalizedQuery = this.normalize(query);

    if (!normalizedQuery) {
      return [];
    }

    return indicators.filter((indicator) => {
      const searchableContent = [
        indicator.name,
        indicator.code,
        indicator.description,
        indicator.category,
        indicator.unit ?? "",
        indicator.source ?? "",
      ]
        .map((value) => this.normalize(value))
        .join(" ");

      return searchableContent.includes(normalizedQuery);
    });
  }

  static count(indicators: Indicator[]): number {
    return indicators.length;
  }

  static countByCategory(
    indicators: Indicator[],
  ): Record<string, number> {
    return indicators.reduce<Record<string, number>>(
      (result, indicator) => {
        const category = indicator.category || "Sans catégorie";

        result[category] = (result[category] ?? 0) + 1;

        return result;
      },
      {},
    );
  }

  static getObservations(
    observations: IndicatorObservation[],
    indicatorId: string,
  ): IndicatorObservation[] {
    return observations
      .filter(
        (observation) =>
          observation.indicatorId === indicatorId,
      )
      .sort(
        (first, second) =>
          new Date(first.periodStart).getTime() -
          new Date(second.periodStart).getTime(),
      );
  }

  static getLatestObservation(
    observations: IndicatorObservation[],
    indicatorId: string,
    territoryId?: string,
  ): IndicatorObservation | undefined {
    const filteredObservations = observations.filter(
      (observation) =>
        observation.indicatorId === indicatorId &&
        (!territoryId ||
          observation.territoryId === territoryId),
    );

    return filteredObservations.sort(
      (first, second) =>
        new Date(second.periodStart).getTime() -
        new Date(first.periodStart).getTime(),
    )[0];
  }

  static calculateVariation(
    currentValue: number,
    previousValue: number,
  ): number | undefined {
    if (previousValue === 0) {
      return undefined;
    }

    return (
      ((currentValue - previousValue) / previousValue) *
      100
    );
  }

  private static normalize(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }
}