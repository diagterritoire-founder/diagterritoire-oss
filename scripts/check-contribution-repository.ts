import {
  WorkspaceContributionRepository,
} from "../core/repositories/WorkspaceContributionRepository";
import { prisma } from "../lib/prisma";

async function main() {
  const workspaceId =
    "workspace-dzaoudzi-labattoir";

  const serviceId =
    "service-finances";

  const contributions =
    await WorkspaceContributionRepository.findByService(
      workspaceId,
      serviceId,
    );

  console.log("\n--- CONTRIBUTIONS FINANCES ---");
  console.log(
    "Nombre :",
    contributions.length,
  );

  for (const contribution of contributions) {
    console.log(
      `- ${contribution.id} | ${contribution.status} | ${contribution.title}`,
    );
  }

  const detail =
    await WorkspaceContributionRepository.findById(
      "contribution-pilot-finances-001",
    );

  if (!detail) {
    throw new Error(
      "Contribution pilote Finances introuvable.",
    );
  }

  console.log("\n--- DETAIL CONTRIBUTION ---");
  console.log(
    "Titre :",
    detail.contribution.title,
  );
  console.log(
    "Statut :",
    detail.contribution.status,
  );
  console.log(
    "Auteur :",
    detail.contribution.authorUserId,
  );
  console.log(
    "Historique :",
    detail.history.length,
  );

  for (const entry of detail.history) {
    console.log(
      `${entry.fromStatus ?? "-"} -> ${entry.toStatus}`,
    );
  }

  if (
    detail.contribution.status !==
    "validated"
  ) {
    throw new Error(
      `Statut inattendu : ${detail.contribution.status}`,
    );
  }

  if (detail.history.length !== 3) {
    throw new Error(
      `Historique inattendu : ${detail.history.length}`,
    );
  }

  console.log(
    "\nOK: repository Contributions / Neon valide.",
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
