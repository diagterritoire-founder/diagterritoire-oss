import { prisma } from "../lib/prisma";
import {
  WorkspaceAccessEngine,
} from "../core/engines/WorkspaceAccessEngine";
import {
  WorkspaceContributionEngine,
} from "../core/engines/WorkspaceContributionEngine";
import type {
  WorkspaceContribution,
  WorkspaceUser,
} from "../types/workspace";

function toWorkspaceUser(
  user: Awaited<
    ReturnType<
      typeof prisma.workspaceUser.findUnique
    >
  >,
): WorkspaceUser {
  if (!user) {
    throw new Error("Utilisateur introuvable.");
  }

  return {
    id: user.id,
    workspaceId: user.workspaceId,
    email: user.email,
    displayName: user.displayName,
    title: user.title ?? undefined,
    serviceIds: user.serviceIds as string[],
    roles: user.roles as WorkspaceUser["roles"],
    permissions:
      user.permissions as WorkspaceUser["permissions"],
    status: user.status as WorkspaceUser["status"],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function toWorkspaceContribution(
  contribution: Awaited<
    ReturnType<
      typeof prisma.workspaceContribution.findUnique
    >
  >,
): WorkspaceContribution {
  if (!contribution) {
    throw new Error("Contribution introuvable.");
  }

  return {
    id: contribution.id,
    workspaceId: contribution.workspaceId,
    serviceId: contribution.serviceId,
    territoryId: contribution.territoryId,
    organizationId: contribution.organizationId,
    authorUserId: contribution.authorUserId,
    validatorUserId:
      contribution.validatorUserId ?? undefined,
    type:
      contribution.type as WorkspaceContribution["type"],
    title: contribution.title,
    description:
      contribution.description ?? undefined,
    status:
      contribution.status as WorkspaceContribution["status"],
    indicatorId:
      contribution.indicatorId ?? undefined,
    projectId:
      contribution.projectId ?? undefined,
    knowledgeId:
      contribution.knowledgeId ?? undefined,
    exchangeId:
      contribution.exchangeId ?? undefined,
    source:
      contribution.source ?? undefined,
    referencePeriod:
      contribution.referencePeriod ?? undefined,
    createdAt: contribution.createdAt.toISOString(),
    updatedAt: contribution.updatedAt.toISOString(),
    submittedAt:
      contribution.submittedAt?.toISOString(),
    validatedAt:
      contribution.validatedAt?.toISOString(),
    publishedAt:
      contribution.publishedAt?.toISOString(),
  };
}

async function main() {
  const contributorRecord =
    await prisma.workspaceUser.findUnique({
      where: {
        id: "user-pilot-finances-contributor",
      },
    });

  const contributor =
    toWorkspaceUser(contributorRecord);

  const serviceId = "service-finances";

  if (
    !WorkspaceAccessEngine.can(
      contributor,
      "contribution:create",
      serviceId,
    )
  ) {
    throw new Error(
      "Le contributeur ne peut pas créer dans Finances.",
    );
  }

  const contributionId =
    "contribution-pilot-finances-001";

  const draft =
    WorkspaceContributionEngine.create({
      id: contributionId,
      workspaceId:
        "workspace-dzaoudzi-labattoir",
      serviceId,
      territoryId:
        "territory-commune-dzaoudzi-labattoir",
      organizationId:
        "organization-commune-dzaoudzi-labattoir",
      authorUserId: contributor.id,
      type: "observation",
      title:
        "Situation budgétaire pilote — Finances",
      description:
        "Première contribution persistée du service Finances dans DT Collectivité.",
      source: "pilote DT",
      referencePeriod: "2026",
    });

  await prisma.workspaceContribution.upsert({
    where: {
      id: contributionId,
    },
    create: {
      id: draft.id,
      workspaceId: draft.workspaceId,
      serviceId: draft.serviceId,
      territoryId: draft.territoryId,
      organizationId: draft.organizationId,
      authorUserId: draft.authorUserId,
      type: draft.type,
      title: draft.title,
      description: draft.description,
      status: draft.status,
      source: draft.source,
      referencePeriod: draft.referencePeriod,
      createdAt: new Date(draft.createdAt),
      updatedAt: new Date(draft.updatedAt),
    },
    update: {
      title: draft.title,
      description: draft.description,
      type: draft.type,
      source: draft.source,
      referencePeriod: draft.referencePeriod,
      updatedAt: new Date(draft.updatedAt),
    },
  });

  const persistedDraft =
    await prisma.workspaceContribution.findUnique({
      where: {
        id: contributionId,
      },
    });

  const contribution =
    toWorkspaceContribution(persistedDraft);

  if (
    !WorkspaceAccessEngine.can(
      contributor,
      "contribution:submit",
      serviceId,
    )
  ) {
    throw new Error(
      "Le contributeur ne peut pas soumettre dans Finances.",
    );
  }

  const transition =
    WorkspaceContributionEngine.transition(
      contribution,
      "submitted",
      contributor.id,
      "Soumission de la contribution pilote Finances.",
    );

  await prisma.$transaction([
    prisma.workspaceContribution.update({
      where: {
        id: contributionId,
      },
      data: {
        status:
          transition.contribution.status,
        updatedAt: new Date(
          transition.contribution.updatedAt,
        ),
        submittedAt: new Date(
          transition.contribution.submittedAt!,
        ),
      },
    }),
    prisma.contributionHistoryEntry.upsert({
      where: {
        id: transition.historyEntry.id,
      },
      create: {
        id: transition.historyEntry.id,
        contributionId:
          transition.historyEntry.contributionId,
        actorUserId:
          transition.historyEntry.actorUserId,
        fromStatus:
          transition.historyEntry.fromStatus,
        toStatus:
          transition.historyEntry.toStatus,
        comment:
          transition.historyEntry.comment,
        createdAt: new Date(
          transition.historyEntry.createdAt,
        ),
      },
      update: {},
    }),
  ]);

  const finalContribution =
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

  console.log("\n--- CONTRIBUTION ---");
  console.log("ID :", finalContribution?.id);
  console.log("Titre :", finalContribution?.title);
  console.log("Service :", finalContribution?.serviceId);
  console.log("Auteur :", finalContribution?.authorUserId);
  console.log("Statut :", finalContribution?.status);

  console.log("\n--- HISTORIQUE ---");
  console.log(
    "Entrées :",
    finalContribution?.history.length ?? 0,
  );

  for (
    const entry of
    finalContribution?.history ?? []
  ) {
    console.log(
      `${entry.fromStatus ?? "-"} -> ${entry.toStatus}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
