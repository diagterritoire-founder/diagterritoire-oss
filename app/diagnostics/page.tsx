import DashboardLayout from "@/components/DashboardLayout";
import PageSection from "@/components/PageSection";
import TerritorialDiagnostic from "@/components/TerritorialDiagnostic";

import {
  platformIntelligence,
} from "@/core";

import {
  mayotteCommunes,
  mayotteDepartment,
  mayotteEpcis,
} from "@/data/mayotte-territories";

type DiagnosticsPageProps = {
  searchParams: Promise<{
    territoryId?: string;
  }>;
};

async function loadDiagnostic(
  territoryId: string,
) {
  try {
    const response =
      await platformIntelligence
        .buildTerritorialIntelligence({
          territoryId,
          question:
            "Présenter le diagnostic territorial et les principales priorités d’action.",
        });

    return {
      result: response.analysis,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      error:
        error instanceof Error
          ? error.message
          : "Le diagnostic n’a pas pu être généré.",
    };
  }
}

export default async function DiagnosticsPage({
  searchParams,
}: DiagnosticsPageProps) {
  const params = await searchParams;

  const territoryId =
    params.territoryId ??
    mayotteDepartment?.id ??
    "territory-mayotte";

  const {
    result,
    error,
  } = await loadDiagnostic(
    territoryId,
  );

  return (
    <DashboardLayout
      eyebrow="Diagnostics"
      title="Diagnostics territoriaux"
      description="Analysez les forces, fragilités et priorités d’action calculées par DiagTerritoire."
    >
      <PageSection
        title="Territoire analysé"
        subtitle="Sélectionnez Mayotte, un EPCI ou une commune pour recalculer le diagnostic."
      >
        <form
          method="get"
          className="flex flex-col gap-4 md:flex-row md:items-end"
        >
          <label className="flex-1">
            <span className="text-sm font-semibold text-slate-700">
              Territoire
            </span>

            <select
              name="territoryId"
              defaultValue={territoryId}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
            >
              {mayotteDepartment ? (
                <optgroup label="Territoire">
                  <option
                    value={
                      mayotteDepartment.id
                    }
                  >
                    {
                      mayotteDepartment.name
                    }
                  </option>
                </optgroup>
              ) : null}

              <optgroup label="EPCI">
                {mayotteEpcis.map(
                  (territory) => (
                    <option
                      key={
                        territory.id
                      }
                      value={
                        territory.id
                      }
                    >
                      {
                        territory.name
                      }
                    </option>
                  ),
                )}
              </optgroup>

              <optgroup label="Communes">
                {mayotteCommunes.map(
                  (territory) => (
                    <option
                      key={
                        territory.id
                      }
                      value={
                        territory.id
                      }
                    >
                      {
                        territory.name
                      }
                    </option>
                  ),
                )}
              </optgroup>
            </select>
          </label>

          <button
            type="submit"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Générer le diagnostic
          </button>
        </form>
      </PageSection>

      {result ? (
        <>
          <PageSection
            title={result.territory.name}
            subtitle={`Diagnostic calculé le ${new Date(
              result.generatedAt,
            ).toLocaleString(
              "fr-FR",
              {
                dateStyle: "long",
                timeStyle: "short",
              },
            )}.`}
          >
            <TerritorialDiagnostic
              diagnostic={
                result.diagnostic
              }
              assistant={
                result.assistant
              }
              territoryLevel={
                result.territory.level
              }
            />
          </PageSection>
        </>
      ) : (
        <PageSection
          title="Diagnostic indisponible"
          subtitle="Le moteur n’a pas pu produire le diagnostic demandé."
        >
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        </PageSection>
      )}
    </DashboardLayout>
  );
}
