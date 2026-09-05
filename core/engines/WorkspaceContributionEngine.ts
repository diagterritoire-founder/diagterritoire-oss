import type {
  ContributionHistoryEntry,
  ContributionStatus,
  WorkspaceContribution,
} from "@/types/workspace";

export type CreateWorkspaceContributionInput = {
  id: string;
  workspaceId: string;
  serviceId: string;
  territoryId: string;
  organizationId: string;
  authorUserId: string;
  type: WorkspaceContribution["type"];
  title: string;
  description?: string;
  indicatorId?: string;
  projectId?: string;
  knowledgeId?: string;
  exchangeId?: string;
  source?: string;
  referencePeriod?: string;
  createdAt?: string;
};

export type ContributionTransitionResult = {
  contribution: WorkspaceContribution;
  historyEntry: ContributionHistoryEntry;
};

export class WorkspaceContributionEngine {
  static create(
    input: CreateWorkspaceContributionInput,
  ): WorkspaceContribution {
    const title = input.title.trim();

    if (!title) {
      throw new Error(
        "Le titre de la contribution est obligatoire.",
      );
    }

    const createdAt =
      input.createdAt ?? new Date().toISOString();

    return {
      id: input.id,
      workspaceId: input.workspaceId,
      serviceId: input.serviceId,
      territoryId: input.territoryId,
      organizationId: input.organizationId,
      authorUserId: input.authorUserId,
      type: input.type,
      title,
      description: input.description?.trim(),
      status: "draft",
      indicatorId: input.indicatorId,
      projectId: input.projectId,
      knowledgeId: input.knowledgeId,
      exchangeId: input.exchangeId,
      source: input.source?.trim(),
      referencePeriod: input.referencePeriod,
      createdAt,
      updatedAt: createdAt,
    };
  }

  static transition(
    contribution: WorkspaceContribution,
    nextStatus: ContributionStatus,
    actorUserId: string,
    comment?: string,
    changedAt = new Date().toISOString(),
  ): ContributionTransitionResult {
    if (
      !this.canTransition(
        contribution.status,
        nextStatus,
      )
    ) {
      throw new Error(
        `Transition impossible : ${contribution.status} vers ${nextStatus}.`,
      );
    }

    const previousStatus =
      contribution.status;

    const updated: WorkspaceContribution = {
      ...contribution,
      status: nextStatus,
      updatedAt: changedAt,
      submittedAt:
        nextStatus === "submitted"
          ? changedAt
          : contribution.submittedAt,
      validatedAt:
        nextStatus === "validated"
          ? changedAt
          : contribution.validatedAt,
      publishedAt:
        nextStatus === "published"
          ? changedAt
          : contribution.publishedAt,
    };

    const historyEntry: ContributionHistoryEntry = {
      id: `${contribution.id}-history-${changedAt}`,
      contributionId: contribution.id,
      actorUserId,
      fromStatus: previousStatus,
      toStatus: nextStatus,
      comment: comment?.trim(),
      createdAt: changedAt,
    };

    return {
      contribution: updated,
      historyEntry,
    };
  }

  static filterByWorkspace(
    contributions: WorkspaceContribution[],
    workspaceId: string,
  ): WorkspaceContribution[] {
    return contributions.filter(
      (contribution) =>
        contribution.workspaceId ===
        workspaceId,
    );
  }

  static filterByService(
    contributions: WorkspaceContribution[],
    serviceId: string,
  ): WorkspaceContribution[] {
    return contributions.filter(
      (contribution) =>
        contribution.serviceId ===
        serviceId,
    );
  }

  static filterByTerritory(
    contributions: WorkspaceContribution[],
    territoryId: string,
  ): WorkspaceContribution[] {
    return contributions.filter(
      (contribution) =>
        contribution.territoryId ===
        territoryId,
    );
  }

  static filterByStatus(
    contributions: WorkspaceContribution[],
    status: ContributionStatus,
  ): WorkspaceContribution[] {
    return contributions.filter(
      (contribution) =>
        contribution.status === status,
    );
  }

  static filterByAuthor(
    contributions: WorkspaceContribution[],
    authorUserId: string,
  ): WorkspaceContribution[] {
    return contributions.filter(
      (contribution) =>
        contribution.authorUserId ===
        authorUserId,
    );
  }

  static sortByUpdatedAt(
    contributions: WorkspaceContribution[],
  ): WorkspaceContribution[] {
    return [...contributions].sort(
      (first, second) =>
        new Date(
          second.updatedAt,
        ).getTime() -
        new Date(
          first.updatedAt,
        ).getTime(),
    );
  }

  static canTransition(
    currentStatus: ContributionStatus,
    nextStatus: ContributionStatus,
  ): boolean {
    const transitions: Record<
      ContributionStatus,
      ContributionStatus[]
    > = {
      draft: [
        "submitted",
        "archived",
      ],
      submitted: [
        "in_review",
        "rejected",
        "archived",
      ],
      in_review: [
        "validated",
        "rejected",
      ],
      validated: [
        "published",
        "archived",
      ],
      rejected: [
        "draft",
        "archived",
      ],
      published: [
        "archived",
      ],
      archived: [],
    };

    return transitions[
      currentStatus
    ].includes(nextStatus);
  }
}
