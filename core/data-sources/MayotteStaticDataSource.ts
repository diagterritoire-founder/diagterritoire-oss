import {
  mayotteCommunes,
  mayotteDepartment,
  mayotteEpcis,
} from "@/data/mayotte-territories";

import {
  getMayotteDiagnosticIndicators,
  getMayotteIndicators,
} from "@/data/mayotte-indicators";

import {
  getMayotteAlertObservations,
  getMayotteAlertRules,
  getMayotteProjectionInputs,
} from "@/data/mayotte-intelligence";

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

import type {
  TerritorialDataSource,
} from "./TerritorialDataSource";

export class MayotteStaticDataSource
  implements TerritorialDataSource
{
  async getTerritories(): Promise<Territory[]> {
    return [
      ...(mayotteDepartment
        ? [mayotteDepartment]
        : []),
      ...mayotteEpcis,
      ...mayotteCommunes,
    ];
  }

  async getIndicators(
    territoryId: string,
  ): Promise<Indicator[]> {
    return getMayotteIndicators(territoryId);
  }

  async getDiagnosticIndicators(
    territoryId: string,
  ): Promise<DiagnosticIndicator[]> {
    return getMayotteDiagnosticIndicators(
      territoryId,
    );
  }

  async getProjectionInputs(
    territoryId: string,
  ): Promise<ProjectionInput[]> {
    return getMayotteProjectionInputs(territoryId);
  }

  async getAlertRules(
    territoryId: string,
  ): Promise<AlertRule[]> {
    return getMayotteAlertRules(territoryId);
  }

  async getAlertObservations(
    territoryId: string,
  ): Promise<AlertObservation[]> {
    return getMayotteAlertObservations(territoryId);
  }
}
