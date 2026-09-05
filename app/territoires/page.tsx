import Image from "next/image";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import PageSection from "@/components/PageSection";
import StatCard from "@/components/StatCard";
import TerritoryNodeCard from "@/components/TerritoryNodeCard";
import {
  mayotteCommunes,
  mayotteDepartment,
  mayotteEpcis,
} from "@/data/mayotte-territories";

export default function TerritoiresPage() {
  return (
    <DashboardLayout
      eyebrow="Territoires"
      title="Référentiel territorial"
      description="Explorez les premiers niveaux territoriaux intégrés à DiagTerritoire."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mayotteDepartment ? (
          <Link
            href={`/territoires/${mayotteDepartment.id}`}
            className="block"
          >
            <StatCard
              label="Territoire pilote"
              value="Mayotte"
              description="Ouvrir la fiche territoriale de Mayotte"
              icon="🏝️"
            />
          </Link>
        ) : null}
        <StatCard
          label="Assemblée de Mayotte"
          value={mayotteDepartment ? 1 : 0}
          description="Institution du Département-Région de Mayotte"
          icon={<Image src="/emblems/mayotte/assemblee.svg" alt="Drapeau de l’Assemblée de Mayotte" width={44} height={30} className="h-auto w-11 object-contain" unoptimized />}
        />
        <StatCard
          label="EPCI"
          value={mayotteEpcis.length}
          description="Deux CA et trois CC"
          icon="🏢"
        />
        <StatCard
          label="Communes"
          value={mayotteCommunes.length}
          description="Les 17 communes de Mayotte"
          icon="🏘️"
        />
      </section>

      <PageSection
        title="Les 5 EPCI"
        subtitle="Première maille de coopération intercommunale du territoire pilote."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mayotteEpcis.map((territory) => (
            <TerritoryNodeCard key={territory.id} territory={territory} />
          ))}
        </div>
      </PageSection>

      <PageSection
        title="Les 17 communes"
        subtitle="Sélectionnez un territoire pour accéder à sa fiche détaillée."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mayotteCommunes.map((territory) => (
            <TerritoryNodeCard key={territory.id} territory={territory} />
          ))}
        </div>
      </PageSection>
    </DashboardLayout>
  );
}
