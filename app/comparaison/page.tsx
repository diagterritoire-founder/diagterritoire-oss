"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import DashboardLayout from "@/components/DashboardLayout";
import MarkdownText from "@/components/MarkdownText";

import {
  mayotteCommunes,
  mayotteEpcis,
} from "@/data/mayotte-territories";

type Priority =
  | "forte"
  | "consolider"
  | "preserver"
  | "unknown";

type ComparisonIndicator = {
  indicatorId: string;
  indicatorName: string;
  leftScore?: number;
  rightScore?: number;
  difference?: number;
  leftPriority: Priority;
  rightPriority: Priority;
  advantage:
    | "left"
    | "right"
    | "equal"
    | "unknown";
};

type Comparison = {
  left: {
    territoryId: string;
    territoryName: string;
    score: number;
    status: string;
  };
  right: {
    territoryId: string;
    territoryName: string;
    score: number;
    status: string;
  };
  scoreDifference: number;
  overallAdvantage:
    | "left"
    | "right"
    | "equal";
  indicators: ComparisonIndicator[];
};

type ComparisonResponse = {
  comparison?: Comparison;
  error?: string;
};

type SynthesisResponse = {
  synthesis?: {
    answer: string;
    source: "omniroute" | "local";
    model?: string;
  };
  error?: string;
};

