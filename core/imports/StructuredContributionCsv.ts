import type {
  ContributionType,
} from "@/types/workspace";

export const STRUCTURED_CSV_MAX_BYTES =
  1024 * 1024;
export const STRUCTURED_CSV_MAX_ROWS = 100;

export const STRUCTURED_CSV_ACCEPT =
  ".csv,text/csv,application/csv,application/vnd.ms-excel,text/plain";

export type StructuredContributionImportRow = {
  type: ContributionType;
  title: string;
  description?: string;
  referencePeriod?: string;
  source?: string;
};

export type StructuredContributionCsvResult = {
  rows: StructuredContributionImportRow[];
  errors: string[];
  delimiter: "," | ";";
};

export type StructuredCsvFileCandidate = {
  name: string;
  size: number;
  type?: string;
  arrayBuffer(): Promise<ArrayBuffer>;
};

type CanonicalHeader =
  | "type"
  | "title"
  | "description"
  | "referencePeriod"
  | "source";

type ParsedCsvRow = {
  line: number;
  cells: string[];
};

const expectedHeaders: readonly CanonicalHeader[] = [
  "type",
  "title",
  "description",
  "referencePeriod",
  "source",
];

const headerAliases: Record<
  string,
  CanonicalHeader
> = {
  type: "type",
  title: "title",
  titre: "title",
  description: "description",
  referenceperiod: "referencePeriod",
  reference_period: "referencePeriod",
  periode: "referencePeriod",
  source: "source",
};

const typeAliases: Record<
  string,
  ContributionType
> = {
  indicator: "indicator",
  indicateur: "indicator",
  project: "project",
  projet: "project",
  action: "action",
  document: "document",
  event: "event",
  evenement: "event",
  alert: "alert",
  alerte: "alert",
  observation: "observation",
  other: "other",
  autre: "other",
};

