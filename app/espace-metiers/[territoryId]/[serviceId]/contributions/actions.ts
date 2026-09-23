"use server";

import {
  createHash,
  randomUUID,
} from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  WorkspaceContributionService,
} from "@/core/services/WorkspaceContributionService";
import {
  readAndValidateDocument,
  type DocumentUploadCandidate,
} from "@/core/documents/DocumentUploadPolicy";
import { prisma } from "@/lib/prisma";
import type {
  ContributionType,
} from "@/types/workspace";

const contributionTypes = [
  "indicator",
  "project",
  "action",
  "document",
  "event",
  "alert",
  "observation",
  "other",
] as const;

function isContributionType(
  value: string,
): value is ContributionType {
  return (
    contributionTypes as readonly string[]
  ).includes(value);
}

function requiredString(
  formData: FormData,
  name: string,
): string {
  const value = formData.get(name);

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      "Champ obligatoire invalide : " + name + ".",
    );
  }

  return value.trim();
}

function optionalString(
  formData: FormData,
  name: string,
): string | undefined {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim() || undefined;
}

function contributionType(
  formData: FormData,
): ContributionType {
  const value = requiredString(
    formData,
    "type",
  );

  if (!isContributionType(value)) {
    throw new Error(
      "Type de contribution invalide.",
    );
  }

  return value;
}

function requiredDocumentFile(
  formData: FormData,
): DocumentUploadCandidate {
  const value = formData.get("file");

  if (
    !value ||
    typeof value === "string" ||
    typeof value.name !== "string" ||
    typeof value.size !== "number" ||
    typeof value.arrayBuffer !== "function"
  ) {
    throw new Error(
      "Sélectionnez un fichier à téléverser.",
    );
  }

  return value;
}

function contributionPaths(contribution: {
  id: string;
  territoryId: string;
  serviceId: string;
}) {
  const listPath =
    "/espace-metiers/" +
    contribution.territoryId +
    "/" +
    contribution.serviceId +
    "/contributions";

  return {
    listPath,
    detailPath:
      listPath + "/" + contribution.id,
  };
}

export async function createContributionDraftAction(
  formData: FormData,
) {
  const territoryId = requiredString(
    formData,
    "territoryId",
  );

  const serviceId = requiredString(
    formData,
    "serviceId",
  );

  const session =
    await CurrentWorkspaceSession.get();

  if (!session) {
    throw new Error(
      "Session utilisateur absente.",
    );
  }

  const contribution =
    await WorkspaceContributionService.createDraft(
      session,
      {
        territoryId,
        serviceId,
        type: contributionType(formData),
        title: requiredString(
          formData,
          "title",
        ),
        description: optionalString(
          formData,
          "description",
        ),
        source: optionalString(
          formData,
          "source",
        ),
        referencePeriod: optionalString(
          formData,
          "referencePeriod",
        ),
      },
    );

  const {
    listPath,
    detailPath,
  } = contributionPaths(contribution);

  revalidatePath(listPath);
  revalidatePath(detailPath);

  redirect(detailPath);
}

export async function createDocumentDraftWithUploadAction(
  formData: FormData,
) {
  const territoryId = requiredString(
    formData,
    "territoryId",
  );

  const serviceId = requiredString(
    formData,
    "serviceId",
  );

  const upload = await readAndValidateDocument(
    requiredDocumentFile(formData),
  );

  const session =
    await CurrentWorkspaceSession.get();

  if (!session) {
    throw new Error(
      "Session utilisateur absente.",
    );
  }

  const attachmentId = randomUUID();
  const source = optionalString(
    formData,
    "source",
  );

  const contribution =
    await WorkspaceContributionService.createDraft(
      session,
      {
        territoryId,
        serviceId,
        type: "document",
        title: requiredString(
          formData,
          "title",
        ),
        description: optionalString(
          formData,
          "description",
        ),
        source:
          source ??
          `Fichier téléversé : ${upload.fileName}`,
        referencePeriod: optionalString(
          formData,
          "referencePeriod",
        ),
      },
    );

  try {
    await prisma.workspaceContributionAttachment.create({
      data: {
        id: attachmentId,
        contributionId: contribution.id,
        fileName: upload.fileName,
        mimeType: upload.mimeType,
        sizeBytes: upload.sizeBytes,
        sha256: createHash("sha256")
          .update(upload.bytes)
          .digest("hex"),
        content: Uint8Array.from(upload.bytes),
        createdAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.workspaceContribution.deleteMany({
      where: {
        id: contribution.id,
        authorUserId: session.user.id,
        status: "draft",
      },
    });

    throw error;
  }

  const {
    listPath,
    detailPath,
  } = contributionPaths(contribution);

  revalidatePath(listPath);
  revalidatePath(detailPath);

  redirect(detailPath);
}

export async function updateContributionDraftAction(
  formData: FormData,
) {
  const contributionId = requiredString(
    formData,
    "contributionId",
  );

  const session =
    await CurrentWorkspaceSession.get();

  if (!session) {
    throw new Error(
      "Session utilisateur absente.",
    );
  }

  const contribution =
    await WorkspaceContributionService.updateDraft(
      session,
      contributionId,
      {
        type: contributionType(formData),
        title: requiredString(
          formData,
          "title",
        ),
        description: optionalString(
          formData,
          "description",
        ),
        source: optionalString(
          formData,
          "source",
        ),
        referencePeriod: optionalString(
          formData,
          "referencePeriod",
        ),
      },
    );

  const {
    listPath,
    detailPath,
  } = contributionPaths(contribution);

  revalidatePath(listPath);
  revalidatePath(detailPath);

  redirect(detailPath);
}
