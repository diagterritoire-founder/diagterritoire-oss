import assert from "node:assert/strict";
import test from "node:test";

import {
  STRUCTURED_CSV_MAX_ROWS,
  parseStructuredContributionCsvText,
  readStructuredContributionCsv,
} from "../core/imports/StructuredContributionCsv";

test("importe un CSV séparé par des points-virgules", () => {
  const result =
    parseStructuredContributionCsvText(
      [
        "type;title;description;referencePeriod;source",
        "observation;Voirie quartier Nord;Signalement terrain;2026-T3;Services techniques",
        "indicator;Éclairage public;;2026;Service énergie",
      ].join("\n"),
    );

  assert.deepEqual(result.errors, []);
  assert.equal(result.delimiter, ";");
  assert.equal(result.rows.length, 2);
  assert.equal(
    result.rows[0].title,
    "Voirie quartier Nord",
  );
  assert.equal(
    result.rows[1].type,
    "indicator",
  );
});

test("accepte les libellés français et un CSV séparé par des virgules", () => {
  const result =
    parseStructuredContributionCsvText(
      [
        "type,title,description,referencePeriod,source",
        'événement,"Réunion, quartier",,2026-09,Service proximité',
      ].join("\n"),
    );

  assert.deepEqual(result.errors, []);
  assert.equal(result.delimiter, ",");
  assert.equal(result.rows[0].type, "event");
  assert.equal(
    result.rows[0].title,
    "Réunion, quartier",
  );
});

test("refuse une colonne inconnue ou manquante", () => {
  const result =
    parseStructuredContributionCsvText(
      [
        "type;title;description;referencePeriod;inconnue",
        "observation;Test;;;valeur",
      ].join("\n"),
    );

  assert.equal(result.rows.length, 0);
  assert.match(
    result.errors.join(" "),
    /Colonne\(s\) non reconnue\(s\).*inconnue/,
  );
  assert.match(
    result.errors.join(" "),
    /source/,
  );
});

test("signale la ligne lorsque le type ou le titre est invalide", () => {
  const result =
    parseStructuredContributionCsvText(
      [
        "type;title;description;referencePeriod;source",
        "inconnu;Titre;;;Service",
        "observation;;;;Service",
      ].join("\n"),
    );

  assert.equal(result.rows.length, 0);
  assert.match(
    result.errors.join(" "),
    /Ligne 2.*type.*inconnu/i,
  );
  assert.match(
    result.errors.join(" "),
    /Ligne 3.*titre.*obligatoire/i,
  );
});

test("refuse plus de 100 lignes de données", () => {
  const rows = Array.from(
    { length: STRUCTURED_CSV_MAX_ROWS + 1 },
    (_, index) =>
      `observation;Ligne ${index + 1};;;Service`,
  );

  const result =
    parseStructuredContributionCsvText(
      [
        "type;title;description;referencePeriod;source",
        ...rows,
      ].join("\n"),
    );

  assert.equal(result.rows.length, 0);
  assert.match(
    result.errors.join(" "),
    /maximum autorisé est 100/i,
  );
});

test("refuse un fichier qui n’est pas un CSV", async () => {
  const bytes = new TextEncoder().encode(
    "type;title;description;referencePeriod;source\nobservation;Test;;;Service",
  );

  const result = await readStructuredContributionCsv({
    name: "import.xlsx",
    size: bytes.byteLength,
    arrayBuffer: async () =>
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer,
  });

  assert.equal(result.rows.length, 0);
  assert.match(
    result.errors.join(" "),
    /format CSV/i,
  );
});
