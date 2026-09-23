import type { ReactNode } from "react";

import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  WorkspaceSessionService,
} from "@/core/session/WorkspaceSession";
import { prisma } from "@/lib/prisma";

type ContributionLayoutProps = {
  children: ReactNode;
  params: Promise<{
    territoryId: string;
    serviceId: string;
    contributionId: string;
  }>;
};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} octets`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.ceil(sizeBytes / 1024)} Ko`;
  }

  return `${(
    sizeBytes /
    (1024 * 1024)
  ).toFixed(1)} Mo`;
}

export default async function ContributionLayout({
  children,
  params,
}: ContributionLayoutProps) {
  const {
    territoryId,
    serviceId,
    contributionId,
  } = await params;

  const session =
    await CurrentWorkspaceSession.get();

  if (!session) {
    return children;
  }

  const attachment =
    await prisma.workspaceContributionAttachment.findUnique({
      where: {
        contributionId,
      },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        contribution: {
          select: {
            workspaceId: true,
            serviceId: true,
            territoryId: true,
          },
        },
      },
    });

  const canDisplayAttachment =
    attachment !== null &&
    attachment.contribution.workspaceId ===
      session.workspaceId &&
    attachment.contribution.serviceId === serviceId &&
    attachment.contribution.territoryId ===
      territoryId &&
    WorkspaceSessionService.canAccessService(
      session,
      serviceId,
    );

  return (
    <>
      {children}

      {canDisplayAttachment && attachment ? (
        <aside
          aria-label="Document joint"
          className="fixed bottom-5 right-5 z-50 w-[min(24rem,calc(100vw-2.5rem))] rounded-2xl border border-cyan-200 bg-white p-4 shadow-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Document joint
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-slate-950">
            {attachment.fileName}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {formatFileSize(attachment.sizeBytes)} · {attachment.mimeType}
          </p>

          <a
            href={`/api/espace-metiers/documents/${attachment.id}`}
            className="mt-3 inline-flex rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
          >
            Télécharger le document
          </a>
        </aside>
      ) : null}
    </>
  );
}
