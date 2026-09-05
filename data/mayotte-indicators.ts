import type { DiagnosticIndicator } from "@/core/engines";
import type { Indicator } from "@/types/domain";

import {
  mayotteCommunes,
  mayotteDepartment,
  mayotteEpcis,
} from "./mayotte-territories";

import {
  MAYOTTE_STATISTICS,
} from "./mayotte-statistics";

import {
  MAYOTTE_FIXED_COVERAGE_2026_T1,
} from "./mayotte-digital-coverage";

const territories = [
  ...(mayotteDepartment ? [mayotteDepartment] : []),
  ...mayotteEpcis,
  ...mayotteCommunes,
];

const definitions: Omit<Indicator, "territoryIds">[] = [
  {
    id: "population-2026",
    code: "POP_2026",
    name: "Population municipale",
    description:
      "Population recensée entre novembre 2025 et janvier 2026.",
    category: "Démographie",
    unit: "habitants",
    valueType: "number",
    source: "Insee, recensement de Mayotte 2025-2026",
    updateFrequency: "Recensement",
    status: "active",
  },
  {
    id: "population-growth-2017-2026",
    code: "POP_GROWTH_2017_2026",
    name: "Évolution de la population 2017-2026",
    description:
      "Variation de la population municipale depuis 2017.",
    category: "Démographie",
    unit: "%",
    valueType: "percentage",
    source: "Insee, recensements 2017 et 2025-2026",
    updateFrequency: "Recensement",
    status: "active",
  },
  {
    id: "employment-2017",
    code: "EMPLOYMENT_2017",
    name: "Part des 15 ans ou plus ayant un emploi",
    description:
      "Part des personnes de 15 ans ou plus déclarant occuper un emploi.",
    category: "Emploi",
    unit: "%",
    valueType: "percentage",
    source: "Insee, recensement 2017, tableau IND8",
    updateFrequency: "Recensement",
    status: "active",
  },
  {
    id: "qualified-2017",
    code: "QUALIFIED_2017",
    name: "Part ayant un diplôme qualifiant",
    description:
      "Part des non-scolarisés titulaires au minimum d’un CAP ou BEP.",
    category: "Formation",
    unit: "%",
    valueType: "percentage",
    source: "Insee, recensement 2017, tableau IND9",
    updateFrequency: "Recensement",
    status: "active",
  },
  {
    id: "water-inside-2017",
    code: "WATER_INSIDE_2017",
    name: "Résidences avec eau à l’intérieur",
    description:
      "Part des résidences principales disposant d’eau à l’intérieur.",
    category: "Habitat",
    unit: "%",
    valueType: "percentage",
    source: "Insee, recensement 2017, tableau PRINC8",
    updateFrequency: "Recensement",
    status: "active",
  },
  {
    id: "electricity-2017",
    code: "ELECTRICITY_2017",
    name: "Résidences avec électricité",
    description:
      "Part des résidences principales disposant d’électricité.",
    category: "Habitat",
    unit: "%",
    valueType: "percentage",
    source: "Insee, recensement 2017, tableau PRINC10",
    updateFrequency: "Recensement",
    status: "active",
  },
  {
    id: "internet-2017",
    code: "INTERNET_2017",
    name: "Résidences équipées d’Internet",
    description:
      "Part des résidences principales équipées d’une connexion Internet.",
    category: "Numérique",
    unit: "%",
    valueType: "percentage",
    source: "Insee, recensement 2017, tableau PRINC20",
    updateFrequency: "Recensement",
    status: "active",
  },
  {
    id: "fixed-thd-coverage-2026",
    code: "FIXED_THD_30_2026_T1",
    name: "Éligibilité fixe à au moins 30 Mbit/s",
    description:
      "Part des locaux éligibles à un débit fixe d’au moins 30 Mbit/s.",
    category: "Numérique",
    unit: "%",
    valueType: "percentage",
    source: "Arcep, Ma connexion internet, 1er trimestre 2026",
    updateFrequency: "Trimestrielle",
    status: "active",
  },
];

