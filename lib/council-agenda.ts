/** Validation des identifiants sélectionnés pour l'ordre du jour partagé. */
export function sanitizeCouncilAgenda(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 20) {
    throw new Error("Sélection de l'ordre du jour invalide.");
  }

  const selected = new Set<string>();
  for (const rawId of value) {
    if (typeof rawId !== "string") {
      throw new Error("Identifiant de sujet invalide.");
    }

    const id = rawId.trim();
    if (!id || id.length > 200 || selected.has(id)) {
      throw new Error("Identifiant de sujet invalide ou dupliqué.");
    }
    selected.add(id);
  }

  return [...selected];
}
