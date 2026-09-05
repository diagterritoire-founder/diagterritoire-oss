import type {
  EntityStatus,
  EventSeverity,
  TerritorialEvent,
} from "@/types/domain";

export type EventTimelineGroup = {
  date: string;
  events: TerritorialEvent[];
};

export type EventSummary = {
  total: number;
  active: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  critical: number;
};

export class EventEngine {
  static findById(
    events: TerritorialEvent[],
    id: string,
  ): TerritorialEvent | undefined {
    return events.find(
      (event) => event.id === id,
    );
  }

  static filterByTerritory(
    events: TerritorialEvent[],
    territoryId: string,
  ): TerritorialEvent[] {
    return events.filter(
      (event) =>
        event.territoryIds.includes(
          territoryId,
        ),
    );
  }

  static filterByOrganization(
    events: TerritorialEvent[],
    organizationId: string,
  ): TerritorialEvent[] {
    return events.filter(
      (event) =>
        event.organizationIds?.includes(
          organizationId,
        ),
    );
  }

  static filterByProject(
    events: TerritorialEvent[],
    projectId: string,
  ): TerritorialEvent[] {
    return events.filter(
      (event) =>
        event.projectIds?.includes(
          projectId,
        ),
    );
  }

  static filterBySeverity(
    events: TerritorialEvent[],
    severity: EventSeverity,
  ): TerritorialEvent[] {
    return events.filter(
      (event) =>
        event.severity === severity,
    );
  }

  static filterByStatus(
    events: TerritorialEvent[],
    status: EntityStatus,
  ): TerritorialEvent[] {
    return events.filter(
      (event) => event.status === status,
    );
  }

  static search(
    events: TerritorialEvent[],
    query: string,
  ): TerritorialEvent[] {
    const normalizedQuery =
      this.normalize(query);

    if (!normalizedQuery) {
      return [];
    }

    return events.filter((event) => {
      const searchableContent = [
        event.title,
        event.description ?? "",
        event.category,
        event.severity,
        event.source ?? "",
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

  static getUpcoming(
    events: TerritorialEvent[],
    now = new Date(),
  ): TerritorialEvent[] {
    return events
      .filter(
        (event) =>
          new Date(
            event.startDate,
          ).getTime() > now.getTime(),
      )
      .sort(
        (first, second) =>
          new Date(
            first.startDate,
          ).getTime() -
          new Date(
            second.startDate,
          ).getTime(),
      );
  }

  static getOngoing(
    events: TerritorialEvent[],
    now = new Date(),
  ): TerritorialEvent[] {
    const nowTime = now.getTime();

    return events.filter((event) => {
      const startTime =
        new Date(
          event.startDate,
        ).getTime();

      const endTime = event.endDate
        ? new Date(
            event.endDate,
          ).getTime()
        : undefined;

      return (
        startTime <= nowTime &&
        (endTime === undefined ||
          endTime >= nowTime)
      );
    });
  }

  static getCompleted(
    events: TerritorialEvent[],
    now = new Date(),
  ): TerritorialEvent[] {
    const nowTime = now.getTime();

    return events.filter(
      (event) =>
        event.endDate !== undefined &&
        new Date(
          event.endDate,
        ).getTime() < nowTime,
    );
  }

  static getCritical(
    events: TerritorialEvent[],
  ): TerritorialEvent[] {
    return events.filter(
      (event) =>
        event.severity === "critical",
    );
  }

  static sortByDate(
    events: TerritorialEvent[],
  ): TerritorialEvent[] {
    return [...events].sort(
      (first, second) =>
        new Date(
          first.startDate,
        ).getTime() -
        new Date(
          second.startDate,
        ).getTime(),
    );
  }

  static sortBySeverity(
    events: TerritorialEvent[],
  ): TerritorialEvent[] {
    const priority: Record<
      EventSeverity,
      number
    > = {
      critical: 5,
      high: 4,
      moderate: 3,
      low: 2,
      information: 1,
    };

    return [...events].sort(
      (first, second) =>
        priority[second.severity] -
        priority[first.severity],
    );
  }

  static buildTimeline(
    events: TerritorialEvent[],
  ): EventTimelineGroup[] {
    const groups =
      new Map<
        string,
        TerritorialEvent[]
      >();

    for (const event of this.sortByDate(
      events,
    )) {
      const date =
        event.startDate.slice(0, 10);

      const existing =
        groups.get(date) ?? [];

      groups.set(date, [
        ...existing,
        event,
      ]);
    }

    return Array.from(
      groups.entries(),
    ).map(([date, groupedEvents]) => ({
      date,
      events: groupedEvents,
    }));
  }

  static summarize(
    events: TerritorialEvent[],
    now = new Date(),
  ): EventSummary {
    return {
      total: events.length,
      active: events.filter(
        (event) =>
          event.status === "active",
      ).length,
      upcoming:
        this.getUpcoming(
          events,
          now,
        ).length,
      ongoing:
        this.getOngoing(
          events,
          now,
        ).length,
      completed:
        this.getCompleted(
          events,
          now,
        ).length,
      critical:
        this.getCritical(
          events,
        ).length,
    };
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