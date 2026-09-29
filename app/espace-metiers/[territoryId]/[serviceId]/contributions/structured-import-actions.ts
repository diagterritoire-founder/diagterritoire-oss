"use server";

import { revalidatePath } from "next/cache";

import {
  STRUCTURED_CSV_MAX_BYTES,
  parseStructuredContributionCsvText,
} from "@/core/imports/StructuredContributionCsv";
import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  WorkspaceContributionService,
} from "@/core/services/WorkspaceContributionService";
import { prisma } from "@/lib/prisma";

export type StructuredImportActionState = {
  status: "idle" | "error" | "success";
  message: string;
  errors: string[];
};

export type StructuredImportPayload = {
  territoryId: string;
  serviceId: string;
  fileName: string;
  text: string;
};

function requiredString(
  value: unknown,
  message = "Contexte d’import invalide.",
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(message);
  }

  return value.trim();
}

function validatePayload(
  payload: StructuredImportPayload,
) {
  const fileName = requiredString(
    payload.fileName,
    "Sélectionnez un fichier CSV à importer.",
  );

  if (!fileName.toLowerCase().endsWith(".csv")) {
    return {
      rows: [],
      errors: [
        "Le fichier doit être au format CSV (.csv).",
      ],
    };
  }

  if (typeof payload.text !== "string") {
    return {
      rows: [],
      errors: [
        "Le contenu du fichier CSV est invalide.",
      ],
    };
  }

  const byteLength = new TextEncoder().encode(
    payload.text,
  ).byteLength;

  if (
    byteLength <= 0 ||
    byteLength > STRUCTURED_CSV_MAX_BYTES
  ) {
    return {
      rows: [],
      errors: [
        "Le fichier CSV doit contenir des données et ne pas dépasser 1 Mo.",
      ],
    };
  }

  if (payload.text.includes("\u0000")) {
    return {
      rows: [],
      errors: [
        "Le fichier CSV contient des caractères non valides.",
      ],
    };
  }

  return parseStructuredContributionCsvText(
    payload.text,
  );
}

export async function importStructuredContributionsAction(
  payload: StructuredImportPayload,
): Promise<StructuredImportActionState> {
  try {
    const territoryId = requiredString(
      payload.territoryId,
    );
    const serviceId = requiredString(
      payload.serviceId,
    );
    const session =
      await CurrentWorkspaceSession.get();

    if (!session) {
      return {
        status: "error",
        message:
          "Votre session n’est plus active. Reconnectez-vous avant de relancer l’import.",
        errors: [],
      };
    }

    const validation = validatePayload(payload);

    if (validation.errors.length > 0) {
      return {
        status: "error",
        message:
          "Le fichier n’a pas été importé. Corrigez les erreurs indiquées puis réessayez.",
        errors: validation.errors.slice(0, 12),
      };
    }

    const createdIds: string[] = [];

    try {
      for (const row of validation.rows) {
        const contribution =
          await WorkspaceContributionService.createDraft(
            session,
            {
              territoryId,
              serviceId,
              type: row.type,
              title: row.title,
              description: row.description,
              referencePeriod:
                row.referencePeriod,
              source: row.source,
            },
          );

        createdIds.push(contribution.id);
      }
    } catch (error) {
      if (createdIds.length > 0) {
        await prisma.workspaceContribution.deleteMany({
          where: {
            id: {
              in: createdIds,
            },
            workspaceId:
              session.workspaceId,
            authorUserId:
              session.user.id,
            status: "draft",
          },
        });
      }

      throw error;
    }

    const listPath =
      `/espace-metiers/${territoryId}/${serviceId}/contributions`;

    revalidatePath(listPath);

    return {
      status: "success",
      message:
        `${validation.rows.length} brouillon(s) créé(s). Vérifiez-les puis soumettez-les au circuit de validation habituel.`,
      errors: [],
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "L’import n’a pas pu être réalisé.",
      errors: [],
    };
  }
}
