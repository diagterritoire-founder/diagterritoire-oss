import {
  AIAssistantEngine,
  type AssistantRequest,
} from "../engines";

import {
  LoggerFactory,
} from "./logging";

export type OmniRouteAssistantResult = {
  answer: string;
  source: "omniroute" | "local";
  model?: string;
};

type OmniRouteOptions = {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
};

export class OmniRouteAssistantService {
  private readonly logger = LoggerFactory.getLogger();

  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(
    options: OmniRouteOptions = {},
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
      options.timeoutMs ?? 30_000;
  }

  async answer(
    request: AssistantRequest,
  ): Promise<OmniRouteAssistantResult> {
    const localContext =
      AIAssistantEngine.answer(request);

    try {
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
                    "Tu es le copilote territorial de DiagTerritoire. Réponds en français, de manière factuelle, concise et orientée aide à la décision. Appuie-toi uniquement sur le contexte territorial fourni. N'invente aucune donnée absente.",
                },
                {
                  role: "user",
                  content: [
                    `Question : ${request.question}`,
                    "",
                    "Contexte DiagTerritoire :",
                    localContext,
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
          OmniRouteAssistantService.parseStreamingResponse(raw);

        if (!parsed.answer) {
          throw new Error(
            "Réponse OmniRoute vide",
          );
        }

        this.logger.info(
          "Réponse Assistant IA via OmniRoute",
          {
            territoryName:
              request.territoryName,
            model: parsed.model,
          },
        );

        return {
          answer: parsed.answer,
          source: "omniroute",
          model: parsed.model,
        };
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      this.logger.error(
        "OmniRoute indisponible, utilisation du moteur local",
        {
          territoryName:
            request.territoryName,
          error,
        },
      );

      return {
        answer: localContext,
        source: "local",
      };
    }
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
      const trimmed = line.trim();

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
        const chunk = JSON.parse(
          data,
        ) as {
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
}
