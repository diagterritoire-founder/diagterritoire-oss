"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type CouncilAction = {
  indicatorId: string;
  indicatorName: string;
  score: number;
  priority: "forte" | "consolider" | "preserver";
  action: string;
};

type FollowUpStatus =
  | "a_decider"
  | "adoptee"
  | "en_cours"
  | "realisee"
  | "reportee"
  | "abandonnee";

type FollowUpItem = {
  indicatorId: string;
  status: FollowUpStatus;
  decision: string;
  responsible: string;
  dueDate: string;
  note: string;
};

type CouncilFollowUpProps = {
  territoryId: string;
  actions: CouncilAction[];
};

function priorityWeight(
  priority: CouncilAction["priority"],
) {
  if (priority === "forte") {
    return 0;
  }

  if (priority === "consolider") {
    return 1;
  }

  return 2;
}

function statusLabel(status: FollowUpStatus) {
  if (status === "adoptee") {
    return "Décision adoptée";
  }

  if (status === "en_cours") {
    return "En cours";
  }

  if (status === "realisee") {
    return "Réalisée";
  }

  if (status === "reportee") {
    return "Reportée";
  }

  if (status === "abandonnee") {
    return "Abandonnée";
  }

  return "À décider";
}

export default function CouncilFollowUp({
  territoryId,
  actions,
}: CouncilFollowUpProps) {
  const trackedActions = useMemo(
    () =>
      [...actions]
        .sort((a, b) => {
          const priorityDifference =
            priorityWeight(a.priority) -
            priorityWeight(b.priority);

          if (priorityDifference !== 0) {
            return priorityDifference;
          }

          return a.score - b.score;
        })
        .slice(0, 5),
    [actions],
  );

  const storageKey =
    `diagterritoire:council-follow-up:${territoryId}`;

  const [items, setItems] = useState<
    Record<string, FollowUpItem>
  >({});

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(storageKey);

      if (stored) {
        const saved = JSON.parse(stored);

        if (
          saved &&
          typeof saved === "object" &&
          !Array.isArray(saved)
        ) {
          setItems(saved);
        }
      }
    } catch {
      // Une sauvegarde locale invalide ne bloque pas le suivi.
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(items),
    );
  }, [hydrated, items, storageKey]);

  function getItem(
    indicatorId: string,
  ): FollowUpItem {
    return (
      items[indicatorId] ?? {
        indicatorId,
        status: "a_decider",
        decision: "",
        responsible: "",
        dueDate: "",
        note: "",
      }
    );
  }

  function updateItem(
    indicatorId: string,
    patch: Partial<FollowUpItem>,
  ) {
    setItems((current) => {
      const existing =
        current[indicatorId] ?? {
          indicatorId,
          status: "a_decider" as FollowUpStatus,
          decision: "",
          responsible: "",
          dueDate: "",
          note: "",
        };

      return {
        ...current,
        [indicatorId]: {
          ...existing,
          ...patch,
        },
      };
    });
  }

  if (trackedActions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm print:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
        Après la séance
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        Suivi des décisions
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600 print:hidden">
        Renseignez les décisions prises, leur responsable,
        leur échéance et leur état d’avancement.
        Le suivi est sauvegardé automatiquement
        sur cet appareil pour ce territoire.
      </p>

      <div className="mt-5 space-y-5">
        {trackedActions.map((action, index) => {
          const item = getItem(action.indicatorId);

          return (
            <article
              key={action.indicatorId}
              className="rounded-2xl border border-slate-200 p-5 print:break-inside-avoid"
            >
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-700">
                  {index + 1}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    {action.indicatorName}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {action.action}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 print:hidden">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Statut
                  </span>

                  <select
                    value={item.status}
                    onChange={(event) =>
                      updateItem(
                        action.indicatorId,
                        {
                          status:
                            event.target
                              .value as FollowUpStatus,
                        },
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900"
                  >
                    <option value="a_decider">
                      À décider
                    </option>
                    <option value="adoptee">
                      Décision adoptée
                    </option>
                    <option value="en_cours">
                      En cours
                    </option>
                    <option value="realisee">
                      Réalisée
                    </option>
                    <option value="reportee">
                      Reportée
                    </option>
                    <option value="abandonnee">
                      Abandonnée
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Responsable
                  </span>

                  <input
                    type="text"
                    value={item.responsible}
                    onChange={(event) =>
                      updateItem(
                        action.indicatorId,
                        {
                          responsible:
                            event.target.value,
                        },
                      )
                    }
                    placeholder="Service ou responsable"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Échéance
                  </span>

                  <input
                    type="date"
                    value={item.dueDate}
                    onChange={(event) =>
                      updateItem(
                        action.indicatorId,
                        {
                          dueDate:
                            event.target.value,
                        },
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Décision prise
                  </span>

                  <input
                    type="text"
                    value={item.decision}
                    onChange={(event) =>
                      updateItem(
                        action.indicatorId,
                        {
                          decision:
                            event.target.value,
                        },
                      )
                    }
                    placeholder="Décision ou orientation retenue"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900"
                  />
                </label>
              </div>

              <label className="mt-4 block print:hidden">
                <span className="text-sm font-semibold text-slate-700">
                  Note de suivi
                </span>

                <textarea
                  value={item.note}
                  onChange={(event) =>
                    updateItem(
                      action.indicatorId,
                      {
                        note: event.target.value,
                      },
                    )
                  }
                  rows={3}
                  placeholder="Avancement, difficulté, prochaine étape..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900"
                />
              </label>

              <dl className="mt-5 hidden grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-sm print:grid">
                <div>
                  <dt className="font-semibold text-slate-500">
                    Statut
                  </dt>
                  <dd className="mt-1 text-slate-950">
                    {statusLabel(item.status)}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">
                    Responsable
                  </dt>
                  <dd className="mt-1 text-slate-950">
                    {item.responsible ||
                      "Non renseigné"}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">
                    Échéance
                  </dt>
                  <dd className="mt-1 text-slate-950">
                    {item.dueDate ||
                      "Non renseignée"}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">
                    Décision
                  </dt>
                  <dd className="mt-1 text-slate-950">
                    {item.decision ||
                      "Non renseignée"}
                  </dd>
                </div>

                {item.note ? (
                  <div className="col-span-2">
                    <dt className="font-semibold text-slate-500">
                      Note de suivi
                    </dt>
                    <dd className="mt-1 text-slate-950">
                      {item.note}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </article>
          );
        })}
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Ce module constitue un outil de suivi interne.
        Les informations renseignées ne valent ni délibération
        ni acte administratif de la collectivité.
      </p>
    </section>
  );
}
