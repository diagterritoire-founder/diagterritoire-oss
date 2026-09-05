import { auth } from "@/auth";

import {
  platformIntelligence,
} from "@/core";

import {
  OmniRouteAssistantService,
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
        question?: string;
        territoryId?: string;
      };

    const question =
      body.question?.trim();

    if (!question) {
      return Response.json(
        {
          error:
            "La question est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    const territoryId =
      body.territoryId ??
      "territory-mayotte";

    const intelligence =
      await platformIntelligence
        .buildTerritorialIntelligence({
          territoryId,
          question,
        });

    const assistant =
      new OmniRouteAssistantService();

    const result =
      await assistant.answer({
        question,
        territoryName:
          intelligence.territoryName,
        diagnostic:
          intelligence.analysis
            .diagnostic,
        projections:
          intelligence.analysis
            .projections,
        alerts:
          intelligence.analysis
            .alerts,
      });

    return Response.json({
      ...result,
      territoryId:
        intelligence.territoryId,
      territoryName:
        intelligence.territoryName,
      generatedAt:
        intelligence.generatedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue";

    const status =
      message.startsWith(
        "Territoire introuvable",
      )
        ? 404
        : 500;

    return Response.json(
      {
        error: message,
      },
      {
        status,
      },
    );
  }
}