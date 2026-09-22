import {
  createContributionDraftAction,
} from "./actions";

type DocumentContributionFormProps = {
  territoryId: string;
  serviceId: string;
};

export default function DocumentContributionForm({
  territoryId,
  serviceId,
}: DocumentContributionFormProps) {
  return (
    <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
        Rapport ou document
      </p>

      <h2 className="mt-1 text-xl font-bold text-slate-950">
        Référencer un document
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Enregistrez un rapport, une note ou une pièce métier à partir de sa référence ou de son lien, sans accès au serveur.
      </p>

      <form
        action={createContributionDraftAction}
        className="mt-6 grid gap-5 md:grid-cols-2"
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

        <input
          type="hidden"
          name="type"
          value="document"
        />

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            Titre du document
          </span>

          <input
            type="text"
            name="title"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950"
            placeholder="Ex. Rapport d’activité 2026"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Lien, référence ou source
          </span>

          <input
            type="text"
            name="source"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950"
            placeholder="URL, référence GED ou origine du document"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Date ou période de référence
          </span>

          <input
            type="text"
            name="referencePeriod"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950"
            placeholder="Ex. 22/09/2026 ou 2026-T3"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            Description
          </span>

          <textarea
            name="description"
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950"
            placeholder="Résumé ou informations utiles sur le document"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-xl bg-cyan-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-900"
          >
            Créer la référence du document
          </button>
        </div>
      </form>
    </section>
  );
}
