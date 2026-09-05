import { WorkspaceRepository } from "../core/repositories/WorkspaceRepository";

async function main() {
  const territoryId =
    "territory-commune-dzaoudzi-labattoir";

  const result =
    await WorkspaceRepository.findByTerritoryId(
      territoryId,
    );

  if (!result) {
    throw new Error(
      "Workspace Dzaoudzi-Labattoir introuvable.",
    );
  }

  console.log("\n--- WORKSPACE REPOSITORY ---");
  console.log("Nom :", result.workspace.name);
  console.log("Source :", result.source);
  console.log(
    "Services :",
    result.services.length,
  );

  const education =
    await WorkspaceRepository.findService(
      territoryId,
      "service-education",
    );

  if (!education) {
    throw new Error(
      "Service Education introuvable.",
    );
  }

  const children =
    education.services.filter(
      (service) =>
        service.parentServiceId ===
        education.service.id,
    );

  console.log("\n--- SERVICE EDUCATION ---");
  console.log("Nom :", education.service.name);
  console.log("Source :", education.source);
  console.log(
    "Sous-services :",
    children.length,
  );

  for (const child of children) {
    console.log("-", child.name);
  }

  if (result.source !== "database") {
    throw new Error(
      "Le repository fonctionne mais utilise le fallback au lieu de Neon.",
    );
  }

  if (result.services.length !== 14) {
    throw new Error(
      `Nombre de services inattendu : ${result.services.length}.`,
    );
  }

  if (children.length !== 2) {
    throw new Error(
      `Nombre de sous-services Education inattendu : ${children.length}.`,
    );
  }

  console.log(
    "\nOK: lecture réelle Neon validée.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
