"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import DashboardLayout from "@/components/DashboardLayout";
import PageSection from "@/components/PageSection";
import MarkdownText from "@/components/MarkdownText";

import {
  mayotteCommunes,
  mayotteDepartment,
  mayotteEpcis,
} from "@/data/mayotte-territories";

type AssistantApiResponse = {
  answer?: string;
  source?: "omniroute" | "local";
  model?: string;
  territoryId?: string;
  territoryName?: string;
  generatedAt?: string;
  error?: string;
};

type AssistantMode =
  | "question"
  | "comparison";

type ComparisonPriority =
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
  leftPriority: ComparisonPriority;
  rightPriority: ComparisonPriority;
  advantage:
    | "left"
    | "right"
    | "equal"
    | "unknown";
};

type ComparisonApiResponse = {
  comparison?: {
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
  synthesis?: {
    answer: string;
    source: "omniroute" | "local";
    model?: string;
  };
  error?: string;
};

export default function AssistantPage() {
  const territories = useMemo(
    () => [
      ...(mayotteDepartment
        ? [mayotteDepartment]
        : []),
      ...mayotteEpcis,
      ...mayotteCommunes,
    ],
    [],
  );

  const [territoryId, setTerritoryId] =
    useState(
      mayotteDepartment?.id ??
        "territory-mayotte",
    );

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [source, setSource] = useState<
    "omniroute" | "local" | null
  >(null);

  const [model, setModel] =
    useState<string>();

  const [territoryName, setTerritoryName] =
    useState<string>();

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const [mode, setMode] =
    useState<AssistantMode>(
      "question",
    );

  const [
    leftTerritoryId,
    setLeftTerritoryId,
  ] = useState(
    mayotteDepartment?.id ??
      "territory-mayotte",
  );

  const [
    rightTerritoryId,
    setRightTerritoryId,
  ] = useState(
    mayotteCommunes[0]?.id ??
      "territory-mayotte",
  );

  const [
    comparison,
    setComparison,
  ] = useState<
    ComparisonApiResponse["comparison"]
  >();

  const [
    comparisonAnswer,
    setComparisonAnswer,
  ] = useState("");

  const [
    comparisonSource,
    setComparisonSource,
  ] = useState<
    "omniroute" | "local" | null
  >(null);

  const [
    comparisonModel,
    setComparisonModel,
  ] = useState<string>();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion) {
      return;
    }

    setIsLoading(true);
    setError("");
    setAnswer("");
    setSource(null);
    setModel(undefined);
    setTerritoryName(undefined);

    try {
      const response = await fetch(
        "/api/assistant",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            question:
              trimmedQuestion,
            territoryId,
          }),
        },
      );

      const payload =
        (await response.json()) as AssistantApiResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Impossible d’interroger l’assistant.",
        );
      }

      setAnswer(
        payload.answer ?? "",
      );

      setSource(
        payload.source ?? null,
      );

      setModel(
        payload.model,
      );

      setTerritoryName(
        payload.territoryName,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleComparisonSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      leftTerritoryId ===
      rightTerritoryId
    ) {
      setError(
        "Sélectionnez deux territoires différents.",
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setComparison(undefined);
    setComparisonAnswer("");
    setComparisonSource(null);
    setComparisonModel(undefined);

    try {
      const comparisonResponse = await fetch(
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

      const comparisonPayload =
        (await comparisonResponse.json()) as ComparisonApiResponse;

      if (!comparisonResponse.ok) {
        throw new Error(
          comparisonPayload.error ??
            "Impossible de comparer les territoires.",
        );
      }

      if (!comparisonPayload.comparison) {
        throw new Error(
          "Comparaison DT indisponible.",
        );
      }

      setComparison(
        comparisonPayload.comparison,
      );

      setIsLoading(false);

      const synthesisResponse = await fetch(
        "/api/comparison/synthesis",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            comparison:
              comparisonPayload.comparison,
          }),
        },
      );

      const synthesisPayload =
        (await synthesisResponse.json()) as ComparisonApiResponse;

      if (!synthesisResponse.ok) {
        throw new Error(
          synthesisPayload.error ??
            "Synthèse IA indisponible.",
        );
      }

      setComparisonAnswer(
        synthesisPayload.synthesis?.answer ??
          "",
      );

      setComparisonSource(
        synthesisPayload.synthesis?.source ??
          null,
      );

      setComparisonModel(
        synthesisPayload.synthesis?.model,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <DashboardLayout
      eyebrow="Assistant IA"
      title="Copilote territorial"
      description="Interrogez ou comparez les territoires de Mayotte à partir des données et moteurs de DiagTerritoire."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setMode("question");
            setError("");
          }}
          className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            mode === "question"
              ? "bg-slate-950 text-white"
              : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          Interroger un territoire
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("comparison");
            setError("");
          }}
          className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            mode === "comparison"
              ? "bg-slate-950 text-white"
              : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          Comparer deux territoires
        </button>
      </div>

      {mode === "question" ? (
        <PageSection
          title="Assistant IA DiagTerritoire"
          subtitle="Sélectionnez un territoire puis posez votre question."
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Territoire
              </span>

              <select
                value={territoryId}
                onChange={(event) =>
                  setTerritoryId(event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              >
                {territories.map((territory) => (
                  <option
                    key={territory.id}
                    value={territory.id}
                  >
                    {territory.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Votre question
              </span>

              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                rows={5}
                placeholder="Exemple : Quels sont les principaux points de vigilance de ce territoire ?"
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isLoading
                ? "Analyse en cours..."
                : "Interroger le copilote"}
            </button>
          </form>
        </PageSection>
      ) : (
        <PageSection
          title="Comparaison territoriale"
          subtitle="Comparez deux territoires à partir des diagnostics calculés par DT."
        >
          <form
            onSubmit={handleComparisonSubmit}
            className="space-y-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Territoire A
                </span>

                <select
                  value={leftTerritoryId}
                  onChange={(event) =>
                    setLeftTerritoryId(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                >
                  {territories.map((territory) => (
                    <option
                      key={territory.id}
                      value={territory.id}
                    >
                      {territory.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Territoire B
                </span>

                <select
                  value={rightTerritoryId}
                  onChange={(event) =>
                    setRightTerritoryId(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                >
                  {territories.map((territory) => (
                    <option
                      key={territory.id}
                      value={territory.id}
                    >
                      {territory.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isLoading
                ? "Comparaison en cours..."
                : "Comparer les territoires"}
            </button>
          </form>
        </PageSection>
      )}

      <PageSection
        title={mode === "comparison" ? "Résultat comparatif" : "Réponse"}
        subtitle="Les chiffres sont calculés par DiagTerritoire. L’IA intervient uniquement pour la synthèse."
      >
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : mode === "comparison" && comparison ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">
                  {comparison.left.territoryName}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {comparison.left.score}/100
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">
                  {comparison.right.territoryName}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {comparison.right.score}/100
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">
                Avantage global :{" "}
                <span className="text-slate-950">
                  {comparison.overallAdvantage === "left"
                    ? comparison.left.territoryName
                    : comparison.overallAdvantage === "right"
                      ? comparison.right.territoryName
                      : "Égalité"}
                </span>
                {comparison.overallAdvantage !== "equal"
                  ? ` de ${Math.abs(comparison.scoreDifference)} point(s)`
                  : ""}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">
                  {comparison.left.territoryName}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-700">
                    {
                      comparison.indicators.filter(
                        (indicator) =>
                          indicator.leftPriority === "forte",
                      ).length
                    } priorité(s) forte(s)
                  </span>

                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                    {
                      comparison.indicators.filter(
                        (indicator) =>
                          indicator.leftPriority === "consolider",
                      ).length
                    } à consolider
                  </span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                    {
                      comparison.indicators.filter(
                        (indicator) =>
                          indicator.leftPriority === "preserver",
                      ).length
                    } à préserver
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">
                  {comparison.right.territoryName}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-700">
                    {
                      comparison.indicators.filter(
                        (indicator) =>
                          indicator.rightPriority === "forte",
                      ).length
                    } priorité(s) forte(s)
                  </span>

                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                    {
                      comparison.indicators.filter(
                        (indicator) =>
                          indicator.rightPriority === "consolider",
                      ).length
                    } à consolider
                  </span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                    {
                      comparison.indicators.filter(
                        (indicator) =>
                          indicator.rightPriority === "preserver",
                      ).length
                    } à préserver
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4">Indicateur</th>
                    <th className="py-3 pr-4">
                      {comparison.left.territoryName}
                    </th>
                    <th className="py-3 pr-4">
                      {comparison.right.territoryName}
                    </th>
                    <th className="py-3">Écart</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.indicators.map((indicator) => (
                    <tr
                      key={indicator.indicatorId}
                      className="border-b border-slate-100"
                    >
                      <td className="py-3 pr-4 font-medium text-slate-700">
                        {indicator.indicatorName}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="space-y-2">
                          <div>{indicator.leftScore ?? "—"}</div>

                          {indicator.leftPriority !== "unknown" ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                indicator.leftPriority === "forte"
                                  ? "bg-red-50 text-red-700"
                                  : indicator.leftPriority === "consolider"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {indicator.leftPriority === "forte"
                                ? "Priorité forte"
                                : indicator.leftPriority === "consolider"
                                  ? "À consolider"
                                  : "À préserver"}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="space-y-2">
                          <div>{indicator.rightScore ?? "—"}</div>

                          {indicator.rightPriority !== "unknown" ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                indicator.rightPriority === "forte"
                                  ? "bg-red-50 text-red-700"
                                  : indicator.rightPriority === "consolider"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {indicator.rightPriority === "forte"
                                ? "Priorité forte"
                                : indicator.rightPriority === "consolider"
                                  ? "À consolider"
                                  : "À préserver"}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-700">
                            {indicator.difference === undefined
                              ? "—"
                              : indicator.difference > 0
                                ? `+${indicator.difference}`
                                : `${indicator.difference}`}
                          </span>

                          {indicator.advantage !== "unknown" ? (
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                indicator.advantage === "equal"
                                  ? "bg-slate-100 text-slate-600"
                                  : indicator.advantage === "left"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {indicator.advantage === "equal"
                                ? "Égalité"
                                : indicator.advantage === "left"
                                  ? `Avantage ${comparison.left.territoryName}`
                                  : `Avantage ${comparison.right.territoryName}`}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {comparisonAnswer ? (
              <div className="rounded-2xl bg-slate-50 p-5">
                <MarkdownText>
                  {comparisonAnswer}
                </MarkdownText>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-cyan-700">
                Synthèse :{" "}
                {comparisonSource === null
                  ? "IA en cours…"
                  : comparisonSource === "omniroute"
                    ? "OmniRoute"
                    : "Moteur local DT"}
              </span>

              {comparisonModel ? (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                  Modèle : {comparisonModel}
                </span>
              ) : null}
            </div>
          </div>
        ) : answer ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-5">
              <MarkdownText>
                {answer}
              </MarkdownText>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {territoryName ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                  Territoire : {territoryName}
                </span>
              ) : null}

              <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-cyan-700">
                Source :{" "}
                {source === "omniroute"
                  ? "OmniRoute"
                  : "Moteur local DT"}
              </span>

              {model ? (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                  Modèle : {model}
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            {mode === "comparison"
              ? "Sélectionnez deux territoires puis lancez la comparaison."
              : "Sélectionnez un territoire et posez une question."}
          </div>
        )}
      </PageSection>
    </DashboardLayout>
  );
}