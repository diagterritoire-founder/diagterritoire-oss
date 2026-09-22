import {
  notFound,
  redirect,
} from "next/navigation";

import {
  WorkspaceAccessEngine,
} from "@/core/engines/WorkspaceAccessEngine";
import {
  WorkspaceRepository,
} from "@/core/repositories/WorkspaceRepository";
import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";

export default async function WorkspaceEntryPage() {
  const session =
    await CurrentWorkspaceSession.get();

  if (!session) {
    redirect("/connexion");
  }

  const result =
    await WorkspaceRepository.findById(
      session.workspaceId,
    );

  if (!result) {
    notFound();
  }

  const accessibleServices =
    WorkspaceAccessEngine.filterAccessibleServices(
      session.user,
      result.services,
    );

  if (accessibleServices.length === 1) {
    redirect(
      `/espace-metiers/${result.workspace.territoryId}/${accessibleServices[0].id}/contributions`,
    );
  }

  redirect(
    `/espace-metiers/${result.workspace.territoryId}`,
  );
}
