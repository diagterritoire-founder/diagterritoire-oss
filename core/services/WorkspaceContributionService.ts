import { prisma } from "@/lib/prisma";
import {
  WorkspaceContributionEngine,
} from "@/core/engines/WorkspaceContributionEngine";
import {
  WorkspaceContributionRepository,
} from "@/core/repositories/WorkspaceContributionRepository";
import {
  WorkspaceSessionService,
  type WorkspaceSession,
} from "@/core/session/WorkspaceSession";
import type {
  ContributionStatus,
  WorkspacePermission,
} from "@/types/workspace";

type TransitionableStatus =
  | "submitted"
  | "in_review"
  | "validated"
  | "rejected"
  | "published";

function permissionForTransition(
  nextStatus: TransitionableStatus,
): WorkspacePermission {
  switch (nextStatus) {
    case "submitted":
      return "contribution:submit";

    case "in_review":
    case "validated":
      return "contribution:validate";

    case "rejected":
      return "contribution:reject";

    case "published":
      return "contribution:publish";
  }
}

export class WorkspaceContributionService {
  static async transition(
    session: WorkspaceSession,
    contributionId: string,
    nextStatus: TransitionableStatus,
    comment?: string,
  ) {
    const result =
      await WorkspaceContributionRepository.findById(
        contributionId,
      );

    if (!result) {
      throw new Error(
        "Contribution introuvable.",
      );
    }

    const contribution =
      result.contribution;

    if (
      session.workspaceId !==
      contribution.workspaceId
    ) {
      throw new Error(
        "La contribution appartient à un autre espace.",
      );
    }

    if (
      !WorkspaceSessionService.canAccessService(
        session,
        contribution.serviceId,
      )
    ) {
      throw new Error(
        "Accès interdit à ce service.",
      );
    }

    const permission =
      permissionForTransition(
        nextStatus,
      );

    if (
      !WorkspaceSessionService.can(
        session,
        permission,
        contribution.serviceId,
      )
    ) {
      throw new Error(
        `Permission refusée : ${permission}.`,
      );
    }

    if (
      nextStatus === "submitted" &&
      contribution.authorUserId !==
        session.user.id
    ) {
      throw new Error(
        "Seul l'auteur peut soumettre cette contribution.",
      );
    }

    const transition =
      WorkspaceContributionEngine.transition(
        contribution,
        nextStatus as ContributionStatus,
        session.user.id,
        comment,
      );

    const updated =
      transition.contribution;

    await prisma.$transaction(
      async (tx) => {
        const updateResult =
          await tx.workspaceContribution.updateMany({
            where: {
              id: contribution.id,
              status:
                contribution.status,
            },
            data: {
              status: updated.status,
              updatedAt: new Date(
                updated.updatedAt,
              ),
              submittedAt:
                updated.submittedAt
                  ? new Date(
                      updated.submittedAt,
                    )
                  : null,
              validatedAt:
                updated.validatedAt
                  ? new Date(
                      updated.validatedAt,
                    )
                  : null,
              publishedAt:
                updated.publishedAt
                  ? new Date(
                      updated.publishedAt,
                    )
                  : null,
              validatorUserId:
                nextStatus === "in_review" ||
                nextStatus === "validated" ||
                nextStatus === "rejected"
                  ? session.user.id
                  : contribution.validatorUserId ??
                    null,
            },
          });

        if (
          updateResult.count !== 1
        ) {
          throw new Error(
            "La contribution a été modifiée entre-temps. Rechargez la page.",
          );
        }

        await tx.contributionHistoryEntry.create({
          data: {
            id:
              transition.historyEntry.id,
            contributionId:
              transition.historyEntry
                .contributionId,
            actorUserId:
              transition.historyEntry
                .actorUserId,
            fromStatus:
              transition.historyEntry
                .fromStatus,
            toStatus:
              transition.historyEntry
                .toStatus,
            comment:
              transition.historyEntry
                .comment,
            createdAt: new Date(
              transition.historyEntry
                .createdAt,
            ),
          },
        });
      },
    );

    return WorkspaceContributionRepository.findById(
      contribution.id,
    );
  }
}
