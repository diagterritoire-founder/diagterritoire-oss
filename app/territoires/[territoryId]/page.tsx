import Link from "next/link";

import DashboardLayout from "@/components/DashboardLayout";
import TerritorialDiagnostic from "@/components/TerritorialDiagnostic";
import TerritorialOutlook from "@/components/TerritorialOutlook";
import { platformIntelligence } from "@/core";
import {
  FRANCE_TRAVAIL_COMMUNAL_SOURCE,
  MAYOTTE_JOB_SEEKERS_ABC_2024_T4,
  MAYOTTE_LABOUR_MARKET_2026_T2,
} from "@/data/mayotte-labour-market";
import { mayotteCommunes } from "@/data/mayotte-territories";
import { getInstitutionalBody } from "@/data/institutional-bodies";

type TerritoryAnalysisPageProps = {
  params: Promise<{
    territoryId: string;
  }>;
};

async function loadTerritorialAnalysis(
  territoryId: string,
) {
  try {
    const response =
      await platformIntelligence.buildTerritorialIntelligence({
        territoryId,
        question:
          "Présenter les principaux éléments d’analyse du territoire.",
      });

    return {
      result: response.analysis,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      error:
        error instanceof Error
          ? error.message
          : "L’analyse n’a pas pu être générée.",
    };
  }
}

export default async function TerritoryAnalysisPage({
  params,
}: TerritoryAnalysisPageProps) {
  const { territoryId } = await params;
  const { result, error } =
    await loadTerritorialAnalysis(territoryId);

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">
            Analyse indisponible
          </h1>

          <p className="mt-3 text-slate-600">
            {error}
          </p>

          <Link
            href="/territoires"
            className="mt-6 inline-block font-medium text-cyan-700"
          >
            ← Retour aux territoires
          </Link>
        </div>
      </main>
    );
  }

  const institutionalBody =
    getInstitutionalBody(result.territory.level);

  const isMayotteDepartment =
    result.territory.id === "territory-mayotte";

  let labourMarketCommuneCodes = mayotteCommunes.map(
    (commune) => commune.code,
  );

  if (result.territory.level === "commune") {
    labourMarketCommuneCodes = [result.territory.code];
  } else if (result.territory.level === "epci") {
    labourMarketCommuneCodes = mayotteCommunes
      .filter(
        (commune) =>
          commune.parentId === result.territory.id,
      )
      .map((commune) => commune.code);
  }

  const registeredJobSeekersABC = isMayotteDepartment
    ? MAYOTTE_LABOUR_MARKET_2026_T2.registeredJobSeekersABC
    : labourMarketCommuneCodes.reduce(
        (total, code) =>
          total +
          (MAYOTTE_JOB_SEEKERS_ABC_2024_T4[code] ?? 0),
        0,
      );

  const labourMarketPeriod = isMayotteDepartment
    ? MAYOTTE_LABOUR_MARKET_2026_T2.periodLabel
    : "4ᵉ trimestre 2024";

  const labourMarketSource = isMayotteDepartment
    ? MAYOTTE_LABOUR_MARKET_2026_T2.source
    : FRANCE_TRAVAIL_COMMUNAL_SOURCE;

  return (
    <DashboardLayout
      eyebrow="Analyse territoriale"
      title={result.territory.name}
      description="Diagnostic, pilotage, prospective et restitution du territoire."
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/territoires"
          className="inline-flex text-sm font-medium text-cyan-700"
        >
          ← Retour aux territoires
        </Link>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Mise à jour le{" "}
              {new Date(result.generatedAt).toLocaleString(
                "fr-FR",
                {
                  dateStyle: "long",
                  timeStyle: "short",
                },
              )}
            </p>

            <div className="flex flex-wrap gap-3">
              {result.territory.id ===
              "territory-commune-dzaoudzi-labattoir" ? (
                <Link
                  href={`/espace-metiers/${result.territory.id}`}
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Espace Métiers
                </Link>
              ) : null}

              {institutionalBody ? (
                <Link
                  href={`/conseil-municipal/${result.territory.id}`}
                  className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
                >
                  {institutionalBody.preparationButton}
                </Link>
              ) : null}

              <Link
                href={`/rapport/${result.territory.id}`}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Générer le rapport
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Indicateurs disponibles
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {result.indicators.length + 1}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Projections disponibles
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {result.projections.length}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Alertes opérationnelles
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {result.alerts.length}
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                {isMayotteDepartment
                  ? "Marché du travail · donnée récente"
                  : "Marché du travail · donnée territoriale disponible"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Inscrits à France Travail
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Moyenne trimestrielle des personnes inscrites
                en catégories A, B ou C.
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-4xl font-bold text-slate-950">
                {registeredJobSeekersABC.toLocaleString("fr-FR")}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {labourMarketPeriod}
              </p>
            </div>
          </div>

          <a
            href={labourMarketSource}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex text-sm font-semibold text-cyan-800 underline decoration-cyan-300 underline-offset-4"
          >
            Consulter la source France Travail / Dares
          </a>

          {isMayotteDepartment ? (
            <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-500">
              {MAYOTTE_LABOUR_MARKET_2026_T2.methodologyNote}
            </p>
          ) : null}
        </section>

        <TerritorialDiagnostic
          diagnostic={result.diagnostic}
          assistant={result.assistant}
          territoryLevel={result.territory.level}
        />

        <TerritorialOutlook
          projections={result.projections}
          alerts={result.alerts}
        />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <h2 className="font-semibold text-slate-950">
            Sources des données
          </h2>
          <p className="mt-2">
            Insee — recensement de Mayotte 2017 et
            recensement réalisé entre novembre 2025 et
            janvier 2026.
          </p>
          <p className="mt-2">
            France Travail / Dares — inscrits en catégories
            A, B et C.{" "}
            {isMayotteDepartment
              ? "Situation conjoncturelle : deuxième trimestre 2026 à Mayotte. Les données communales utilisées pour les comparaisons territoriales restent celles du quatrième trimestre 2024."
              : "Données communales du quatrième trimestre 2024, agrégées le cas échéant."}
          </p>
          <p className="mt-2">
            Arcep — éligibilité des locaux au réseau fixe,
            premier trimestre 2026.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
