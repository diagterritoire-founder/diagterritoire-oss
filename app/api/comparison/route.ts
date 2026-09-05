import { auth } from "@/auth";

import {
  isTerritoryNotFoundError,
} from "@/core/contracts";

import {
  platformIntelligence,
} from "@/core";

import {
  TerritorialComparisonService,
} from "@/core/services";

import {
  getTerritoryById,
} from "@/data/mayotte-territories";

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
        leftTerritoryId?: string;
        rightTerritoryId?: string;
      };

    if (
      !body.leftTerritoryId ||
      !body.rightTerritoryId
    ) {
      return Response.json(
        {
          error:
            "Les deux territoires sont obligatoires.",
        },
        {
          status: 400,
        },
      );
    }

    const leftTerritory =
      getTerritoryById(
        body.leftTerritoryId,
      );

    const rightTerritory =
      getTerritoryById(
        body.rightTerritoryId,
      );

    if (!leftTerritory || !rightTerritory) {
      return Response.json(
        {
          error: "Territoire introuvable.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      leftTerritory.id ===
      rightTerritory.id
    ) {
      return Response.json(
        {
          error:
            "Sélectionnez deux territoires différents.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      leftTerritory.level !==
      rightTerritory.level
    ) {
      return Response.json(
        {
          error:
            "La comparaison est limitée aux territoires de même niveau.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      leftTerritory.level !== "epci" &&
      leftTerritory.level !== "commune"
    ) {
      return Response.json(
        {
          error:
            "La comparaison est disponible entre EPCI ou entre communes.",
        },
        {
          status: 400,
        },
      );
    }

    const [left, right] =
      await Promise.all([
        platformIntelligence
          .buildTerritorialIntelligence({
            territoryId:
              body.leftTerritoryId,
          }),
        platformIntelligence
          .buildTerritorialIntelligence({
            territoryId:
              body.rightTerritoryId,
          }),
      ]);

    const comparison =
      TerritorialComparisonService.compare(
        left,
        right,
      );

    return Response.json({
      comparison,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue";

    const status =
      isTerritoryNotFoundError(error)
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
