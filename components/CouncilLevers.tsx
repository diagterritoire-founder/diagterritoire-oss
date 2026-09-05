type CouncilAlert = {
  ruleId: string;
  level: string;
  recommendation: string;
};

type CouncilLeversProps = {
  alerts: CouncilAlert[];
  recommendations: string[];
};

export default function CouncilLevers({
  alerts,
  recommendations,
}: CouncilLeversProps) {
  const activeAlertRecommendations = alerts
    .filter((alert) => alert.level !== "information")
    .map((alert) => alert.recommendation);

  const levers = [
    ...new Set([
      ...activeAlertRecommendations,
      ...recommendations,
    ]),
  ].slice(0, 5);

  if (levers.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm print:break-inside-avoid print:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
        Aide à la décision
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        Leviers à examiner
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Pistes issues des alertes et du diagnostic territorial
        actuellement disponibles dans DiagTerritoire.
      </p>

      <div className="mt-5 space-y-3">
        {levers.map((lever, index) => (
          <article
            key={`${index}-${lever}`}
            className="flex gap-4 rounded-2xl border border-slate-200 p-4 print:break-inside-avoid"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-700">
              {index + 1}
            </div>

            <p className="text-sm leading-6 text-slate-700">
              {lever}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Ces leviers constituent des pistes d’examen.
        Ils ne préjugent ni de la compétence juridique,
        ni de la décision finale de la collectivité.
      </p>
    </section>
  );
}
