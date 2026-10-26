import {
  MAYOTTE_DATA_SOURCES,
} from "./mayotte-statistics";
import {
  ARCEP_FIXED_COVERAGE_SOURCE,
} from "./mayotte-digital-coverage";

export type MayotteIndicatorSourceReference = {
  label: string;
  url: string;
  /** Date de publication de la page source, pas date d'ingestion DT. */
  publicationDate?: string;
};

export type MayotteIndicatorProvenance = {
  origin: "publication" | "calcul";
  method: string;
  sources: readonly MayotteIndicatorSourceReference[];
};

/**
 * Les jeux communaux sont des instantanés statiques dans le dépôt.
 * La périodicité de publication de la source n'implique aucune mise à jour
 * automatique de DiagTerritoire.
 */
export const MAYOTTE_INDICATORS_AUTOMATIC_REFRESH = false;

const census2026: MayotteIndicatorSourceReference = {
  label: "Insee — populations communales de Mayotte en 2026",
  url: MAYOTTE_DATA_SOURCES.population2026,
  publicationDate: "07/07/2026",
};

const census2017: MayotteIndicatorSourceReference = {
  label: "Insee — recensement 2017, tableaux détaillés",
  url: MAYOTTE_DATA_SOURCES.detailed2017,
  publicationDate: "05/08/2019",
};

const arcep2026: MayotteIndicatorSourceReference = {
  label: "Arcep — Ma connexion internet, jeu de données",
  url: ARCEP_FIXED_COVERAGE_SOURCE,
};

const insee2017 = [census2017] as const;
const insee2026 = [census2026] as const;
const inseeTwoPeriods = [census2017, census2026] as const;
const arcep = [arcep2026] as const;

const rateMethods: Record<string, string> = {
  "employment-2017":
    "Rapport entre les effectifs de personnes ayant un emploi et la population de 15 ans ou plus, calculé à partir des données communales Insee 2017.",
  "qualified-2017":
    "Rapport entre les personnes titulaires d'un diplôme qualifiant et la population non scolarisée de référence, calculé à partir des données communales Insee 2017.",
  "water-inside-2017":
    "Rapport entre les résidences principales disposant d'eau à l'intérieur et l'ensemble des résidences principales, calculé à partir des données communales Insee 2017.",
  "electricity-2017":
    "Rapport entre les résidences principales disposant d'électricité et l'ensemble des résidences principales, calculé à partir des données communales Insee 2017.",
  "internet-2017":
    "Rapport entre les résidences principales équipées d'Internet et l'ensemble des résidences principales, calculé à partir des données communales Insee 2017.",
};

export function getMayotteIndicatorProvenance(
  indicatorId: string,
  territoryLevel: string,
): MayotteIndicatorProvenance | undefined {
  const aggregated = territoryLevel !== "commune";

  if (indicatorId === "population-2026") {
    return {
      origin: aggregated ? "calcul" : "publication",
      method: aggregated
        ? "Somme des populations municipales des communes composant le territoire, à partir de la publication Insee 2026."
        : "Population municipale communale publiée par l'Insee ; aucune projection DiagTerritoire.",
      sources: insee2026,
    };
  }

  if (indicatorId === "population-growth-2017-2026") {
    return {
      origin: "calcul",
      method:
        "Variation entre les populations municipales 2017 et 2026, rapportée à la population 2017. Aux niveaux intercommunal et départemental, les effectifs communaux sont d'abord additionnés ; les pourcentages ne sont pas moyennés.",
      sources: inseeTwoPeriods,
    };
  }

  if (Object.prototype.hasOwnProperty.call(rateMethods, indicatorId)) {
    return {
      origin: "calcul",
      method: aggregated
        ? rateMethods[indicatorId] + " Les effectifs communaux sont additionnés avant le calcul du taux ; les pourcentages communaux ne sont pas moyennés."
        : rateMethods[indicatorId],
      sources: insee2017,
    };
  }

  if (indicatorId === "fixed-thd-coverage-2026") {
    return {
      origin: "calcul",
      method:
        "Part des locaux éligibles à au moins 30 Mbit/s calculée à partir des effectifs de locaux de la table Arcep intégrée, millésime T1 2026. Pour les regroupements, les locaux sont additionnés avant le calcul du taux. La présence d'une publication plus récente n'actualise pas automatiquement cette table.",
      sources: arcep,
    };
  }

  return undefined;
}
