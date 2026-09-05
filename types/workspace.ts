export type WorkspaceStatus =
  | "active"
  | "inactive"
  | "archived";

export type WorkspaceServiceCategory =
  | "general_management"
  | "finance"
  | "technical_services"
  | "urban_planning"
  | "land_management"
  | "education"
  | "school_fund"
  | "culture"
  | "extracurricular_activities"
  | "social"
  | "ccas"
  | "associations"
  | "city_policy"
  | "economic_development"
  | "environment"
  | "human_resources"
  | "public_procurement"
  | "other";

export type WorkspaceRole =
  | "executive"
  | "general_management"
  | "service_manager"
  | "contributor"
  | "validator"
  | "observer"
  | "administrator";

export type WorkspacePermission =
  | "workspace:view"
  | "service:view"
  | "service:manage"
  | "contribution:create"
  | "contribution:update"
  | "contribution:submit"
  | "contribution:validate"
  | "contribution:reject"
  | "contribution:publish"
  | "project:view"
  | "project:manage"
  | "indicator:view"
  | "indicator:manage"
  | "document:view"
  | "document:manage"
  | "decision:view"
  | "decision:manage"
  | "administration:manage";

export type Workspace = {
  id: string;
  organizationId: string;
  territoryId: string;
  name: string;
  slug: string;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceService = {
  id: string;
  workspaceId: string;
  organizationId?: string;
  parentServiceId?: string;
  name: string;
  slug: string;
  category: WorkspaceServiceCategory;
  description?: string;
  managerUserId?: string;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceUser = {
  id: string;
  workspaceId: string;
  email: string;
  displayName: string;
  title?: string;
  serviceIds: string[];
  roles: WorkspaceRole[];
  permissions: WorkspacePermission[];
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
};

export type ContributionStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "validated"
  | "rejected"
  | "published"
  | "archived";

export type ContributionType =
  | "indicator"
  | "project"
  | "action"
  | "document"
  | "event"
  | "alert"
  | "observation"
  | "other";

export type WorkspaceContribution = {
  id: string;
  workspaceId: string;
  serviceId: string;
  territoryId: string;
  organizationId: string;
  authorUserId: string;
  validatorUserId?: string;
  type: ContributionType;
  title: string;
  description?: string;
  status: ContributionStatus;
  indicatorId?: string;
  projectId?: string;
  knowledgeId?: string;
  exchangeId?: string;
  source?: string;
  referencePeriod?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  validatedAt?: string;
  publishedAt?: string;
};

export type ContributionHistoryEntry = {
  id: string;
  contributionId: string;
  actorUserId: string;
  fromStatus?: ContributionStatus;
  toStatus: ContributionStatus;
  comment?: string;
  createdAt: string;
};
