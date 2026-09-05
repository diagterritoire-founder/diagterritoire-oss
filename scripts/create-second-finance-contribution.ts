import { prisma } from "../lib/prisma";

async function main() {
  const contributionId =
    "contribution-pilot-finances-002";

  const existing =
    await prisma.workspaceContribution.findUnique({
      where: {
        id: contributionId,
      },
    });

  if (existing) {
    console.log(
      "Contribution 002 deja presente :",
      existing.status,
    );
    return;
  }

  const now = new Date();

  await prisma.workspaceContribution.create({
    data: {
      id: contributionId,
      workspaceId:
        "workspace-dzaoudzi-labattoir",
      serviceId:
        "service-finances",
      territoryId:
        "territory-commune-dzaoudzi-labattoir",
      organizationId:
        "organization-commune-dzaoudzi-labattoir",
      authorUserId:
        "user-pilot-finances-contributor",
      type:
        "observation",
      title:
        "Contribution workflow UI — Finances",
      description:
        "Contribution pilote dédiée au test du workflow depuis l'interface DT Collectivité.",
      status:
        "draft",
      source:
        "pilote UI DT",
      referencePeriod:
        "2026",
      createdAt:
        now,
      updatedAt:
        now,
    },
  });

  console.log(
    "OK: contribution-pilot-finances-002 creee en draft.",
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