function resolveTerritory(identifier: string) {
  return territories.find(
    (territory) =>
      territory.id === identifier ||
      territory.slug === identifier ||
      territory.code === identifier,
  );
}

function getCommuneCodes(identifier: string): Set<string> {
  const territory = resolveTerritory(identifier);

  if (!territory) {
    return new Set();
  }

  if (territory.level === "commune") {
    return new Set([territory.code]);
  }

  if (territory.level === "epci") {
    return new Set(
      mayotteCommunes
        .filter(
          (commune) =>
            commune.parentId === territory.id,
        )
        .map((commune) => commune.code),
    );
  }

  return new Set(
    mayotteCommunes.map((commune) => commune.code),
  );
}

function aggregate(identifier: string) {
  const codes = getCommuneCodes(identifier);
  const rows = MAYOTTE_STATISTICS.filter(
    ([code]) => codes.has(code),
  );

  if (rows.length === 0) {
    return undefined;
  }

  return rows.reduce(
    (total, row) => ({
      population2017:
        total.population2017 + row[1],
      population2026:
        total.population2026 + row[2],
      employed:
        total.employed + row[3],
      population15Plus:
        total.population15Plus + row[4],
      qualified:
        total.qualified + row[5],
      nonStudent15Plus:
        total.nonStudent15Plus + row[6],
      waterInside:
        total.waterInside + row[7],
      electricity:
        total.electricity + row[8],
      internet:
        total.internet + row[9],
      residences:
        total.residences + row[10],
    }),
    {
      population2017: 0,
      population2026: 0,
      employed: 0,
      population15Plus: 0,
      qualified: 0,
      nonStudent15Plus: 0,
      waterInside: 0,
      electricity: 0,
      internet: 0,
      residences: 0,
    },
  );
}

function percentage(
  value: number,
  total: number,
): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 1000) / 10;
}

export function getMayotteIndicators(
  identifier: string,
): Indicator[] {
  const territory = resolveTerritory(identifier);

  if (!territory || !aggregate(identifier)) {
    return [];
  }

  return definitions.map((definition) => ({
    ...definition,
    territoryIds: [territory.id],
  }));
}

export function getMayotteDiagnosticIndicators(
  identifier: string,
): DiagnosticIndicator[] {
  const values = aggregate(identifier);

  if (!values) {
    return [];
  }

  const digitalCoverage = Array.from(
    getCommuneCodes(identifier),
  ).reduce(
    (total, code) => {
      const coverage =
        MAYOTTE_FIXED_COVERAGE_2026_T1[code];

      if (!coverage) {
        return total;
      }

      return {
        premises: total.premises + coverage.premises,
        atLeast30Mbps:
          total.atLeast30Mbps + coverage.atLeast30Mbps,
      };
    },
    {
      premises: 0,
      atLeast30Mbps: 0,
    },
  );

  return [
    {
      id: "employment-2017",
      name: "Part des 15 ans ou plus ayant un emploi",
      value: percentage(
        values.employed,
        values.population15Plus,
      ),
      target: 70,
      direction: "higher-is-better",
    },
    {
      id: "qualified-2017",
      name: "Diplôme qualifiant",
      value: percentage(
        values.qualified,
        values.nonStudent15Plus,
      ),
      target: 72,
      direction: "higher-is-better",
    },
    {
      id: "water-inside-2017",
      name: "Eau à l’intérieur du logement",
      value: percentage(
        values.waterInside,
        values.residences,
      ),
      target: 100,
      direction: "higher-is-better",
    },
    {
      id: "electricity-2017",
      name: "Électricité dans le logement",
      value: percentage(
        values.electricity,
        values.residences,
      ),
      target: 100,
      direction: "higher-is-better",
    },
    {
      id: "fixed-thd-coverage-2026",
      name: "Éligibilité fixe à au moins 30 Mbit/s",
      value: percentage(
        digitalCoverage.atLeast30Mbps,
        digitalCoverage.premises,
      ),
      target: 100,
      direction: "higher-is-better",
    },
  ];
}
