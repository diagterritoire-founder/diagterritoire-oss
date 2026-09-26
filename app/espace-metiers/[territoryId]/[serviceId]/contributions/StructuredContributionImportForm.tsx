"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";

import {
  importStructuredContributionsAction,
  type StructuredImportActionState,
} from "./structured-import-actions";

type StructuredContributionImportFormProps = {
  territoryId: string;
  serviceId: string;
};

const initialState: StructuredImportActionState = {
  status: "idle",
  message: "",
  errors: [],
};

const template = [
  "type;title;description;referencePeriod;source",
  "observation;Exemple de donnée;Description facultative;2026-T3;Service métier",
].join("\n");

const templateHref =
  "data:text/csv;charset=utf-8," +
  encodeURIComponent(template);

export default function StructuredContributionImportForm({
  territoryId,
  serviceId,
}: StructuredContributionImportFormProps) {
  const formRef =
    useRef<HTMLFormElement>(null);
  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    importStructuredContributionsAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-bold text-slate-950">
            Importer des données structurées
          </p>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600">
            Importez jusqu’à 100 contributions depuis un fichier CSV UTF-8 de 1 Mo maximum. Le fichier est contrôlé entièrement avant création : s’il contient une erreur, aucun brouillon n’est ajouté.
          </p>
        </div>

        <a
          href={templateHref}
          download="modele-import-contributions-dt.csv"
          className="inline-flex w-fit shrink-0 rounded-xl border border-sky-700 px-4 py-2 text-xs font-semibold text-sky-900 transition hover:bg-sky-100"
        >
          Télécharger le modèle CSV
        </a>
      </div>

      <div className="mt-4 rounded-xl border border-sky-100 bg-white px-4 py-3 text-xs leading-5 text-slate-600">
        Colonnes attendues : <code>type</code>, <code>title</code>, <code>description</code>, <code>referencePeriod</code>, <code>source</code>. Types acceptés : indicator, project, action, document, event, alert, observation, other. Les libellés français correspondants sont également reconnus.
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="mt-5 grid gap-4"
      >
        <input
          type="hidden"
          name="territoryId"
          value={territoryId}
        />
        <input
          type="hidden"
          name="serviceId"
          value={serviceId}
        />

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Fichier CSV
          </span>
          <input
            type="file"
            name="file"
            required
            accept=".csv,text/csv,application/csv,application/vnd.ms-excel,text/plain"
            className="block w-full rounded-xl border border-dashed border-sky-300 bg-white px-4 py-4 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-800 file:px-4 file:py-2 file:font-semibold file:text-white"
          />
        </label>

        <p className="text-xs leading-5 text-slate-500">
          Chaque ligne valide crée un brouillon dans ce service. Rien n’est publié automatiquement : le circuit Soumettre → Examiner → Valider → Publier reste inchangé.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded-xl bg-sky-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Contrôle du fichier…"
            : "Contrôler et importer"}
        </button>
      </form>

      {state.status !== "idle" ? (
        <div
          aria-live="polite"
          className={
            "mt-4 rounded-xl border px-4 py-3 text-sm " +
            (state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900")
          }
        >
          <p className="font-semibold">
            {state.message}
          </p>

          {state.errors.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
              {state.errors.map((error) => (
                <li key={error}>
                  {error}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
