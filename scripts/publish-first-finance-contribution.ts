import { prisma } from "../lib/prisma";
import {
  WorkspaceContributionService,
} from "../core/services/WorkspaceContributionService";
import {
  WorkspaceSessionService,
} from "../core/session/WorkspaceSession";

async function main() {
  const contributionId =
    "contribution-pilot-finances-001";

  const session =
    await WorkspaceSessionService.createForUser(
      "user-pilot-finances-validator",
    );

  if (!session) {
    throw new Error(
      "Session validateur introuvable.",
    );
  }

  const before =
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

  if (!before) {
    throw new Error(
      "Contribution pilote introuvable.",
    );
  }

  console.log(
    "\n--- AVANT PUBLICATION ---",
  );
  console.log(
    "Statut :",
    before.status,
  );
  console.log(
    "Historique :",
    before.history.length,
  );
  console.log(
    "Utilisateur :",
    session.user.displayName,
  );

  if (before.status !== "validated") {
    throw new Error(
      `Statut initial inattendu : ${before.status}`,
    );
  }

  await WorkspaceContributionService.transition(
    session,
    contributionId,
    "published",
    "Publication pilote par le validateur Finances.",
  );

  const after =
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

  if (!after) {
    throw new Error(
      "Contribution introuvable après publication.",
    );
  }

  console.log(
    "\n--- APRES PUBLICATION ---",
  );
  console.log(
    "Statut :",
    after.status,
  );
  console.log(
    "Historique :",
    after.history.length,
  );
  console.log(
    "PublishedAt :",
    after.publishedAt?.toISOString(),
  );

  console.log(
    "\n--- HISTORIQUE ---",
  );

  for (const entry of after.history) {
    console.log(
      `${entry.fromStatus ?? "-"} -> ${entry.toStatus}`,
    );
  }

  if (after.status !== "published") {
    throw new Error(
      `Publication échouée : ${after.status}`,
    );
  }

  if (!after.publishedAt) {
    throw new Error(
      "publishedAt absent après publication.",
    );
  }

  if (
    after.history.length !==
    before.history.length + 1
  ) {
    throw new Error(
      `Historique inattendu : ${after.history.length}`,
    );
  }

  const lastEntry =
    after.history[
      after.history.length - 1
    ];

  if (
    lastEntry.fromStatus !== "validated" ||
    lastEntry.toStatus !== "published"
  ) {
    throw new Error(
      "Transition finale incorrecte.",
    );
  }

  console.log(
    "\nOK: publication par le validateur appliquee.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
