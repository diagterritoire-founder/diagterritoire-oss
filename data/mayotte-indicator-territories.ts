import {
  mayotteCommunes,
  mayotteDepartment,
  mayotteEpcis,
} from "./mayotte-territories";

export const DEFAULT_INDICATOR_TERRITORY_ID =
  "territory-commune-dzaoudzi-labattoir";

function byName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((left, right) =>
    left.name.localeCompare(right.name, "fr"),
  );
}

export const indicatorTerritoryGroups = [
  {
    label: "Département",
    territories: mayotteDepartment ? [mayotteDepartment] : [],
  },
  {
    label: "Intercommunalités",
    territories: byName(mayotteEpcis),
  },
  {
    label: "Communes",
    territories: byName(mayotteCommunes),
  },
];

export const indicatorTerritories =
  indicatorTerritoryGroups.flatMap(
    (group) => group.territories,
  );

export function resolveMayotteIndicatorTerritory(
  selected: unknown,
) {
  const territoryId =
    selected === undefined
      ? DEFAULT_INDICATOR_TERRITORY_ID
      : selected;

  return typeof territoryId === "string"
    ? indicatorTerritories.find(
        (territory) => territory.id === territoryId,
      )
    : undefined;
}
