import type {
  Territory,
  TerritorialLevel,
} from "@/types/domain";

export type TerritoryTreeNode = Territory & {
  children: TerritoryTreeNode[];
};

export class TerritoryEngine {
  static findById(
    territories: Territory[],
    id: string,
  ): Territory | undefined {
    return territories.find(
      (territory) => territory.id === id,
    );
  }

  static findBySlug(
    territories: Territory[],
    slug: string,
  ): Territory | undefined {
    return territories.find(
      (territory) => territory.slug === slug,
    );
  }

  static getChildren(
    territories: Territory[],
    parentId: string,
  ): Territory[] {
    return territories.filter(
      (territory) => territory.parentId === parentId,
    );
  }

  static getParent(
    territories: Territory[],
    territory: Territory,
  ): Territory | undefined {
    if (!territory.parentId) {
      return undefined;
    }

    return this.findById(
      territories,
      territory.parentId,
    );
  }

  static getRoots(
    territories: Territory[],
  ): Territory[] {
    return territories.filter(
      (territory) => !territory.parentId,
    );
  }

  static getAncestors(
    territories: Territory[],
    territoryId: string,
  ): Territory[] {
    const ancestors: Territory[] = [];
    const visited = new Set<string>();

    let current = this.findById(
      territories,
      territoryId,
    );

    while (current?.parentId) {
      if (visited.has(current.id)) {
        break;
      }

      visited.add(current.id);

      const parent = this.findById(
        territories,
        current.parentId,
      );

      if (!parent) {
        break;
      }

      ancestors.unshift(parent);
      current = parent;
    }

    return ancestors;
  }

  static getDescendants(
    territories: Territory[],
    territoryId: string,
  ): Territory[] {
    const descendants: Territory[] = [];
    const visited = new Set<string>();

    const collectChildren = (parentId: string) => {
      if (visited.has(parentId)) {
        return;
      }

      visited.add(parentId);

      const children = this.getChildren(
        territories,
        parentId,
      );

      for (const child of children) {
        descendants.push(child);
        collectChildren(child.id);
      }
    };

    collectChildren(territoryId);

    return descendants;
  }

  static getPath(
    territories: Territory[],
    territoryId: string,
  ): Territory[] {
    const territory = this.findById(
      territories,
      territoryId,
    );

    if (!territory) {
      return [];
    }

    return [
      ...this.getAncestors(
        territories,
        territoryId,
      ),
      territory,
    ];
  }

  static filterByLevel(
    territories: Territory[],
    level: TerritorialLevel,
  ): Territory[] {
    return territories.filter(
      (territory) => territory.level === level,
    );
  }

  static count(
    territories: Territory[],
  ): number {
    return territories.length;
  }

  static countByLevel(
    territories: Territory[],
    level: TerritorialLevel,
  ): number {
    return this.filterByLevel(
      territories,
      level,
    ).length;
  }

  static search(
    territories: Territory[],
    query: string,
  ): Territory[] {
    const normalizedQuery = this.normalize(query);

    if (!normalizedQuery) {
      return [];
    }

    return territories.filter((territory) => {
      const searchableContent = [
        territory.name,
        territory.code,
        territory.slug,
      ]
        .map((value) => this.normalize(value))
        .join(" ");

      return searchableContent.includes(
        normalizedQuery,
      );
    });
  }

  static buildTree(
    territories: Territory[],
    parentId?: string,
  ): TerritoryTreeNode[] {
    return territories
      .filter((territory) =>
        parentId
          ? territory.parentId === parentId
          : !territory.parentId,
      )
      .map((territory) => ({
        ...territory,
        children: this.buildTree(
          territories,
          territory.id,
        ),
      }));
  }

  private static normalize(
    value: string,
  ): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }
}