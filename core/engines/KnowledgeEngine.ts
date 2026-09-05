import type { Territory } from "@/types/domain";

export interface KnowledgeRequest {
  territory: Territory;
  question: string;
}

export interface KnowledgeSection {
  title: string;
  content: string;
}

export interface KnowledgeResponse {
  summary: string;
  sections: KnowledgeSection[];
}

export class KnowledgeEngine {

  static analyze(
    request: KnowledgeRequest,
  ): KnowledgeResponse {

    return {

      summary:
        `Analyse du territoire ${request.territory.name}`,

      sections: [

        {
          title: "Contexte",

          content:
            "Le moteur de connaissances sera enrichi progressivement afin de produire une analyse territoriale complète.",

        },

      ],

    };

  }

}