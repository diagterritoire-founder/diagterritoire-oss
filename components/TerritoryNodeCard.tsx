import Link from "next/link";

import TerritoryEmblem from "@/components/TerritoryEmblem";
import type {
  Territory,
  TerritorialLevel,
} from "@/types/domain";

type TerritoryNodeCardProps = {
  territory: Territory;
};

const labels: Record<TerritorialLevel, string> = {
  country: "Pays",
  metropolitan_area: "Hexagone",
  overseas_area: "Outre-mer",
  region: "Région",
  department: "Département",
  special_collectivity: "Collectivité",
  epci: "EPCI",
  commune: "Commune",
  village: "Village",
  district: "Quartier",
  iris: "IRIS",
  functional_area: "Zone",
};

export default function TerritoryNodeCard({
  territory,
}: TerritoryNodeCardProps) {
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            {labels[territory.level]}
          </span>

          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            {territory.name}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Code : {territory.code}
          </p>
        </div>

        <TerritoryEmblem territory={territory} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Actif
        </span>

        <Link
          href={`/territoires/${territory.id}`}
          className="font-semibold text-cyan-700 transition hover:text-cyan-900"
        >
          Explorer →
        </Link>
      </div>
    </article>
  );
}
