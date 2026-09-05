import type {
  AlertObservation,
  AlertRule,
  ProjectionInput,
} from "@/core/engines";

import {
  MAYOTTE_FIXED_COVERAGE_2026_T1,
} from "./mayotte-digital-coverage";
import {
  MAYOTTE_JOB_SEEKERS_ABC_2024_T4,
} from "./mayotte-labour-market";
import {
  MAYOTTE_STATISTICS,
} from "./mayotte-statistics";
import {
  mayotteCommunes,
  mayotteDepartment,
  mayotteEpcis,
} from "./mayotte-territories";

const territories = [
  ...(mayotteDepartment ? [mayotteDepartment] : []),
  ...mayotteEpcis,
  ...mayotteCommunes,
];

function resolveTerritory(identifier: string) {
  return territories.find(
    (territory) =>
      territory.id === identifier ||
      territory.slug === identifier ||
      territory.code === identifier,
  );
}

function getCommuneCodes(identifier: string): string[] {
  const territory = resolveTerritory(identifier);

  if (!territory) {
    return [];
  }

  if (territory.level === "commune") {
    return [territory.code];
  }

  if (territory.level === "epci") {
    return mayotteCommunes
      .filter(
        (commune) =>
          commune.parentId === territory.id,
      )
      .map((commune) => commune.code);
  }

  return mayotteCommunes.map(
    (commune) => commune.code,
  );
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
}

function percentage(
  value: number,
  total: number,
): number {
  return total > 0 ? round((value / total) * 100) : 0;
}

function aggregate(identifier: string) {
  const territory = resolveTerritory(identifier);
  const codes = getCommuneCodes(identifier);

  if (!territory || codes.length === 0) {
    return undefined;
  }

  const populations = MAYOTTE_STATISTICS.filter(
    ([code]) => codes.includes(code),
  ).reduce(
    (total, row) => ({
      population2017: total.population2017 + row[1],
      population2026: total.population2026 + row[2],
    }),
    {
      population2017: 0,
      population2026: 0,
    },
  );

  const digital = codes.reduce(
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
        atLeast100Mbps:
          total.atLeast100Mbps +
          coverage.atLeast100Mbps,
      };
    },
    {
      premises: 0,
      atLeast30Mbps: 0,
      atLeast100Mbps: 0,
    },
  );

  const jobSeekers = codes.reduce(
    (total, code) =>
      total +
      (MAYOTTE_JOB_SEEKERS_ABC_2024_T4[code] ?? 0),
    0,
  );

  return {
    territory,
    ...populations,
    ...digital,
    jobSeekers,
  };
}

export function getMayotteProjectionInputs(
  identifier: string,
): ProjectionInput[] {
  const values = aggregate(identifier);

  if (
    !values ||
    values.population2017 <= 0 ||
    values.population2026 <= 0
  ) {
    return [];
  }

  const observedYears = 9;
  const annualGrowthRate =
    (Math.pow(
      values.population2026 / values.population2017,
      1 / observedYears,
    ) -
      1) *
    100;

  return [
    {
      indicatorId: "population-2031",
      currentValue: values.population2026,
      annualGrowthRate: round(annualGrowthRate, 2),
      years: 5,
      scenario: "realiste",
    },
  ];
}

export function getMayotteAlertRules(
  identifier: string,
): AlertRule[] {
  const values = aggregate(identifier);

  if (!values) {
    return [];
  }

  const territoryId = values.territory.id;

  return [
    {
      id: `job-seekers-density-${territoryId}`,
      indicatorId: "job-seekers-per-1000-2024",
      territoryId,
      name:
        "Inscrits à France Travail pour 1 000 habitants",
      warningThreshold: 50,
      criticalThreshold: 80,
      direction: "higher-is-risk",
      recommendation:
        "Analyser les profils des inscrits et renforcer les actions locales d’accès à l’emploi.",
    },
    {
      id: `fixed-thd-coverage-${territoryId}`,
      indicatorId: "fixed-thd-coverage-2026",
      territoryId,
      name:
        "Éligibilité fixe à au moins 30 Mbit/s",
      warningThreshold: 70,
      criticalThreshold: 40,
      direction: "lower-is-risk",
      recommendation:
        "Prioriser les secteurs les moins couverts dans la programmation numérique.",
    },
    {
      id: `fixed-100-coverage-${territoryId}`,
      indicatorId: "fixed-100-coverage-2026",
      territoryId,
      name:
        "Éligibilité fixe à au moins 100 Mbit/s",
      warningThreshold: 30,
      criticalThreshold: 10,
      direction: "lower-is-risk",
      recommendation:
        "Accélérer le déploiement du très haut débit et suivre les locaux restant à raccorder.",
    },
  ];
}

export function getMayotteAlertObservations(
  identifier: string,
): AlertObservation[] {
  const values = aggregate(identifier);

  if (!values) {
    return [];
  }

  const territoryId = values.territory.id;
  const jobSeekersPer1000 =
    values.population2026 > 0
      ? round(
          (values.jobSeekers /
            values.population2026) *
            1000,
        )
      : 0;

  return [
    {
      indicatorId: "job-seekers-per-1000-2024",
      territoryId,
      value: jobSeekersPer1000,
      observedAt: "2024-12-31",
    },
    {
      indicatorId: "fixed-thd-coverage-2026",
      territoryId,
      value: percentage(
        values.atLeast30Mbps,
        values.premises,
      ),
      observedAt: "2026-03-31",
    },
    {
      indicatorId: "fixed-100-coverage-2026",
      territoryId,
      value: percentage(
        values.atLeast100Mbps,
        values.premises,
      ),
      observedAt: "2026-03-31",
    },
  ];
}
