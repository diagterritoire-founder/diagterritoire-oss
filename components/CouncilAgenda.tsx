"use client";

import {
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";

const AGENDA_CHANGE_EVENT = "diagterritoire:council-agenda-change";

// Permet de conserver la sélection dans la session si localStorage est inaccessible.
const memorySelections = new Map<string, string>();

type CouncilAction = {
  indicatorId: string;
  indicatorName: string;
  score: number;
  priority: "forte" | "consolider" | "preserver";
  action: string;
};

type CouncilAgendaProps = {
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

export default function CouncilAgenda({
  territoryId,
  actions,
}: CouncilAgendaProps) {
  const proposedItems = useMemo(
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
    `diagterritoire:council-agenda:${territoryId}`;

  const proposedIds = useMemo(
    () => proposedItems.map((item) => item.indicatorId),
    [proposedItems],
  );

  const defaultSnapshot = useMemo(
    () => JSON.stringify(proposedIds),
    [proposedIds],
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === storageKey || event.key === null) {
          onStoreChange();
        }
      };

      window.addEventListener("storage", onStorage);
      window.addEventListener(AGENDA_CHANGE_EVENT, onStoreChange);

      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(AGENDA_CHANGE_EVENT, onStoreChange);
      };
    },
    [storageKey],
  );

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(storageKey) ?? defaultSnapshot;
    } catch {
      return memorySelections.get(storageKey) ?? defaultSnapshot;
    }
  }, [storageKey, defaultSnapshot]);

  const getServerSnapshot = useCallback(
    () => defaultSnapshot,
    [defaultSnapshot],
  );

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const selectedIds = useMemo(() => {
    try {
      const saved: unknown = JSON.parse(snapshot);
      if (Array.isArray(saved)) {
        return saved.filter(
          (value): value is string => typeof value === "string",
        );
      }
    } catch {
      // Une sélection invalide restaure les propositions par défaut.
    }

    return proposedIds;
  }, [snapshot, proposedIds]);

  function toggleItem(indicatorId: string) {
    const updated = selectedIds.includes(indicatorId)
      ? selectedIds.filter((id) => id !== indicatorId)
      : [...selectedIds, indicatorId];
    const serialized = JSON.stringify(updated);

    memorySelections.set(storageKey, serialized);
    try {
      window.localStorage.setItem(storageKey, serialized);
    } catch {
      // La sélection reste utilisable dans la session courante.
    }
    window.dispatchEvent(new Event(AGENDA_CHANGE_EVENT));
  }

  const selectedItems = proposedItems.filter(
    (item) =>
      selectedIds.includes(item.indicatorId),
  );

  if (proposedItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm print:break-inside-avoid print:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
        Préparation de séance
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        Proposition d’ordre du jour
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600 print:hidden">
        Sélectionnez les sujets à retenir dans le dossier
        préparatoire. La sélection est sauvegardée
        automatiquement pour ce territoire.
      </p>

      <div className="mt-5 space-y-3 print:hidden">
        {proposedItems.map((item) => {
          const checked =
            selectedIds.includes(item.indicatorId);

          return (
            <label
              key={item.indicatorId}
              className="flex cursor-pointer gap-4 rounded-2xl border border-slate-200 p-4"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  toggleItem(item.indicatorId)
                }
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="font-semibold text-slate-950">
                  {item.indicatorName}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.action}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-5 hidden print:block">
        {selectedItems.length > 0 ? (
          <ol className="space-y-3">
            {selectedItems.map((item, index) => (
              <li
                key={item.indicatorId}
                className="flex gap-3 print:break-inside-avoid"
              >
                <span className="font-bold">
                  {index + 1}.
                </span>

                <div>
                  <p className="font-semibold text-slate-950">
                    {item.indicatorName}
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {item.action}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">
            Aucun sujet préparatoire sélectionné.
          </p>
        )}
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Cette proposition est générée à des fins de
        préparation. Elle ne constitue pas l’ordre du jour
        officiel de l’assemblée délibérante.
      </p>
    </section>
  );
}
