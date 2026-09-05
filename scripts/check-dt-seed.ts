import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

async function main() {
  const connectionString =
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL absente.",
    );
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  try {
    const workspace =
      await prisma.workspace.findUnique({
        where: {
          id: "workspace-dzaoudzi-labattoir",
        },
        include: {
          services: {
            orderBy: {
              name: "asc",
            },
          },
        },
      });

    if (!workspace) {
      throw new Error(
        "Workspace Dzaoudzi-Labattoir introuvable.",
      );
    }

    const educationChildren =
      workspace.services.filter(
        (service) =>
          service.parentServiceId ===
          "service-education",
      );

    console.log("\n--- WORKSPACE ---");
    console.log(workspace.name);
    console.log(
      "Territoire :",
      workspace.territoryId,
    );
    console.log(
      "Statut :",
      workspace.status,
    );

    console.log("\n--- SERVICES ---");
    console.log(
      "Nombre :",
      workspace.services.length,
    );

    for (
      const service of
      workspace.services
    ) {
      console.log(
        `- ${service.name} [${service.category}]`,
      );
    }

    console.log(
      "\n--- ENFANTS EDUCATION ---",
    );

    console.log(
      "Nombre :",
      educationChildren.length,
    );

    for (
      const service of
      educationChildren
    ) {
      console.log(
        `- ${service.name}`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
