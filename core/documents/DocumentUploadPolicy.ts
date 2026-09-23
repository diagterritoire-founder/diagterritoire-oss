export const MAX_DOCUMENT_UPLOAD_BYTES =
  10 * 1024 * 1024;

export const DOCUMENT_UPLOAD_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.csv,.txt";

type DocumentRule = {
  mimeTypes: readonly string[];
  signature: "pdf" | "zip" | "ole" | "text";
  fallbackMimeType: string;
};

const rules: Record<string, DocumentRule> = {
  pdf: {
    mimeTypes: ["application/pdf"],
    signature: "pdf",
    fallbackMimeType: "application/pdf",
  },
  doc: {
    mimeTypes: ["application/msword"],
    signature: "ole",
    fallbackMimeType: "application/msword",
  },
  docx: {
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    signature: "zip",
    fallbackMimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  xls: {
    mimeTypes: ["application/vnd.ms-excel"],
    signature: "ole",
    fallbackMimeType: "application/vnd.ms-excel",
  },
  xlsx: {
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    signature: "zip",
    fallbackMimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  ppt: {
    mimeTypes: ["application/vnd.ms-powerpoint"],
    signature: "ole",
    fallbackMimeType: "application/vnd.ms-powerpoint",
  },
  pptx: {
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    signature: "zip",
    fallbackMimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
  odt: {
    mimeTypes: ["application/vnd.oasis.opendocument.text"],
    signature: "zip",
    fallbackMimeType: "application/vnd.oasis.opendocument.text",
  },
  ods: {
    mimeTypes: [
      "application/vnd.oasis.opendocument.spreadsheet",
    ],
    signature: "zip",
    fallbackMimeType:
      "application/vnd.oasis.opendocument.spreadsheet",
  },
  csv: {
    mimeTypes: [
      "text/csv",
      "text/plain",
      "application/vnd.ms-excel",
    ],
    signature: "text",
    fallbackMimeType: "text/csv",
  },
  txt: {
    mimeTypes: ["text/plain"],
    signature: "text",
    fallbackMimeType: "text/plain",
  },
};

export type DocumentUploadCandidate = {
  name: string;
  type?: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type ValidatedDocumentUpload = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  bytes: Uint8Array;
};

function extensionOf(fileName: string) {
  const match = /\.([^.]+)$/.exec(fileName);
  return match?.[1]?.toLowerCase() ?? "";
}

export function sanitizeDocumentFileName(
  fileName: string,
) {
  const leaf = fileName
    .split(/[\\/]/)
    .pop()
    ?.replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"|?*]/g, "_")
    .trim();

  if (!leaf) {
    return "document";
  }

  return leaf.slice(0, 180);
}

function hasPrefix(
  bytes: Uint8Array,
  prefix: readonly number[],
) {
  return (
    bytes.length >= prefix.length &&
    prefix.every(
      (value, index) =>
        bytes[index] === value,
    )
  );
}

function signatureMatches(
  signature: DocumentRule["signature"],
  bytes: Uint8Array,
) {
  switch (signature) {
    case "pdf":
      return hasPrefix(
        bytes,
        [0x25, 0x50, 0x44, 0x46, 0x2d],
      );
    case "zip":
      return (
        hasPrefix(bytes, [0x50, 0x4b, 0x03, 0x04]) ||
        hasPrefix(bytes, [0x50, 0x4b, 0x05, 0x06]) ||
        hasPrefix(bytes, [0x50, 0x4b, 0x07, 0x08])
      );
    case "ole":
      return hasPrefix(
        bytes,
        [
          0xd0,
          0xcf,
          0x11,
          0xe0,
          0xa1,
          0xb1,
          0x1a,
          0xe1,
        ],
      );
    case "text":
      return !bytes.some((byte) => byte === 0);
  }
}

export function validateDocumentBytes(input: {
  name: string;
  type?: string;
  size: number;
  bytes: Uint8Array;
}): ValidatedDocumentUpload {
  if (input.size <= 0 || input.bytes.length <= 0) {
    throw new Error(
      "Le fichier sélectionné est vide.",
    );
  }

  if (
    input.size > MAX_DOCUMENT_UPLOAD_BYTES ||
    input.bytes.length > MAX_DOCUMENT_UPLOAD_BYTES
  ) {
    throw new Error(
      "Le fichier dépasse la taille maximale autorisée de 10 Mo.",
    );
  }

  const fileName =
    sanitizeDocumentFileName(input.name);
  const extension = extensionOf(fileName);
  const rule = rules[extension];

  if (!rule) {
    throw new Error(
      "Format de fichier non autorisé. Utilisez PDF, Word, Excel, PowerPoint, OpenDocument, CSV ou TXT.",
    );
  }

  const declaredMimeType =
    input.type?.trim().toLowerCase() ?? "";

  if (
    declaredMimeType &&
    declaredMimeType !== "application/octet-stream" &&
    !rule.mimeTypes.includes(declaredMimeType)
  ) {
    throw new Error(
      "Le type du fichier ne correspond pas à son extension.",
    );
  }

  if (!signatureMatches(rule.signature, input.bytes)) {
    throw new Error(
      "Le contenu du fichier ne correspond pas au format annoncé.",
    );
  }

  return {
    fileName,
    mimeType:
      declaredMimeType &&
      declaredMimeType !== "application/octet-stream"
        ? declaredMimeType
        : rule.fallbackMimeType,
    sizeBytes: input.bytes.length,
    bytes: input.bytes,
  };
}

export async function readAndValidateDocument(
  file: DocumentUploadCandidate,
): Promise<ValidatedDocumentUpload> {
  const bytes = new Uint8Array(
    await file.arrayBuffer(),
  );

  return validateDocumentBytes({
    name: file.name,
    type: file.type,
    size: file.size,
    bytes,
  });
}
