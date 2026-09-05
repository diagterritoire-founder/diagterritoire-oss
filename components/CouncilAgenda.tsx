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

  const [selectedIds, setSelectedIds] = useState<
    string[]
  >([]);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(storageKey);

      if (stored) {
        const saved = JSON.parse(stored);

        if (Array.isArray(saved)) {
          setSelectedIds(
            saved.filter(
              (value): value is string =>
                typeof value === "string",
            ),
          );
        }
      } else {
        setSelectedIds(
          proposedItems.map(
            (item) => item.indicatorId,
          ),
        );
      }
    } catch {
      setSelectedIds(
        proposedItems.map(
          (item) => item.indicatorId,
        ),
      );
    } finally {
      setHydrated(true);
    }
  }, [proposedItems, storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(selectedIds),
    );
  }, [
    hydrated,
    selectedIds,
    storageKey,
  ]);

  function toggleItem(indicatorId: string) {
    setSelectedIds((current) =>
      current.includes(indicatorId)
        ? current.filter(
            (id) => id !== indicatorId,
          )
        : [...current, indicatorId],
    );
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
