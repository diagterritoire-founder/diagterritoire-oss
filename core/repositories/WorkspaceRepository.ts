import {
  dzaoudziLabattoirServices,
  dzaoudziLabattoirWorkspace,
} from "@/data/dzaoudzi-labattoir-workspace";
import { prisma } from "@/lib/prisma";
import type {
  Workspace,
  WorkspaceService,
} from "@/types/workspace";

export type WorkspaceWithServices = {
  workspace: Workspace;
  services: WorkspaceService[];
  source: "database" | "fallback";
};

function toWorkspace(
  value: {
    id: string;
    organizationId: string;
    territoryId: string;
    name: string;
    slug: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  },
): Workspace {
  return {
    id: value.id,
    organizationId: value.organizationId,
    territoryId: value.territoryId,
    name: value.name,
    slug: value.slug,
    status: value.status as Workspace["status"],
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
  };
}

function toWorkspaceService(
  value: {
    id: string;
    workspaceId: string;
    organizationId: string | null;
    parentServiceId: string | null;
    name: string;
    slug: string;
    category: string;
    description: string | null;
    managerUserId: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  },
): WorkspaceService {
  return {
    id: value.id,
    workspaceId: value.workspaceId,
    organizationId:
      value.organizationId ?? undefined,
    parentServiceId:
      value.parentServiceId ?? undefined,
    name: value.name,
    slug: value.slug,
    category:
      value.category as WorkspaceService["category"],
    description:
      value.description ?? undefined,
    managerUserId:
      value.managerUserId ?? undefined,
    status:
      value.status as WorkspaceService["status"],
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
  };
}

function getPilotFallback(
  territoryId: string,
): WorkspaceWithServices | null {
  if (
    territoryId !==
    dzaoudziLabattoirWorkspace.territoryId
  ) {
    return null;
  }

  return {
    workspace: dzaoudziLabattoirWorkspace,
    services: dzaoudziLabattoirServices,
    source: "fallback",
  };
}

export class WorkspaceRepository {
  static async findByTerritoryId(
    territoryId: string,
  ): Promise<WorkspaceWithServices | null> {
    try {
      const result =
        await prisma.workspace.findFirst({
          where: {
            territoryId,
            status: "active",
          },
          include: {
            services: {
              where: {
                status: "active",
              },
              orderBy: {
                name: "asc",
              },
            },
          },
        });

      if (!result) {
        return getPilotFallback(
          territoryId,
        );
      }

      return {
        workspace: toWorkspace(result),
        services: result.services.map(
          toWorkspaceService,
        ),
        source: "database",
      };
    } catch (error) {
      console.error(
        "WorkspaceRepository.findByTerritoryId:",
        error,
      );

      return getPilotFallback(
        territoryId,
      );
    }
  }

  static async findService(
    territoryId: string,
    serviceId: string,
  ): Promise<{
    workspace: Workspace;
    service: WorkspaceService;
    services: WorkspaceService[];
    source: "database" | "fallback";
  } | null> {
    const result =
      await this.findByTerritoryId(
        territoryId,
      );

    if (!result) {
      return null;
    }

    const service =
      result.services.find(
        (candidate) =>
          candidate.id === serviceId,
      );

    if (!service) {
      return null;
    }

    return {
      workspace: result.workspace,
      service,
      services: result.services,
      source: result.source,
    };
  }
}
