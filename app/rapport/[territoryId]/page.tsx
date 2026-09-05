import Link from "next/link";

import PrintCouncilButton from "@/components/PrintCouncilButton";
import TerritorialDiagnostic from "@/components/TerritorialDiagnostic";
import TerritorialOutlook from "@/components/TerritorialOutlook";
import { platformIntelligence } from "@/core";
import {
  FRANCE_TRAVAIL_COMMUNAL_SOURCE,
  MAYOTTE_JOB_SEEKERS_ABC_2024_T4,
  MAYOTTE_LABOUR_MARKET_2026_T2,
} from "@/data/mayotte-labour-market";
import { mayotteCommunes } from "@/data/mayotte-territories";

type ReportPageProps = {
  params: Promise<{
    territoryId: string;
  }>;
};

export default async function ReportPage({
  params,
}: ReportPageProps) {
  const { territoryId } = await params;

  const response =
    await platformIntelligence.buildTerritorialIntelligence({
      territoryId,
      question:
        "Produire une synthèse exécutive destinée à la restitution territoriale.",
    });

  const result = response.analysis;

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

  const strongPriorities =
    result.diagnostic.actions.filter(
      (action) => action.priority === "forte",
    ).length;

  const activeAlerts = result.alerts.filter(
    (alert) => alert.level !== "information",
  ).length;

  const priorityNames = [...result.diagnostic.actions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((action) => action.indicatorName);

  const mainProjection = result.projections[0];

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(value);

  const prioritySentence =
    priorityNames.length > 0
      ? `Les priorités portent principalement sur ${priorityNames.join(
          ", ",
        )}.`
      : "Aucune priorité forte n’est actuellement identifiée.";

  const alertSentence =
    activeAlerts > 0
      ? `${activeAlerts} alerte${activeAlerts > 1 ? "s" : ""} opérationnelle${
          activeAlerts > 1 ? "s" : ""
        } appelle${activeAlerts > 1 ? "nt" : ""} un suivi renforcé.`
      : "Aucune alerte opérationnelle active n’est actuellement relevée.";

  const projectionSentence = mainProjection
    ? `À l’horizon 2031, la population est projetée à ${formatNumber(
        mainProjection.projectedValue,
      )} habitants, contre ${formatNumber(
        mainProjection.currentValue,
      )} actuellement, ce qui renforce les besoins d’anticipation et de programmation.`
    : "";

  const executiveSummary = [
    `Le territoire présente un score de ${result.diagnostic.score}/100.`,
    prioritySentence,
    alertSentence,
    projectionSentence,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl space-y-6 print:max-w-none">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href={`/territoires/${result.territory.id}`}
            className="inline-flex text-sm font-semibold text-cyan-700"
          >
            ← Retour à l’analyse
          </Link>

          <PrintCouncilButton />
        </div>

        <header className="rounded-3xl bg-white p-8 shadow-sm print:break-inside-avoid print:shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Restitution décisionnelle
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Rapport territorial — {result.territory.name}
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Généré le{" "}
            {new Date(result.generatedAt).toLocaleString(
              "fr-FR",
              {
                dateStyle: "long",
                timeStyle: "short",
              },
            )}
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm print:break-inside-avoid print:shadow-none">
            <p className="text-sm text-slate-500">
              Indice diagnostic DT
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {result.diagnostic.score}/100
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm print:break-inside-avoid print:shadow-none">
            <p className="text-sm text-slate-500">
              Points de vigilance
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {result.diagnostic.weaknesses.length +
                result.diagnostic.alerts.length}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm print:break-inside-avoid print:shadow-none">
            <p className="text-sm text-slate-500">
              Priorités fortes
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {strongPriorities}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm print:break-inside-avoid print:shadow-none">
            <p className="text-sm text-slate-500">
              Alertes opérationnelles
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {activeAlerts}
            </p>
          </article>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm print:break-inside-avoid print:shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Synthèse exécutive
          </p>

          <p className="mt-4 whitespace-pre-line leading-7 text-slate-700">
            {executiveSummary}
          </p>
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-cyan-50 p-7 shadow-sm print:break-inside-avoid print:shadow-none">
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

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
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
            Source France Travail / Dares
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
          showSummary={false}
        />

        <TerritorialOutlook
          projections={result.projections}
          alerts={result.alerts}
        />

        <section className="rounded-3xl border border-slate-200 bg-white p-7 text-sm leading-6 text-slate-600 print:break-inside-avoid">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Références
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-950">
            Sources des données
          </h2>

          <p className="mt-4">
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

          <p className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500">
            Rapport généré à partir des données et analyses
            disponibles dans DiagTerritoire à la date indiquée
            en tête du document.
          </p>
        </section>
      </div>
    </main>
  );
}
