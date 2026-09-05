import type {
  AlertResult,
  ProjectionResult,
} from "@/core/engines";

type TerritorialOutlookProps = {
  projections: ProjectionResult[];
  alerts: AlertResult[];
};

const alertStyles = {
  information: {
    label: "Information",
    className: "border-sky-200 bg-sky-50 text-sky-950",
  },
  vigilance: {
    label: "Vigilance",
    className: "border-amber-200 bg-amber-50 text-amber-950",
  },
  alerte: {
    label: "Alerte",
    className: "border-orange-200 bg-orange-50 text-orange-950",
  },
  critique: {
    label: "Critique",
    className: "border-rose-200 bg-rose-50 text-rose-950",
  },
} as const;

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
  }).format(value);
}

function projectionName(indicatorId: string): string {
  return indicatorId === "population-2031"
    ? "Population projetée en 2031"
    : indicatorId;
}

export default function TerritorialOutlook({
  projections,
  alerts,
}: TerritorialOutlookProps) {
  if (projections.length === 0 && alerts.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-950 to-slate-950 p-6 text-white shadow-sm print:break-inside-avoid">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Prospective territoriale
        </p>
        <h2 className="mt-2 text-2xl font-bold">Projection à cinq ans</h2>

        {projections.map((projection) => (
          <div
            key={projection.indicatorId}
            className="mt-6 rounded-2xl bg-white/10 p-5"
          >
            <p className="text-sm text-cyan-100">
              {projectionName(projection.indicatorId)}
            </p>
            <p className="mt-2 text-4xl font-bold">
              {formatNumber(projection.projectedValue)}
            </p>
            <p className="mt-1 text-sm text-cyan-100">
              habitants, scénario {projection.scenario}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/15 pt-4 text-sm">
              <div>
                <dt className="text-cyan-200">Population actuelle</dt>
                <dd className="mt-1 font-semibold">
                  {formatNumber(projection.currentValue)}
                </dd>
              </div>
              <div>
                <dt className="text-cyan-200">Évolution annuelle</dt>
                <dd className="mt-1 font-semibold">
                  {formatNumber(projection.annualGrowthRate)} %
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Veille opérationnelle
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">
          Alertes territoriales
        </h2>

        <div className="mt-6 space-y-4">
          {alerts.map((alert) => {
            const presentation = alertStyles[alert.level];

            return (
              <div
                key={alert.ruleId}
                className={`rounded-2xl border p-4 print:break-inside-avoid ${presentation.className}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {presentation.label}
                    </span>
                    <h3 className="mt-1 font-semibold">{alert.message}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-sm font-bold">
                    {formatNumber(alert.value)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 opacity-80">
                  {alert.recommendation}
                </p>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
