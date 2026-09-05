import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";
import {
  WorkspaceRepository,
} from "@/core/repositories/WorkspaceRepository";
import {
  CurrentWorkspaceSession,
} from "@/core/session/CurrentWorkspaceSession";
import {
  WorkspaceSessionService,
} from "@/core/session/WorkspaceSession";
import {
  getTerritoryById,
} from "@/data/mayotte-territories";

type ServiceWorkspacePageProps = {
  params: Promise<{
    territoryId: string;
    serviceId: string;
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

const modules = [
  {
    title: "Indicateurs",
    description:
      "Suivre les indicateurs métier, leurs valeurs, leurs sources et leur actualisation.",
    icon: "▥",
  },
  {
    title: "Projets et actions",
    description:
      "Piloter les projets, actions, échéances, budgets et niveaux d’avancement.",
    icon: "◇",
  },
  {
    title: "Contributions",
    description:
      "Saisir et transmettre les informations produites par le service.",
    icon: "＋",
    href: "contributions",
  },
  {
    title: "Documents",
    description:
      "Centraliser les études, rapports, délibérations et documents de référence.",
    icon: "▤",
  },
  {
    title: "Alertes",
    description:
      "Identifier les situations nécessitant une attention ou une décision.",
    icon: "⚠",
  },
  {
    title: "Validations",
    description:
      "Contrôler les contributions avant leur consolidation dans DiagTerritoire.",
    icon: "✓",
  },
];

export default async function ServiceWorkspacePage({
  params,
}: ServiceWorkspacePageProps) {
  const {
    territoryId,
    serviceId,
  } = await params;

  const territory =
    getTerritoryById(territoryId);

  if (!territory) {
    notFound();
  }

  const result =
    await WorkspaceRepository.findService(
      territoryId,
      serviceId,
    );

  if (
    !result ||
    result.service.status !== "active"
  ) {
    notFound();
  }

  const {
    workspace,
    service,
    services,
    source,
  } = result;

  if (
    workspace.territoryId !==
    territory.id
  ) {
    notFound();
  }

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

  const children =
    services.filter(
      (candidate) =>
        candidate.parentServiceId ===
          service.id &&
        candidate.status === "active",
    );

  const parent =
    service.parentServiceId
      ? services.find(
          (candidate) =>
            candidate.id ===
              service.parentServiceId &&
            candidate.status === "active",
        )
      : undefined;

  const siblingCount =
    service.parentServiceId
      ? services.filter(
          (candidate) =>
            candidate.parentServiceId ===
              service.parentServiceId &&
            candidate.status === "active",
        ).length
      : 0;

  return (
    <DashboardLayout
      eyebrow="Espace Métiers"
      title={service.name}
      description={service.description}
    >
      <div className="space-y-6">
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-2xl font-bold text-slate-950">
                {serviceIcons[
                  service.category
                ] ?? "•"}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  DT Collectivité
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  {service.name}
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  {service.description}
                </p>

                {parent ? (
                  <p className="mt-3 text-sm text-slate-400">
                    Rattaché à :{" "}
                    <span className="font-semibold text-white">
                      {parent.name}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>

            <Link
              href={`/espace-metiers/${territory.id}`}
              className="inline-flex w-fit rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              ← Tous les services
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Statut du service
            </p>
            <p className="mt-2 text-xl font-bold text-emerald-700">
              Actif
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Modules métier
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {modules.length}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Sous-services
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {children.length}
            </p>
          </article>

          <article className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
            <p className="text-sm text-cyan-800">
              Circuit DT
            </p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              Contribution → Validation
            </p>

            <p className="mt-2 text-xs text-cyan-700">
              Source :{" "}
              {source === "database"
                ? "Neon"
                : "secours local"}
            </p>
          </article>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Pilotage métier
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Outils du service
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              L’espace centralise progressivement
              les informations nécessaires au
              fonctionnement, au suivi et à la
              décision.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <article
                key={module.title}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
                  {module.icon}
                </div>

                <h3 className="mt-4 font-bold text-slate-950">
                  {module.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {module.description}
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  {module.href ? (
                    <Link
                      href={`/espace-metiers/${territory.id}/${service.id}/${module.href}`}
                      className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
                    >
                      Ouvrir le module →
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">
                      Module en préparation
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {children.length > 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Organisation
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Espaces rattachés
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {children.map((child) => (
                <Link
                  key={child.id}
                  href={`/espace-metiers/${territory.id}/${child.id}`}
                  className="rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100"
                >
                  <p className="font-semibold text-slate-950">
                    {child.name}
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {child.description}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-cyan-700">
                    Ouvrir →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {parent ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Organisation du service
            </p>

            <p className="mt-2 font-semibold text-slate-950">
              {parent.name} · {siblingCount} espace
              {siblingCount > 1 ? "s" : ""} rattaché
              {siblingCount > 1 ? "s" : ""}
            </p>
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
