import { prisma } from "@/lib/prisma";
import type {
  WorkspaceUser,
} from "@/types/workspace";

function toWorkspaceUser(
  value: {
    id: string;
    workspaceId: string;
    email: string;
    displayName: string;
    title: string | null;
    serviceIds: unknown;
    roles: unknown;
    permissions: unknown;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  },
): WorkspaceUser {
  return {
    id: value.id,
    workspaceId: value.workspaceId,
    email: value.email,
    displayName: value.displayName,
    title: value.title ?? undefined,
    serviceIds:
      value.serviceIds as WorkspaceUser["serviceIds"],
    roles:
      value.roles as WorkspaceUser["roles"],
    permissions:
      value.permissions as WorkspaceUser["permissions"],
    status:
      value.status as WorkspaceUser["status"],
    createdAt:
      value.createdAt.toISOString(),
    updatedAt:
      value.updatedAt.toISOString(),
  };
}

export class WorkspaceUserRepository {
  static async findById(
    userId: string,
  ): Promise<WorkspaceUser | null> {
    const user =
      await prisma.workspaceUser.findUnique({
        where: {
          id: userId,
        },
      });

    return user
      ? toWorkspaceUser(user)
      : null;
  }

  static async findByEmail(
    workspaceId: string,
    email: string,
  ): Promise<WorkspaceUser | null> {
    const user =
      await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_email: {
            workspaceId,
            email:
              email.trim().toLowerCase(),
          },
        },
      });

    return user
      ? toWorkspaceUser(user)
      : null;
  }

  static async findActiveByEmail(
    email: string,
  ): Promise<WorkspaceUser | null> {
    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await prisma.workspaceUser.findFirst({
        where: {
          email: normalizedEmail,
          status: "active",
        },
      });

    return user
      ? toWorkspaceUser(user)
      : null;
  }

  static async findActiveByWorkspace(
    workspaceId: string,
  ): Promise<WorkspaceUser[]> {
    const users =
      await prisma.workspaceUser.findMany({
        where: {
          workspaceId,
          status: "active",
        },
        orderBy: {
          displayName: "asc",
        },
      });

    return users.map(
      toWorkspaceUser,
    );
  }
}
