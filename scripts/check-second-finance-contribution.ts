import { prisma } from "../lib/prisma";

async function main() {
  const id =
    "contribution-pilot-finances-002";

  const value =
    await prisma.workspaceContribution.findUnique({
      where: {
        id,
      },
      include: {
        history: true,
      },
    });

  if (!value) {
    throw new Error(
      "Contribution 002 introuvable.",
    );
  }

  console.log(
    "\n--- CONTRIBUTION 002 ---",
  );

  console.log(
    "ID :",
    value.id,
  );

  console.log(
    "Statut :",
    value.status,
  );

  console.log(
    "Auteur :",
    value.authorUserId,
  );

  console.log(
    "Historique :",
    value.history.length,
  );

  if (value.status !== "draft") {
    throw new Error(
      `Statut inattendu : ${value.status}`,
    );
  }

  if (
    value.authorUserId !==
    "user-pilot-finances-contributor"
  ) {
    throw new Error(
      "Auteur inattendu.",
    );
  }

  if (value.history.length !== 0) {
    throw new Error(
      `Historique inattendu : ${value.history.length}`,
    );
  }

  console.log(
    "\nOK: contribution 002 prete pour le workflow UI.",
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
