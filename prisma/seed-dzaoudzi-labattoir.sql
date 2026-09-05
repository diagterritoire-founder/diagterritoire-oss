BEGIN;

INSERT INTO "Workspace" (
  "id",
  "organizationId",
  "territoryId",
  "name",
  "slug",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES (
  'workspace-dzaoudzi-labattoir',
  'organization-commune-dzaoudzi-labattoir',
  'territory-commune-dzaoudzi-labattoir',
  'Espace Collectivité — Dzaoudzi-Labattoir',
  'dzaoudzi-labattoir',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "organizationId" = EXCLUDED."organizationId",
  "territoryId" = EXCLUDED."territoryId",
  "name" = EXCLUDED."name",
  "slug" = EXCLUDED."slug",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO "WorkspaceService" (
  "id",
  "workspaceId",
  "name",
  "slug",
  "category",
  "description",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
(
  'service-direction-generale',
  'workspace-dzaoudzi-labattoir',
  'Direction générale',
  'direction-generale',
  'general_management',
  'Pilotage transversal de la collectivité et coordination des services.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-finances',
  'workspace-dzaoudzi-labattoir',
  'Finances',
  'finances',
  'finance',
  'Budget, exécution financière, investissements et suivi financier.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-services-techniques',
  'workspace-dzaoudzi-labattoir',
  'Services techniques',
  'services-techniques',
  'technical_services',
  'Voirie, patrimoine, équipements et interventions techniques.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-urbanisme-foncier',
  'workspace-dzaoudzi-labattoir',
  'Urbanisme et foncier',
  'urbanisme-foncier',
  'urban_planning',
  'Urbanisme, foncier, habitat et projets d’aménagement.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-education',
  'workspace-dzaoudzi-labattoir',
  'Éducation',
  'education',
  'education',
  'Écoles, effectifs, équipements et politiques éducatives.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-culture',
  'workspace-dzaoudzi-labattoir',
  'Culture',
  'culture',
  'culture',
  'Programmation, équipements, acteurs culturels, événements et projets.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-social-ccas',
  'workspace-dzaoudzi-labattoir',
  'Social et CCAS',
  'social-ccas',
  'ccas',
  'Action sociale, dispositifs d’accompagnement et suivi des besoins sociaux.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-associations-politique-ville',
  'workspace-dzaoudzi-labattoir',
  'Associations et politique de la ville',
  'associations-politique-ville',
  'city_policy',
  'Vie associative, quartiers, actions de proximité et politique de la ville.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-developpement-economique',
  'workspace-dzaoudzi-labattoir',
  'Développement économique',
  'developpement-economique',
  'economic_development',
  'Activité économique, commerces, projets et développement territorial.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-environnement',
  'workspace-dzaoudzi-labattoir',
  'Environnement',
  'environnement',
  'environment',
  'Environnement, cadre de vie, déchets, résilience et transition territoriale.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-ressources-humaines',
  'workspace-dzaoudzi-labattoir',
  'Ressources humaines',
  'ressources-humaines',
  'human_resources',
  'Effectifs, organisation, compétences et gestion des ressources humaines.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-commande-publique',
  'workspace-dzaoudzi-labattoir',
  'Commande publique',
  'commande-publique',
  'public_procurement',
  'Marchés, consultations, contrats et suivi de la commande publique.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "workspaceId" = EXCLUDED."workspaceId",
  "name" = EXCLUDED."name",
  "slug" = EXCLUDED."slug",
  "category" = EXCLUDED."category",
  "description" = EXCLUDED."description",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO "WorkspaceService" (
  "id",
  "workspaceId",
  "parentServiceId",
  "name",
  "slug",
  "category",
  "description",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
(
  'service-caisse-des-ecoles',
  'workspace-dzaoudzi-labattoir',
  'service-education',
  'Caisse des écoles',
  'caisse-des-ecoles',
  'school_fund',
  'Restauration scolaire, dispositifs éducatifs, besoins et moyens de la caisse des écoles.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
),
(
  'service-animations-periscolaires',
  'workspace-dzaoudzi-labattoir',
  'service-education',
  'Animations périscolaires',
  'animations-periscolaires',
  'extracurricular_activities',
  'Activités périscolaires, capacités d’accueil, fréquentation et encadrement.',
  'active',
  '2026-08-24T00:00:00.000Z',
  '2026-08-24T00:00:00.000Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "workspaceId" = EXCLUDED."workspaceId",
  "parentServiceId" = EXCLUDED."parentServiceId",
  "name" = EXCLUDED."name",
  "slug" = EXCLUDED."slug",
  "category" = EXCLUDED."category",
  "description" = EXCLUDED."description",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";

COMMIT;
