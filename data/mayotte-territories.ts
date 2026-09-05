import type { Territory } from "@/types/domain";

export const mayotteTerritories: Territory[] = [
  {
    id: "territory-france",
    code: "FR",
    name: "France",
    slug: "france",
    level: "country",
    status: "active",
  },
  {
    id: "territory-overseas",
    code: "FR-OM",
    name: "Outre-mer",
    slug: "outre-mer",
    level: "overseas_area",
    parentId: "territory-france",
    status: "active",
  },
  {
    id: "territory-mayotte",
    code: "976",
    name: "Mayotte",
    slug: "mayotte",
    level: "department",
    parentId: "territory-overseas",
    status: "active",
  },

  {
    id: "territory-epci-cadema",
    code: "EPCI-CADEMA",
    name: "Communauté d’agglomération de Dembéni-Mamoudzou",
    slug: "cadema",
    level: "epci",
    parentId: "territory-mayotte",
    status: "active",
  },
  {
    id: "territory-epci-cagnm",
    code: "EPCI-CAGNM",
    name: "Communauté d’agglomération du Grand Nord de Mayotte",
    slug: "cagnm",
    level: "epci",
    parentId: "territory-mayotte",
    status: "active",
  },
  {
    id: "territory-epci-3co",
    code: "EPCI-3CO",
    name: "Communauté de communes du Centre-Ouest",
    slug: "3co",
    level: "epci",
    parentId: "territory-mayotte",
    status: "active",
  },
  {
    id: "territory-epci-ccsud",
    code: "EPCI-CCSUD",
    name: "Communauté de communes du Sud",
    slug: "ccsud",
    level: "epci",
    parentId: "territory-mayotte",
    status: "active",
  },
  {
    id: "territory-epci-ccpt",
    code: "EPCI-CCPT",
    name: "Communauté de communes de Petite-Terre",
    slug: "ccpt",
    level: "epci",
    parentId: "territory-mayotte",
    status: "active",
  },

  { id: "territory-commune-dembeni", code: "97607", name: "Dembéni", slug: "dembeni", level: "commune", parentId: "territory-epci-cadema", status: "active" },
  { id: "territory-commune-mamoudzou", code: "97611", name: "Mamoudzou", slug: "mamoudzou", level: "commune", parentId: "territory-epci-cadema", status: "active" },

  { id: "territory-commune-acoua", code: "97601", name: "Acoua", slug: "acoua", level: "commune", parentId: "territory-epci-cagnm", status: "active" },
  { id: "territory-commune-bandraboua", code: "97602", name: "Bandraboua", slug: "bandraboua", level: "commune", parentId: "territory-epci-cagnm", status: "active" },
  { id: "territory-commune-koungou", code: "97610", name: "Koungou", slug: "koungou", level: "commune", parentId: "territory-epci-cagnm", status: "active" },
  { id: "territory-commune-mtsamboro", code: "97612", name: "Mtsamboro", slug: "mtsamboro", level: "commune", parentId: "territory-epci-cagnm", status: "active" },

  { id: "territory-commune-chiconi", code: "97605", name: "Chiconi", slug: "chiconi", level: "commune", parentId: "territory-epci-3co", status: "active" },
  { id: "territory-commune-mtsangamouji", code: "97613", name: "M'Tsangamouji", slug: "mtsangamouji", level: "commune", parentId: "territory-epci-3co", status: "active" },
  { id: "territory-commune-ouangani", code: "97614", name: "Ouangani", slug: "ouangani", level: "commune", parentId: "territory-epci-3co", status: "active" },
  { id: "territory-commune-sada", code: "97616", name: "Sada", slug: "sada", level: "commune", parentId: "territory-epci-3co", status: "active" },
  { id: "territory-commune-tsingoni", code: "97617", name: "Tsingoni", slug: "tsingoni", level: "commune", parentId: "territory-epci-3co", status: "active" },

  { id: "territory-commune-bandrele", code: "97603", name: "Bandrélé", slug: "bandrele", level: "commune", parentId: "territory-epci-ccsud", status: "active" },
  { id: "territory-commune-boueni", code: "97604", name: "Bouéni", slug: "boueni", level: "commune", parentId: "territory-epci-ccsud", status: "active" },
  { id: "territory-commune-chirongui", code: "97606", name: "Chirongui", slug: "chirongui", level: "commune", parentId: "territory-epci-ccsud", status: "active" },
  { id: "territory-commune-kani-keli", code: "97609", name: "Kani-Kéli", slug: "kani-keli", level: "commune", parentId: "territory-epci-ccsud", status: "active" },

  { id: "territory-commune-dzaoudzi-labattoir", code: "97608", name: "Dzaoudzi-Labattoir", slug: "dzaoudzi-labattoir", level: "commune", parentId: "territory-epci-ccpt", status: "active" },
  { id: "territory-commune-pamandzi", code: "97615", name: "Pamandzi", slug: "pamandzi", level: "commune", parentId: "territory-epci-ccpt", status: "active" },
];

export const mayotteDepartment = mayotteTerritories.find(
  (territory) => territory.id === "territory-mayotte",
);

export const mayotteEpcis = mayotteTerritories.filter(
  (territory) => territory.level === "epci",
);

export const mayotteCommunes = mayotteTerritories.filter(
  (territory) => territory.level === "commune",
);

export function getTerritoryById(id: string): Territory | undefined {
  return mayotteTerritories.find((territory) => territory.id === id);
}

export function getTerritoryBySlug(slug: string): Territory | undefined {
  return mayotteTerritories.find((territory) => territory.slug === slug);
}

export function getTerritoryChildren(parentId: string): Territory[] {
  return mayotteTerritories.filter(
    (territory) => territory.parentId === parentId,
  );
}
