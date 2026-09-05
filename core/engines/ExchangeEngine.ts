export type ExchangeItemType =
  | "document"
  | "request"
  | "project"
  | "dataset"
  | "message";

export type ExchangePriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export type ExchangeStatus =
  | "draft"
  | "submitted"
  | "received"
  | "in_review"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

export type ExchangeParticipant = {
  organizationId: string;
  name: string;
  role:
    | "sender"
    | "recipient"
    | "observer"
    | "validator";
};

export type ExchangeAttachment = {
  id: string;
  name: string;
  mimeType: string;
  sizeInBytes?: number;
  checksum?: string;
  storageReference?: string;
};

export type ExchangeHistoryEntry = {
  id: string;
  status: ExchangeStatus;
  actorOrganizationId: string;
  message?: string;
  createdAt: string;
};

export type ExchangeEnvelope = {
  id: string;
  reference: string;
  type: ExchangeItemType;
  title: string;
  description?: string;
  territoryIds: string[];
  sender: ExchangeParticipant;
  recipients: ExchangeParticipant[];
  observers?: ExchangeParticipant[];
  attachments: ExchangeAttachment[];
  priority: ExchangePriority;
  status: ExchangeStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  history: ExchangeHistoryEntry[];
};

export type CreateExchangeInput = {
  id: string;
  reference: string;
  type: ExchangeItemType;
  title: string;
  description?: string;
  territoryIds?: string[];
  sender: ExchangeParticipant;
  recipients: ExchangeParticipant[];
  observers?: ExchangeParticipant[];
  attachments?: ExchangeAttachment[];
  priority?: ExchangePriority;
  dueDate?: string;
  createdAt?: string;
};

export class ExchangeEngine {
  static create(
    input: CreateExchangeInput,
  ): ExchangeEnvelope {
    if (!input.title.trim()) {
      throw new Error(
        "Le titre de l’échange est obligatoire.",
      );
    }

    if (input.recipients.length === 0) {
      throw new Error(
        "Au moins un destinataire est obligatoire.",
      );
    }

    const createdAt =
      input.createdAt ?? new Date().toISOString();

    return {
      id: input.id,
      reference: input.reference,
      type: input.type,
      title: input.title.trim(),
      description: input.description?.trim(),
      territoryIds: input.territoryIds ?? [],
      sender: input.sender,
      recipients: input.recipients,
      observers: input.observers ?? [],
      attachments: input.attachments ?? [],
      priority: input.priority ?? "normal",
      status: "draft",
      dueDate: input.dueDate,
      createdAt,
      updatedAt: createdAt,
      history: [
        {
          id: `${input.id}-history-1`,
          status: "draft",
          actorOrganizationId:
            input.sender.organizationId,
          message: "Échange créé.",
          createdAt,
        },
      ],
    };
  }

  static transition(
    envelope: ExchangeEnvelope,
    nextStatus: ExchangeStatus,
    actorOrganizationId: string,
    message?: string,
    changedAt = new Date().toISOString(),
  ): ExchangeEnvelope {
    if (
      !this.canTransition(
        envelope.status,
        nextStatus,
      )
    ) {
      throw new Error(
        `Transition impossible : ${envelope.status} vers ${nextStatus}.`,
      );
    }

    return {
      ...envelope,
      status: nextStatus,
      updatedAt: changedAt,
      history: [
        ...envelope.history,
        {
          id: `${envelope.id}-history-${envelope.history.length + 1}`,
          status: nextStatus,
          actorOrganizationId,
          message,
          createdAt: changedAt,
        },
      ],
    };
  }

  static addAttachment(
    envelope: ExchangeEnvelope,
    attachment: ExchangeAttachment,
    changedAt = new Date().toISOString(),
  ): ExchangeEnvelope {
    const alreadyExists =
      envelope.attachments.some(
        (item) => item.id === attachment.id,
      );

    if (alreadyExists) {
      throw new Error(
        `La pièce jointe ${attachment.id} existe déjà.`,
      );
    }

    return {
      ...envelope,
      attachments: [
        ...envelope.attachments,
        attachment,
      ],
      updatedAt: changedAt,
    };
  }

  static isOverdue(
    envelope: ExchangeEnvelope,
    now = new Date(),
  ): boolean {
    if (!envelope.dueDate) {
      return false;
    }

    if (
      envelope.status === "completed" ||
      envelope.status === "cancelled" ||
      envelope.status === "rejected"
    ) {
      return false;
    }

    return (
      new Date(envelope.dueDate).getTime() <
      now.getTime()
    );
  }

  static filterByOrganization(
    exchanges: ExchangeEnvelope[],
    organizationId: string,
  ): ExchangeEnvelope[] {
    return exchanges.filter(
      (exchange) =>
        exchange.sender.organizationId ===
          organizationId ||
        exchange.recipients.some(
          (participant) =>
            participant.organizationId ===
            organizationId,
        ) ||
        exchange.observers?.some(
          (participant) =>
            participant.organizationId ===
            organizationId,
        ),
    );
  }

  static filterByTerritory(
    exchanges: ExchangeEnvelope[],
    territoryId: string,
  ): ExchangeEnvelope[] {
    return exchanges.filter(
      (exchange) =>
        exchange.territoryIds.includes(
          territoryId,
        ),
    );
  }

  static sortByPriority(
    exchanges: ExchangeEnvelope[],
  ): ExchangeEnvelope[] {
    const priorities: Record<
      ExchangePriority,
      number
    > = {
      urgent: 4,
      high: 3,
      normal: 2,
      low: 1,
    };

    return [...exchanges].sort(
      (first, second) =>
        priorities[second.priority] -
        priorities[first.priority],
    );
  }

  private static canTransition(
    currentStatus: ExchangeStatus,
    nextStatus: ExchangeStatus,
  ): boolean {
    const transitions: Record<
      ExchangeStatus,
      ExchangeStatus[]
    > = {
      draft: ["submitted", "cancelled"],
      submitted: [
        "received",
        "rejected",
        "cancelled",
      ],
      received: [
        "in_review",
        "accepted",
        "rejected",
      ],
      in_review: [
        "accepted",
        "rejected",
      ],
      accepted: ["completed", "cancelled"],
      rejected: [],
      completed: [],
      cancelled: [],
    };

    return transitions[currentStatus].includes(
      nextStatus,
    );
  }
}