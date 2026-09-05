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
