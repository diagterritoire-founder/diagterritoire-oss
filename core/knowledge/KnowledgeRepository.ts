import type {
  Knowledge,
  KnowledgeType,
} from "@/types/domain";

export type KnowledgeSearchFilters = {
  query?: string;
  type?: KnowledgeType;
  territoryId?: string;
  organizationId?: string;
  projectId?: string;
  eventId?: string;
};

export interface KnowledgeRepository {
  findAll(): Promise<Knowledge[]>;

  findById(
    id: string,
  ): Promise<Knowledge | undefined>;

  search(
    filters: KnowledgeSearchFilters,
  ): Promise<Knowledge[]>;

  save(
    knowledge: Knowledge,
  ): Promise<Knowledge>;

  delete(
    id: string,
  ): Promise<boolean>;
}

export class InMemoryKnowledgeRepository
  implements KnowledgeRepository
{
  private readonly items =
    new Map<string, Knowledge>();

  constructor(
    initialItems: Knowledge[] = [],
  ) {
    for (const item of initialItems) {
      this.items.set(item.id, item);
    }
  }

  async findAll(): Promise<Knowledge[]> {
    return Array.from(
      this.items.values(),
    );
  }

  async findById(
    id: string,
  ): Promise<Knowledge | undefined> {
    return this.items.get(id);
  }

  async search(
    filters: KnowledgeSearchFilters,
  ): Promise<Knowledge[]> {
    const items = await this.findAll();

    const normalizedQuery =
      filters.query
        ? this.normalize(filters.query)
        : undefined;

    return items.filter((item) => {
      if (
        filters.type &&
        item.type !== filters.type
      ) {
        return false;
      }

      if (
        filters.territoryId &&
        !item.territoryIds.includes(
          filters.territoryId,
        )
      ) {
        return false;
      }

      if (
        filters.organizationId &&
        !item.organizationIds?.includes(
          filters.organizationId,
        )
      ) {
        return false;
      }

      if (
        filters.projectId &&
        !item.projectIds?.includes(
          filters.projectId,
        )
      ) {
        return false;
      }

      if (
        filters.eventId &&
        !item.eventIds?.includes(
          filters.eventId,
        )
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableContent = [
        item.title,
        item.summary ?? "",
        item.source ?? "",
        item.type,
      ]
        .map((value) =>
          this.normalize(value),
        )
        .join(" ");

      return searchableContent.includes(
        normalizedQuery,
      );
    });
  }

  async save(
    knowledge: Knowledge,
  ): Promise<Knowledge> {
    this.items.set(
      knowledge.id,
      knowledge,
    );

    return knowledge;
  }

  async delete(
    id: string,
  ): Promise<boolean> {
    return this.items.delete(id);
  }

  private normalize(
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