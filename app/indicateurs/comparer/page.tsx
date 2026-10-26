import Link from "next/link";

import DashboardLayout from "@/components/DashboardLayout";
import PageSection from "@/components/PageSection";

import { compareMayotteIndicatorValues } from "@/data/mayotte-indicator-comparison";
import { indicatorTerritoryGroups } from "@/data/mayotte-indicator-territories";

const DEFAULT_LEFT = "territory-commune-dzaoudzi-labattoir";
const DEFAULT_RIGHT = "territory-commune-pamandzi";

type PageProps = {
  searchParams: Promise<{
    territoireA?: string | string[];
    territoireB?: string | string[];
  }>;
};

function valueFromQuery(value: string | string[] | undefined, fallback: string) {
  return value === undefined ? fallback : typeof value === "string" ? value : "";
}

function formatNumber(value: number | undefined, unit: string): string {
  if (value === undefined || !Number.isFinite(value)) {
    return "Non disponible";
  }

  const number = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: unit === "%" ? 1 : 0,
  }).format(value);

  return unit ? number + " " + unit : number;
}

function formatDifference(
  difference: number | undefined,
  unit: string,
): string {
  if (difference === undefined || !Number.isFinite(difference)) {
    return "Non calculable";
  }

  const number = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: unit === "points" ? 1 : 0,
  }).format(difference);

  return (difference > 0 ? "+" : "") + number + " " + unit;
}

export default async function ComparerIndicateursPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const leftId = valueFromQuery(query.territoireA, DEFAULT_LEFT);
  const rightId = valueFromQuery(query.territoireB, DEFAULT_RIGHT);
  const comparison = compareMayotteIndicatorValues(leftId, rightId);

  const groups = indicatorTerritoryGroups.filter(
    (group) => group.label !== "Département",
  );

  return (
    <DashboardLayout
      eyebrow="Indicateurs"
      title="Comparer les valeurs territoriales"
      description="Comparez les statistiques documentées de deux communes ou de deux intercommunalités de Mayotte, sans confondre les valeurs et les scores de diagnostic."
    >
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Choisir deux territoires de même niveau
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          L’écart est calculé comme territoire A moins territoire B.
          Pour un taux, il est exprimé en points de pourcentage.
          Une valeur manquante ou une période différente empêche le calcul.
          Les données intégrées ne se synchronisent pas automatiquement avec les sources officielles.
        </p>
        <form
          action="/indicateurs/comparer"
          method="get"
          className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          {([
            { name: "territoireA", label: "Territoire A", selected: leftId },
            { name: "territoireB", label: "Territoire B", selected: rightId },
          ] as const).map((field) => (
            <label key={field.name} className="text-sm font-semibold text-slate-700">
              {field.label}
              <select
                name={field.name}
                defaultValue={field.selected}
                required
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950"
              >
                {groups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.territories.map((territory) => (
                      <option key={territory.id} value={territory.id}>
                        {territory.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          ))}
          <button
            type="submit"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Comparer
          </button>
        </form>
        <Link
          href="/indicateurs"
          className="mt-4 inline-block text-sm font-semibold text-cyan-800 underline"
        >
          Retour au catalogue des indicateurs
        </Link>
      </section>

      {comparison ? (
        <PageSection
          title={comparison.left.name + " / " + comparison.right.name}
          subtitle="Valeurs issues du même référentiel. Sources, unités et périodes sont précisées pour chaque indicateur. Écart = A − B, sans interprétation normative."
        >
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-[860px] w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                Comparaison des huit indicateurs territoriaux documentés
              </caption>
              <thead className="bg-slate-50 text-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-4">Indicateur et source</th>
                  <th scope="col" className="px-4 py-4">{comparison.left.name} (A)</th>
                  <th scope="col" className="px-4 py-4">{comparison.right.name} (B)</th>
                  <th scope="col" className="px-4 py-4">Écart A − B</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.indicatorId} className="border-t border-slate-100 align-top">
                    <th scope="row" className="px-4 py-4 font-normal">
                      <p className="font-semibold text-slate-950">{row.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{row.category}</p>
                      <p className="mt-2 text-xs text-slate-600">Source : {row.source}</p>
                      {row.provenance ? (
                        <div className="mt-3 space-y-2 text-xs text-slate-600">
                          <p className="font-semibold">
                            {row.provenance.origin === "publication"
                              ? "Valeur publiée directement"
                              : "Valeur calculée par DiagTerritoire"}
                          </p>
                          <p>{row.provenance.method}</p>
                          <ul className="list-disc space-y-1 pl-4">
                            {row.provenance.sources.map((source) => (
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
                        </div>
                      ) : null}
                    </th>
                    <td className="px-4 py-4">
                      <strong className="text-slate-950">
                        {formatNumber(row.leftValue, row.unit)}
                      </strong>
                      <p className="mt-2 text-xs text-slate-500">
                        Période : {row.leftPeriod ?? "Non disponible"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <strong className="text-slate-950">
                        {formatNumber(row.rightValue, row.unit)}
                      </strong>
                      <p className="mt-2 text-xs text-slate-500">
                        Période : {row.rightPeriod ?? "Non disponible"}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-950">
                      {formatDifference(row.difference, row.differenceUnit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Ces écarts descriptifs ne constituent ni un classement de performance
            ni une recommandation. Pour les analyses décisionnelles existantes,
            utilisez le module Comparaison.
          </p>
        </PageSection>
      ) : (
        <section
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
        >
          Sélectionnez deux communes distinctes ou deux intercommunalités distinctes.
          Il n’est pas possible de comparer directement des niveaux institutionnels différents.
        </section>
      )}
    </DashboardLayout>
  );
}
