import DashboardLayout from "@/components/DashboardLayout";
import { platformConfig } from "@/config";

function environmentLabel(environment: string) {
  if (environment === "production") {
    return "Production";
  }

  if (environment === "test") {
    return "Test";
  }

  return "Développement";
}

function featureLabel(feature: string) {
  const labels: Record<string, string> = {
    aiAssistant: "Assistant IA",
    diagnostics: "Diagnostics",
    indicators: "Indicateurs",
    prospective: "Prospective",
    cartography: "Cartographie",
    executiveDashboard: "Tableau de bord exécutif",
  };

  return labels[feature] ?? feature;
}

export default function ParametresPage() {
  const omniRouteBaseUrl =
    process.env.OMNIROUTE_BASE_URL ??
    "http://localhost:20128/v1";

  const omniRouteModel =
    process.env.OMNIROUTE_MODEL ??
    "auto";

  const enabledFeatures =
    Object.entries(
      platformConfig.features,
    ).filter(([, enabled]) => enabled);

  return (
    <DashboardLayout
      eyebrow="Paramètres"
      title="Configuration du pilote"
      description="Consultez la configuration technique et fonctionnelle actuellement active dans DiagTerritoire."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Version
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {platformConfig.platform.version}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            {platformConfig.platform.name}
          </p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Environnement
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {environmentLabel(
              platformConfig.environment,
            )}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Mode debug{" "}
            {platformConfig.runtime.debug
              ? "actif"
              : "inactif"}
          </p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Territoire pilote
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            Mayotte
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Source statique territoriale intégrée
          </p>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Cartographie
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            Zoom {platformConfig.cartography.defaultZoom}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Paramètre cartographique par défaut
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Fonctions
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Modules actifs
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {enabledFeatures.map(
              ([feature]) => (
                <div
                  key={feature}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                >
                  <span className="text-sm font-semibold text-slate-700">
                    {featureLabel(feature)}
                  </span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Actif
                  </span>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Intelligence artificielle
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            OmniRoute et fallback local
          </h2>

          <dl className="mt-5 space-y-4 text-sm">
            <div className="rounded-2xl border border-slate-200 p-4">
              <dt className="font-semibold text-slate-500">
                Modèle
              </dt>
              <dd className="mt-1 text-slate-950">
                {omniRouteModel}
              </dd>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <dt className="font-semibold text-slate-500">
                Endpoint
              </dt>
              <dd className="mt-1 break-all text-slate-950">
                {omniRouteBaseUrl}
              </dd>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <dt className="font-semibold text-slate-500">
                Timeout principal
              </dt>
              <dd className="mt-1 text-slate-950">
                {platformConfig.runtime.timeoutMs / 1000} secondes
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            En cas d’indisponibilité d’OmniRoute,
            DiagTerritoire conserve une réponse locale
            déterministe issue de son moteur territorial.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-3xl border border-cyan-200 bg-cyan-50 p-7">
        <h2 className="text-xl font-bold text-slate-950">
          Périmètre de cette version
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-700">
          Cette version pilote expose la configuration
          fonctionnelle de la plateforme. La gestion des
          comptes, rôles, droits d’accès et référentiels
          administrables relève d’une version ultérieure.
        </p>
      </section>
    </DashboardLayout>
  );
}
