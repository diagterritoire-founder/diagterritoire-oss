-- CreateTable
CREATE TABLE "CouncilPreparationState" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "sessionDate" TEXT,
    "sessionTime" TEXT,
    "sessionLocation" TEXT,
    "sessionSubject" TEXT,
    "followUp" JSONB,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouncilPreparationState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CouncilPreparationState_workspaceId_territoryId_key" ON "CouncilPreparationState"("workspaceId", "territoryId");

-- CreateIndex
CREATE INDEX "CouncilPreparationState_territoryId_idx" ON "CouncilPreparationState"("territoryId");

-- CreateIndex
CREATE INDEX "CouncilPreparationState_updatedAt_idx" ON "CouncilPreparationState"("updatedAt");

-- AddForeignKey
ALTER TABLE "CouncilPreparationState" ADD CONSTRAINT "CouncilPreparationState_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
