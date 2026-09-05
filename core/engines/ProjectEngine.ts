export type ProjectStatus =
  | "planned"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

export type ProjectPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ProjectMilestone = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
};

export type Project = {
  id: string;
  territoryId: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  startDate?: string;
  endDate?: string;
  milestones: ProjectMilestone[];
};

export class ProjectEngine {
  static calculateProgress(
    project: Project,
  ): number {
    if (project.milestones.length === 0) {
      return project.progress;
    }

    const completed =
      project.milestones.filter(
        (milestone) => milestone.completed,
      ).length;

    return Math.round(
      (completed / project.milestones.length) *
        100,
    );
  }

  static isCompleted(
    project: Project,
  ): boolean {
    return (
      this.calculateProgress(project) ===
      100
    );
  }

  static nextMilestone(
    project: Project,
  ): ProjectMilestone | undefined {
    return project.milestones.find(
      (milestone) => !milestone.completed,
    );
  }
}