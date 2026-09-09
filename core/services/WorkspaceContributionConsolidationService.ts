import {
  WorkspaceContributionRepository,
  type PublishedContributionRecord,
  type PublishedContributionScope,
} from "@/core/repositories/WorkspaceContributionRepository";

export const PUBLISHED_CONTRIBUTION_ORDER = [
  "publishedAt:desc",
  "id:asc",
] as const;

export type PublishedContributionConsolidation = {
  workspaceId: string;
  territoryId: string;
  serviceId?: string;
  order:
    typeof PUBLISHED_CONTRIBUTION_ORDER;
  contributions:
    PublishedContributionRecord[];
};

export class WorkspaceContributionConsolidationService {
  static async readPublished(
    scope: PublishedContributionScope,
  ): Promise<PublishedContributionConsolidation> {
    const contributions =
      await WorkspaceContributionRepository.findPublished(
        scope,
      );

    return {
      workspaceId:
        scope.workspaceId,
      territoryId:
        scope.territoryId,
      serviceId:
        scope.serviceId,
      order:
        PUBLISHED_CONTRIBUTION_ORDER,
      contributions,
    };
  }
}
