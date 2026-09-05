-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceService" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "organizationId" TEXT,
    "parentServiceId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "managerUserId" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceUser" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "title" TEXT,
    "serviceIds" JSONB NOT NULL,
    "roles" JSONB NOT NULL,
    "permissions" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceContribution" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "validatorUserId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "indicatorId" TEXT,
    "projectId" TEXT,
    "knowledgeId" TEXT,
    "exchangeId" TEXT,
    "source" TEXT,
    "referencePeriod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "WorkspaceContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContributionHistoryEntry" (
    "id" TEXT NOT NULL,
    "contributionId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionHistoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_territoryId_idx" ON "Workspace"("territoryId");

-- CreateIndex
CREATE INDEX "Workspace_organizationId_idx" ON "Workspace"("organizationId");

-- CreateIndex
CREATE INDEX "Workspace_status_idx" ON "Workspace"("status");

-- CreateIndex
CREATE INDEX "WorkspaceService_workspaceId_idx" ON "WorkspaceService"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceService_parentServiceId_idx" ON "WorkspaceService"("parentServiceId");

-- CreateIndex
CREATE INDEX "WorkspaceService_category_idx" ON "WorkspaceService"("category");

-- CreateIndex
CREATE INDEX "WorkspaceService_status_idx" ON "WorkspaceService"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceService_workspaceId_slug_key" ON "WorkspaceService"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "WorkspaceUser_workspaceId_idx" ON "WorkspaceUser"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceUser_status_idx" ON "WorkspaceUser"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceUser_workspaceId_email_key" ON "WorkspaceUser"("workspaceId", "email");

-- CreateIndex
CREATE INDEX "WorkspaceContribution_workspaceId_idx" ON "WorkspaceContribution"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceContribution_serviceId_idx" ON "WorkspaceContribution"("serviceId");

-- CreateIndex
CREATE INDEX "WorkspaceContribution_territoryId_idx" ON "WorkspaceContribution"("territoryId");

-- CreateIndex
CREATE INDEX "WorkspaceContribution_status_idx" ON "WorkspaceContribution"("status");

-- CreateIndex
CREATE INDEX "WorkspaceContribution_authorUserId_idx" ON "WorkspaceContribution"("authorUserId");

-- CreateIndex
CREATE INDEX "WorkspaceContribution_validatorUserId_idx" ON "WorkspaceContribution"("validatorUserId");

-- CreateIndex
CREATE INDEX "WorkspaceContribution_updatedAt_idx" ON "WorkspaceContribution"("updatedAt");

-- CreateIndex
CREATE INDEX "ContributionHistoryEntry_contributionId_idx" ON "ContributionHistoryEntry"("contributionId");

-- CreateIndex
CREATE INDEX "ContributionHistoryEntry_actorUserId_idx" ON "ContributionHistoryEntry"("actorUserId");

-- CreateIndex
CREATE INDEX "ContributionHistoryEntry_createdAt_idx" ON "ContributionHistoryEntry"("createdAt");

-- AddForeignKey
ALTER TABLE "WorkspaceService" ADD CONSTRAINT "WorkspaceService_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceService" ADD CONSTRAINT "WorkspaceService_parentServiceId_fkey" FOREIGN KEY ("parentServiceId") REFERENCES "WorkspaceService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceContribution" ADD CONSTRAINT "WorkspaceContribution_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceContribution" ADD CONSTRAINT "WorkspaceContribution_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "WorkspaceService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceContribution" ADD CONSTRAINT "WorkspaceContribution_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "WorkspaceUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceContribution" ADD CONSTRAINT "WorkspaceContribution_validatorUserId_fkey" FOREIGN KEY ("validatorUserId") REFERENCES "WorkspaceUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionHistoryEntry" ADD CONSTRAINT "ContributionHistoryEntry_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "WorkspaceContribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributionHistoryEntry" ADD CONSTRAINT "ContributionHistoryEntry_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "WorkspaceUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
