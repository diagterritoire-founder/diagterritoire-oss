-- Ajoute la sélection partagée des sujets, sans altérer les fiches existantes.
-- NULL : aucune sélection enregistrée ; [] : sélection explicitement vide.
ALTER TABLE "CouncilPreparationState"
ADD COLUMN "agenda" JSONB;
