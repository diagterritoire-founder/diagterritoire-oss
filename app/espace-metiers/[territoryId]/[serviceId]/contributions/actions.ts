"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  WorkspaceContributionService,
} from "@/core/services/WorkspaceContributionService";
import type {
  ContributionType,
} from "@/types/workspace";

const contributionTypes = [
  "indicator",
  "project",
  "action",
  "document",
  "event",
  "alert",
  "observation",
  "other",
] as const;

function isContributionType(
  value: string,
): value is ContributionType {
  return (
    contributionTypes as readonly string[]
  ).includes(value);
}

function requiredString(
  formData: FormData,
  name: string,
): string {
  const value = formData.get(name);

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      "Champ obligatoire invalide : " + name + ".",
    );
  }

  return value.trim();
}

function optionalString(
  formData: FormData,
  name: string,
): string | undefined {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim() || undefined;
}

function contributionType(
  formData: FormData,
): ContributionType {
  const value = requiredString(
    formData,
    "type",
  );

  if (!isContributionType(value)) {
    throw new Error(
      "Type de contribution invalide.",
    );
  }

  return value;
}

export async function createContributionDraftAction(
  formData: FormData,
) {
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
    throw new Error(
      "Session utilisateur absente.",
    );
  }

  const contribution =
    await WorkspaceContributionService.createDraft(
      session,
      {
        territoryId,
        serviceId,
        type: contributionType(formData),
        title: requiredString(
          formData,
          "title",
        ),
        description: optionalString(
          formData,
          "description",
        ),
        source: optionalString(
          formData,
          "source",
        ),
        referencePeriod: optionalString(
          formData,
          "referencePeriod",
        ),
      },
    );

  const listPath =
    "/espace-metiers/" +
    contribution.territoryId +
    "/" +
    contribution.serviceId +
    "/contributions";

  const detailPath =
    listPath + "/" + contribution.id;

  revalidatePath(listPath);
  revalidatePath(detailPath);

  redirect(detailPath);
}

export async function updateContributionDraftAction(
  formData: FormData,
) {
  const contributionId = requiredString(
    formData,
    "contributionId",
  );

  const session =
    await CurrentWorkspaceSession.get();

  if (!session) {
    throw new Error(
      "Session utilisateur absente.",
    );
  }

  const contribution =
    await WorkspaceContributionService.updateDraft(
      session,
      contributionId,
      {
        type: contributionType(formData),
        title: requiredString(
          formData,
          "title",
        ),
        description: optionalString(
          formData,
          "description",
        ),
        source: optionalString(
          formData,
          "source",
        ),
        referencePeriod: optionalString(
          formData,
          "referencePeriod",
        ),
      },
    );

  const listPath =
    "/espace-metiers/" +
    contribution.territoryId +
    "/" +
    contribution.serviceId +
    "/contributions";

  const detailPath =
    listPath + "/" + contribution.id;

  revalidatePath(listPath);
  revalidatePath(detailPath);

  redirect(detailPath);
}
