BEGIN;

INSERT INTO "WorkspaceUser" (
  "id",
  "workspaceId",
  "email",
  "displayName",
  "title",
  "serviceIds",
  "roles",
  "permissions",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
(
  'user-pilot-finances-contributor',
  'workspace-dzaoudzi-labattoir',
  'contributeur.finances@diagterritoire.local',
  'Contributeur pilote — Finances',
  'Agent contributeur pilote',
  '["service-finances"]'::jsonb,
  '["contributor"]'::jsonb,
  '[]'::jsonb,
  'active',
  NOW(),
  NOW()
),
(
  'user-pilot-finances-validator',
  'workspace-dzaoudzi-labattoir',
  'validateur.finances@diagterritoire.local',
  'Validateur pilote — Finances',
  'Validateur métier pilote',
  '["service-finances"]'::jsonb,
  '["validator"]'::jsonb,
  '[]'::jsonb,
  'active',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "workspaceId" = EXCLUDED."workspaceId",
  "email" = EXCLUDED."email",
  "displayName" = EXCLUDED."displayName",
  "title" = EXCLUDED."title",
  "serviceIds" = EXCLUDED."serviceIds",
  "roles" = EXCLUDED."roles",
  "permissions" = EXCLUDED."permissions",
  "status" = EXCLUDED."status",
  "updatedAt" = NOW();

COMMIT;
