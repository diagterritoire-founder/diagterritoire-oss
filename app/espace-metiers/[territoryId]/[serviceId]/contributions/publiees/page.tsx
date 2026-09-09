import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";
import {
  WorkspaceRepository,
} from "@/core/repositories/WorkspaceRepository";
import {
  WorkspaceContributionConsolidationService,
} from "@/core/services/WorkspaceContributionConsolidationService";
import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  WorkspaceSessionService,
} from "@/core/session/WorkspaceSession";
import {
  getTerritoryById,
} from "@/data/mayotte-territories";

type PublishedContributionsPageProps = {
  params: Promise<{
    territoryId: string;
    serviceId: string;
  }>;
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

function formatDate(
  value: string | null,
) {
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

export default async function PublishedContributionsPage({
  params,
}: PublishedContributionsPageProps) {
  const {
    territoryId,
    serviceId,
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

  if (
    !workspaceResult ||
    workspaceResult.service.status !== "active"
  ) {
    notFound();
  }

  const {
    workspace,
    service,
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

  const consolidation =
    await WorkspaceContributionConsolidationService.readPublished(
      {
        workspaceId: workspace.id,
        territoryId: territory.id,
        serviceId: service.id,
      },
    );

  const contributions =
    consolidation.contributions;

  return (
    <DashboardLayout
      eyebrow="Contributions publiées"
      title={service.name}
      description="Lecture consolidée des informations publiées et exploitables."
    >
      <div className="space-y-6">
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Pilotage métier
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Lecture consolidée — {service.name}
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Cette vue présente uniquement les
                contributions arrivées au statut publié
                et utilisables pour le pilotage.
              </p>
            </div>

            <Link
              href={
                "/espace-metiers/" +
                territory.id +
                "/" +
                service.id +
                "/contributions"
              }
              className="inline-flex w-fit rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              ← Toutes les contributions
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
            <p className="text-sm text-cyan-800">
              Contributions publiées
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {contributions.length}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Périmètre
            </p>

            <p className="mt-2 text-lg font-bold text-slate-950">
              {service.name}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {territory.name}
            </p>
          </article>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Informations exploitables
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Contributions publiées
            </h2>
          </div>

          {contributions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-semibold text-slate-950">
                Aucune contribution publiée.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Les contributions apparaîtront ici
                après leur publication.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contributions.map(
                (contribution) => (
                  <article
                    key={contribution.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">
                          {typeLabels[
                            contribution.type
                          ] ??
                            contribution.type}
                        </p>

                        <h3 className="mt-2 text-lg font-bold text-slate-950">
                          {contribution.title}
                        </h3>

                        {contribution.description ? (
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            {
                              contribution.description
                            }
                          </p>
                        ) : null}
                      </div>

                      <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Publié
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-slate-500">
                          Période
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {contribution.referencePeriod ??
                            "Non renseignée"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">
                          Source métier
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {contribution.source ??
                            "Non renseignée"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">
                          Auteur
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {
                            contribution.author
                              .displayName
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">
                          Publication
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {formatDate(
                            contribution.publishedAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <Link
                        href={
                          "/espace-metiers/" +
                          territory.id +
                          "/" +
                          service.id +
                          "/contributions/" +
                          contribution.id
                        }
                        className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
                      >
                        Consulter la contribution →
                      </Link>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>

        <section className="flex flex-wrap gap-3">
          <Link
            href={
              "/espace-metiers/" +
              territory.id +
              "/" +
              service.id
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            ← Retour au service
          </Link>

          <Link
            href={
              "/espace-metiers/" +
              territory.id
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Espace Métiers
          </Link>

          <Link
            href={
              "/territoires/" +
              territory.id
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Voir le territoire
          </Link>
        </section>
      </div>
    </DashboardLayout>
  );
}
