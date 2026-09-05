export type EntityStatus =
  | "draft"
  | "active"
  | "inactive"
  | "archived";

export type TerritorialLevel =
  | "country"
  | "metropolitan_area"
  | "overseas_area"
  | "region"
  | "department"
  | "special_collectivity"
  | "epci"
  | "commune"
  | "village"
  | "district"
  | "iris"
  | "functional_area";

export type OrganizationType =
  | "state_administration"
  | "local_authority"
  | "public_establishment"
  | "consular_chamber"
  | "public_company"
  | "private_company"
  | "association"
  | "agency"
  | "operator"
  | "mixed_union"
  | "educational_establishment"
  | "health_establishment"
  | "social_establishment"
  | "other";

export type IndicatorValueType =
  | "number"
  | "percentage"
  | "currency"
  | "duration"
  | "score"
  | "text"
  | "boolean";

export type ProjectStatus =
  | "planned"
  | "approved"
  | "in_progress"
  | "suspended"
  | "delayed"
  | "completed"
  | "cancelled";

export type EventSeverity =
  | "information"
  | "low"
  | "moderate"
  | "high"
  | "critical";

export type KnowledgeType =
  | "report"
  | "audit"
  | "study"
  | "deliberation"
  | "agreement"
  | "contract"
  | "minutes"
  | "recommendation"
  | "legal_document"
  | "technical_document"
  | "feedback"
  | "other";

export type Territory = {
  id: string;
  code: string;
  name: string;
  slug: string;
  level: TerritorialLevel;
  parentId?: string;
  geometryReference?: string;
  organizationIds?: string[];
  status: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type Organization = {
  id: string;
  name: string;
  acronym?: string;
  slug: string;
  type: OrganizationType;
  siren?: string;
  territoryIds: string[];
  parentOrganizationId?: string;
  status: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type Indicator = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit?: string;
  valueType: IndicatorValueType;
  source?: string;
  calculationMethod?: string;
  updateFrequency?: string;
  territoryIds?: string[];
  organizationIds?: string[];
  status: EntityStatus;
};

export type IndicatorObservation = {
  id: string;
  indicatorId: string;
  territoryId?: string;
  organizationId?: string;
  periodStart: string;
  periodEnd?: string;
  numericValue?: number;
  textValue?: string;
  booleanValue?: boolean;
  source?: string;
  confidenceLevel?: number;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  territoryIds: string[];
  organizationIds: string[];
  status: ProjectStatus;
  budgetPlanned?: number;
  budgetCommitted?: number;
  budgetSpent?: number;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  progress?: number;
  indicatorIds?: string[];
  riskIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type TerritorialEvent = {
  id: string;
  title: string;
  description?: string;
  category: string;
  severity: EventSeverity;
  territoryIds: string[];
  organizationIds?: string[];
  projectIds?: string[];
  startDate: string;
  endDate?: string;
  source?: string;
  status: EntityStatus;
};

export type Knowledge = {
  id: string;
  title: string;
  type: KnowledgeType;
  summary?: string;
  territoryIds: string[];
  organizationIds?: string[];
  projectIds?: string[];
  eventIds?: string[];
  documentUrl?: string;
  source?: string;
  publicationDate?: string;
  confidentiality:
    | "public"
    | "internal"
    | "sensitive"
    | "confidential";
  status: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
};
