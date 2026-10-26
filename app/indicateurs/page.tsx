import Link from "next/link";
import { notFound } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";
import PageSection from "@/components/PageSection";
import StatCard from "@/components/StatCard";

import {
  IndicatorEngine,
} from "@/core/engines";

import {
  getMayotteIndicators,
  getMayotteIndicatorValues,
} from "@/data/mayotte-indicators";
import { getComparableIndicatorTerritories } from "@/data/mayotte-indicator-comparison";
import { getMayotteIndicatorProvenance } from "@/data/mayotte-indicator-provenance";

import {
  indicatorTerritoryGroups,
  resolveMayotteIndicatorTerritory,
} from "@/data/mayotte-indicator-territories";

const categoryIcons: Record<string, string> = {
  "Démographie": "👥",
  "Emploi": "💼",
  "Formation": "🎓",
  "Habitat": "🏠",
  "Numérique": "🌐",
};

function formatIndicatorValue(
  value: number,
  valueType: string,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      maximumFractionDigits:
        valueType === "percentage"
          ? 1
          : 0,
    },
  ).format(value);
}

type IndicateursPageProps = {
  searchParams: Promise<{
    territoire?: string | string[];
  }>;
};

export default async function IndicateursPage({
  searchParams,
}: IndicateursPageProps) {
  const params = await searchParams;
  const territory = resolveMayotteIndicatorTerritory(
    params.territoire,
  );

  if (!territory) {
    notFound();
  }

  const territoryId = territory.id;
  const territoryName = territory.name;

  const comparableTerritories = getComparableIndicatorTerritories(territoryId);
  const suggestedPeer =
    comparableTerritories.find((item) => item.parentId === territory.parentId) ??
    comparableTerritories[0];

  const indicators =
    getMayotteIndicators(
      territoryId,
    );

  const indicatorValues =
    getMayotteIndicatorValues(
      territoryId,
    );

  const valueByIndicatorId =
    new Map(
      indicatorValues.map(
        (value) => [
          value.indicatorId,
          value,
        ],
      ),
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
      description={`Explorez le référentiel d’indicateurs et les valeurs territoriales disponibles pour ${territoryName}.`}
    >
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Choisir un territoire
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Consultez les indicateurs disponibles pour une commune,
          une intercommunalité ou Mayotte.
        </p>
        <form
          action="/indicateurs"
          method="get"
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label
            htmlFor="indicateurs-territoire"
            className="flex-1 text-sm font-semibold text-slate-700"
          >
            Territoire consulté
            <select
              id="indicateurs-territoire"
              name="territoire"
              defaultValue={territoryId}
              required
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950"
            >
              {indicatorTerritoryGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.territories.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Afficher les indicateurs
          </button>
        </form>
        {suggestedPeer ? (
          <Link
            href={"/indicateurs/comparer?territoireA=" + encodeURIComponent(territoryId) + "&territoireB=" + encodeURIComponent(suggestedPeer.id)}
            className="mt-4 inline-block text-sm font-semibold text-cyan-800 underline"
          >
            Comparer les valeurs avec un autre territoire du même niveau
          </Link>
        ) : null}
      </section>

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
        subtitle={`Valeurs disponibles pour ${territoryName}, avec unité, période de référence, source et fréquence de mise à jour.`}
      >
        <p className="mb-4 text-sm text-slate-600">
          Les valeurs proviennent de jeux de données intégrés à DiagTerritoire.
          La fréquence indiquée décrit celle de la source et ne signifie pas
          une actualisation automatique. Vérifiez le millésime avant tout usage.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {indicators.map(
            (indicator) => {
              const territorialValue =
                valueByIndicatorId.get(
                  indicator.id,
                );

              const hasValue =
                territorialValue
                  ?.numericValue !==
                undefined;

              const provenance = getMayotteIndicatorProvenance(
                indicator.id,
                territory.level,
              );

              return (
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

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Valeur territoriale
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {hasValue
                        ? `${formatIndicatorValue(
                            territorialValue
                              .numericValue as number,
                            indicator.valueType,
                          )}${indicator.unit
                            ? ` ${indicator.unit}`
                            : ""}`
                        : "Valeur non disponible"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {territoryName}
                    </p>
                  </div>

                  <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Période
                      </dt>
                      <dd className="mt-1 font-medium text-slate-700">
                        {
                          territorialValue
                            ?.referencePeriod ??
                          "Non disponible"
                        }
                      </dd>
                    </div>

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
                        {indicator.source ?? "Non renseignée"}
                      </dd>
                    </div>
                    {provenance ? (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Traçabilité
                        </dt>
                        <dd className="mt-1 space-y-2 leading-6 text-slate-700">
                          <p className="font-semibold">
                            {provenance.origin === "publication"
                              ? "Valeur publiée directement"
                              : "Valeur calculée par DiagTerritoire"}
                          </p>
                          <p>{provenance.method}</p>
                          <ul className="list-disc space-y-1 pl-5">
                            {provenance.sources.map((source) => (
                              <li key={source.url}>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-cyan-800 underline"
                                >
                                  {source.label}
                                </a>
                                {source.publicationDate
                                  ? " — publication du " + source.publicationDate
                                  : " — date de publication non renseignée"}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </article>
              );
            },
          )}
        </div>
      </PageSection>
    </DashboardLayout>
  );
}
