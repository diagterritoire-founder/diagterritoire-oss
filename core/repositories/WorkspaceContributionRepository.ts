import { prisma } from "@/lib/prisma";
import type {
  ContributionHistoryEntry,
  WorkspaceContribution,
} from "@/types/workspace";

function toContribution(
  value: {
    id: string;
    workspaceId: string;
    serviceId: string;
    territoryId: string;
    organizationId: string;
    authorUserId: string;
    validatorUserId: string | null;
    type: string;
    title: string;
    description: string | null;
    status: string;
    indicatorId: string | null;
    projectId: string | null;
    knowledgeId: string | null;
    exchangeId: string | null;
    source: string | null;
    referencePeriod: string | null;
    createdAt: Date;
    updatedAt: Date;
    submittedAt: Date | null;
    validatedAt: Date | null;
    publishedAt: Date | null;
  },
): WorkspaceContribution {
  return {
    id: value.id,
    workspaceId: value.workspaceId,
    serviceId: value.serviceId,
    territoryId: value.territoryId,
    organizationId: value.organizationId,
    authorUserId: value.authorUserId,
    validatorUserId:
      value.validatorUserId ?? undefined,
    type:
      value.type as WorkspaceContribution["type"],
    title: value.title,
    description:
      value.description ?? undefined,
    status:
      value.status as WorkspaceContribution["status"],
    indicatorId:
      value.indicatorId ?? undefined,
    projectId:
      value.projectId ?? undefined,
    knowledgeId:
      value.knowledgeId ?? undefined,
    exchangeId:
      value.exchangeId ?? undefined,
    source:
      value.source ?? undefined,
    referencePeriod:
      value.referencePeriod ?? undefined,
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
    submittedAt:
      value.submittedAt?.toISOString(),
    validatedAt:
      value.validatedAt?.toISOString(),
    publishedAt:
      value.publishedAt?.toISOString(),
  };
}

function toHistoryEntry(
  value: {
    id: string;
    contributionId: string;
    actorUserId: string;
    fromStatus: string | null;
    toStatus: string;
    comment: string | null;
    createdAt: Date;
  },
): ContributionHistoryEntry {
  return {
    id: value.id,
    contributionId: value.contributionId,
    actorUserId: value.actorUserId,
    fromStatus:
      (value.fromStatus as ContributionHistoryEntry["fromStatus"]) ??
      undefined,
    toStatus:
      value.toStatus as ContributionHistoryEntry["toStatus"],
    comment:
      value.comment ?? undefined,
    createdAt: value.createdAt.toISOString(),
  };
}

export class WorkspaceContributionRepository {
  static async create(
    contribution: WorkspaceContribution,
  ): Promise<WorkspaceContribution> {
    const created =
      await prisma.workspaceContribution.create({
        data: {
          id: contribution.id,
          workspaceId: contribution.workspaceId,
          serviceId: contribution.serviceId,
          territoryId: contribution.territoryId,
          organizationId:
            contribution.organizationId,
          authorUserId:
            contribution.authorUserId,
          validatorUserId:
            contribution.validatorUserId ?? null,
          type: contribution.type,
          title: contribution.title,
          description:
            contribution.description ?? null,
          status: contribution.status,
          indicatorId:
            contribution.indicatorId ?? null,
          projectId:
            contribution.projectId ?? null,
          knowledgeId:
            contribution.knowledgeId ?? null,
          exchangeId:
            contribution.exchangeId ?? null,
          source:
            contribution.source ?? null,
          referencePeriod:
            contribution.referencePeriod ?? null,
          createdAt: new Date(
            contribution.createdAt,
          ),
          updatedAt: new Date(
            contribution.updatedAt,
          ),
          submittedAt:
            contribution.submittedAt
              ? new Date(
                  contribution.submittedAt,
                )
              : null,
          validatedAt:
            contribution.validatedAt
              ? new Date(
                  contribution.validatedAt,
                )
              : null,
          publishedAt:
            contribution.publishedAt
              ? new Date(
                  contribution.publishedAt,
                )
              : null,
        },
      });

    return toContribution(created);
  }

  static async updateDraft(
    contribution: WorkspaceContribution,
  ): Promise<WorkspaceContribution | null> {
    const result =
      await prisma.workspaceContribution.updateMany({
        where: {
          id: contribution.id,
          workspaceId:
            contribution.workspaceId,
          serviceId:
            contribution.serviceId,
          authorUserId:
            contribution.authorUserId,
          status: "draft",
        },
        data: {
          type: contribution.type,
          title: contribution.title,
          description:
            contribution.description ?? null,
          source:
            contribution.source ?? null,
          referencePeriod:
            contribution.referencePeriod ?? null,
          updatedAt: new Date(
            contribution.updatedAt,
          ),
        },
      });

    if (result.count !== 1) {
      return null;
    }

    const updated =
      await prisma.workspaceContribution.findUnique({
        where: {
          id: contribution.id,
        },
      });

    return updated
      ? toContribution(updated)
      : null;
  }

  static async findByService(
    workspaceId: string,
    serviceId: string,
  ): Promise<WorkspaceContribution[]> {
    const contributions =
      await prisma.workspaceContribution.findMany({
        where: {
          workspaceId,
          serviceId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

    return contributions.map(
      toContribution,
    );
  }

  static async findById(
    contributionId: string,
  ): Promise<{
    contribution: WorkspaceContribution;
    history: ContributionHistoryEntry[];
  } | null> {
    const contribution =
      await prisma.workspaceContribution.findUnique({
        where: {
          id: contributionId,
        },
        include: {
          history: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    if (!contribution) {
      return null;
    }

    return {
      contribution:
        toContribution(contribution),
      history:
        contribution.history.map(
          toHistoryEntry,
        ),
    };
  }
}
