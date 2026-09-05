import { prisma } from "../lib/prisma";
import {
  WorkspaceAccessEngine,
} from "../core/engines/WorkspaceAccessEngine";
import type {
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
    serviceIds:
      user.serviceIds as string[],
    roles:
      user.roles as WorkspaceUser["roles"],
    permissions:
      user.permissions as WorkspaceUser["permissions"],
    status:
      user.status as WorkspaceUser["status"],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function main() {
  const contributorRecord =
    await prisma.workspaceUser.findUnique({
      where: {
        id: "user-pilot-finances-contributor",
      },
    });

  const validatorRecord =
    await prisma.workspaceUser.findUnique({
      where: {
        id: "user-pilot-finances-validator",
      },
    });

  const contributor =
    toWorkspaceUser(contributorRecord);

  const validator =
    toWorkspaceUser(validatorRecord);

  console.log("\n--- UTILISATEURS NEON ---");
  console.log(
    contributor.displayName,
    contributor.roles,
    contributor.serviceIds,
  );
  console.log(
    validator.displayName,
    validator.roles,
    validator.serviceIds,
  );

  console.log("\n--- CONTRIBUTEUR FINANCES ---");
  console.log(
    "Créer :",
    WorkspaceAccessEngine.can(
      contributor,
      "contribution:create",
      "service-finances",
    ),
  );
  console.log(
    "Soumettre :",
    WorkspaceAccessEngine.can(
      contributor,
      "contribution:submit",
      "service-finances",
    ),
  );
  console.log(
    "Valider :",
    WorkspaceAccessEngine.can(
      contributor,
      "contribution:validate",
      "service-finances",
    ),
  );

  console.log("\n--- VALIDATEUR FINANCES ---");
  console.log(
    "Créer :",
    WorkspaceAccessEngine.can(
      validator,
      "contribution:create",
      "service-finances",
    ),
  );
  console.log(
    "Valider :",
    WorkspaceAccessEngine.can(
      validator,
      "contribution:validate",
      "service-finances",
    ),
  );
  console.log(
    "Rejeter :",
    WorkspaceAccessEngine.can(
      validator,
      "contribution:reject",
      "service-finances",
    ),
  );

  console.log("\n--- CLOISONNEMENT SERVICES ---");
  console.log(
    "Contributeur vers Education :",
    WorkspaceAccessEngine.can(
      contributor,
      "contribution:create",
      "service-education",
    ),
  );
  console.log(
    "Validateur vers Education :",
    WorkspaceAccessEngine.can(
      validator,
      "contribution:validate",
      "service-education",
    ),
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
