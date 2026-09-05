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

export default function CouncilSessionDetails({
  territoryId,
  institutionalBody,
}: CouncilSessionDetailsProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [subject, setSubject] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const storageKey =
    `diagterritoire:council-session:${territoryId}`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        storageKey,
      );

      if (stored) {
        const saved = JSON.parse(
          stored,
        ) as SavedCouncilSession;

        setDate(saved.date ?? "");
        setTime(saved.time ?? "");
        setLocation(saved.location ?? "");
        setSubject(saved.subject ?? "");
      }
    } catch {
      // Une sauvegarde locale invalide ne bloque pas la fiche.
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const session: SavedCouncilSession = {
      date,
      time,
      location,
      subject,
    };

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(session),
    );
  }, [
    date,
    hydrated,
    location,
    storageKey,
    subject,
    time,
  ]);

  function clearSession() {
    setDate("");
    setTime("");
    setLocation("");
    setSubject("");
    window.localStorage.removeItem(storageKey);
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
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Effacer la fiche
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 print:hidden">
        Les informations sont sauvegardées automatiquement
        sur cet appareil pour ce territoire.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 print:hidden">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Date de séance
          </span>

          <input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Heure
          </span>

          <input
            type="time"
            value={time}
            onChange={(event) =>
              setTime(event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Lieu
          </span>

          <input
            type="text"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            placeholder={institutionalBody.locationPlaceholder}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Objet de la séance
          </span>

          <input
            type="text"
            value={subject}
            onChange={(event) =>
              setSubject(event.target.value)
            }
            placeholder="Exemple : séance ordinaire"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
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
