import {
  WorkspaceContributionService,
} from "../core/services/WorkspaceContributionService";
import {
  WorkspaceSessionService,
} from "../core/session/WorkspaceSession";
import { prisma } from "../lib/prisma";

async function main() {
  const contributionId =
    "contribution-pilot-finances-001";

  const contributor =
    await WorkspaceSessionService.createForUser(
      "user-pilot-finances-contributor",
    );

  if (!contributor) {
    throw new Error(
      "Session contributeur introuvable.",
    );
  }

  const contribution =
    await prisma.workspaceContribution.findUnique({
      where: {
        id: contributionId,
      },
    });

  if (!contribution) {
    throw new Error(
      "Contribution pilote introuvable.",
    );
  }

  console.log(
    "\n--- SERVICE CONTRIBUTION ---",
  );

  console.log(
    "Statut actuel :",
    contribution.status,
  );

  console.log(
    "Utilisateur :",
    contributor.user.displayName,
  );

  console.log(
    "Peut publier :",
    WorkspaceSessionService.can(
      contributor,
      "contribution:publish",
      contribution.serviceId,
    ),
  );

  console.log(
    "Peut valider :",
    WorkspaceSessionService.can(
      contributor,
      "contribution:validate",
      contribution.serviceId,
    ),
  );

  console.log(
    "\nOK: service de transition charge sans mutation.",
  );

  // La méthode transition n'est volontairement
  // pas appelée dans ce contrôle.
  void WorkspaceContributionService;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
