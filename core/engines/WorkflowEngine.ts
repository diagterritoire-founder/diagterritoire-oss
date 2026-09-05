export type WorkflowStatus =
  | "pending"
  | "running"
  | "completed"
  | "cancelled";

export type WorkflowStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

export type Workflow = {
  id: string;
  territoryId: string;
  title: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
};

export class WorkflowEngine {
  static progress(
    workflow: Workflow,
  ): number {
    if (workflow.steps.length === 0) {
      return 0;
    }

    const completed =
      workflow.steps.filter(
        (step) => step.completed,
      ).length;

    return Math.round(
      (completed / workflow.steps.length) *
        100,
    );
  }

  static isCompleted(
    workflow: Workflow,
  ): boolean {
    return (
      this.progress(workflow) === 100
    );
  }

  static nextStep(
    workflow: Workflow,
  ): WorkflowStep | undefined {
    return workflow.steps.find(
      (step) => !step.completed,
    );
  }
}