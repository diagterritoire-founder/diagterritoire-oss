type CouncilAction = {
  indicatorId: string;
  indicatorName: string;
  score: number;
  priority: "forte" | "consolider" | "preserver";
  action: string;
};

type CouncilIndicator = {
  id: string;
  name: string;
  description: string;
  category: string;
  unit?: string;
  source?: string;
  updateFrequency?: string;
};

type CouncilDiagnosticIndicator = {
  id: string;
  name: string;
  value: number;
  target?: number;
  direction?: "higher-is-better" | "lower-is-better";
};

type CouncilQuestionsProps = {
  actions: CouncilAction[];
  indicators: CouncilIndicator[];
  diagnosticIndicators: CouncilDiagnosticIndicator[];
};

function formatIndicatorValue(
  value: number,
  unit?: string,
) {
  return unit ? `${value} ${unit}` : `${value}`;
}

function buildGap(
  value: number,
  target: number,
  direction:
    | "higher-is-better"
    | "lower-is-better" = "higher-is-better",
) {
  const gap =
    direction === "lower-is-better"
      ? value - target
      : target - value;

  return Math.round(gap * 10) / 10;
}

function gapLabel(gap: number) {
  if (gap <= 0) {
    return "Référence atteinte";
  }

  if (gap <= 10) {
    return "Écart modéré";
  }

  return "Écart important";
}

function buildQuestion(action: CouncilAction) {
  if (action.priority === "forte") {
    return `Quelles mesures sont envisagées pour répondre à la fragilité concernant ${action.indicatorName} ?`;
  }

  if (action.priority === "consolider") {
    return `Comment la commune prévoit-elle de renforcer le suivi concernant ${action.indicatorName} ?`;
  }

  return `Comment préserver les résultats observés concernant ${action.indicatorName} ?`;
}

export default function CouncilQuestions({
  actions,
  indicators,
  diagnosticIndicators,
}: CouncilQuestionsProps) {
  const questions = [...actions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm print:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
        Préparation de séance
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        Questions à anticiper
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Questions susceptibles d'être soulevées à partir des
        principaux constats territoriaux disponibles.
      </p>

      <div className="mt-5 space-y-4">
        {questions.map((action, index) => {
          const indicator = indicators.find(
            (item) => item.id === action.indicatorId,
          );

          const diagnosticIndicator =
            diagnosticIndicators.find(
              (item) => item.id === action.indicatorId,
            );

          const gap =
            diagnosticIndicator?.target !== undefined
              ? buildGap(
                  diagnosticIndicator.value,
                  diagnosticIndicator.target,
                  diagnosticIndicator.direction,
                )
              : undefined;

          return (
            <article
              key={action.indicatorId}
              className="rounded-2xl border border-slate-200 p-5 print:break-inside-avoid"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Question {index + 1}
              </p>

              <h3 className="mt-2 font-semibold leading-6 text-slate-950">
                {buildQuestion(action)}
              </h3>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Élément de réponse disponible
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {action.action}
                </p>
              </div>

              {indicator ? (
                <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                  <p className="text-xs font-semibold uppercase text-cyan-700">
                    Appui factuel
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {indicator.description}
                  </p>

                  <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-slate-500">
                        Catégorie
                      </dt>
                      <dd>{indicator.category}</dd>
                    </div>

                    <div>
                      <dt className="font-semibold text-slate-500">
                        Source
                      </dt>
                      <dd>
                        {indicator.source ?? "Non renseignée"}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p className="mt-4 text-xs text-amber-700">
                  Point à vérifier avant séance : la fiche source détaillée
                  de cet indicateur n’est pas disponible dans le résultat courant.
                </p>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Valeur territoriale
                  </p>
                  <p className="mt-1 font-bold text-slate-950">
                    {diagnosticIndicator
                      ? formatIndicatorValue(
                          diagnosticIndicator.value,
                          indicator?.unit,
                        )
                      : "Non disponible"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Indice diagnostic DT
                  </p>
                  <p className="mt-1 font-bold text-slate-950">
                    {action.score}/100
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Référence interne DT
                  </p>
                  <p className="mt-1 font-bold text-slate-950">
                    {diagnosticIndicator?.target !== undefined
                      ? formatIndicatorValue(
                          diagnosticIndicator.target,
                          indicator?.unit,
                        )
                      : "Non renseigné"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Écart à la référence
                  </p>
                  <p className="mt-1 font-bold text-slate-950">
                    {gap !== undefined
                      ? gap <= 0
                        ? gapLabel(gap)
                        : `${formatIndicatorValue(
                            gap,
                            indicator?.unit === "%"
                              ? "points"
                              : indicator?.unit,
                          )} — ${gapLabel(gap)}`
                      : "Non calculable"}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
