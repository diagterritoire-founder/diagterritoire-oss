import {
  notFound,
  redirect,
} from "next/navigation";

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

  redirect(
    `/espace-metiers/${result.workspace.territoryId}`,
  );
}
