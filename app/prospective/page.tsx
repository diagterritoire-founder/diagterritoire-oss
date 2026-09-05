import Link from "next/link";

import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { platformIntelligence } from "@/core";
import {
  mayotteCommunes,
  mayotteDepartment,
  mayotteEpcis,
} from "@/data/mayotte-territories";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);
}

async function loadProjection(territoryId: string) {
  try {
    const response =
      await platformIntelligence.buildTerritorialIntelligence({
        territoryId,
        question:
          "Présenter la projection démographique du territoire.",
      });

    const projection =
      response.analysis.projections[0];

    if (!projection) {
      return null;
    }

    const change =
      projection.currentValue === 0
        ? 0
        : ((projection.projectedValue -
              projection.currentValue) /
            projection.currentValue) *
          100;

    return {
      territory: response.analysis.territory,
      projection,
      change,
    };
  } catch {
    return null;
  }
}

export default async function ProspectivePage() {
  const territories = [
    ...(mayotteDepartment
      ? [mayotteDepartment]
      : []),
    ...mayotteEpcis,
    ...mayotteCommunes,
  ];

  const results = (
    await Promise.all(
      territories.map((territory) =>
        loadProjection(territory.id),
      ),
    )
  ).filter(
    (
      result,
    ): result is NonNullable<typeof result> =>
      result !== null,
  );

  const mayotteResult = results.find(
    (result) =>
      result.territory.id ===
      "territory-mayotte",
  );

  const communeResults = results.filter(
    (result) =>
      result.territory.level === "commune",
  );

  const strongestGrowth =
    communeResults.length > 0
      ? [...communeResults].sort(
          (a, b) => b.change - a.change,
        )[0]
      : null;

  return (
    <DashboardLayout
      eyebrow="Prospective"
      title="Scénarios territoriaux"
      description="Anticipez les évolutions démographiques de Mayotte à partir des données territoriales intégrées à DiagTerritoire."
    >
      <div className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Horizon"
            value="2031"
            description="Projection à cinq ans à partir de la population 2026."
            icon="↗"
          />

          <StatCard
            label="Territoires analysés"
            value={results.length}
            description="Mayotte, intercommunalités et communes disposant d’une projection."
            icon="◎"
          />

          <StatCard
            label="Population Mayotte projetée"
            value={
              mayotteResult
                ? formatNumber(
                    mayotteResult.projection
                      .projectedValue,
                  )
                : "—"
            }
            description="Projection démographique selon la tendance observée."
            icon="◉"
          />

          <StatCard
            label="Commune la plus dynamique"
            value={
              strongestGrowth
                ? strongestGrowth.territory.name
                : "—"
            }
            description={
              strongestGrowth
                ? `${formatPercent(
                    strongestGrowth.change,
                  )} % projetés à l’horizon 2031.`
                : "Projection indisponible."
            }
            icon="▲"
          />
        </section>

        {mayotteResult ? (
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950 to-slate-950 p-7 text-white shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Projection départementale
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Mayotte à l’horizon 2031
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-100">
                  Projection construite à partir de
                  l’évolution démographique observée entre
                  2017 et 2026 et calculée par le moteur
                  prospectif de DiagTerritoire.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-cyan-200">
                    Population actuelle
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {formatNumber(
                      mayotteResult.projection
                        .currentValue,
                    )}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-cyan-200">
                    Projection 2031
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {formatNumber(
                      mayotteResult.projection
                        .projectedValue,
                    )}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-cyan-200">
                    Évolution projetée
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {formatPercent(
                      mayotteResult.change,
                    )} %
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Lecture territoriale
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Projections par territoire
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Comparez les trajectoires démographiques et
              ouvrez l’analyse détaillée de chaque territoire.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">
                    Territoire
                  </th>
                  <th className="px-3 py-3">
                    Niveau
                  </th>
                  <th className="px-3 py-3 text-right">
                    Population 2026
                  </th>
                  <th className="px-3 py-3 text-right">
                    Projection 2031
                  </th>
                  <th className="px-3 py-3 text-right">
                    Taux annuel
                  </th>
                  <th className="px-3 py-3 text-right">
                    Évolution
                  </th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>

              <tbody>
                {results.map((result) => (
                  <tr
                    key={result.territory.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-3 py-4 font-semibold text-slate-950">
                      {result.territory.name}
                    </td>

                    <td className="px-3 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {result.territory.level ===
                        "department"
                          ? "Département"
                          : result.territory.level ===
                              "epci"
                            ? "Intercommunalité"
                            : "Commune"}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-right text-slate-600">
                      {formatNumber(
                        result.projection.currentValue,
                      )}
                    </td>

                    <td className="px-3 py-4 text-right font-bold text-slate-950">
                      {formatNumber(
                        result.projection
                          .projectedValue,
                      )}
                    </td>

                    <td className="px-3 py-4 text-right text-slate-600">
                      {formatPercent(
                        result.projection
                          .annualGrowthRate,
                      )} %
                    </td>

                    <td className="px-3 py-4 text-right">
                      <span
                        className={`font-semibold ${
                          result.change >= 0
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        {formatPercent(
                          result.change,
                        )} %
                      </span>
                    </td>

                    <td className="px-3 py-4 text-right">
                      <Link
                        href={`/territoires/${result.territory.id}`}
                        className="font-semibold text-cyan-700 transition hover:text-cyan-900"
                      >
                        Analyser →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Méthode
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-950">
            Une projection, pas une prévision certaine
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
            Le scénario présenté prolonge la tendance
            démographique observée entre 2017 et 2026 sur
            cinq années supplémentaires. Il constitue un
            outil d’aide à la réflexion territoriale et doit
            être interprété avec les autres indicateurs,
            alertes et diagnostics disponibles dans
            DiagTerritoire.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
