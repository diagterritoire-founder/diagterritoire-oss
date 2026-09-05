-- CreateTable
CREATE TABLE "WorkspaceCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceCredential_userId_key" ON "WorkspaceCredential"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceCredential_userId_idx" ON "WorkspaceCredential"("userId");

-- AddForeignKey
ALTER TABLE "WorkspaceCredential" ADD CONSTRAINT "WorkspaceCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WorkspaceUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
