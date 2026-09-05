import {
  auth,
} from "@/auth";
import {
  WorkspaceSessionService,
} from "@/core/session/WorkspaceSession";

const DEFAULT_PILOT_USER_ID =
  "user-pilot-finances-contributor";

export class CurrentWorkspaceSession {
  static async get() {
    const authSession =
      await auth();

    const authenticatedEmail =
      authSession?.user?.email;

    if (authenticatedEmail) {
      return WorkspaceSessionService.createForEmail(
        authenticatedEmail,
      );
    }

    if (
      process.env.DT_ALLOW_PILOT_SESSION !==
      "true"
    ) {
      return null;
    }

    const pilotUserId =
      process.env.DT_PILOT_USER_ID ??
      DEFAULT_PILOT_USER_ID;

    return WorkspaceSessionService.createForUser(
      pilotUserId,
    );
  }
}