const priorityPresentation = {
  forte: {
    label: "Priorité forte",
    className: "bg-rose-50 text-rose-700",
  },
  consolider: {
    label: "À consolider",
    className: "bg-amber-50 text-amber-700",
  },
  preserver: {
    label: "À préserver",
    className: "bg-emerald-50 text-emerald-700",
  },
  unknown: {
    label: "Non disponible",
    className: "bg-slate-100 text-slate-500",
  },
} as const;

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const presentation =
    priorityPresentation[priority];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${presentation.className}`}
    >
      {presentation.label}
    </span>
  );
}

function countPriority(
  indicators: ComparisonIndicator[],
  side: "left" | "right",
  priority: Priority,
): number {
  return indicators.filter(
    (indicator) =>
      indicator[
        side === "left"
          ? "leftPriority"
          : "rightPriority"
      ] === priority,
  ).length;
}

export default function ComparaisonPage() {
  const territories = useMemo(
    () => [
      ...mayotteEpcis,
      ...mayotteCommunes,
    ],
    [],
  );

  const [leftTerritoryId, setLeftTerritoryId] =
    useState(
      mayotteEpcis[0]?.id ??
        mayotteCommunes[0]?.id ??
        "",
    );

  const [rightTerritoryId, setRightTerritoryId] =
    useState(
      mayotteEpcis[1]?.id ??
        mayotteCommunes[1]?.id ??
        "",
    );

  const leftTerritory = useMemo(
    () =>
      territories.find(
        (territory) =>
          territory.id === leftTerritoryId,
      ),
    [territories, leftTerritoryId],
  );

  const rightTerritories = useMemo(
    () =>
      territories.filter(
        (territory) =>
          territory.level ===
            leftTerritory?.level &&
          territory.id !== leftTerritoryId,
      ),
    [
      territories,
      leftTerritory,
      leftTerritoryId,
    ],
  );

  const [comparison, setComparison] =
    useState<Comparison>();

  const [synthesis, setSynthesis] =
    useState("");

  const [synthesisSource, setSynthesisSource] =
    useState<
      "omniroute" | "local" | null
    >(null);

  const [synthesisModel, setSynthesisModel] =
    useState<string>();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);
  const [isSynthesizing, setIsSynthesizing] =
    useState(false);

  async function handleCompare(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      leftTerritoryId === rightTerritoryId
    ) {
      setError(
        "Sélectionnez deux territoires différents.",
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setComparison(undefined);
    setSynthesis("");
    setSynthesisSource(null);
    setSynthesisModel(undefined);
    setIsSynthesizing(false);

    try {
      const response = await fetch(
        "/api/comparison",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            leftTerritoryId,
            rightTerritoryId,
          }),
        },
      );

      const payload =
        (await response.json()) as ComparisonResponse;

      if (
        !response.ok ||
        !payload.comparison
      ) {
        throw new Error(
          payload.error ??
            "Impossible de comparer les territoires.",
        );
      }

      setComparison(payload.comparison);

      // Le résultat DT est disponible immédiatement.
      // La synthèse IA continue indépendamment.
      setIsLoading(false);
      setIsSynthesizing(true);

      try {
        const synthesisResponse = await fetch(
          "/api/comparison/synthesis",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              comparison: payload.comparison,
            }),
          },
        );

        const synthesisPayload =
          (await synthesisResponse.json()) as SynthesisResponse;

        if (
          synthesisResponse.ok &&
          synthesisPayload.synthesis
        ) {
          setSynthesis(
            synthesisPayload.synthesis.answer,
          );
          setSynthesisSource(
            synthesisPayload.synthesis.source,
          );
          setSynthesisModel(
            synthesisPayload.synthesis.model,
          );
        }
      } finally {
        setIsSynthesizing(false);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Erreur inconnue.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardLayout
      eyebrow="Comparaison"
      title="Comparer les territoires"
      description="Comparez deux EPCI ou deux communes de même niveau pour identifier leurs écarts, leurs forces et leurs priorités d’action."
    >
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Lecture comparative
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Choisir deux territoires
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Les scores et les écarts sont calculés par
            DiagTerritoire. La comparaison est limitée aux
            territoires de même niveau institutionnel.
            L’IA intervient uniquement pour produire la
            synthèse décisionnelle.
          </p>

          <form
            onSubmit={handleCompare}
            className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end"
          >
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Territoire A
              </span>

              <select
                value={leftTerritoryId}
                onChange={(event) => {
                  const nextLeftId =
                    event.target.value;

                  const nextLeft =
                    territories.find(
                      (territory) =>
                        territory.id ===
                        nextLeftId,
                    );

                  setLeftTerritoryId(
                    nextLeftId,
                  );

                  if (!nextLeft) {
                    return;
                  }

                  const currentRight =
                    territories.find(
                      (territory) =>
                        territory.id ===
                        rightTerritoryId,
                    );

                  if (
                    !currentRight ||
                    currentRight.level !==
                      nextLeft.level ||
                    currentRight.id ===
                      nextLeftId
                  ) {
                    const replacement =
                      territories.find(
                        (territory) =>
                          territory.level ===
                            nextLeft.level &&
                          territory.id !==
                            nextLeftId,
                      );

                    if (replacement) {
                      setRightTerritoryId(
                        replacement.id,
                      );
                    }
                  }
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950"
              >
                {territories.map(
                  (territory) => (
                    <option
                      key={territory.id}
                      value={territory.id}
                    >
                      {territory.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            <div className="hidden pb-3 text-xl font-bold text-slate-300 lg:block">
              ↔
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Territoire B
              </span>

              <select
                value={rightTerritoryId}
                onChange={(event) =>
                  setRightTerritoryId(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950"
              >
                {rightTerritories.map(
                  (territory) => (
                    <option
                      key={territory.id}
                      value={territory.id}
                    >
                      {territory.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isLoading
                ? "Comparaison…"
                : "Comparer"}
            </button>
          </form>
        </section>

        {error ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </section>
        ) : null}

        {comparison ? (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              {[
                {
                  side: "left" as const,
                  territory:
                    comparison.left,
                },
                {
                  side: "right" as const,
                  territory:
                    comparison.right,
                },
              ].map(
                ({
                  side,
                  territory,
                }) => (
                  <article
                    key={territory.territoryId}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-slate-500">
                      {territory.territoryName}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-4xl font-bold text-slate-950">
                          {territory.score}
                          <span className="text-lg text-slate-400">
                            /100
                          </span>
                        </p>

                        <p className="mt-1 text-sm capitalize text-slate-500">
                          {territory.status}
                        </p>
                      </div>

                      <Link
                        href={`/territoires/${territory.territoryId}`}
                        className="text-sm font-semibold text-cyan-700"
                      >
                        Ouvrir l’analyse →
                      </Link>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                        {countPriority(
                          comparison.indicators,
                          side,
                          "forte",
                        )}{" "}
                        priorité(s) forte(s)
                      </span>

                      <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                        {countPriority(
                          comparison.indicators,
                          side,
                          "consolider",
                        )}{" "}
                        à consolider
                      </span>

                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        {countPriority(
                          comparison.indicators,
                          side,
                          "preserver",
                        )}{" "}
                        à préserver
                      </span>
                    </div>
                  </article>
                ),
              )}
            </section>

            <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Lecture décisionnelle
              </p>

              <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Avantage global :{" "}
                    {comparison.overallAdvantage ===
                    "left"
                      ? comparison.left
                          .territoryName
                      : comparison.overallAdvantage ===
                          "right"
                        ? comparison.right
                            .territoryName
                        : "Égalité"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-300">
                    {comparison.overallAdvantage ===
                    "equal"
                      ? "Les deux territoires présentent le même score global."
                      : `Écart de ${Math.abs(
                          comparison.scoreDifference,
                        )} point(s).`}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Indicateurs
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Écarts territoriaux
              </h2>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-4">
                        Indicateur
                      </th>
                      <th className="py-3 pr-4">
                        {
                          comparison.left
                            .territoryName
                        }
                      </th>
                      <th className="py-3 pr-4">
                        {
                          comparison.right
                            .territoryName
                        }
                      </th>
                      <th className="py-3">
                        Écart
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {comparison.indicators.map(
                      (indicator) => (
                        <tr
                          key={
                            indicator.indicatorId
                          }
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-4 pr-4 font-semibold text-slate-700">
                            {
                              indicator.indicatorName
                            }
                          </td>

                          <td className="py-4 pr-4">
                            <div className="space-y-2">
                              <p className="font-bold text-slate-950">
                                {indicator.leftScore ??
                                  "—"}
                              </p>
                              <PriorityBadge
                                priority={
                                  indicator.leftPriority
                                }
                              />
                            </div>
                          </td>

                          <td className="py-4 pr-4">
                            <div className="space-y-2">
                              <p className="font-bold text-slate-950">
                                {indicator.rightScore ??
                                  "—"}
                              </p>
                              <PriorityBadge
                                priority={
                                  indicator.rightPriority
                                }
                              />
                            </div>
                          </td>

                          <td className="py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-700">
                                {indicator.difference ===
                                undefined
                                  ? "—"
                                  : indicator.difference >
                                      0
                                    ? `+${indicator.difference}`
                                    : `${indicator.difference}`}
                              </span>

                              {indicator.advantage !==
                              "unknown" ? (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                  {indicator.advantage ===
                                  "equal"
                                    ? "Égalité"
                                    : indicator.advantage ===
                                        "left"
                                      ? `Avantage ${comparison.left.territoryName}`
                                      : `Avantage ${comparison.right.territoryName}`}
                                </span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Synthèse décisionnelle
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Ce qu’il faut retenir
              </h2>

              {synthesis ? (
                <div className="mt-4 text-slate-700">
                  <MarkdownText>
                    {synthesis}
                  </MarkdownText>
                </div>
              ) : isSynthesizing ? (
                <p className="mt-4 text-sm text-slate-500">
                  Les résultats DT sont disponibles.
                  La synthèse décisionnelle est en cours…
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Synthèse décisionnelle indisponible.
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white px-3 py-1.5 text-cyan-700">
                  Synthèse :{" "}
                  {isSynthesizing
                    ? "en cours…"
                    : synthesisSource ===
                        "omniroute"
                      ? "OmniRoute"
                      : synthesisSource === "local"
                        ? "Moteur local DT"
                        : "indisponible"}
                </span>

                {synthesisModel ? (
                  <span className="rounded-full bg-white px-3 py-1.5 text-slate-600">
                    Modèle : {synthesisModel}
                  </span>
                ) : null}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
