import { prisma } from "@/lib/prisma";

async function main() {
  const contribution =
    await prisma.workspaceContribution.findUnique({
      where: {
        id: "contribution-pilot-finances-001",
      },
      include: {
        history: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  if (!contribution) {
    throw new Error(
      "Contribution pilote introuvable.",
    );
  }

  console.log(
    "Statut :",
    contribution.status,
  );

  console.log(
    "Validateur :",
    contribution.validatorUserId,
  );

  console.log(
    "ValidatedAt :",
    contribution.validatedAt?.toISOString() ??
      "ABSENT",
  );

  console.log(
    "Historique :",
    contribution.history.length,
  );

  for (const entry of contribution.history) {
    console.log(
      `${entry.fromStatus ?? "-"} -> ${entry.toStatus}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
