import type {
  Indicator,
  Territory,
} from "@/types/domain";

import type {
  AlertObservation,
  AlertRule,
  DiagnosticIndicator,
  ProjectionInput,
} from "../engines";

export interface TerritorialDataSource {
  getTerritories(): Promise<Territory[]>;

  getIndicators(
    territoryId: string,
  ): Promise<Indicator[]>;

  getDiagnosticIndicators(
    territoryId: string,
  ): Promise<DiagnosticIndicator[]>;

  getProjectionInputs(
    territoryId: string,
  ): Promise<ProjectionInput[]>;

  getAlertRules(
    territoryId: string,
  ): Promise<AlertRule[]>;

  getAlertObservations(
    territoryId: string,
  ): Promise<AlertObservation[]>;
}