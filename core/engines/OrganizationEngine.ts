import type {
  Organization,
  OrganizationType,
} from "@/types/domain";

export type OrganizationTreeNode =
  Organization & {
    children: OrganizationTreeNode[];
  };

export class OrganizationEngine {
  static findById(
    organizations: Organization[],
    id: string,
  ): Organization | undefined {
    return organizations.find(
      (organization) =>
        organization.id === id,
    );
  }

  static findBySlug(
    organizations: Organization[],
    slug: string,
  ): Organization | undefined {
    const normalizedSlug =
      this.normalize(slug);

    return organizations.find(
      (organization) =>
        this.normalize(
          organization.slug,
        ) === normalizedSlug,
    );
  }

  static findBySiren(
    organizations: Organization[],
    siren: string,
  ): Organization | undefined {
    const normalizedSiren =
      siren.replace(/\s/g, "");

    return organizations.find(
      (organization) =>
        organization.siren?.replace(
          /\s/g,
          "",
        ) === normalizedSiren,
    );
  }

  static filterByType(
    organizations: Organization[],
    type: OrganizationType,
  ): Organization[] {
    return organizations.filter(
      (organization) =>
        organization.type === type,
    );
  }

  static filterByTerritory(
    organizations: Organization[],
    territoryId: string,
  ): Organization[] {
    return organizations.filter(
      (organization) =>
        organization.territoryIds.includes(
          territoryId,
        ),
    );
  }

  static getChildren(
    organizations: Organization[],
    parentOrganizationId: string,
  ): Organization[] {
    return organizations.filter(
      (organization) =>
        organization.parentOrganizationId ===
        parentOrganizationId,
    );
  }

  static getParent(
    organizations: Organization[],
    organization: Organization,
  ): Organization | undefined {
    if (
      !organization.parentOrganizationId
    ) {
      return undefined;
    }

    return this.findById(
      organizations,
      organization.parentOrganizationId,
    );
  }

  static getRoots(
    organizations: Organization[],
  ): Organization[] {
    return organizations.filter(
      (organization) =>
        !organization.parentOrganizationId,
    );
  }

  static search(
    organizations: Organization[],
    query: string,
  ): Organization[] {
    const normalizedQuery =
      this.normalize(query);

    if (!normalizedQuery) {
      return [];
    }

    return organizations.filter(
      (organization) => {
        const searchableContent = [
          organization.name,
          organization.acronym ?? "",
          organization.slug,
          organization.siren ?? "",
          organization.type,
        ]
          .map((value) =>
            this.normalize(value),
          )
          .join(" ");

        return searchableContent.includes(
          normalizedQuery,
        );
      },
    );
  }

  static count(
    organizations: Organization[],
  ): number {
    return organizations.length;
  }

  static countByType(
    organizations: Organization[],
  ): Record<OrganizationType, number> {
    return organizations.reduce<
      Record<OrganizationType, number>
    >(
      (result, organization) => {
        result[organization.type] =
          (result[
            organization.type
          ] ?? 0) + 1;

        return result;
      },
      {} as Record<
        OrganizationType,
        number
      >,
    );
  }

  static buildTree(
    organizations: Organization[],
    parentOrganizationId?: string,
  ): OrganizationTreeNode[] {
    return organizations
      .filter((organization) =>
        parentOrganizationId
          ? organization
              .parentOrganizationId ===
            parentOrganizationId
          : !organization
              .parentOrganizationId,
      )
      .map((organization) => ({
        ...organization,
        children: this.buildTree(
          organizations,
          organization.id,
        ),
      }));
  }

  private static normalize(
    value: string,
  ): string {
    return value
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .trim()
      .toLowerCase();
  }
}