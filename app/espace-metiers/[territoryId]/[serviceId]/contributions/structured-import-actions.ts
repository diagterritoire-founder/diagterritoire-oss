"use server";

import { revalidatePath } from "next/cache";

import {
  readStructuredContributionCsv,
  type StructuredCsvFileCandidate,
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

function requiredString(
  formData: FormData,
  name: string,
) {
  const value = formData.get(name);

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      "Contexte d’import invalide.",
    );
  }

  return value.trim();
}

function requiredCsvFile(
  formData: FormData,
): StructuredCsvFileCandidate {
  const value = formData.get("file");

  if (
    !value ||
    typeof value === "string" ||
    typeof value.name !== "string" ||
    typeof value.size !== "number" ||
    typeof value.arrayBuffer !== "function"
  ) {
    throw new Error(
      "Sélectionnez un fichier CSV à importer.",
    );
  }

  return value;
}

export async function importStructuredContributionsAction(
  _previousState: StructuredImportActionState,
  formData: FormData,
): Promise<StructuredImportActionState> {
  try {
    const territoryId = requiredString(
      formData,
      "territoryId",
    );
    const serviceId = requiredString(
      formData,
      "serviceId",
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

    const validation =
      await readStructuredContributionCsv(
        requiredCsvFile(formData),
      );

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
