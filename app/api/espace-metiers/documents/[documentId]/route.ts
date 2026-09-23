import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  WorkspaceSessionService,
} from "@/core/session/WorkspaceSession";
import { prisma } from "@/lib/prisma";

function safeHeaderFileName(fileName: string) {
  return fileName
    .replace(/[\r\n"]/g, "_")
    .slice(0, 180);
}

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      documentId: string;
    }>;
  },
) {
  const session =
    await CurrentWorkspaceSession.get();

  if (!session) {
    return new Response("Non authentifié.", {
      status: 401,
    });
  }

  const { documentId } = await params;

  const attachment =
    await prisma.workspaceContributionAttachment.findUnique({
      where: {
        id: documentId,
      },
      include: {
        contribution: {
          select: {
            workspaceId: true,
            serviceId: true,
          },
        },
      },
    });

  if (!attachment) {
    return new Response("Document introuvable.", {
      status: 404,
    });
  }

  if (
    attachment.contribution.workspaceId !==
      session.workspaceId ||
    !WorkspaceSessionService.canAccessService(
      session,
      attachment.contribution.serviceId,
    )
  ) {
    return new Response("Document introuvable.", {
      status: 404,
    });
  }

  const safeName = safeHeaderFileName(
    attachment.fileName,
  );

  return new Response(
    attachment.content as unknown as BodyInit,
    {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(
          attachment.sizeBytes,
        ),
        "Content-Disposition":
          `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(
            attachment.fileName,
          )}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
