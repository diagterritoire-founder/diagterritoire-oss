import { auth } from "@/auth";

import { platformIntelligence } from "@/core";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      territoryId: string;
    }>;
  },
) {
  const session = await auth();

  if (!session?.user) {
    return Response.json(
      {
        error: "Authentification requise.",
      },
      {
        status: 401,
      },
    );
  }

  const { territoryId } = await params;

  const url = new URL(request.url);
  const question =
    url.searchParams.get("question") ?? undefined;

  try {
    const result =
      await platformIntelligence
        .buildTerritorialIntelligence({
          territoryId,
          question,
        });

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue";

    const status = message.startsWith(
      "Territoire introuvable",
    )
      ? 404
      : 500;

    return Response.json(
      {
        error: message,
        territoryId,
      },
      {
        status,
      },
    );
  }
}