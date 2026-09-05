import {
  WorkspaceSessionService,
} from "../core/session/WorkspaceSession";
import { prisma } from "../lib/prisma";

async function main() {
  const contributor =
    await WorkspaceSessionService.createForUser(
      "user-pilot-finances-contributor",
    );

  const validator =
    await WorkspaceSessionService.createForUser(
      "user-pilot-finances-validator",
    );

  if (!contributor) {
    throw new Error(
      "Session contributeur introuvable.",
    );
  }

  if (!validator) {
    throw new Error(
      "Session validateur introuvable.",
    );
  }

  console.log(
    "\n--- SESSION CONTRIBUTEUR ---",
  );

  console.log(
    "Utilisateur :",
    contributor.user.displayName,
  );

  console.log(
    "Workspace :",
    contributor.workspaceId,
  );

  console.log(
    "Accès Finances :",
    WorkspaceSessionService.canAccessService(
      contributor,
      "service-finances",
    ),
  );

  console.log(
    "Accès Education :",
    WorkspaceSessionService.canAccessService(
      contributor,
      "service-education",
    ),
  );

  console.log(
    "Créer contribution Finances :",
    WorkspaceSessionService.can(
      contributor,
      "contribution:create",
      "service-finances",
    ),
  );

  console.log(
    "Valider contribution Finances :",
    WorkspaceSessionService.can(
      contributor,
      "contribution:validate",
      "service-finances",
    ),
  );

  console.log(
    "\n--- SESSION VALIDATEUR ---",
  );

  console.log(
    "Utilisateur :",
    validator.user.displayName,
  );

  console.log(
    "Créer contribution Finances :",
    WorkspaceSessionService.can(
      validator,
      "contribution:create",
      "service-finances",
    ),
  );

  console.log(
    "Valider contribution Finances :",
    WorkspaceSessionService.can(
      validator,
      "contribution:validate",
      "service-finances",
    ),
  );

  if (
    !WorkspaceSessionService.canAccessService(
      contributor,
      "service-finances",
    )
  ) {
    throw new Error(
      "Le contributeur doit accéder à Finances.",
    );
  }

  if (
    WorkspaceSessionService.canAccessService(
      contributor,
      "service-education",
    )
  ) {
    throw new Error(
      "Le contributeur ne doit pas accéder à Education.",
    );
  }

  if (
    !WorkspaceSessionService.can(
      contributor,
      "contribution:create",
      "service-finances",
    )
  ) {
    throw new Error(
      "Le contributeur doit pouvoir créer une contribution.",
    );
  }

  if (
    WorkspaceSessionService.can(
      contributor,
      "contribution:validate",
      "service-finances",
    )
  ) {
    throw new Error(
      "Le contributeur ne doit pas pouvoir valider.",
    );
  }

  if (
    !WorkspaceSessionService.can(
      validator,
      "contribution:validate",
      "service-finances",
    )
  ) {
    throw new Error(
      "Le validateur doit pouvoir valider.",
    );
  }

  console.log(
    "\nOK: session applicative pilote valide.",
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
