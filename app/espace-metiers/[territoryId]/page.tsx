import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";
import {
  WorkspaceRepository,
} from "@/core/repositories/WorkspaceRepository";
import {
  WorkspaceAccessEngine,
} from "@/core/engines/WorkspaceAccessEngine";
import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  getTerritoryById,
} from "@/data/mayotte-territories";

type WorkspacePageProps = {
  params: Promise<{
    territoryId: string;
  }>;
};

const serviceIcons: Record<string, string> = {
  general_management: "⌘",
  finance: "€",
  technical_services: "⚙",
  urban_planning: "⌂",
  land_management: "⌖",
  education: "▤",
  school_fund: "◎",
  culture: "✦",
  extracurricular_activities: "★",
  social: "♥",
  ccas: "♥",
  associations: "◇",
  city_policy: "◉",
  economic_development: "↗",
  environment: "♧",
  human_resources: "♙",
  public_procurement: "§",
  other: "•",
};

export default async function WorkspacePage({
  params,
}: WorkspacePageProps) {
  const { territoryId } = await params;

  const territory =
    getTerritoryById(territoryId);

  const workspaceResult =
    await WorkspaceRepository.findByTerritoryId(
      territoryId,
    );

  if (
    !territory ||
    !workspaceResult
  ) {
    notFound();
  }

  const {
    workspace,
    services: activeServices,
    source,
  } = workspaceResult;

  const session =
    await CurrentWorkspaceSession.get();

  if (
    !session ||
    session.workspaceId !== workspace.id
  ) {
    notFound();
  }

  const accessibleServices =
    WorkspaceAccessEngine.filterAccessibleServices(
      session.user,
      activeServices,
    );

  const rootServices =
    accessibleServices.filter(
      (service) =>
        !service.parentServiceId,
    );

  const childServices =
    accessibleServices.filter(
      (service) =>
        service.parentServiceId,
    );

  return (
    <DashboardLayout
      eyebrow="Espace Métiers"
      title={territory.name}
      description="Pilotez les services, les contributions et les informations opérationnelles de la collectivité."
    >
      <div className="space-y-6">
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                DT Collectivité
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                {workspace.name}
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Un espace commun pour alimenter,
                consolider et exploiter les données
                métiers nécessaires au pilotage de
                la collectivité.
              </p>
            </div>

            <Link
              href={`/territoires/${territory.id}`}
              className="inline-flex w-fit rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Voir le territoire
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Session active
          </p>

          <p className="mt-2 font-bold text-slate-950">
            {session.user.displayName}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {session.user.roles.join(", ")}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Services actifs
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {accessibleServices.length}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Espaces principaux
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {rootServices.length}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Sous-services
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {childServices.length}
            </p>
          </article>

          <article className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
            <p className="text-sm text-cyan-800">
              Statut
            </p>
            <p className="mt-2 text-xl font-bold text-slate-950">
              Pilote actif
            </p>
            <p className="mt-2 text-xs text-cyan-700">
              Source : {source === "database" ? "Neon" : "secours local"}
            </p>
          </article>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Organisation
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Espaces métiers
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Chaque service dispose de son propre
              périmètre de contribution et de suivi.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rootServices.map((service) => {
              const children =
                childServices.filter(
                  (child) =>
                    child.parentServiceId ===
                    service.id,
                );

              return (
                <article
                  key={service.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
                      {serviceIcons[
                        service.category
                      ] ?? "•"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-950">
                        {service.name}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {children.length > 0 ? (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Espaces rattachés
                      </p>

                      <div className="mt-3 space-y-2">
                        {children.map(
                          (child) => (
                            <div
                              key={child.id}
                              className="rounded-xl bg-slate-50 px-3 py-3"
                            >
                              <p className="text-sm font-semibold text-slate-800">
                                {child.name}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <Link
                      href={`/espace-metiers/${territory.id}/${service.id}`}
                      className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-800"
                    >
                      Ouvrir l’espace →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
