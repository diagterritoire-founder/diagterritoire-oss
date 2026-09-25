import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  WorkspaceRepository,
} from "@/core/repositories/WorkspaceRepository";
import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  WorkspaceSessionService,
} from "@/core/session/WorkspaceSession";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    territoryId: string;
  }>;
};

type JsonRecord = Record<string, unknown>;

const followUpStatuses = new Set([
  "a_decider",
  "adoptee",
  "en_cours",
  "realisee",
  "reportee",
  "abandonnee",
]);

function isRecord(value: unknown): value is JsonRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readString(
  value: unknown,
  label: string,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    throw new Error(`${label} invalide.`);
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new Error(
      `${label} dépasse la longueur autorisée.`,
    );
  }

  return normalized;
}

function readDate(
  value: unknown,
  label: string,
): string {
  const normalized = readString(
    value,
    label,
    10,
  );

  if (
    normalized &&
    !/^\d{4}-\d{2}-\d{2}$/.test(
      normalized,
    )
  ) {
    throw new Error(`${label} invalide.`);
  }

  return normalized;
}

function readTime(value: unknown): string {
  const normalized = readString(
    value,
    "Heure",
    5,
  );

  if (
    normalized &&
    !/^\d{2}:\d{2}$/.test(normalized)
  ) {
    throw new Error("Heure invalide.");
  }

  return normalized;
}

function sanitizeSession(value: unknown) {
  if (!isRecord(value)) {
    throw new Error(
      "Fiche de séance invalide.",
    );
  }

  return {
    date: readDate(
      value.date,
      "Date de séance",
    ),
    time: readTime(value.time),
    location: readString(
      value.location,
      "Lieu",
      200,
    ),
    subject: readString(
      value.subject,
      "Objet de la séance",
      300,
    ),
  };
}

function sanitizeFollowUp(value: unknown) {
  if (!isRecord(value)) {
    throw new Error(
      "Suivi des décisions invalide.",
    );
  }

  const entries = Object.entries(value);

  if (entries.length > 20) {
    throw new Error(
      "Trop de lignes de suivi.",
    );
  }

  const result: Record<
    string,
    {
      indicatorId: string;
      status: string;
      decision: string;
      responsible: string;
      dueDate: string;
      note: string;
    }
  > = {};

  for (const [indicatorId, rawItem] of entries) {
    if (
      !indicatorId ||
      indicatorId.length > 200 ||
      !isRecord(rawItem)
    ) {
      throw new Error(
        "Ligne de suivi invalide.",
      );
    }

    const status = readString(
      rawItem.status,
      "Statut",
      30,
    );

    if (!followUpStatuses.has(status)) {
      throw new Error(
        "Statut de suivi invalide.",
      );
    }

    result[indicatorId] = {
      indicatorId,
      status,
      decision: readString(
        rawItem.decision,
        "Décision",
        500,
      ),
      responsible: readString(
        rawItem.responsible,
        "Responsable",
        200,
      ),
      dueDate: readDate(
        rawItem.dueDate,
        "Échéance",
      ),
      note: readString(
        rawItem.note,
        "Note de suivi",
        2000,
      ),
    };
  }

  return result;
}

async function authorizeTerritory(
  territoryId: string,
) {
  const session =
    await CurrentWorkspaceSession.get();

  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Session utilisateur absente." },
        { status: 401 },
      ),
    };
  }

  const workspaceResult =
    await WorkspaceRepository.findByTerritoryId(
      territoryId,
    );

  if (
    !workspaceResult ||
    workspaceResult.workspace.id !==
      session.workspaceId
  ) {
    return {
      error: NextResponse.json(
        { error: "Territoire inaccessible." },
        { status: 404 },
      ),
    };
  }

  if (
    !WorkspaceSessionService.can(
      session,
      "decision:view",
    )
  ) {
    return {
      error: NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 },
      ),
    };
  }

  return {
    session,
    workspaceId:
      workspaceResult.workspace.id,
  };
}

function responseBody(
  state:
    | {
        sessionDate: string | null;
        sessionTime: string | null;
        sessionLocation: string | null;
        sessionSubject: string | null;
        followUp: unknown;
        updatedAt: Date;
      }
    | null,
) {
  return {
    session: {
      date: state?.sessionDate ?? "",
      time: state?.sessionTime ?? "",
      location:
        state?.sessionLocation ?? "",
      subject: state?.sessionSubject ?? "",
    },
    followUp:
      state && isRecord(state.followUp)
        ? state.followUp
        : {},
    updatedAt:
      state?.updatedAt.toISOString() ?? null,
  };
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const { territoryId } =
    await context.params;

  const authorization =
    await authorizeTerritory(territoryId);

  if (authorization.error) {
    return authorization.error;
  }

  const state =
    await prisma.councilPreparationState.findUnique({
      where: {
        workspaceId_territoryId: {
          workspaceId:
            authorization.workspaceId,
          territoryId,
        },
      },
    });

  return NextResponse.json(
    responseBody(state),
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  const { territoryId } =
    await context.params;

  const authorization =
    await authorizeTerritory(territoryId);

  if (authorization.error) {
    return authorization.error;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 },
    );
  }

  const hasSession =
    Object.prototype.hasOwnProperty.call(
      body,
      "session",
    );
  const hasFollowUp =
    Object.prototype.hasOwnProperty.call(
      body,
      "followUp",
    );

  if (!hasSession && !hasFollowUp) {
    return NextResponse.json(
      { error: "Aucune donnée à enregistrer." },
      { status: 400 },
    );
  }

  let sessionData:
    | ReturnType<typeof sanitizeSession>
    | null = null;
  let followUpData:
    | ReturnType<typeof sanitizeFollowUp>
    | null = null;

  try {
    if (hasSession) {
      sessionData = sanitizeSession(
        body.session,
      );
    }

    if (hasFollowUp) {
      followUpData = sanitizeFollowUp(
        body.followUp,
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Données invalides.",
      },
      { status: 400 },
    );
  }

  const now = new Date();

  const state =
    await prisma.councilPreparationState.upsert({
      where: {
        workspaceId_territoryId: {
          workspaceId:
            authorization.workspaceId,
          territoryId,
        },
      },
      update: {
        ...(sessionData
          ? {
              sessionDate:
                sessionData.date,
              sessionTime:
                sessionData.time,
              sessionLocation:
                sessionData.location,
              sessionSubject:
                sessionData.subject,
            }
          : {}),
        ...(followUpData
          ? {
              followUp: followUpData,
            }
          : {}),
        updatedByUserId:
          authorization.session.user.id,
        updatedAt: now,
      },
      create: {
        id: randomUUID(),
        workspaceId:
          authorization.workspaceId,
        territoryId,
        sessionDate:
          sessionData?.date ?? null,
        sessionTime:
          sessionData?.time ?? null,
        sessionLocation:
          sessionData?.location ?? null,
        sessionSubject:
          sessionData?.subject ?? null,
        followUp: followUpData ?? {},
        updatedByUserId:
          authorization.session.user.id,
        createdAt: now,
        updatedAt: now,
      },
    });

  return NextResponse.json(
    responseBody(state),
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
