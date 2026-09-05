import Link from "next/link";

import DashboardLayout from "@/components/DashboardLayout";
import PageSection from "@/components/PageSection";
import StatCard from "@/components/StatCard";

import { platformIntelligence } from "@/core";
import { AlertEngine } from "@/core/engines";

import {
  mayotteCommunes,
  mayotteDepartment,
  mayotteEpcis,
} from "@/data/mayotte-territories";

const territories = [
  ...(mayotteDepartment ? [mayotteDepartment] : []),
  ...mayotteEpcis,
  ...mayotteCommunes,
];

const levelPresentation = {
  critique: {
    label: "Critique",
    className:
      "border-rose-200 bg-rose-50 text-rose-950",
  },
  alerte: {
    label: "Alerte",
    className:
      "border-orange-200 bg-orange-50 text-orange-950",
  },
  vigilance: {
    label: "Vigilance",
    className:
      "border-amber-200 bg-amber-50 text-amber-950",
  },
  information: {
    label: "Maîtrisé",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
} as const;

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
  }).format(value);
}

export default async function VeillePage() {
  const analyses = await Promise.all(
    territories.map(async (territory) => {
      try {
        const analysis =
          await platformIntelligence.analyzeTerritory(
            territory.id,
            "Identifier les principaux signaux de veille territoriale.",
          );

        return {
          territory,
          alerts: analysis.alerts,
          error: null,
        };
      } catch (error) {
        return {
          territory,
          alerts: [],
          error:
            error instanceof Error
              ? error.message
              : "Analyse indisponible.",
        };
      }
    }),
  );

  const flattened = analyses.flatMap(
    ({ territory, alerts }) =>
      alerts.map((alert) => ({
        territory,
        alert,
      })),
  );

  const activeAlerts = AlertEngine.sortByPriority(
    AlertEngine.getActiveAlerts(
      flattened.map((item) => item.alert),
    ),
  );

  const activeKeys = new Set(
    activeAlerts.map((alert) => alert.ruleId),
  );

  const activeItems = flattened
    .filter((item) =>
      activeKeys.has(item.alert.ruleId),
    )
    .sort((first, second) => {
      const rank = {
        critique: 4,
        alerte: 3,
        vigilance: 2,
        information: 1,
      };

      return (
        rank[second.alert.level] -
        rank[first.alert.level]
      );
    });

  const masteredItems = flattened.filter(
    (item) =>
      item.alert.level === "information",
  );

  const criticalCount = activeItems.filter(
    ({ alert }) =>
      alert.level === "critique",
  ).length;

  const vigilanceCount = activeItems.filter(
    ({ alert }) =>
      alert.level === "vigilance",
  ).length;

  const territoriesWithActiveAlerts =
    new Set(
      activeItems.map(
        ({ territory }) => territory.id,
      ),
    ).size;

  const failedAnalyses = analyses.filter(
    ({ error }) => error !== null,
  );

  return (
    <DashboardLayout
      eyebrow="Veille territoriale"
      title="Signaux territoriaux"
      description="Repérez les territoires nécessitant une attention sur l’emploi et la couverture numérique."
    >
      <div className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Territoires suivis"
            value={territories.length}
            description="Mayotte, EPCI et communes couverts par la veille DT."
            icon="◎"
          />

          <StatCard
            label="Signaux actifs"
            value={activeItems.length}
            description="Alertes de vigilance ou critiques actuellement détectées."
            icon="🔔"
          />

          <StatCard
            label="Territoires concernés"
            value={territoriesWithActiveAlerts}
            description="Territoires présentant au moins un signal actif."
            icon="⌖"
          />

          <StatCard
            label="Alertes critiques"
            value={criticalCount}
            description={`${vigilanceCount} signal(s) supplémentaire(s) en vigilance.`}
            icon="⚠"
          />
        </section>

        {failedAnalyses.length > 0 ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            Certaines analyses territoriales n’ont pas pu être calculées.
          </section>
        ) : null}

        <PageSection
          title="Signaux à traiter"
          subtitle="Les alertes sont classées automatiquement selon leur niveau de sévérité."
        >
          {activeItems.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
              Aucun signal actif n’est actuellement détecté.
            </div>
          ) : (
            <div className="space-y-4">
              {activeItems.map(
                ({ territory, alert }) => {
                  const presentation =
                    levelPresentation[
                      alert.level
                    ];

                  return (
                    <article
                      key={`${territory.id}-${alert.ruleId}`}
                      className={`rounded-2xl border p-5 ${presentation.className}`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                              {presentation.label}
                            </span>

                            <span className="text-sm font-semibold">
                              {territory.name}
                            </span>
                          </div>

                          <h3 className="mt-3 font-semibold">
                            {alert.message}
                          </h3>

                          <p className="mt-3 text-sm leading-6 opacity-85">
                            {alert.recommendation}
                          </p>
                        </div>

                        <div className="shrink-0 text-left md:text-right">
                          <p className="text-2xl font-bold">
                            {formatNumber(
                              alert.value,
                            )}
                          </p>

                          <p className="mt-1 text-xs opacity-70">
                            Observation du{" "}
                            {new Date(
                              alert.detectedAt,
                            ).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>

                          <Link
                            href={`/territoires/${territory.id}`}
                            className="mt-3 inline-flex text-sm font-semibold underline underline-offset-4"
                          >
                            Ouvrir le diagnostic →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </PageSection>

        <PageSection
          title="Situations maîtrisées"
          subtitle="Indicateurs actuellement sous les seuils de vigilance."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {masteredItems
              .slice(0, 12)
              .map(({ territory, alert }) => (
                <article
                  key={`${territory.id}-${alert.ruleId}`}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {territory.name}
                  </p>

                  <p className="mt-2 text-sm font-medium text-emerald-950">
                    {alert.message}
                  </p>

                  <p className="mt-2 text-xs text-emerald-800">
                    Valeur :{" "}
                    {formatNumber(alert.value)}
                  </p>
                </article>
              ))}
          </div>

          {masteredItems.length > 12 ? (
            <p className="mt-4 text-xs text-slate-500">
              {masteredItems.length - 12} autre(s)
              situation(s) maîtrisée(s) non affichée(s).
            </p>
          ) : null}
        </PageSection>
      </div>
    </DashboardLayout>
  );
}
