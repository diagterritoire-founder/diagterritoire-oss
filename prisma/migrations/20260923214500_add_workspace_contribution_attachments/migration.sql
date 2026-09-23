-- CreateTable
CREATE TABLE "WorkspaceContributionAttachment" (
    "id" TEXT NOT NULL,
    "contributionId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "content" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceContributionAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceContributionAttachment_contributionId_key" ON "WorkspaceContributionAttachment"("contributionId");

-- CreateIndex
CREATE INDEX "WorkspaceContributionAttachment_sha256_idx" ON "WorkspaceContributionAttachment"("sha256");

-- CreateIndex
CREATE INDEX "WorkspaceContributionAttachment_createdAt_idx" ON "WorkspaceContributionAttachment"("createdAt");

-- AddForeignKey
ALTER TABLE "WorkspaceContributionAttachment" ADD CONSTRAINT "WorkspaceContributionAttachment_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "WorkspaceContribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
