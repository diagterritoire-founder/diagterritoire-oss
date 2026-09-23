import {
  createContributionDraftAction,
  createDocumentDraftWithUploadAction,
} from "./actions";
import {
  DOCUMENT_UPLOAD_ACCEPT,
} from "@/core/documents/DocumentUploadPolicy";

type DocumentContributionFormProps = {
  territoryId: string;
  serviceId: string;
};

function HiddenDocumentContext({
  territoryId,
  serviceId,
}: DocumentContributionFormProps) {
  return (
    <>
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
    </>
  );
}

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
        Ajouter un document
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Choisissez directement un fichier depuis votre ordinateur, une clé USB, un dossier réseau ou un stockage synchronisé accessible depuis votre appareil. Vous pouvez aussi conserver un simple lien ou une référence.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <form
          action={createDocumentDraftWithUploadAction}
          className="rounded-2xl border border-cyan-200 bg-white p-5"
        >
          <HiddenDocumentContext
            territoryId={territoryId}
            serviceId={serviceId}
          />

          <p className="text-sm font-bold text-slate-950">
            Téléverser un fichier
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Formats autorisés : PDF, Word, Excel, PowerPoint, OpenDocument, CSV et TXT. Taille maximale : 10 Mo.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Fichier
              </span>
              <input
                type="file"
                name="file"
                required
                accept={DOCUMENT_UPLOAD_ACCEPT}
                className="block w-full rounded-xl border border-dashed border-cyan-300 bg-cyan-50 px-4 py-4 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-800 file:px-4 file:py-2 file:font-semibold file:text-white"
              />
            </label>

            <label className="space-y-2">
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
                Date ou période de référence
              </span>
              <input
                type="text"
                name="referencePeriod"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950"
                placeholder="Ex. 23/09/2026 ou 2026-T3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Source métier
              </span>
              <input
                type="text"
                name="source"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950"
                placeholder="Ex. Direction des services techniques"
              />
            </label>

            <label className="space-y-2">
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

            <button
              type="submit"
              className="w-fit rounded-xl bg-cyan-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-900"
            >
              Ajouter le fichier
            </button>
          </div>
        </form>

        <form
          action={createContributionDraftAction}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <HiddenDocumentContext
            territoryId={territoryId}
            serviceId={serviceId}
          />

          <p className="text-sm font-bold text-slate-950">
            Référencer sans téléverser
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Utilisez ce parcours lorsque le document reste dans une GED, un cloud ou une autre source externe.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="space-y-2">
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
                placeholder="Ex. 23/09/2026 ou 2026-T3"
              />
            </label>

            <label className="space-y-2">
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

            <button
              type="submit"
              className="w-fit rounded-xl border border-cyan-800 px-5 py-3 text-sm font-semibold text-cyan-900 transition hover:bg-cyan-50"
            >
              Créer la référence du document
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