function normalizeToken(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function countDelimiter(
  line: string,
  delimiter: "," | ";",
) {
  let count = 0;
  let quoted = false;

  for (
    let index = 0;
    index < line.length;
    index += 1
  ) {
    const character = line[index];

    if (character === '"') {
      if (
        quoted &&
        line[index + 1] === '"'
      ) {
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (
      character === delimiter &&
      !quoted
    ) {
      count += 1;
    }
  }

  return count;
}

function detectDelimiter(
  text: string,
): "," | ";" {
  const firstLine =
    text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .find((line) => line.trim());

  if (!firstLine) {
    return ";";
  }

  const semicolons = countDelimiter(
    firstLine,
    ";",
  );
  const commas = countDelimiter(
    firstLine,
    ",",
  );

  return semicolons >= commas
    ? ";"
    : ",";
}

function parseCsv(
  text: string,
  delimiter: "," | ";",
): {
  rows: ParsedCsvRow[];
  syntaxError?: string;
} {
  const rows: ParsedCsvRow[] = [];
  let cells: string[] = [];
  let cell = "";
  let quoted = false;
  let line = 1;
  let rowStartLine = 1;

  const pushRow = () => {
    cells.push(cell);
    rows.push({
      line: rowStartLine,
      cells,
    });
    cells = [];
    cell = "";
  };

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    const character = text[index];

    if (character === '"') {
      if (
        quoted &&
        text[index + 1] === '"'
      ) {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (
      character === delimiter &&
      !quoted
    ) {
      cells.push(cell);
      cell = "";
      continue;
    }

    if (
      character === "\n" &&
      !quoted
    ) {
      pushRow();
      line += 1;
      rowStartLine = line;
      continue;
    }

    if (
      character === "\r" &&
      !quoted
    ) {
      continue;
    }

    cell += character;

    if (character === "\n") {
      line += 1;
    }
  }

  if (quoted) {
    return {
      rows,
      syntaxError:
        `Ligne ${rowStartLine} : guillemet non fermé dans le fichier CSV.`,
    };
  }

  if (
    cell.length > 0 ||
    cells.length > 0
  ) {
    pushRow();
  }

  return { rows };
}

function cleanOptional(
  value: string | undefined,
  maxLength: number,
  label: string,
  line: number,
  errors: string[],
) {
  const cleaned = value?.trim();

  if (!cleaned) {
    return undefined;
  }

  if (cleaned.length > maxLength) {
    errors.push(
      `Ligne ${line} : ${label} dépasse ${maxLength} caractères.`,
    );
  }

  return cleaned;
}

export function parseStructuredContributionCsvText(
  text: string,
): StructuredContributionCsvResult {
  const delimiter = detectDelimiter(text);
  const parsed = parseCsv(
    text.replace(/^\uFEFF/, ""),
    delimiter,
  );
  const errors: string[] = [];

  if (parsed.syntaxError) {
    return {
      rows: [],
      errors: [parsed.syntaxError],
      delimiter,
    };
  }

  const nonEmptyRows = parsed.rows.filter(
    (row) =>
      row.cells.some(
        (cell) => cell.trim(),
      ),
  );

  if (nonEmptyRows.length === 0) {
    return {
      rows: [],
      errors: [
        "Le fichier CSV est vide.",
      ],
      delimiter,
    };
  }

  const headerRow = nonEmptyRows[0];
  const mappedHeaders: Array<
    CanonicalHeader | undefined
  > = headerRow.cells.map((cell) =>
    headerAliases[normalizeToken(cell)],
  );

  const unknownHeaders =
    headerRow.cells.filter(
      (cell, index) =>
        cell.trim() &&
        !mappedHeaders[index],
    );

  if (unknownHeaders.length > 0) {
    errors.push(
      "Colonne(s) non reconnue(s) : " +
        unknownHeaders.join(", ") +
        ".",
    );
  }

  const presentHeaders =
    mappedHeaders.filter(
      (value): value is CanonicalHeader =>
        Boolean(value),
    );

  const duplicateHeaders =
    presentHeaders.filter(
      (value, index) =>
        presentHeaders.indexOf(value) !==
        index,
    );

  if (duplicateHeaders.length > 0) {
    errors.push(
      "Colonne(s) en double : " +
        [...new Set(duplicateHeaders)].join(
          ", ",
        ) +
        ".",
    );
  }

  const missingHeaders =
    expectedHeaders.filter(
      (header) =>
        !presentHeaders.includes(header),
    );

  if (missingHeaders.length > 0) {
    errors.push(
      "Colonne(s) obligatoire(s) absente(s) : " +
        missingHeaders.join(", ") +
        ".",
    );
  }

  if (errors.length > 0) {
    return {
      rows: [],
      errors,
      delimiter,
    };
  }

  const dataRows = nonEmptyRows.slice(1);

  if (dataRows.length === 0) {
    return {
      rows: [],
      errors: [
        "Le fichier contient un en-tête mais aucune ligne de données.",
      ],
      delimiter,
    };
  }

  if (
    dataRows.length >
    STRUCTURED_CSV_MAX_ROWS
  ) {
    return {
      rows: [],
      errors: [
        `Le fichier contient ${dataRows.length} lignes de données. Le maximum autorisé est ${STRUCTURED_CSV_MAX_ROWS}.`,
      ],
      delimiter,
    };
  }

  const indexByHeader = new Map<
    CanonicalHeader,
    number
  >();

  mappedHeaders.forEach(
    (header, index) => {
      if (header) {
        indexByHeader.set(
          header,
          index,
        );
      }
    },
  );

  const rows: StructuredContributionImportRow[] = [];

  for (const row of dataRows) {
    if (
      row.cells.length >
      headerRow.cells.length
    ) {
      errors.push(
        `Ligne ${row.line} : trop de colonnes.`,
      );
      continue;
    }

    const value = (
      header: CanonicalHeader,
    ) =>
      row.cells[
        indexByHeader.get(header) ?? -1
      ] ?? "";

    const rawType = normalizeToken(
      value("type"),
    );
    const type = typeAliases[rawType];

    if (!type) {
      errors.push(
        `Ligne ${row.line} : type « ${value("type").trim() || "vide"} » non reconnu.`,
      );
    }

    const title = value("title").trim();

    if (!title) {
      errors.push(
        `Ligne ${row.line} : le titre est obligatoire.`,
      );
    } else if (title.length > 200) {
      errors.push(
        `Ligne ${row.line} : le titre dépasse 200 caractères.`,
      );
    }

    const description = cleanOptional(
      value("description"),
      5000,
      "la description",
      row.line,
      errors,
    );
    const referencePeriod = cleanOptional(
      value("referencePeriod"),
      100,
      "la période de référence",
      row.line,
      errors,
    );
    const source = cleanOptional(
      value("source"),
      500,
      "la source",
      row.line,
      errors,
    );

    if (type && title) {
      rows.push({
        type,
        title,
        description,
        referencePeriod,
        source,
      });
    }
  }

  return {
    rows:
      errors.length === 0
        ? rows
        : [],
    errors,
    delimiter,
  };
}

export async function readStructuredContributionCsv(
  candidate: StructuredCsvFileCandidate,
): Promise<StructuredContributionCsvResult> {
  const name = candidate.name.trim();

  if (!name.toLowerCase().endsWith(".csv")) {
    return {
      rows: [],
      errors: [
        "Le fichier doit être au format CSV (.csv).",
      ],
      delimiter: ";",
    };
  }

  if (
    candidate.size <= 0 ||
    candidate.size > STRUCTURED_CSV_MAX_BYTES
  ) {
    return {
      rows: [],
      errors: [
        "Le fichier CSV doit contenir des données et ne pas dépasser 1 Mo.",
      ],
      delimiter: ";",
    };
  }

  const bytes = await candidate.arrayBuffer();

  if (
    bytes.byteLength >
    STRUCTURED_CSV_MAX_BYTES
  ) {
    return {
      rows: [],
      errors: [
        "Le fichier CSV dépasse la taille maximale de 1 Mo.",
      ],
      delimiter: ";",
    };
  }

  let text: string;

  try {
    text = new TextDecoder(
      "utf-8",
      { fatal: true },
    ).decode(bytes);
  } catch {
    return {
      rows: [],
      errors: [
        "Le fichier CSV doit être encodé en UTF-8.",
      ],
      delimiter: ";",
    };
  }

  if (text.includes("\u0000")) {
    return {
      rows: [],
      errors: [
        "Le fichier CSV contient des caractères non valides.",
      ],
      delimiter: ";",
    };
  }

  return parseStructuredContributionCsvText(
    text,
  );
}
