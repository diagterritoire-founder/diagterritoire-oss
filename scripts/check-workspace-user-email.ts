import { prisma } from "../lib/prisma";
import {
  WorkspaceUserRepository,
} from "../core/repositories/WorkspaceUserRepository";

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

  console.log("\n--- UTILISATEUR PILOTE ---");
  console.log("ID :", pilot.id);
  console.log("Email :", pilot.email);
  console.log("Statut :", pilot.status);

  const found =
    await WorkspaceUserRepository.findActiveByEmail(
      pilot.email,
    );

  console.log(
    "\n--- RECHERCHE PAR EMAIL ---",
  );

  console.log(
    "Utilisateur retrouve :",
    found?.id ?? "ABSENT",
  );

  console.log(
    "Workspace :",
    found?.workspaceId ?? "ABSENT",
  );

  console.log(
    "Nom :",
    found?.displayName ?? "ABSENT",
  );

  if (!found) {
    throw new Error(
      "La recherche par email actif a echoue.",
    );
  }

  if (found.id !== pilot.id) {
    throw new Error(
      `Utilisateur inattendu : ${found.id}`,
    );
  }

  console.log(
    "\nOK: utilisateur actif retrouve par email.",
  );

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
