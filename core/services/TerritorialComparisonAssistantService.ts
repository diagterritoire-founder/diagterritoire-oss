import type {
  TerritorialComparisonResult,
} from "./TerritorialComparisonService";

import {
  LoggerFactory,
} from "./logging";

export type TerritorialComparisonAssistantResult = {
  answer: string;
  source: "omniroute" | "local";
  model?: string;
};

type ComparisonAssistantOptions = {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  retryDelayMs?: number;
};

export class TerritorialComparisonAssistantService {
  private readonly logger = LoggerFactory.getLogger();

  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly retryDelayMs: number;

  constructor(
    options: ComparisonAssistantOptions = {},
  ) {
    this.baseUrl =
      options.baseUrl ??
      process.env.OMNIROUTE_BASE_URL ??
      "http://localhost:20128/v1";

    this.model =
      options.model ??
      process.env.OMNIROUTE_MODEL ??
      "auto";

    this.timeoutMs =
      options.timeoutMs ?? 60_000;

    this.retryDelayMs =
      options.retryDelayMs ?? 1_500;
  }

  async summarize(
    comparison: TerritorialComparisonResult,
  ): Promise<TerritorialComparisonAssistantResult> {
    const localSummary =
      this.buildLocalSummary(comparison);

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const result =
          await this.requestOmniRoute(
            comparison,
          );

        this.logger.info(
          "Synthèse comparative via OmniRoute",
          {
            left:
              comparison.left.territoryId,
            right:
              comparison.right.territoryId,
            model: result.model,
            attempt,
          },
        );

        return {
          answer: result.answer
            .replace(/\s*\(left\)/gi, "")
            .replace(/\s*\(right\)/gi, ""),
          source: "omniroute",
          model: result.model,
        };
      } catch (error) {
        this.logger.error(
          "Échec OmniRoute pour la comparaison",
          {
            attempt,
            error,
          },
        );

        if (attempt < 2) {
          await this.delay(
            this.retryDelayMs,
          );
        }
      }
    }

    this.logger.info(
      "Utilisation de la synthèse locale DT après échec OmniRoute",
      {
        left:
          comparison.left.territoryId,
        right:
          comparison.right.territoryId,
      },
    );

    return {
      answer: localSummary,
      source: "local",
    };
  }

  private async requestOmniRoute(
    comparison: TerritorialComparisonResult,
  ): Promise<{
    answer: string;
    model?: string;
  }> {
    const controller =
      new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      this.timeoutMs,
    );

    try {
      const response = await fetch(
        `${this.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            stream: true,
            messages: [
              {
                role: "system",
                content:
                  "Tu es le copilote décisionnel de DiagTerritoire. Tu interprètes une comparaison territoriale calculée par DT. N'invente aucune donnée. Utilise uniquement les chiffres fournis. Produis une synthèse concise, structurée et orientée décision. Les termes techniques internes left et right ne doivent jamais apparaître dans la réponse : utilise exclusivement les noms réels des territoires.",
              },
              {
                role: "user",
                content: [
                  "Comparaison territoriale calculée par DiagTerritoire :",
                  JSON.stringify(
                    comparison,
                    null,
                    2,
                  ),
                  "",
                  "Présente :",
                  "1. le territoire globalement en avantage ;",
                  "2. les écarts les plus importants ;",
                  "3. les points de vigilance communs ;",
                  "4. les priorités d'action différenciées pour chaque territoire.",
                ].join("\n"),
              },
            ],
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(
          `OmniRoute HTTP ${response.status}`,
        );
      }

      const raw =
        await response.text();

      const parsed =
        TerritorialComparisonAssistantService
          .parseStreamingResponse(raw);

      if (!parsed.answer) {
        const providerError =
          TerritorialComparisonAssistantService
            .extractStreamingError(raw);

        throw new Error(
          providerError ??
            "Réponse OmniRoute vide",
        );
      }

      return parsed;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildLocalSummary(
    comparison: TerritorialComparisonResult,
  ): string {
    const advantage =
      comparison.overallAdvantage === "left"
        ? comparison.left.territoryName
        : comparison.overallAdvantage === "right"
          ? comparison.right.territoryName
          : "Aucun territoire";

    const ranked =
      [...comparison.indicators]
        .filter(
          (indicator) =>
            indicator.difference !== undefined,
        )
        .sort(
          (a, b) =>
            Math.abs(
              b.difference ?? 0,
            ) -
            Math.abs(
              a.difference ?? 0,
            ),
        )
        .slice(0, 3);

    const mainDifferences =
      ranked.length > 0
        ? ranked
            .map(
              (indicator) =>
                `${indicator.indicatorName} : ${indicator.difference}`,
            )
            .join("; ")
        : "Aucun écart calculable.";

    return [
      `${advantage} présente l'avantage global.`,
      `Écart de score : ${Math.abs(comparison.scoreDifference)} point(s).`,
      `Principaux écarts : ${mainDifferences}`,
    ].join("\n");
  }

  private static parseStreamingResponse(
    raw: string,
  ): {
    answer: string;
    model?: string;
  } {
    let answer = "";
    let model: string | undefined;

    for (const line of raw.split("\n")) {
      const trimmed =
        line.trim();

      if (
        !trimmed.startsWith("data:")
      ) {
        continue;
      }

      const data =
        trimmed.slice(5).trim();

      if (
        !data ||
        data === "[DONE]"
      ) {
        continue;
      }

      try {
        const chunk =
          JSON.parse(data) as {
            model?: string;
            choices?: Array<{
              delta?: {
                content?: string;
              };
            }>;
          };

        model =
          chunk.model ?? model;

        const content =
          chunk.choices?.[0]
            ?.delta?.content;

        if (content) {
          answer += content;
        }
      } catch {
        continue;
      }
    }

    return {
      answer: answer.trim(),
      model,
    };
  }

  private static extractStreamingError(
    raw: string,
  ): string | undefined {
    for (const line of raw.split("\n")) {
      const trimmed =
        line.trim();

      if (
        !trimmed.startsWith("data:")
      ) {
        continue;
      }

      const data =
        trimmed.slice(5).trim();

      if (
        !data ||
        data === "[DONE]"
      ) {
        continue;
      }

      try {
        const chunk =
          JSON.parse(data) as {
            error?: {
              message?: string;
            };
          };

        if (
          chunk.error?.message
        ) {
          return chunk.error.message;
        }
      } catch {
        continue;
      }
    }

    return undefined;
  }

  private delay(
    milliseconds: number,
  ): Promise<void> {
    return new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          milliseconds,
        ),
    );
  }
}