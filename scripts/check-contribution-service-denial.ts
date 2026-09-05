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
      "user-pilot-finances-contributor",
    );

  if (!session) {
    throw new Error(
      "Session contributeur introuvable.",
    );
  }

  const before =
    await prisma.workspaceContribution.findUnique({
      where: {
        id: contributionId,
      },
      include: {
        history: true,
      },
    });

  if (!before) {
    throw new Error(
      "Contribution pilote introuvable.",
    );
  }

  console.log(
    "\n--- AVANT TENTATIVE ---",
  );
  console.log(
    "Statut :",
    before.status,
  );
  console.log(
    "Historique :",
    before.history.length,
  );

  let denied = false;

  try {
    await WorkspaceContributionService.transition(
      session,
      contributionId,
      "published",
      "Tentative de publication interdite.",
    );
  } catch (error) {
    denied = true;

    console.log(
      "\n--- REFUS ATTENDU ---",
    );

    console.log(
      error instanceof Error
        ? error.message
        : error,
    );
  }

  if (!denied) {
    throw new Error(
      "ERREUR: la publication interdite a été acceptée.",
    );
  }

  const after =
    await prisma.workspaceContribution.findUnique({
      where: {
        id: contributionId,
      },
      include: {
        history: true,
      },
    });

  if (!after) {
    throw new Error(
      "Contribution introuvable après contrôle.",
    );
  }

  console.log(
    "\n--- APRES TENTATIVE ---",
  );
  console.log(
    "Statut :",
    after.status,
  );
  console.log(
    "Historique :",
    after.history.length,
  );

  if (after.status !== before.status) {
    throw new Error(
      `Statut modifié : ${before.status} -> ${after.status}`,
    );
  }

  if (
    after.history.length !==
    before.history.length
  ) {
    throw new Error(
      "L'historique a été modifié malgré le refus.",
    );
  }

  console.log(
    "\nOK: permission serveur appliquee sans mutation.",
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
