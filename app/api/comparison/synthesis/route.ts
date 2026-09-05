import { auth } from "@/auth";

import {
  TerritorialComparisonAssistantService,
} from "@/core/services";

import type {
  TerritorialComparisonResult,
} from "@/core/services";

export async function POST(
  request: Request,
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

  try {
    const body =
      (await request.json()) as {
        comparison?: TerritorialComparisonResult;
      };

    if (!body.comparison) {
      return Response.json(
        {
          error:
            "La comparaison est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    const assistant =
      new TerritorialComparisonAssistantService();

    const synthesis =
      await assistant.summarize(
        body.comparison,
      );

    return Response.json({
      synthesis,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue";

    return Response.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}