import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_DOCUMENT_UPLOAD_BYTES,
  sanitizeDocumentFileName,
  validateDocumentBytes,
} from "../core/documents/DocumentUploadPolicy";

test("accepte un PDF valide", () => {
  const bytes = new Uint8Array([
    0x25,
    0x50,
    0x44,
    0x46,
    0x2d,
    0x31,
    0x2e,
    0x37,
  ]);

  const result = validateDocumentBytes({
    name: "rapport.pdf",
    type: "application/pdf",
    size: bytes.length,
    bytes,
  });

  assert.equal(result.fileName, "rapport.pdf");
  assert.equal(result.mimeType, "application/pdf");
});

test("refuse une extension non autorisée", () => {
  assert.throws(
    () =>
      validateDocumentBytes({
        name: "programme.exe",
        type: "application/octet-stream",
        size: 4,
        bytes: new Uint8Array([1, 2, 3, 4]),
      }),
    /Format de fichier non autorisé/,
  );
});

test("refuse un faux PDF", () => {
  assert.throws(
    () =>
      validateDocumentBytes({
        name: "rapport.pdf",
        type: "application/pdf",
        size: 4,
        bytes: new Uint8Array([1, 2, 3, 4]),
      }),
    /contenu du fichier ne correspond pas/i,
  );
});

test("refuse un fichier de plus de 10 Mo", () => {
  const bytes = new Uint8Array(
    MAX_DOCUMENT_UPLOAD_BYTES + 1,
  );

  assert.throws(
    () =>
      validateDocumentBytes({
        name: "rapport.txt",
        type: "text/plain",
        size: bytes.length,
        bytes,
      }),
    /taille maximale autorisée de 10 Mo/,
  );
});

test("neutralise les caractères dangereux du nom", () => {
  assert.equal(
    sanitizeDocumentFileName(
      "..\\rapport:<2026>?.pdf",
    ),
    "rapport__2026__.pdf",
  );
});
