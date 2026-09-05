import type {
  Workspace,
  WorkspaceService,
} from "@/types/workspace";

const createdAt =
  "2026-08-24T00:00:00.000Z";

export const dzaoudziLabattoirWorkspace: Workspace = {
  id: "workspace-dzaoudzi-labattoir",
  organizationId:
    "organization-commune-dzaoudzi-labattoir",
  territoryId:
    "territory-commune-dzaoudzi-labattoir",
  name: "Espace Collectivité — Dzaoudzi-Labattoir",
  slug: "dzaoudzi-labattoir",
  status: "active",
  createdAt,
  updatedAt: createdAt,
};

export const dzaoudziLabattoirServices: WorkspaceService[] = [
  {
    id: "service-direction-generale",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Direction générale",
    slug: "direction-generale",
    category: "general_management",
    description:
      "Pilotage transversal de la collectivité et coordination des services.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-finances",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Finances",
    slug: "finances",
    category: "finance",
    description:
      "Budget, exécution financière, investissements et suivi financier.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-services-techniques",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Services techniques",
    slug: "services-techniques",
    category: "technical_services",
    description:
      "Voirie, patrimoine, équipements et interventions techniques.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-urbanisme-foncier",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Urbanisme et foncier",
    slug: "urbanisme-foncier",
    category: "urban_planning",
    description:
      "Urbanisme, foncier, habitat et projets d’aménagement.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-education",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Éducation",
    slug: "education",
    category: "education",
    description:
      "Écoles, effectifs, équipements et politiques éducatives.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-caisse-des-ecoles",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    parentServiceId:
      "service-education",
    name: "Caisse des écoles",
    slug: "caisse-des-ecoles",
    category: "school_fund",
    description:
      "Restauration scolaire, dispositifs éducatifs, besoins et moyens de la caisse des écoles.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-animations-periscolaires",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    parentServiceId:
      "service-education",
    name: "Animations périscolaires",
    slug: "animations-periscolaires",
    category: "extracurricular_activities",
    description:
      "Activités périscolaires, capacités d’accueil, fréquentation et encadrement.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-culture",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Culture",
    slug: "culture",
    category: "culture",
    description:
      "Programmation, équipements, acteurs culturels, événements et projets.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-social-ccas",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Social et CCAS",
    slug: "social-ccas",
    category: "ccas",
    description:
      "Action sociale, dispositifs d’accompagnement et suivi des besoins sociaux.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-associations-politique-ville",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Associations et politique de la ville",
    slug: "associations-politique-ville",
    category: "city_policy",
    description:
      "Vie associative, quartiers, actions de proximité et politique de la ville.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-developpement-economique",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Développement économique",
    slug: "developpement-economique",
    category: "economic_development",
    description:
      "Activité économique, commerces, projets et développement territorial.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-environnement",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Environnement",
    slug: "environnement",
    category: "environment",
    description:
      "Environnement, cadre de vie, déchets, résilience et transition territoriale.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-ressources-humaines",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Ressources humaines",
    slug: "ressources-humaines",
    category: "human_resources",
    description:
      "Effectifs, organisation, compétences et gestion des ressources humaines.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "service-commande-publique",
    workspaceId:
      dzaoudziLabattoirWorkspace.id,
    name: "Commande publique",
    slug: "commande-publique",
    category: "public_procurement",
    description:
      "Marchés, consultations, contrats et suivi de la commande publique.",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  },
];

export function getDzaoudziLabattoirServiceById(
  serviceId: string,
): WorkspaceService | undefined {
  return dzaoudziLabattoirServices.find(
    (service) =>
      service.id === serviceId,
  );
}

export function getDzaoudziLabattoirServiceChildren(
  parentServiceId: string,
): WorkspaceService[] {
  return dzaoudziLabattoirServices.filter(
    (service) =>
      service.parentServiceId ===
      parentServiceId,
  );
}
