import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";
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

type ContributionsPageProps = {
  params: Promise<{
    territoryId: string;
    serviceId: string;
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

export default async function ContributionsPage({
  params,
}: ContributionsPageProps) {
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

  const contributions =
    await WorkspaceContributionRepository.findByService(
      workspace.id,
      service.id,
    );

  const submitted =
    contributions.filter(
      (contribution) =>
        contribution.status === "submitted",
    ).length;

  const validated =
    contributions.filter(
      (contribution) =>
        contribution.status === "validated",
    ).length;

  const published =
    contributions.filter(
      (contribution) =>
        contribution.status === "published",
    ).length;

  return (
    <DashboardLayout
      eyebrow="Contributions"
      title={service.name}
      description="Suivi des contributions métier du service."
    >
      <div className="space-y-6">
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                DT Collectivité
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Contributions — {service.name}
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Contributions transmises par le service,
                leur état d’avancement et leur historique
                de traitement dans DiagTerritoire.
              </p>

              <p className="mt-3 text-xs text-slate-400">
                Source :{" "}
                {source === "database"
                  ? "Neon"
                  : "secours local"}
              </p>
            </div>

            <Link
              href={`/espace-metiers/${territory.id}/${service.id}`}
              className="inline-flex w-fit rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              ← Retour au service
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {contributions.length}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Soumises
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {submitted}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Validées
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {validated}
            </p>
          </article>

          <article className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
            <p className="text-sm text-cyan-800">
              Publiées
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {published}
            </p>
          </article>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Flux métier
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Contributions du service
            </h2>
          </div>

          {contributions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-semibold text-slate-950">
                Aucune contribution pour ce service.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Les premières contributions apparaîtront ici.
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
                          {contribution.type}
                        </p>

                        <h3 className="mt-2 text-lg font-bold text-slate-950">
                          {contribution.title}
                        </h3>

                        {contribution.description ? (
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            {contribution.description}
                          </p>
                        ) : null}
                      </div>

                      <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {statusLabels[
                          contribution.status
                        ] ?? contribution.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:grid-cols-3">
                      <p>
                        Période :{" "}
                        <span className="font-semibold text-slate-800">
                          {contribution.referencePeriod ??
                            "Non renseignée"}
                        </span>
                      </p>

                      <p>
                        Source :{" "}
                        <span className="font-semibold text-slate-800">
                          {contribution.source ??
                            "Non renseignée"}
                        </span>
                      </p>

                      <p>
                        Auteur :{" "}
                        <span className="font-semibold text-slate-800">
                          {contribution.authorUserId}
                        </span>
                      </p>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <Link
                        href={`/espace-metiers/${territory.id}/${service.id}/contributions/${contribution.id}`}
                        className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
                      >
                        Ouvrir la contribution →
                      </Link>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
