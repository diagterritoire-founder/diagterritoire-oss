export type Scenario =
  | "optimiste"
  | "realiste"
  | "pessimiste";

export type ProjectionInput = {
  indicatorId: string;
  currentValue: number;
  annualGrowthRate: number;
  years: number;
  scenario?: Scenario;
};

export type ProjectionResult = {
  indicatorId: string;
  currentValue: number;
  projectedValue: number;
  annualGrowthRate: number;
  years: number;
  scenario: Scenario;
};

export class ProspectiveEngine {
  static project(
    input: ProjectionInput,
  ): ProjectionResult {
    const scenario =
      input.scenario ?? "realiste";

    const projectedValue =
      input.currentValue *
      Math.pow(
        1 + input.annualGrowthRate / 100,
        input.years,
      );

    return {
      indicatorId: input.indicatorId,
      currentValue: input.currentValue,
      projectedValue: Number(
        projectedValue.toFixed(2),
      ),
      annualGrowthRate:
        input.annualGrowthRate,
      years: input.years,
      scenario,
    };
  }
}