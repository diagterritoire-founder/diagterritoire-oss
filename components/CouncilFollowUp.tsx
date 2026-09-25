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

type CouncilStateResponse = {
  followUp: Record<string, FollowUpItem>;
  updatedAt: string | null;
};

type PersistenceStatus =
  | "loading"
  | "saved"
  | "saving"
  | "error";

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

function persistenceLabel(
  status: PersistenceStatus,
) {
  if (status === "loading") {
    return "Chargement du suivi partagé…";
  }

  if (status === "saving") {
    return "Enregistrement du suivi dans DiagTerritoire…";
  }

  if (status === "error") {
    return "Le suivi n’a pas pu être synchronisé. Réessayez après quelques instants.";
  }

  return "Suivi enregistré dans DiagTerritoire.";
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

  const [items, setItems] = useState<
    Record<string, FollowUpItem>
  >({});
  const [loaded, setLoaded] = useState(false);
  const [editRevision, setEditRevision] = useState(0);
  const [persistenceStatus, setPersistenceStatus] =
    useState<PersistenceStatus>("loading");

  const stateUrl =
    `/api/conseil-municipal/${encodeURIComponent(
      territoryId,
    )}/state`;

  useEffect(() => {
    let cancelled = false;

    async function loadSharedFollowUp() {
      setPersistenceStatus("loading");

      try {
        const response = await fetch(stateUrl, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Chargement du suivi impossible.",
          );
        }

        const payload =
          (await response.json()) as CouncilStateResponse;

        if (cancelled) {
          return;
        }

        if (
          payload.followUp &&
          typeof payload.followUp === "object" &&
          !Array.isArray(payload.followUp)
        ) {
          setItems(payload.followUp);
        }

        setPersistenceStatus("saved");
      } catch {
        if (!cancelled) {
          setPersistenceStatus("error");
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    void loadSharedFollowUp();

    return () => {
      cancelled = true;
    };
  }, [stateUrl]);

  useEffect(() => {
    if (
      !loaded ||
      editRevision === 0
    ) {
      return;
    }

    const controller =
      new AbortController();

    const timeoutId = window.setTimeout(
      async () => {
        setPersistenceStatus("saving");

        try {
          const response = await fetch(
            stateUrl,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                followUp: items,
              }),
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error(
              "Enregistrement impossible.",
            );
          }

          setPersistenceStatus("saved");
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }

          setPersistenceStatus("error");
        }
      },
      450,
    );

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    editRevision,
    items,
    loaded,
    stateUrl,
  ]);

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

    setEditRevision(
      (current) => current + 1,
    );
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
        Le suivi est enregistré automatiquement dans
        DiagTerritoire et partagé avec les utilisateurs
        autorisés de ce territoire.
      </p>

      <p
        className={
          "mt-2 text-xs print:hidden " +
          (persistenceStatus === "error"
            ? "text-rose-700"
            : "text-cyan-700")
        }
        aria-live="polite"
      >
        {persistenceLabel(
          persistenceStatus,
        )}
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
                    disabled={!loaded}
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
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
                    disabled={!loaded}
                    maxLength={200}
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Échéance
                  </span>

                  <input
                    type="date"
                    value={item.dueDate}
                    disabled={!loaded}
                    onChange={(event) =>
                      updateItem(
                        action.indicatorId,
                        {
                          dueDate:
                            event.target.value,
                        },
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Décision prise
                  </span>

                  <input
                    type="text"
                    value={item.decision}
                    disabled={!loaded}
                    maxLength={500}
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>

              <label className="mt-4 block print:hidden">
                <span className="text-sm font-semibold text-slate-700">
                  Note de suivi
                </span>

                <textarea
                  value={item.note}
                  disabled={!loaded}
                  maxLength={2000}
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
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
