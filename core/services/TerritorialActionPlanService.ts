import type { DiagnosticAction } from "@/core/engines/DiagnosticEngine";

export type TerritorialPolicyPriority =
  | DiagnosticAction["priority"]
  | "documenter";

export type TerritorialPolicySignal = {
  indicatorId: string;
  indicatorName: string;
  score: number;
  priority: DiagnosticAction["priority"];
};

export type TerritorialActionPlanItem = {
  id: string;
  title: string;
  description: string;
  diagnosticScope: string;
  scopeLabel: string;
  priority: TerritorialPolicyPriority;
  action: string;
  signals: TerritorialPolicySignal[];
};

type LevelKey =
  | "department"
  | "epci"
  | "commune"
  | "default";

type PolicyDefinition = {
  id: string;
  title: string;
  description: string;
  diagnosticScope: string;
  indicatorIds: string[];
  actions: Record<LevelKey, string>;
};

const policyDefinitions: PolicyDefinition[] = [
  {
    id: "amenagement-habitat-foncier",
    title: "Aménagement, habitat & foncier",
    description:
      "Urbanisme, habitat, foncier, équipements publics et opérations d’aménagement.",
    diagnosticScope:
      "Appui diagnostic actuel : conditions d’habitat, eau et électricité.",
    indicatorIds: [
      "water-inside-2017",
      "electricity-2017",
    ],
    actions: {
      department:
        "Coordonner la programmation de l’habitat, du foncier, des équipements structurants et de la résorption de l’habitat dégradé à l’échelle de Mayotte.",
      epci:
        "Prioriser les opérations d’aménagement, d’habitat, de foncier et les équipements structurants à l’échelle intercommunale.",
      commune:
        "Traduire les besoins identifiés en opérations communales d’urbanisme, d’habitat, de foncier et d’équipements de proximité.",
      default:
        "Structurer la programmation territoriale de l’aménagement, de l’habitat, du foncier et des équipements.",
    },
  },
  {
    id: "mobilites-infrastructures-accessibilite",
    title: "Mobilités, infrastructures & accessibilité",
    description:
      "Mobilités, voirie, désenclavement, accessibilité aux services et infrastructures numériques.",
    diagnosticScope:
      "Appui diagnostic actuel : accessibilité numérique. Les mobilités physiques restent à documenter par des indicateurs dédiés.",
    indicatorIds: ["fixed-thd-coverage-2026"],
    actions: {
      department:
        "Coordonner les infrastructures structurantes, les mobilités, le désenclavement et l’accessibilité numérique de Mayotte.",
      epci:
        "Programmer les mobilités, la voirie structurante, les pôles d’échanges, le désenclavement et l’accessibilité numérique du territoire.",
      commune:
        "Prioriser la voirie locale, les cheminements, le stationnement, l’accessibilité aux services et la continuité numérique.",
      default:
        "Améliorer les mobilités, les infrastructures et l’accessibilité du territoire.",
    },
  },
  {
    id: "developpement-economique-emploi-attractivite",
    title: "Développement économique, emploi & attractivité",
    description:
      "Emploi, formation, entreprises, commerce, zones d’activités, tourisme, agriculture, pêche et attractivité.",
    diagnosticScope:
      "Appui diagnostic actuel : emploi et qualification de la population.",
    indicatorIds: [
      "employment-2017",
      "qualified-2017",
    ],
    actions: {
      department:
        "Coordonner les politiques d’emploi, de formation, de développement des filières et d’attractivité économique à l’échelle de Mayotte.",
      epci:
        "Renforcer les zones d’activités, l’accompagnement des entreprises, l’emploi, la formation et les filières économiques locales.",
      commune:
        "Soutenir l’emploi local, le commerce de proximité, l’insertion, l’activité économique et l’accès à la formation.",
      default:
        "Renforcer l’emploi, les compétences, l’activité économique et l’attractivité territoriale.",
    },
  },
  {
    id: "services-population-jeunesse-cohesion",
    title: "Services à la population, jeunesse & cohésion sociale",
    description:
      "Éducation, jeunesse, insertion, santé, solidarités, culture, sport, accès aux droits et politique de la ville.",
    diagnosticScope:
      "Appui diagnostic actuel : qualification. Les autres services à la population devront être enrichis progressivement par leurs données propres.",
    indicatorIds: ["qualified-2017"],
    actions: {
      department:
        "Coordonner l’accès aux services, l’éducation, la jeunesse, l’insertion, les solidarités, la culture, le sport et les politiques sociales.",
      epci:
        "Développer l’accès aux services intercommunaux, l’insertion, la jeunesse, la politique de la ville et les équipements à la population.",
      commune:
        "Renforcer les services de proximité, l’éducation, la jeunesse, l’action sociale, la culture, le sport et l’accès aux droits.",
      default:
        "Renforcer l’accès aux services publics, la jeunesse, l’insertion et la cohésion sociale.",
    },
  },
  {
    id: "environnement-ressources-resilience",
    title: "Environnement, ressources & résilience",
    description:
      "Eau, assainissement, déchets, énergie, biodiversité, risques, climat et résilience territoriale.",
    diagnosticScope:
      "Appui diagnostic actuel : accès à l’eau et à l’électricité dans l’habitat.",
    indicatorIds: [
      "water-inside-2017",
      "electricity-2017",
    ],
    actions: {
      department:
        "Coordonner la sécurisation des ressources, des réseaux, la prévention des risques et la résilience de Mayotte.",
      epci:
        "Prioriser les actions sur l’eau, l’assainissement, les déchets, l’énergie, les risques et la résilience intercommunale.",
      commune:
        "Renforcer la résilience locale, la gestion des ressources, la prévention des risques et la qualité du cadre de vie.",
      default:
        "Sécuriser les ressources, protéger l’environnement et renforcer la résilience territoriale.",
    },
  },
];

function getLevelKey(level?: string): LevelKey {
  if (
    level === "department" ||
    level === "epci" ||
    level === "commune"
  ) {
    return level;
  }

  return "default";
}

function getScopeLabel(level?: string): string {
  if (level === "department") {
    return "Échelle Mayotte";
  }

  if (level === "epci") {
    return "Échelle intercommunale";
  }

  if (level === "commune") {
    return "Échelle communale";
  }

  return "Échelle territoriale";
}

function derivePriority(
  signals: DiagnosticAction[],
): TerritorialPolicyPriority {
  if (signals.length === 0) {
    return "documenter";
  }

  if (
    signals.some(
      (signal) => signal.priority === "forte",
    )
  ) {
    return "forte";
  }

  if (
    signals.some(
      (signal) =>
        signal.priority === "consolider",
    )
  ) {
    return "consolider";
  }

  return "preserver";
}

export function buildTerritorialActionPlan(
  diagnosticActions: DiagnosticAction[],
  level?: string,
): TerritorialActionPlanItem[] {
  const levelKey = getLevelKey(level);

  return policyDefinitions.map((policy) => {
    const signals = diagnosticActions.filter(
      (action) =>
        policy.indicatorIds.includes(
          action.indicatorId,
        ),
    );

    return {
      id: policy.id,
      title: policy.title,
      description: policy.description,
      diagnosticScope: policy.diagnosticScope,
      scopeLabel: getScopeLabel(level),
      priority: derivePriority(signals),
      action: policy.actions[levelKey],
      signals: signals.map((signal) => ({
        indicatorId: signal.indicatorId,
        indicatorName: signal.indicatorName,
        score: signal.score,
        priority: signal.priority,
      })),
    };
  });
}
