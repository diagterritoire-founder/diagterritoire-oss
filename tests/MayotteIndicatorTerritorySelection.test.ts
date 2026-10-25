import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  DEFAULT_INDICATOR_TERRITORY_ID,
  indicatorTerritories,
  indicatorTerritoryGroups,
  resolveMayotteIndicatorTerritory,
} from "../data/mayotte-indicator-territories";
import {
  getMayotteIndicators,
  getMayotteIndicatorValues,
} from "../data/mayotte-indicators";

test("propose Mayotte, 5 EPCI et 17 communes sans doublon", () => {
  assert.deepEqual(
    indicatorTerritoryGroups.map((group) => group.territories.length),
    [1, 5, 17],
  );
  assert.equal(indicatorTerritories.length, 23);
  assert.equal(
    new Set(indicatorTerritories.map((territory) => territory.id)).size,
    indicatorTerritories.length,
  );
});

test("conserve Dzaoudzi-Labattoir par défaut", () => {
  assert.equal(
    resolveMayotteIndicatorTerritory(undefined)?.id,
    DEFAULT_INDICATOR_TERRITORY_ID,
  );
});

test("refuse les identifiants inconnus et les paramètres multiples", () => {
  assert.equal(resolveMayotteIndicatorTerritory("territory-inconnu"), undefined);
  assert.equal(resolveMayotteIndicatorTerritory(["territory-mayotte"]), undefined);
  assert.equal(resolveMayotteIndicatorTerritory(""), undefined);
});

test("charge les indicateurs pour une commune, un EPCI et Mayotte", () => {
  for (const group of indicatorTerritoryGroups) {
    const territory = group.territories[0];
    assert.ok(territory, `Groupe vide : ${group.label}`);
    assert.equal(resolveMayotteIndicatorTerritory(territory.id)?.id, territory.id);

    const indicators = getMayotteIndicators(territory.id);
    const values = getMayotteIndicatorValues(territory.id);
    assert.equal(indicators.length, 8);
    assert.equal(values.length, 8);
    assert.ok(values.every((value) => value.territoryId === territory.id));
    assert.ok(
      values.every(
        (value) =>
          value.numericValue === undefined ||
          Number.isFinite(value.numericValue),
      ),
    );
    assert.ok(indicators.every((indicator) => indicator.source && indicator.unit));
    assert.ok(values.every((value) => value.referencePeriod));
  }
});

test("la page utilise le sélecteur et rejette les territoires inconnus", () => {
  const source = readFileSync("app/indicateurs/page.tsx", "utf8");
  for (const token of [
    "indicatorTerritoryGroups",
    "resolveMayotteIndicatorTerritory",
    "notFound()",
    'name="territoire"',
    'method="get"',
  ]) {
    assert.ok(source.includes(token), `Token manquant : ${token}`);
  }
});
