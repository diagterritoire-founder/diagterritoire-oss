import DashboardLayout from "@/components/DashboardLayout";
import PageSection from "@/components/PageSection";
import StatCard from "@/components/StatCard";

import {
  IndicatorEngine,
} from "@/core/engines";

import {
  getMayotteIndicators,
} from "@/data/mayotte-indicators";

import {
  mayotteDepartment,
} from "@/data/mayotte-territories";

const categoryIcons: Record<string, string> = {
  "Démographie": "👥",
  "Emploi": "💼",
  "Formation": "🎓",
  "Habitat": "🏠",
  "Numérique": "🌐",
};

export default function IndicateursPage() {
  const territoryId =
    mayotteDepartment?.id ??
    "territory-mayotte";

  const indicators =
    getMayotteIndicators(
      territoryId,
    );

  const categories =
    IndicatorEngine.countByCategory(
      indicators,
    );

  const categoryEntries =
    Object.entries(categories).sort(
      ([first], [second]) =>
        first.localeCompare(
          second,
          "fr",
        ),
    );

  const sourceCount =
    new Set(
      indicators
        .map(
          (indicator) =>
            indicator.source,
        )
        .filter(Boolean),
    ).size;

  const frequencyCount =
    new Set(
      indicators
        .map(
          (indicator) =>
            indicator.updateFrequency,
        )
        .filter(Boolean),
    ).size;

  return (
    <DashboardLayout
      eyebrow="Indicateurs"
      title="Catalogue des indicateurs"
      description="Explorez le référentiel d’indicateurs actuellement intégré à DiagTerritoire pour Mayotte."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Indicateurs"
          value={
            IndicatorEngine.count(
              indicators,
            )
          }
          description="Indicateurs actuellement documentés dans le référentiel DT"
          icon="📊"
        />

        <StatCard
          label="Catégories"
          value={
            categoryEntries.length
          }
          description="Domaines thématiques couverts par le catalogue"
          icon="🗂️"
        />

        <StatCard
          label="Sources"
          value={sourceCount}
          description="Références statistiques et administratives documentées"
          icon="📚"
        />

        <StatCard
          label="Fréquences"
          value={frequencyCount}
          description="Rythmes de mise à jour actuellement renseignés"
          icon="🗓️"
        />
      </section>

      <PageSection
        title="Répartition par catégorie"
        subtitle="Vue synthétique des domaines actuellement couverts par le référentiel."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {categoryEntries.map(
            ([category, count]) => (
              <article
                key={category}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="text-2xl">
                  {
                    categoryIcons[
                      category
                    ] ?? "📌"
                  }
                </div>

                <p className="mt-4 font-semibold text-slate-950">
                  {category}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {count} indicateur
                  {count > 1
                    ? "s"
                    : ""}
                </p>
              </article>
            ),
          )}
        </div>
      </PageSection>

      <PageSection
        title="Référentiel des indicateurs"
        subtitle="Métadonnées, source, unité et fréquence de mise à jour. Les valeurs territoriales détaillées seront intégrées dans l’étape suivante."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {indicators.map(
            (indicator) => (
              <article
                key={indicator.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                      {
                        indicator.category
                      }
                    </span>

                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Actif
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-950">
                  {indicator.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {
                    indicator.description
                  }
                </p>

                <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Unité
                    </dt>
                    <dd className="mt-1 font-medium text-slate-700">
                      {
                        indicator.unit ??
                        "Non renseignée"
                      }
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Mise à jour
                    </dt>
                    <dd className="mt-1 font-medium text-slate-700">
                      {
                        indicator.updateFrequency ??
                        "Non renseignée"
                      }
                    </dd>
                  </div>

                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Source
                    </dt>
                    <dd className="mt-1 leading-6 text-slate-700">
                      {
                        indicator.source ??
                        "Non renseignée"
                      }
                    </dd>
                  </div>
                </dl>
              </article>
            ),
          )}
        </div>
      </PageSection>
    </DashboardLayout>
  );
}
