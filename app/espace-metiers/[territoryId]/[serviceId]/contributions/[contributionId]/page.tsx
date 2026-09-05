import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";
import {
  transitionContributionAction,
} from "./actions";
import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  WorkspaceSessionService,
} from "@/core/session/WorkspaceSession";
import {
  WorkspaceContributionRepository,
} from "@/core/repositories/WorkspaceContributionRepository";
import {
  WorkspaceRepository,
} from "@/core/repositories/WorkspaceRepository";
import {
  getTerritoryById,
} from "@/data/mayotte-territories";

type ContributionDetailPageProps = {
  params: Promise<{
    territoryId: string;
    serviceId: string;
    contributionId: string;
  }>;
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  in_review: "En examen",
  validated: "Validé",
  rejected: "Rejeté",
  published: "Publié",
  archived: "Archivé",
};

const typeLabels: Record<string, string> = {
  indicator: "Indicateur",
  project: "Projet",
  action: "Action",
  document: "Document",
  event: "Événement",
  alert: "Alerte",
  observation: "Observation",
  other: "Autre",
};

function formatDate(value?: string) {
  if (!value) {
    return "Non renseignée";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Indian/Mayotte",
    },
  ).format(new Date(value));
}

export default async function ContributionDetailPage({
  params,
}: ContributionDetailPageProps) {
  const {
    territoryId,
    serviceId,
    contributionId,
  } = await params;

  const territory =
    getTerritoryById(territoryId);

  if (!territory) {
    notFound();
  }

  const workspaceResult =
    await WorkspaceRepository.findService(
      territoryId,
      serviceId,
    );

  if (!workspaceResult) {
    notFound();
  }

  const {
    workspace,
    service,
    source,
  } = workspaceResult;

  const session =
    await CurrentWorkspaceSession.get();

  if (
    !session ||
    session.workspaceId !== workspace.id ||
    !WorkspaceSessionService.canAccessService(
      session,
      service.id,
    )
  ) {
    notFound();
  }

  const result =
    await WorkspaceContributionRepository.findById(
      contributionId,
    );

  if (!result) {
    notFound();
  }

  const {
    contribution,
    history,
  } = result;

  if (
    contribution.workspaceId !== workspace.id ||
    contribution.serviceId !== service.id ||
    contribution.territoryId !== territory.id
  ) {
    notFound();
  }

  const canSubmit =
    contribution.status === "draft" &&
    contribution.authorUserId === session.user.id &&
    WorkspaceSessionService.can(
      session,
      "contribution:submit",
      service.id,
    );

  const canReview =
    contribution.status === "submitted" &&
    WorkspaceSessionService.can(
      session,
      "contribution:validate",
      service.id,
    );

  const canValidate =
    contribution.status === "in_review" &&
    WorkspaceSessionService.can(
      session,
      "contribution:validate",
      service.id,
    );

  const canReject =
    (
      contribution.status === "submitted" ||
      contribution.status === "in_review"
    ) &&
    WorkspaceSessionService.can(
      session,
      "contribution:reject",
      service.id,
    );

  const canPublish =
    contribution.status === "validated" &&
    WorkspaceSessionService.can(
      session,
      "contribution:publish",
      service.id,
    );

  const availableActions = [
    canSubmit && "Soumettre",
    canReview && "Prendre en examen",
    canValidate && "Valider",
    canReject && "Rejeter",
    canPublish && "Publier",
  ].filter(Boolean) as string[];

  return (
    <DashboardLayout
      eyebrow="Contribution"
      title={contribution.title}
      description={`Contribution métier — ${service.name}`}
    >
      <div className="space-y-6">
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                DT Collectivité
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                {contribution.title}
              </h2>

              <p className="mt-3 text-sm text-slate-300">
                {service.name}
              </p>

              <p className="mt-3 text-xs text-slate-400">
                Source des données :{" "}
                {source === "database"
                  ? "Neon"
                  : "secours local"}
              </p>
            </div>

            <Link
              href={`/espace-metiers/${territory.id}/${service.id}/contributions`}
              className="inline-flex w-fit rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              ← Toutes les contributions
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Statut
            </p>
            <p className="mt-2 text-xl font-bold text-slate-950">
              {statusLabels[
                contribution.status
              ] ?? contribution.status}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Type
            </p>
            <p className="mt-2 text-xl font-bold text-slate-950">
              {typeLabels[
                contribution.type
              ] ?? contribution.type}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Période
            </p>
            <p className="mt-2 font-bold text-slate-950">
              {contribution.referencePeriod ??
                "Non renseignée"}
            </p>
          </article>

          <article className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
            <p className="text-sm text-cyan-800">
              Historique
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {history.length}
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Workflow
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Actions disponibles
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Les actions proposées dépendent du statut,
                du rôle et du service de l’utilisateur connecté.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableActions.length === 0 ? (
                <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
                  Aucune action disponible
                </span>
              ) : (
                <>
                  {canSubmit ? (
                    <form action={transitionContributionAction}>
                      <input
                        type="hidden"
                        name="contributionId"
                        value={contribution.id}
                      />
                      <input
                        type="hidden"
                        name="nextStatus"
                        value="submitted"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
                      >
                        Soumettre
                      </button>
                    </form>
                  ) : null}

                  {canReview ? (
                    <form action={transitionContributionAction}>
                      <input
                        type="hidden"
                        name="contributionId"
                        value={contribution.id}
                      />
                      <input
                        type="hidden"
                        name="nextStatus"
                        value="in_review"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
                      >
                        Prendre en examen
                      </button>
                    </form>
                  ) : null}

                  {canValidate ? (
                    <form action={transitionContributionAction}>
                      <input
                        type="hidden"
                        name="contributionId"
                        value={contribution.id}
                      />
                      <input
                        type="hidden"
                        name="nextStatus"
                        value="validated"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                      >
                        Valider
                      </button>
                    </form>
                  ) : null}

                  {canReject ? (
                    <form action={transitionContributionAction}>
                      <input
                        type="hidden"
                        name="contributionId"
                        value={contribution.id}
                      />
                      <input
                        type="hidden"
                        name="nextStatus"
                        value="rejected"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
                      >
                        Rejeter
                      </button>
                    </form>
                  ) : null}

                  {canPublish ? (
                    <form action={transitionContributionAction}>
                      <input
                        type="hidden"
                        name="contributionId"
                        value={contribution.id}
                      />
                      <input
                        type="hidden"
                        name="nextStatus"
                        value="published"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
                      >
                        Publier
                      </button>
                    </form>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Contenu
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Informations de la contribution
          </h2>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Description
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {contribution.description ??
                  "Aucune description renseignée."}
              </p>
            </div>

            <div className="grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">
                  Source métier
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {contribution.source ??
                    "Non renseignée"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Auteur
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {contribution.authorUserId}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Validateur
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {contribution.validatorUserId ??
                    "Non attribué"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Créée le
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {formatDate(
                    contribution.createdAt,
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Mise à jour
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {formatDate(
                    contribution.updatedAt,
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Traçabilité
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Historique de traitement
          </h2>

          {history.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">
              Aucun changement de statut enregistré.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {history.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <p className="font-semibold text-slate-950">
                      {entry.fromStatus
                        ? `${
                            statusLabels[
                              entry.fromStatus
                            ] ?? entry.fromStatus
                          } → ${
                            statusLabels[
                              entry.toStatus
                            ] ?? entry.toStatus
                          }`
                        : statusLabels[
                            entry.toStatus
                          ] ?? entry.toStatus}
                    </p>

                    <p className="text-xs text-slate-500">
                      {formatDate(
                        entry.createdAt,
                      )}
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Acteur :{" "}
                    <span className="font-semibold text-slate-700">
                      {entry.actorUserId}
                    </span>
                  </p>

                  {entry.comment ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {entry.comment}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
