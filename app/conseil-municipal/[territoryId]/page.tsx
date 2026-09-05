import Link from "next/link";

import CouncilAgenda from "@/components/CouncilAgenda";
import CouncilFollowUp from "@/components/CouncilFollowUp";
import CouncilLevers from "@/components/CouncilLevers";
import CouncilPriorities from "@/components/CouncilPriorities";
import CouncilQuestions from "@/components/CouncilQuestions";
import CouncilSessionDetails from "@/components/CouncilSessionDetails";
import PrintCouncilButton from "@/components/PrintCouncilButton";
import { platformIntelligence } from "@/core";
import { getInstitutionalBody } from "@/data/institutional-bodies";

type ConseilMunicipalPageProps = {
  params: Promise<{
    territoryId: string;
  }>;
};

function priorityLabel(
  priority: "forte" | "consolider" | "preserver",
) {
  if (priority === "forte") {
    return "À traiter en priorité";
  }

  if (priority === "consolider") {
    return "À consolider";
  }

  return "À préserver";
}

export default async function ConseilMunicipalPage({
  params,
}: ConseilMunicipalPageProps) {
  const { territoryId } = await params;

  const response =
    await platformIntelligence.buildTerritorialIntelligence({
      territoryId,
      question:
        "Préparer les principaux éléments territoriaux utiles à l’assemblée délibérante du territoire.",
    });

  const result = response.analysis;

  const institutionalBody =
    getInstitutionalBody(result.territory.level);

  if (!institutionalBody) {
    throw new Error(
      "Aucune assemblée délibérante configurée pour ce niveau territorial.",
    );
  }

  const activeAlerts = result.alerts.filter(
    (alert) => alert.level !== "information",
  );

  const strongPriorities =
    result.diagnostic.actions.filter(
      (action) => action.priority === "forte",
    );

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl space-y-6 print:max-w-none">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href={`/territoires/${result.territory.id}`}
            className="text-sm font-semibold text-cyan-700"
          >
            ← Retour au territoire
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/rapport/${result.territory.id}`}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Ouvrir le rapport territorial
            </Link>

            <PrintCouncilButton />
          </div>
        </div>

        <header className="rounded-3xl bg-slate-950 p-8 text-white shadow-sm print:break-inside-avoid print:rounded-none">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            {institutionalBody.preparationTitle}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {result.territory.name}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Dossier d’aide à la préparation de la séance à partir
            des données et analyses disponibles dans DiagTerritoire.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-slate-300">
                Indice diagnostic DT
              </p>
              <p className="mt-1 text-2xl font-bold">
                {result.diagnostic.score}/100
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-slate-300">
                Priorités fortes
              </p>
              <p className="mt-1 text-2xl font-bold">
                {strongPriorities.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-slate-300">
                Signaux actifs
              </p>
              <p className="mt-1 text-2xl font-bold">
                {activeAlerts.length}
              </p>
            </div>
          </div>
        </header>

        <CouncilSessionDetails
          territoryId={result.territory.id}
          institutionalBody={institutionalBody}
        />

        <section className="rounded-3xl bg-white p-7 shadow-sm print:break-inside-avoid print:shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Note aux élus
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Situation territoriale
          </h2>

          <p className="mt-4 leading-7 text-slate-700">
            {result.assistant.summary}
          </p>
        </section>

        <CouncilPriorities
          actions={result.diagnostic.actions}
        />

        <section className="rounded-3xl bg-white p-7 shadow-sm print:break-inside-avoid print:shadow-none">
          <h2 className="text-2xl font-bold text-slate-950">
            Sujets à porter à l’attention du conseil
          </h2>

          <div className="mt-5 space-y-3">
            {result.diagnostic.actions.map((action) => (
              <article
                key={action.indicatorId}
                className="rounded-2xl border border-slate-200 p-4 print:break-inside-avoid"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {action.indicatorName}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {action.action}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {priorityLabel(action.priority)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <CouncilLevers
          alerts={result.alerts}
          recommendations={result.diagnostic.recommendations}
        />

        <CouncilQuestions
          actions={result.diagnostic.actions}
          indicators={result.indicators}
          diagnosticIndicators={result.diagnosticIndicators}
        />

        {activeAlerts.length > 0 ? (
          <section className="rounded-3xl bg-white p-7 shadow-sm print:break-inside-avoid print:shadow-none">
            <h2 className="text-2xl font-bold text-slate-950">
              Points de vigilance
            </h2>

            <div className="mt-5 space-y-3">
              {activeAlerts.map((alert) => (
                <article
                  key={alert.ruleId}
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-4 print:break-inside-avoid"
                >
                  <p className="font-semibold text-amber-950">
                    {alert.message}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    {alert.recommendation}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <CouncilFollowUp
          territoryId={result.territory.id}
          actions={result.diagnostic.actions}
        />

        <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-7">
          <h2 className="text-xl font-bold text-slate-950">
            Cadre d’utilisation
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            Ce dossier prépare les éléments territoriaux utiles aux élus.
            Il ne constitue ni une délibération, ni un avis juridique,
            ni une décision {institutionalBody.decisionLabel}.
          </p>
        </section>
      </div>
    </main>
  );
}
