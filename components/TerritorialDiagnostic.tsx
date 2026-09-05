import { buildTerritorialActionPlan } from "@/core/services/TerritorialActionPlanService";

type DiagnosticFinding = {
  indicatorId: string;
  indicatorName: string;
  score: number;
  message: string;
};

type DiagnosticAction = {
  indicatorId: string;
  indicatorName: string;
  score: number;
  priority:
    | "forte"
    | "consolider"
    | "preserver";
  action: string;
};

type TerritorialDiagnosticProps = {
  diagnostic: {
    score: number;
    status: string;
    strengths: DiagnosticFinding[];
    weaknesses: DiagnosticFinding[];
    alerts: DiagnosticFinding[];
    recommendations: string[];
    actions: DiagnosticAction[];
  };
  assistant: {
    summary: string;
  };
  showSummary?: boolean;
  territoryLevel?: string;
};

const statusLabels: Record<string, string> = {
  favorable: "Situation favorable",
  vigilance: "Vigilance nécessaire",
  critique: "Situation prioritaire",
};

function FindingList({
  title,
  icon,
  findings,
  emptyMessage,
  colorClass,
}: {
  title: string;
  icon: string;
  findings: DiagnosticFinding[];
  emptyMessage: string;
  colorClass: string;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm print:break-inside-avoid">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h2>

      {findings.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {findings.map((finding) => (
            <article
              key={finding.indicatorId}
              className={`rounded-2xl border p-4 print:break-inside-avoid ${colorClass}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {finding.indicatorName}
                  </h3>
                  <p className="mt-1 text-sm opacity-80">
                    {finding.message}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-bold shadow-sm">
                  {finding.score}/100
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function TerritorialDiagnostic({
  diagnostic,
  assistant,
  showSummary = true,
  territoryLevel,
}: TerritorialDiagnosticProps) {
  const statusLabel =
    statusLabels[diagnostic.status] ??
    diagnostic.status;

  const scoreColor =
    diagnostic.score >= 70
      ? "bg-emerald-500"
      : diagnostic.score >= 40
        ? "bg-amber-500"
        : "bg-rose-500";

  const actionPlan =
    buildTerritorialActionPlan(
      diagnostic.actions,
      territoryLevel,
    );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
              Diagnostic territorial
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              {statusLabel}
            </h2>
            {showSummary ? (
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                {assistant.summary}
              </p>
            ) : null}
          </div>

          <div className="text-center">
            <p className="text-5xl font-bold">
              {diagnostic.score}
            </p>
            <p className="text-sm text-slate-300">
              sur 100
            </p>
          </div>
        </div>

        <div
          className="mt-6 h-3 overflow-hidden rounded-full bg-slate-700"
          role="progressbar"
          aria-label="Indice diagnostic DT"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={diagnostic.score}
        >
          <div
            className={`h-full rounded-full ${scoreColor}`}
            style={{ width: `${diagnostic.score}%` }}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 print:block print:space-y-4">
        <article className="rounded-2xl bg-emerald-50 p-5 text-emerald-950">
          <p className="text-sm font-medium">Points forts</p>
          <p className="mt-2 text-3xl font-bold">
            {diagnostic.strengths.length}
          </p>
        </article>

        <article className="rounded-2xl bg-amber-50 p-5 text-amber-950">
          <p className="text-sm font-medium">Points à surveiller</p>
          <p className="mt-2 text-3xl font-bold">
            {diagnostic.weaknesses.length}
          </p>
        </article>

        <article className="rounded-2xl bg-rose-50 p-5 text-rose-950">
          <p className="text-sm font-medium">Priorités</p>
          <p className="mt-2 text-3xl font-bold">
            {diagnostic.alerts.length}
          </p>
        </article>
      </section>

      <div className="grid gap-6 lg:grid-cols-3 print:block print:space-y-6">
        <FindingList
          title="Points forts"
          icon="✓"
          findings={diagnostic.strengths}
          emptyMessage="Aucun point fort identifié."
          colorClass="border-emerald-200 bg-emerald-50 text-emerald-950"
        />

        <FindingList
          title="À surveiller"
          icon="!"
          findings={diagnostic.weaknesses}
          emptyMessage="Aucun point nécessitant une vigilance."
          colorClass="border-amber-200 bg-amber-50 text-amber-950"
        />

        <FindingList
          title="Actions prioritaires"
          icon="⚠"
          findings={diagnostic.alerts}
          emptyMessage="Aucune priorité critique."
          colorClass="border-rose-200 bg-rose-50 text-rose-950"
        />
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Pilotage
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Plan d’action territorial
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            5 politiques publiques territoriales
          </p>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Le diagnostic alimente le pilotage sans se substituer
          aux politiques publiques de la collectivité.
        </p>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {actionPlan.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 p-5 print:break-inside-avoid"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                    {item.scopeLabel}
                  </p>

                  <h3 className="mt-1 font-semibold text-slate-950">
                    {item.title}
                  </h3>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    item.priority === "forte"
                      ? "bg-rose-50 text-rose-700"
                      : item.priority ===
                          "consolider"
                        ? "bg-amber-50 text-amber-700"
                        : item.priority ===
                            "preserver"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.priority === "forte"
                    ? "Signal prioritaire"
                    : item.priority ===
                        "consolider"
                      ? "Signal à consolider"
                      : item.priority ===
                          "preserver"
                        ? "Signal favorable"
                        : "À documenter"}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.description}
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Orientation d’action
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-800">
                  {item.action}
                </p>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                {item.diagnosticScope}
              </p>

              {item.signals.length > 0 ? (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Indicateurs mobilisés
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.signals.map(
                      (signal) => (
                        <span
                          key={
                            signal.indicatorId
                          }
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                        >
                          {
                            signal.indicatorName
                          }{" "}
                          · {signal.score}/100
                        </span>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm print:break-inside-avoid">
        <h2 className="text-xl font-semibold text-slate-950">
          Recommandations
        </h2>

        <ol className="mt-4 space-y-3">
          {diagnostic.recommendations.map(
            (recommendation, index) => (
              <li
                key={recommendation}
                className="flex gap-3 rounded-2xl bg-cyan-50 p-4 text-cyan-950"
              >
                <span className="font-bold">
                  {index + 1}.
                </span>
                <span>{recommendation}</span>
              </li>
            ),
          )}
        </ol>
      </section>
    </div>
  );
}
