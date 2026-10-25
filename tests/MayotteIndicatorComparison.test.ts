import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  compareMayotteIndicatorValues,
  getComparableIndicatorTerritories,
} from "../data/mayotte-indicator-comparison";
import {
  indicatorTerritories,
} from "../data/mayotte-indicator-territories";

const DZAOUDZI = "territory-commune-dzaoudzi-labattoir";
const PAMANDZI = "territory-commune-pamandzi";

test("compare 8 indicateurs documentés entre Dzaoudzi-Labattoir et Pamandzi", () => {
  const comparison = compareMayotteIndicatorValues(DZAOUDZI, PAMANDZI);
  assert.ok(comparison);
  assert.equal(comparison.left.name, "Dzaoudzi-Labattoir");
  assert.equal(comparison.right.name, "Pamandzi");
  assert.equal(comparison.rows.length, 8);

  const population = comparison.rows.find(
    (row) => row.indicatorId === "population-2026",
  );
  assert.ok(population);
  assert.equal(population.leftValue, 20336);
  assert.equal(population.rightValue, 11446);
  assert.equal(population.difference, 8890);
  assert.equal(population.differenceUnit, "habitants");
  assert.equal(population.leftPeriod, "2025-2026");
  assert.equal(population.rightPeriod, "2025-2026");
  assert.match(population.source, /Insee/);

  const internet = comparison.rows.find(
    (row) => row.indicatorId === "internet-2017",
  );
  assert.ok(internet);
  assert.equal(internet.differenceUnit, "points");
  assert.equal(internet.leftPeriod, "2017");
  assert.equal(internet.rightPeriod, "2017");
  // Exact difference is verified from the two displayed source values.
  assert.equal(
    internet.difference,
    Math.round(((internet.leftValue ?? 0) - (internet.rightValue ?? 0)) * 10) / 10,
  );
});

test("refuse les niveaux différents, les inconnus et les doublons", () => {
  const ccpt = "territory-epci-ccpt";
  for (const [left, right] of [
    [DZAOUDZI, DZAOUDZI],
    [DZAOUDZI, ccpt],
    [DZAOUDZI, "territory-mayotte"],
    ["territory-mayotte", "territory-mayotte"],
    ["territory-mayotte", ccpt],
    ["territory-inconnu", PAMANDZI],
    ["", PAMANDZI],
  ]) {
    assert.equal(compareMayotteIndicatorValues(left, right), undefined);
  }

  assert.deepEqual(getComparableIndicatorTerritories("territory-mayotte"), []);
  assert.deepEqual(getComparableIndicatorTerritories("territory-inconnu"), []);
});

test("couvre toutes les paires ordonnées de communes ou EPCI sans écarts fictifs", () => {
  const eligible = indicatorTerritories.filter(
    (territory) => territory.level === "commune" || territory.level === "epci",
  );
  assert.equal(eligible.length, 22);

  let comparedPairs = 0;

  for (const left of eligible) {
    const options = getComparableIndicatorTerritories(left.id);
    assert.equal(options.length, left.level === "commune" ? 16 : 4);

    for (const right of options) {
      const comparison = compareMayotteIndicatorValues(left.id, right.id);
      assert.ok(comparison);
      assert.equal(comparison.rows.length, 8);
      comparedPairs++;

      for (const row of comparison.rows) {
        assert.ok(row.source);
        assert.ok(row.unit);
        assert.ok(row.leftPeriod);
        assert.ok(row.rightPeriod);

        if (row.difference !== undefined) {
          assert.equal(row.leftPeriod, row.rightPeriod);
          assert.ok(Number.isFinite(row.leftValue));
          assert.ok(Number.isFinite(row.rightValue));
          assert.equal(
            row.difference,
            Math.round(((row.leftValue ?? 0) - (row.rightValue ?? 0)) * 10) / 10,
          );
        }
      }
    }
  }

  assert.equal(comparedPairs, 17 * 16 + 5 * 4);
});

test("affiche la comparaison depuis Indicateurs sans changer le module de scores", () => {
  const source = readFileSync("app/indicateurs/comparer/page.tsx", "utf8");
  for (const token of [
    "compareMayotteIndicatorValues",
    'action="/indicateurs/comparer"',
    "territoireA",
    "territoireB",
    "Période",
    "Source",
    "Écart A − B",
    "Non calculable",
  ]) {
    assert.ok(source.includes(token), "Absent : " + token);
  }
});
