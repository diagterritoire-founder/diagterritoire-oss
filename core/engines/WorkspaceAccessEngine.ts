import type {
  WorkspacePermission,
  WorkspaceRole,
  WorkspaceService,
  WorkspaceUser,
} from "@/types/workspace";

const allPermissions: WorkspacePermission[] = [
  "workspace:view",
  "service:view",
  "service:manage",
  "contribution:create",
  "contribution:update",
  "contribution:submit",
  "contribution:validate",
  "contribution:reject",
  "contribution:publish",
  "project:view",
  "project:manage",
  "indicator:view",
  "indicator:manage",
  "document:view",
  "document:manage",
  "decision:view",
  "decision:manage",
  "administration:manage",
];

const rolePermissions: Record<
  WorkspaceRole,
  WorkspacePermission[]
> = {
  executive: [
    "workspace:view",
    "service:view",
    "project:view",
    "indicator:view",
    "document:view",
    "decision:view",
  ],

  general_management: [
    "workspace:view",
    "service:view",
    "service:manage",
    "contribution:create",
    "contribution:update",
    "contribution:submit",
    "contribution:validate",
    "contribution:reject",
    "contribution:publish",
    "project:view",
    "project:manage",
    "indicator:view",
    "indicator:manage",
    "document:view",
    "document:manage",
    "decision:view",
    "decision:manage",
  ],

  service_manager: [
    "workspace:view",
    "service:view",
    "service:manage",
    "contribution:create",
    "contribution:update",
    "contribution:submit",
    "contribution:validate",
    "contribution:reject",
    "project:view",
    "project:manage",
    "indicator:view",
    "indicator:manage",
    "document:view",
    "document:manage",
    "decision:view",
  ],

  contributor: [
    "workspace:view",
    "service:view",
    "contribution:create",
    "contribution:update",
    "contribution:submit",
    "project:view",
    "indicator:view",
    "document:view",
    "decision:view",
  ],

  validator: [
    "workspace:view",
    "service:view",
    "contribution:validate",
    "contribution:reject",
    "contribution:publish",
    "project:view",
    "indicator:view",
    "document:view",
    "decision:view",
  ],

  observer: [
    "workspace:view",
    "service:view",
    "project:view",
    "indicator:view",
    "document:view",
    "decision:view",
  ],

  administrator: allPermissions,
};

export class WorkspaceAccessEngine {
  static isActive(
    user: WorkspaceUser,
  ): boolean {
    return user.status === "active";
  }

  static hasRole(
    user: WorkspaceUser,
    role: WorkspaceRole,
  ): boolean {
    return user.roles.includes(role);
  }

  static effectivePermissions(
    user: WorkspaceUser,
  ): WorkspacePermission[] {
    const permissions =
      new Set<WorkspacePermission>(
        user.permissions,
      );

    for (const role of user.roles) {
      for (
        const permission of
        rolePermissions[role]
      ) {
        permissions.add(permission);
      }
    }

    return [...permissions];
  }

  static hasPermission(
    user: WorkspaceUser,
    permission: WorkspacePermission,
  ): boolean {
    if (!this.isActive(user)) {
      return false;
    }

    return this.effectivePermissions(
      user,
    ).includes(permission);
  }

  static hasGlobalServiceAccess(
    user: WorkspaceUser,
  ): boolean {
    return (
      this.hasRole(
        user,
        "administrator",
      ) ||
      this.hasRole(
        user,
        "general_management",
      ) ||
      this.hasRole(
        user,
        "executive",
      )
    );
  }

  static canAccessService(
    user: WorkspaceUser,
    serviceId: string,
  ): boolean {
    if (!this.isActive(user)) {
      return false;
    }

    if (
      this.hasGlobalServiceAccess(
        user,
      )
    ) {
      return true;
    }

    return user.serviceIds.includes(
      serviceId,
    );
  }

  static can(
    user: WorkspaceUser,
    permission: WorkspacePermission,
    serviceId?: string,
  ): boolean {
    if (
      !this.hasPermission(
        user,
        permission,
      )
    ) {
      return false;
    }

    if (!serviceId) {
      return true;
    }

    return this.canAccessService(
      user,
      serviceId,
    );
  }

  static filterAccessibleServices(
    user: WorkspaceUser,
    services: WorkspaceService[],
  ): WorkspaceService[] {
    if (!this.isActive(user)) {
      return [];
    }

    if (
      this.hasGlobalServiceAccess(
        user,
      )
    ) {
      return services.filter(
        (service) =>
          service.status === "active",
      );
    }

    return services.filter(
      (service) =>
        service.status === "active" &&
        user.serviceIds.includes(
          service.id,
        ),
    );
  }
}
