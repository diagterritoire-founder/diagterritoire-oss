import DashboardLayout from "@/components/DashboardLayout";
import MayotteMap from "@/components/MayotteMap";
import PageSection from "@/components/PageSection";
import StatCard from "@/components/StatCard";

import {
  mayotteCommunes,
  mayotteEpcis,
} from "@/data/mayotte-territories";

export default function CartographiePage() {
  return (
    <DashboardLayout
      eyebrow="Cartographie"
      title="Intelligence géographique"
      description="Explorez les communes de Mayotte et accédez directement à leur analyse territoriale."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Communes"
          value={mayotteCommunes.length}
          description="Communes intégrées à la couche géographique DT"
          icon="🗺️"
        />

        <StatCard
          label="EPCI"
          value={mayotteEpcis.length}
          description="Intercommunalités structurantes de Mayotte"
          icon="🏛️"
        />

        <StatCard
          label="Couche"
          value="GeoJSON"
          description="Contours communaux locaux versionnés dans DiagTerritoire"
          icon="📐"
        />

        <StatCard
          label="Interaction"
          value="Active"
          description="Cliquez sur une commune pour ouvrir son analyse territoriale"
          icon="⌖"
        />
      </section>

      <PageSection
        title="Carte des communes de Mayotte"
        subtitle="Survolez une commune pour afficher son nom et son code INSEE. Cliquez pour accéder à sa fiche territoriale."
      >
        <MayotteMap />
      </PageSection>

      <PageSection
        title="Lecture cartographique"
        subtitle="Cette première couche géographique constitue le socle des futures cartes thématiques DT."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-950">
              Territoires
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Les contours sont reliés aux communes DT par leur code INSEE.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-950">
              Diagnostic
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Le clic sur une commune ouvre directement son analyse territoriale.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-950">
              Prochaine étape
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ajouter des couches thématiques : emploi, habitat, numérique et priorités.
            </p>
          </article>
        </div>
      </PageSection>
    </DashboardLayout>
  );
}
