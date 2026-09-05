export type TerritorialIntelligenceErrorCode =
  | "TERRITORY_NOT_FOUND"
  | "INVALID_VERSION"
  | "INVALID_TERRITORY_ID"
  | "INVALID_TERRITORY_NAME"
  | "INVALID_GENERATED_AT"
  | "INVALID_EXECUTION_TIME"
  | "INVALID_ANALYSIS"
  | "INVALID_METADATA"
  | "INVALID_DASHBOARD";

export class TerritorialIntelligenceError extends Error {
  constructor(
    public readonly code: TerritorialIntelligenceErrorCode,
    message: string,
    public readonly field?: string,
  ) {
    super(message);

    this.name = "TerritorialIntelligenceError";
  }
}

export function isTerritoryNotFoundError(
  error: unknown,
): error is TerritorialIntelligenceError {
  return (
    error instanceof TerritorialIntelligenceError &&
    error.code === "TERRITORY_NOT_FOUND"
  );
}
