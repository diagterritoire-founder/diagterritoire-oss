"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  isContributionTransitionTarget,
  WorkspaceContributionService,
} from "@/core/services/WorkspaceContributionService";

export async function transitionContributionAction(
  formData: FormData,
) {
  const contributionId =
    formData.get("contributionId");

  const nextStatus =
    formData.get("nextStatus");

  if (
    typeof contributionId !== "string" ||
    !contributionId
  ) {
    throw new Error(
      "Identifiant de contribution invalide.",
    );
  }

  if (
    typeof nextStatus !== "string" ||
    !isContributionTransitionTarget(
      nextStatus,
    )
  ) {
    throw new Error(
      "Transition demandée invalide.",
    );
  }

  const session =
    await CurrentWorkspaceSession.get();

  if (!session) {
    throw new Error(
      "Session utilisateur absente.",
    );
  }

  const result =
    await WorkspaceContributionService.transition(
      session,
      contributionId,
      nextStatus,
      `Action ${nextStatus} depuis l'interface DT Collectivité.`,
    );

  if (!result) {
    throw new Error(
      "Contribution introuvable après transition.",
    );
  }

  const {
    contribution,
  } = result;

  const path =
    `/espace-metiers/${contribution.territoryId}` +
    `/${contribution.serviceId}` +
    `/contributions/${contribution.id}`;

  revalidatePath(path);

  revalidatePath(
    `/espace-metiers/${contribution.territoryId}` +
      `/${contribution.serviceId}/contributions`,
  );

  redirect(path);
}
