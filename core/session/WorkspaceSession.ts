import {
  WorkspaceUserRepository,
} from "@/core/repositories/WorkspaceUserRepository";
import {
  WorkspaceAccessEngine,
} from "@/core/engines/WorkspaceAccessEngine";
import type {
  WorkspacePermission,
  WorkspaceUser,
} from "@/types/workspace";

export type WorkspaceSession = {
  user: WorkspaceUser;
  workspaceId: string;
};

export class WorkspaceSessionService {
  static async createForEmail(
    email: string,
  ): Promise<WorkspaceSession | null> {
    const user =
      await WorkspaceUserRepository.findActiveByEmail(
        email,
      );

    if (!user) {
      return null;
    }

    return {
      user,
      workspaceId: user.workspaceId,
    };
  }

  static async createForUser(
    userId: string,
  ): Promise<WorkspaceSession | null> {
    const user =
      await WorkspaceUserRepository.findById(
        userId,
      );

    if (
      !user ||
      !WorkspaceAccessEngine.isActive(user)
    ) {
      return null;
    }

    return {
      user,
      workspaceId: user.workspaceId,
    };
  }

  static canAccessService(
    session: WorkspaceSession,
    serviceId: string,
  ): boolean {
    return WorkspaceAccessEngine.canAccessService(
      session.user,
      serviceId,
    );
  }

  static can(
    session: WorkspaceSession,
    permission: WorkspacePermission,
    serviceId?: string,
  ): boolean {
    return WorkspaceAccessEngine.can(
      session.user,
      permission,
      serviceId,
    );
  }
}
