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

type CouncilAgendaResponse = {
  agenda: string[] | null;
  agendaRevision: number;
  canManage: boolean;
};

type PersistenceStatus =
  | "loading"
  | "ready"
  | "saving"
  | "saved"
  | "conflict"
  | "error";

function priorityWeight(priority: CouncilAction["priority"]) {
  if (priority === "forte") return 0;
  if (priority === "consolider") return 1;
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
          const diff =
            priorityWeight(a.priority) -
            priorityWeight(b.priority);
          return diff !== 0 ? diff : a.score - b.score;
        })
        .slice(0, 5),
    [actions],
  );

  const proposedIds = useMemo(
    () => proposedItems.map((item) => item.indicatorId),
    [proposedItems],
  );

  const stateUrl =
    `/api/conseil-municipal/${encodeURIComponent(territoryId)}/state`;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [agendaRevision, setAgendaRevision] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [status, setStatus] =
    useState<PersistenceStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAgenda() {
      try {
        const response = await fetch(stateUrl, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Chargement de l'ordre du jour impossible.");
        }

        const payload =
          (await response.json()) as CouncilAgendaResponse;
        if (controller.signal.aborted) return;

        if (
          payload.agenda !== null &&
          (!Array.isArray(payload.agenda) ||
            !payload.agenda.every((id) => typeof id === "string"))
        ) {
          throw new Error("Sélection sauvegardée invalide.");
        }

        const selected = payload.agenda === null
          ? proposedIds
          : payload.agenda.filter((id) => proposedIds.includes(id));

        setSelectedIds(selected);
        setSavedSnapshot(
          payload.agenda === null
            ? null
            : JSON.stringify(selected),
        );
        if (!Number.isSafeInteger(payload.agendaRevision) || payload.agendaRevision < 0) {
          throw new Error("Version de l'ordre du jour invalide.");
        }
        setAgendaRevision(payload.agendaRevision);
        setCanManage(payload.canManage === true);
        setLoaded(true);
        setStatus("ready");
      } catch {
        if (!controller.signal.aborted) {
          setStatus("error");
        }
      }
    }

    void loadAgenda();
    return () => controller.abort();
  }, [proposedIds, stateUrl]);

  const dirty =
    loaded &&
    (savedSnapshot === null ||
      JSON.stringify(selectedIds) !== savedSnapshot);

  const selectedItems = proposedItems.filter((item) =>
    selectedIds.includes(item.indicatorId),
  );

  function toggleItem(indicatorId: string) {
    if (!loaded || !canManage || status === "saving" || status === "conflict") return;

    setSelectedIds((current) =>
      current.includes(indicatorId)
        ? current.filter((id) => id !== indicatorId)
        : [...current, indicatorId],
    );
    setStatus("ready");
  }

  async function saveAgenda() {
    if (!loaded || !canManage || !dirty || status === "saving" || status === "conflict") {
      return;
    }

    setStatus("saving");

    try {
      const response = await fetch(stateUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agenda: selectedIds,
          expectedAgendaRevision: agendaRevision,
        }),
      });

      if (response.status === 409) {
        setStatus("conflict");
        return;
      }
      if (!response.ok) {
        throw new Error("Enregistrement impossible.");
      }

      const payload =
        (await response.json()) as CouncilAgendaResponse;
      if (
        !Array.isArray(payload.agenda) ||
        !Number.isSafeInteger(payload.agendaRevision) ||
        payload.agendaRevision <= agendaRevision
      ) {
        throw new Error("Réponse de sauvegarde invalide.");
      }

      setAgendaRevision(payload.agendaRevision);
      setSelectedIds(payload.agenda);
      setSavedSnapshot(JSON.stringify(payload.agenda));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  if (proposedItems.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm print:break-inside-avoid print:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
        Préparation de séance
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        Proposition d’ordre du jour
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600 print:hidden">
        Choisissez les sujets du dossier préparatoire. Après
        enregistrement, la sélection est partagée avec les utilisateurs
        autorisés de cette collectivité.
      </p>

      <p
        className={
          "mt-3 text-xs print:hidden " +
          (status === "error" || status === "conflict" ? "text-rose-700" : "text-cyan-700")
        }
        role="status"
        aria-live="polite"
      >
        {status === "loading"
          ? "Chargement de l’ordre du jour partagé…"
          : status === "error"
            ? "Impossible de synchroniser la sélection. Réessayez ou rechargez la page."
            : status === "conflict"
              ? "Une autre personne a enregistré des changements. Rechargez la page avant de modifier l'ordre du jour."
            : status === "saving"
              ? "Enregistrement dans DiagTerritoire…"
              : !canManage
                ? "Consultation seule. La sélection est modifiable par les responsables autorisés."
                : dirty
                  ? savedSnapshot === null
                    ? "Proposition initiale non encore enregistrée."
                    : "Modifications non enregistrées."
                  : "Sélection partagée enregistrée dans DiagTerritoire."}
      </p>

      <div className="mt-5 space-y-3 print:hidden">
        {loaded
          ? proposedItems.map((item) => (
              <label
                key={item.indicatorId}
                className="flex cursor-pointer gap-4 rounded-2xl border border-slate-200 p-4"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.indicatorId)}
                  disabled={!canManage || status === "saving" || status === "conflict"}
                  onChange={() => toggleItem(item.indicatorId)}
                  className="mt-1 h-4 w-4 disabled:cursor-not-allowed"
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
            ))
          : null}
      </div>

      {loaded && canManage && status === "conflict" ? (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl border border-rose-300 px-5 py-2.5 text-sm font-semibold text-rose-800 print:hidden"
        >
          Recharger la sélection partagée
        </button>
      ) : null}

      {loaded && canManage ? (
        <button
          type="button"
          onClick={() => void saveAgenda()}
          disabled={!dirty || status === "saving" || status === "conflict"}
          className="mt-4 rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
        >
          {status === "saving"
            ? "Enregistrement…"
            : "Enregistrer la sélection"}
        </button>
      ) : null}

      <div className="mt-5 hidden print:block">
        {selectedItems.length > 0 ? (
          <ol className="space-y-3">
            {selectedItems.map((item, index) => (
              <li
                key={item.indicatorId}
                className="flex gap-3 print:break-inside-avoid"
              >
                <span className="font-bold">{index + 1}.</span>
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
        Cette proposition facilite la préparation de la séance. Elle
        ne constitue pas l’ordre du jour officiel de l’assemblée.
      </p>
    </section>
  );
}
