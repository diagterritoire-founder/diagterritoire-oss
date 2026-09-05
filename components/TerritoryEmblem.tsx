import Image from "next/image";

import type { Territory } from "@/types/domain";

type TerritoryEmblemProps = {
  territory: Territory;
  compact?: boolean;
};

const emblemBySlug: Record<string, string> = {
  mayotte: "/emblems/mayotte/assemblee.svg",
  acoua: "/emblems/communes/acoua.svg",
  bandraboua: "/emblems/communes/bandraboua.svg",
  bandrele: "/emblems/communes/bandrele.svg",
  boueni: "/emblems/communes/boueni.svg",
  chiconi: "/emblems/communes/chiconi.svg",
  dembeni: "/emblems/communes/dembeni.svg",
  "dzaoudzi-labattoir":
    "/emblems/communes/dzaoudzi-labattoir.svg",
  "kani-keli": "/emblems/communes/kani-keli.svg",
  koungou: "/emblems/communes/koungou.svg",
  mamoudzou: "/emblems/communes/mamoudzou.svg",
  mtsangamouji:
    "/emblems/communes/mtsangamouji.svg",
  ouangani: "/emblems/communes/ouangani.svg",
  pamandzi: "/emblems/communes/pamandzi.gif",
};

const fallbackBySlug: Record<string, string> = {
  cadema: "DM",
  "3co": "3CO",
  ccpt: "PT",
  cagnm: "GN",
  ccsud: "SUD",
  chirongui: "CH",
  mtsamboro: "MT",
  sada: "SA",
  tsingoni: "TS",
};

function initials(name: string): string {
  return name
    .split(/[\s’'-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default function TerritoryEmblem({
  territory,
  compact = false,
}: TerritoryEmblemProps) {
  const source = emblemBySlug[territory.slug];
  const dimensions = compact ? 44 : 72;

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        "border border-slate-200 bg-white shadow-sm",
        compact
          ? "h-11 w-11 rounded-xl"
          : "h-[72px] w-[72px] rounded-2xl",
      ].join(" ")}
    >
      {source ? (
        <Image
          src={source}
          alt={`Emblème de ${territory.name}`}
          width={dimensions}
          height={dimensions}
          className="h-full w-full object-contain p-1.5"
          unoptimized
        />
      ) : (
        <span
          className={[
            "flex h-full w-full items-center justify-center",
            "bg-gradient-to-br from-cyan-700 to-slate-900",
            "px-1 text-center font-bold tracking-tight text-white",
            compact ? "text-xs" : "text-sm",
          ].join(" ")}
          aria-label={`Monogramme de ${territory.name}`}
        >
          {fallbackBySlug[territory.slug] ??
            initials(territory.name)}
        </span>
      )}
    </div>
  );
}
