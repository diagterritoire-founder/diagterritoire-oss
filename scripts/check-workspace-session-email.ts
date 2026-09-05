import { prisma } from "../lib/prisma";
import {
  WorkspaceSessionService,
} from "../core/session/WorkspaceSession";

async function main() {
  const pilot =
    await prisma.workspaceUser.findUnique({
      where: {
        id: "user-pilot-finances-contributor",
      },
    });

  if (!pilot) {
    throw new Error(
      "Utilisateur pilote introuvable.",
    );
  }

  const session =
    await WorkspaceSessionService.createForEmail(
      pilot.email,
    );

  console.log(
    "\n--- SESSION PAR EMAIL ---",
  );

  console.log(
    "Email :",
    pilot.email,
  );

  console.log(
    "Utilisateur :",
    session?.user.id ?? "ABSENT",
  );

  console.log(
    "Workspace :",
    session?.workspaceId ?? "ABSENT",
  );

  console.log(
    "Actif :",
    session ? "OUI" : "NON",
  );

  if (!session) {
    throw new Error(
      "Creation de session par email echouee.",
    );
  }

  const canAccessFinances =
    WorkspaceSessionService.canAccessService(
      session,
      "service-finances",
    );

  const canSubmit =
    WorkspaceSessionService.can(
      session,
      "contribution:submit",
      "service-finances",
    );

  const canPublish =
    WorkspaceSessionService.can(
      session,
      "contribution:publish",
      "service-finances",
    );

  console.log(
    "\n--- DROITS METIER ---",
  );

  console.log(
    "Acces Finances :",
    canAccessFinances,
  );

  console.log(
    "Soumettre :",
    canSubmit,
  );

  console.log(
    "Publier :",
    canPublish,
  );

  if (!canAccessFinances) {
    throw new Error(
      "Acces au service Finances inattendu.",
    );
  }

  if (!canSubmit) {
    throw new Error(
      "Permission de soumission absente.",
    );
  }

  if (canPublish) {
    throw new Error(
      "Permission de publication inattendue.",
    );
  }

  console.log(
    "\nOK: session email et permissions metier coherentes.",
  );

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
