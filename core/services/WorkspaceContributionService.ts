import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";
import {
  WorkspaceContributionEngine,
} from "@/core/engines/WorkspaceContributionEngine";
import {
  WorkspaceRepository,
} from "@/core/repositories/WorkspaceRepository";
import {
  WorkspaceContributionRepository,
} from "@/core/repositories/WorkspaceContributionRepository";
import {
  WorkspaceSessionService,
  type WorkspaceSession,
} from "@/core/session/WorkspaceSession";
import type {
  ContributionStatus,
  ContributionType,
  WorkspacePermission,
} from "@/types/workspace";

export type ContributionDraftInput = {
  territoryId: string;
  serviceId: string;
  type: ContributionType;
  title: string;
  description?: string;
  source?: string;
  referencePeriod?: string;
};

export type UpdateContributionDraftInput = {
  type: ContributionType;
  title: string;
  description?: string;
  source?: string;
  referencePeriod?: string;
};

export const CONTRIBUTION_TRANSITION_TARGETS = [
  "submitted",
  "in_review",
  "validated",
  "rejected",
  "published",
] as const;

export type TransitionableStatus =
  (typeof CONTRIBUTION_TRANSITION_TARGETS)[number];

export function isContributionTransitionTarget(
  value: string,
): value is TransitionableStatus {
  return (
    CONTRIBUTION_TRANSITION_TARGETS as readonly string[]
  ).includes(value);
}

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
  static async createDraft(
    session: WorkspaceSession,
    input: ContributionDraftInput,
  ) {
    const workspaceResult =
      await WorkspaceRepository.findService(
        input.territoryId,
        input.serviceId,
      );

    if (!workspaceResult) {
      throw new Error(
        "Espace métier ou service introuvable.",
      );
    }

    const {
      workspace,
      service,
      source,
    } = workspaceResult;

    if (source !== "database") {
      throw new Error(
        "La création d'une contribution nécessite un espace métier persisté en base.",
      );
    }

    if (
      session.workspaceId !== workspace.id
    ) {
      throw new Error(
        "Le service appartient à un autre espace.",
      );
    }

    if (
      !WorkspaceSessionService.canAccessService(
        session,
        service.id,
      )
    ) {
      throw new Error(
        "Accès interdit à ce service.",
      );
    }

    if (
      !WorkspaceSessionService.can(
        session,
        "contribution:create",
        service.id,
      )
    ) {
      throw new Error(
        "Permission refusée : contribution:create.",
      );
    }

    const contribution =
      WorkspaceContributionEngine.create({
        id: randomUUID(),
        workspaceId: workspace.id,
        serviceId: service.id,
        territoryId: workspace.territoryId,
        organizationId:
          workspace.organizationId,
        authorUserId: session.user.id,
        type: input.type,
        title: input.title,
        description: input.description,
        source: input.source,
        referencePeriod:
          input.referencePeriod,
      });

    return WorkspaceContributionRepository.create(
      contribution,
    );
  }

  static async updateDraft(
    session: WorkspaceSession,
    contributionId: string,
    input: UpdateContributionDraftInput,
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

    if (
      !WorkspaceSessionService.can(
        session,
        "contribution:update",
        contribution.serviceId,
      )
    ) {
      throw new Error(
        "Permission refusée : contribution:update.",
      );
    }

    if (
      contribution.authorUserId !==
      session.user.id
    ) {
      throw new Error(
        "Seul l'auteur peut modifier ce brouillon.",
      );
    }

    const workspaceResult =
      await WorkspaceRepository.findService(
        contribution.territoryId,
        contribution.serviceId,
      );

    if (
      !workspaceResult ||
      workspaceResult.source !== "database" ||
      workspaceResult.workspace.id !==
        contribution.workspaceId
    ) {
      throw new Error(
        "La modification nécessite un espace métier persisté en base.",
      );
    }

    const updated =
      WorkspaceContributionEngine.updateDraft(
        contribution,
        input,
      );

    const persisted =
      await WorkspaceContributionRepository.updateDraft(
        updated,
      );

    if (!persisted) {
      throw new Error(
        "Le brouillon a été modifié entre-temps ou n'est plus modifiable. Rechargez la page.",
      );
    }

    return persisted;
  }

  static async transition(
    session: WorkspaceSession,
    contributionId: string,
    nextStatus: ContributionStatus,
    comment?: string,
  ) {
    if (
      !isContributionTransitionTarget(
        nextStatus,
      )
    ) {
      throw new Error(
        "Transition demandée invalide.",
      );
    }

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
        "Contribution inaccessible dans cet espace.",
      );
    }

    const workspaceResult =
      await WorkspaceRepository.findService(
        contribution.territoryId,
        contribution.serviceId,
      );

    if (
      !workspaceResult ||
      workspaceResult.source !== "database" ||
      workspaceResult.workspace.id !==
        contribution.workspaceId ||
      workspaceResult.workspace.territoryId !==
        contribution.territoryId ||
      workspaceResult.workspace.organizationId !==
        contribution.organizationId ||
      workspaceResult.service.workspaceId !==
        contribution.workspaceId
    ) {
      throw new Error(
        "Contexte de contribution invalide ou inaccessible.",
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
        nextStatus,
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
              workspaceId:
                contribution.workspaceId,
              serviceId:
                contribution.serviceId,
              territoryId:
                contribution.territoryId,
              organizationId:
                contribution.organizationId,
              status:
                contribution.status,
              updatedAt: new Date(
                contribution.updatedAt,
              ),
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
