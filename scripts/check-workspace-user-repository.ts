import {
  WorkspaceUserRepository,
} from "../core/repositories/WorkspaceUserRepository";
import {
  WorkspaceAccessEngine,
} from "../core/engines/WorkspaceAccessEngine";
import { prisma } from "../lib/prisma";

async function main() {
  const workspaceId =
    "workspace-dzaoudzi-labattoir";

  const contributor =
    await WorkspaceUserRepository.findById(
      "user-pilot-finances-contributor",
    );

  const validator =
    await WorkspaceUserRepository.findByEmail(
      workspaceId,
      "validateur.finances@diagterritoire.local",
    );

  const users =
    await WorkspaceUserRepository.findActiveByWorkspace(
      workspaceId,
    );

  if (!contributor) {
    throw new Error(
      "Contributeur pilote introuvable.",
    );
  }

  if (!validator) {
    throw new Error(
      "Validateur pilote introuvable.",
    );
  }

  console.log(
    "\n--- UTILISATEURS WORKSPACE ---",
  );
  console.log(
    "Utilisateurs actifs :",
    users.length,
  );

  for (const user of users) {
    console.log(
      `- ${user.displayName} | ${user.roles.join(", ")} | ${user.serviceIds.join(", ")}`,
    );
  }

  console.log(
    "\n--- CONTRIBUTEUR ---",
  );
  console.log(
    "Identité :",
    contributor.displayName,
  );
  console.log(
    "Accès Finances :",
    WorkspaceAccessEngine.canAccessService(
      contributor,
      "service-finances",
    ),
  );
  console.log(
    "Accès Education :",
    WorkspaceAccessEngine.canAccessService(
      contributor,
      "service-education",
    ),
  );

  console.log(
    "\n--- VALIDATEUR ---",
  );
  console.log(
    "Identité :",
    validator.displayName,
  );
  console.log(
    "Validation Finances :",
    WorkspaceAccessEngine.can(
      validator,
      "contribution:validate",
      "service-finances",
    ),
  );

  if (
    !WorkspaceAccessEngine.canAccessService(
      contributor,
      "service-finances",
    )
  ) {
    throw new Error(
      "Le contributeur doit accéder à Finances.",
    );
  }

  if (
    WorkspaceAccessEngine.canAccessService(
      contributor,
      "service-education",
    )
  ) {
    throw new Error(
      "Le cloisonnement Finances / Education est invalide.",
    );
  }

  if (
    !WorkspaceAccessEngine.can(
      validator,
      "contribution:validate",
      "service-finances",
    )
  ) {
    throw new Error(
      "Le validateur doit pouvoir valider Finances.",
    );
  }

  console.log(
    "\nOK: repository utilisateurs / Neon valide.",
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
