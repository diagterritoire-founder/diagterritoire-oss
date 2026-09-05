import Link from "next/link";

import DashboardLayout from "@/components/DashboardLayout";
import PageSection from "@/components/PageSection";
import StatCard from "@/components/StatCard";

export default function DashboardPage() {
  return (
    <DashboardLayout
      eyebrow="Tableau de bord"
      title="Vue exécutive"
      description="Pilotez votre territoire grâce à une vision synthétique des principaux indicateurs."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Collectivités"
          value={23}
          description="Mayotte, 5 EPCI et 17 communes"
          icon="🏛️"
        />
        <StatCard
          label="Indicateurs"
          value={8}
          description="Indicateurs territoriaux actuellement intégrés"
          icon="📊"
        />
        <StatCard
          label="Diagnostics"
          value={1}
          description="Restitution territoriale disponible"
          icon="📑"
        />
        <StatCard
          label="Alertes"
          value="Actif"
          description="Veille territoriale opérationnelle"
          icon="🔔"
        />
      </section>

      <PageSection
        title="Pilote territorial Mayotte"
        subtitle="Diagnostic, comparaison, veille, prospective et restitution"
      >
        <div className="space-y-4">
          <p className="text-slate-700">Bienvenue dans DiagTerritoire.</p>
          <p className="text-slate-600">
            DiagTerritoire réunit désormais les principales briques du pilote Mayotte dans une chaîne de lecture et de décision territoriale.
          </p>

          <div className="rounded-xl bg-cyan-50 p-5">
            <h3 className="font-bold">🚀 Pilote Mayotte</h3>
            <p className="mt-2 text-sm text-slate-600">
              Territoires, indicateurs, diagnostic, cartographie, prospective, comparaison, veille et restitution.
            </p>

            <Link
              href="/territoires"
              className="mt-4 inline-flex rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              Choisir un territoire →
            </Link>
          </div>
        </div>
      </PageSection>
    </DashboardLayout>
  );
}
