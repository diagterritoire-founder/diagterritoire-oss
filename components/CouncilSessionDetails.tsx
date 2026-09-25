"use client";

import type { InstitutionalBody } from "@/data/institutional-bodies";

import {
  useEffect,
  useState,
} from "react";

type CouncilSessionDetailsProps = {
  territoryId: string;
  institutionalBody: InstitutionalBody;
};

type SavedCouncilSession = {
  date: string;
  time: string;
  location: string;
  subject: string;
};

type CouncilStateResponse = {
  session: SavedCouncilSession;
  updatedAt: string | null;
};

type PersistenceStatus =
  | "loading"
  | "saved"
  | "saving"
  | "error";

function persistenceLabel(
  status: PersistenceStatus,
) {
  if (status === "loading") {
    return "Chargement de la fiche partagée…";
  }

  if (status === "saving") {
    return "Enregistrement dans DiagTerritoire…";
  }

  if (status === "error") {
    return "La fiche n’a pas pu être synchronisée. Réessayez après quelques instants.";
  }

  return "Fiche enregistrée dans DiagTerritoire.";
}

export default function CouncilSessionDetails({
  territoryId,
  institutionalBody,
}: CouncilSessionDetailsProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [subject, setSubject] = useState("");
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

    async function loadSharedSession() {
      setPersistenceStatus("loading");

      try {
        const response = await fetch(stateUrl, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Chargement de la fiche impossible.",
          );
        }

        const payload =
          (await response.json()) as CouncilStateResponse;

        if (cancelled) {
          return;
        }

        setDate(payload.session.date ?? "");
        setTime(payload.session.time ?? "");
        setLocation(
          payload.session.location ?? "",
        );
        setSubject(
          payload.session.subject ?? "",
        );
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

    void loadSharedSession();

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
                session: {
                  date,
                  time,
                  location,
                  subject,
                },
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
    date,
    editRevision,
    loaded,
    location,
    stateUrl,
    subject,
    time,
  ]);

  function markEdited() {
    setEditRevision(
      (current) => current + 1,
    );
  }

  function clearSession() {
    setDate("");
    setTime("");
    setLocation("");
    setSubject("");
    markEdited();
  }

  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm print:break-inside-avoid print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Fiche de séance
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {institutionalBody.sessionInformationTitle}
          </h2>
        </div>

        <div className="print:hidden">
          <button
            type="button"
            onClick={clearSession}
            disabled={!loaded}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Effacer la fiche
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 print:hidden">
        Les informations sont enregistrées automatiquement
        dans DiagTerritoire et partagées avec les utilisateurs
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

      <div className="mt-5 grid gap-4 md:grid-cols-2 print:hidden">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Date de séance
          </span>

          <input
            type="date"
            value={date}
            disabled={!loaded}
            onChange={(event) => {
              setDate(event.target.value);
              markEdited();
            }}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Heure
          </span>

          <input
            type="time"
            value={time}
            disabled={!loaded}
            onChange={(event) => {
              setTime(event.target.value);
              markEdited();
            }}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Lieu
          </span>

          <input
            type="text"
            value={location}
            disabled={!loaded}
            maxLength={200}
            onChange={(event) => {
              setLocation(event.target.value);
              markEdited();
            }}
            placeholder={institutionalBody.locationPlaceholder}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Objet de la séance
          </span>

          <input
            type="text"
            value={subject}
            disabled={!loaded}
            maxLength={300}
            onChange={(event) => {
              setSubject(event.target.value);
              markEdited();
            }}
            placeholder="Exemple : séance ordinaire"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </div>

      <dl className="mt-5 hidden grid-cols-2 gap-x-8 gap-y-4 border-t border-slate-200 pt-5 text-sm print:grid">
        <div>
          <dt className="font-semibold text-slate-500">
            Date
          </dt>
          <dd className="mt-1 text-slate-950">
            {date || "Non renseignée"}
          </dd>
        </div>

        <div>
          <dt className="font-semibold text-slate-500">
            Heure
          </dt>
          <dd className="mt-1 text-slate-950">
            {time || "Non renseignée"}
          </dd>
        </div>

        <div>
          <dt className="font-semibold text-slate-500">
            Lieu
          </dt>
          <dd className="mt-1 text-slate-950">
            {location || "Non renseigné"}
          </dd>
        </div>

        <div>
          <dt className="font-semibold text-slate-500">
            Objet
          </dt>
          <dd className="mt-1 text-slate-950">
            {subject || "Non renseigné"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
