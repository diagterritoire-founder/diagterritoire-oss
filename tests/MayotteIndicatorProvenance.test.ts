import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  MAYOTTE_INDICATORS_AUTOMATIC_REFRESH,
  getMayotteIndicatorProvenance,
} from "../data/mayotte-indicator-provenance";
import {
  getMayotteIndicators,
  getMayotteIndicatorValues,
} from "../data/mayotte-indicators";
import {
  indicatorTerritories,
} from "../data/mayotte-indicator-territories";
import {
  MAYOTTE_FIXED_COVERAGE_2026_T1,
} from "../data/mayotte-digital-coverage";
import {
  MAYOTTE_STATISTICS,
} from "../data/mayotte-statistics";
import {
  compareMayotteIndicatorValues,
} from "../data/mayotte-indicator-comparison";

const DZAOUDZI = "territory-commune-dzaoudzi-labattoir";
const PAMANDZI = "territory-commune-pamandzi";
const CCPT = "territory-epci-ccpt";
const MAYOTTE = "territory-mayotte";

test("documente les 8 indicateurs des 23 territoires sans fausse date d'actualisation", () => {
  assert.equal(MAYOTTE_INDICATORS_AUTOMATIC_REFRESH, false);
  assert.equal(indicatorTerritories.length, 23);

  for (const territory of indicatorTerritories) {
    const indicators = getMayotteIndicators(territory.id);
    assert.equal(indicators.length, 8);

    for (const indicator of indicators) {
      const provenance = getMayotteIndicatorProvenance(
        indicator.id,
        territory.level,
      );
      assert.ok(provenance, indicator.id);
      assert.ok(provenance.method.trim().length > 20);
      assert.ok(provenance.sources.length > 0);

      for (const source of provenance.sources) {
        assert.match(source.url, /^https:\/\//);
        assert.ok(source.label.trim());
        if (source.publicationDate) {
          assert.match(source.publicationDate, /^\d{2}\/\d{2}\/\d{4}$/);
        }
      }
    }
  }

  assert.equal(
    getMayotteIndicatorProvenance("inconnu", "commune"),
    undefined,
  );
});

test("distingue publication communale et agrégation intercommunale", () => {
  const commune = getMayotteIndicatorProvenance("population-2026", "commune");
  const epci = getMayotteIndicatorProvenance("population-2026", "epci");
  const department = getMayotteIndicatorProvenance("population-2026", "department");

  assert.equal(commune?.origin, "publication");
  assert.equal(epci?.origin, "calcul");
  assert.equal(department?.origin, "calcul");
  assert.match(epci?.method ?? "", /Somme/);
  assert.match(epci?.sources[0]?.url ?? "", /insee\.fr/);

  const growth = getMayotteIndicatorProvenance(
    "population-growth-2017-2026",
    "department",
  );
  assert.equal(growth?.origin, "calcul");
  assert.equal(growth?.sources.length, 2);
  assert.deepEqual(
    growth?.sources.map((source) => source.publicationDate),
    ["05/08/2019", "07/07/2026"],
  );

  const arcep = getMayotteIndicatorProvenance(
    "fixed-thd-coverage-2026",
    "commune",
  );
  assert.equal(arcep?.origin, "calcul");
  assert.equal(arcep?.sources[0]?.publicationDate, undefined);
  assert.match(arcep?.method ?? "", /T1 2026/);
});

test("refuse une couverture Arcep incomplète au lieu de calculer un taux partiel", () => {
  const original = MAYOTTE_FIXED_COVERAGE_2026_T1["97615"];
  assert.ok(original);

  const before = getMayotteIndicatorValues(CCPT)
    .find((value) => value.indicatorId === "fixed-thd-coverage-2026");
  assert.ok(before && before.numericValue !== undefined);

  Reflect.deleteProperty(MAYOTTE_FIXED_COVERAGE_2026_T1, "97615");

  try {
    for (const territoryId of [PAMANDZI, CCPT, MAYOTTE]) {
      const result = getMayotteIndicatorValues(territoryId)
        .find((value) => value.indicatorId === "fixed-thd-coverage-2026");
      assert.ok(result);
      assert.equal(result.numericValue, undefined);
    }

    const unaffected = getMayotteIndicatorValues(DZAOUDZI)
      .find((value) => value.indicatorId === "fixed-thd-coverage-2026");
    assert.ok(unaffected && unaffected.numericValue !== undefined);
  } finally {
    MAYOTTE_FIXED_COVERAGE_2026_T1["97615"] = original;
  }

  const restored = getMayotteIndicatorValues(CCPT)
    .find((value) => value.indicatorId === "fixed-thd-coverage-2026");
  assert.equal(restored?.numericValue, before.numericValue);
});

test("refuse toute agrégation Insee partielle au lieu de masquer une commune absente", () => {
  const index = MAYOTTE_STATISTICS.findIndex(([code]) => code === "97615");
  assert.ok(index >= 0);
  const original = MAYOTTE_STATISTICS[index];
  assert.ok(original);
  const before = getMayotteIndicatorValues(CCPT);
  assert.equal(before.length, 8);

  Reflect.deleteProperty(MAYOTTE_STATISTICS, String(index));
  try {
    for (const territoryId of [PAMANDZI, CCPT, MAYOTTE]) {
      assert.deepEqual(getMayotteIndicatorValues(territoryId), []);
    }
    assert.equal(getMayotteIndicatorValues(DZAOUDZI).length, 8);
  } finally {
    Reflect.set(MAYOTTE_STATISTICS, String(index), original);
  }
  assert.deepEqual(getMayotteIndicatorValues(CCPT), before);
});

test("transmet les liens de provenance à la comparaison et aux pages", () => {
  const comparison = compareMayotteIndicatorValues(DZAOUDZI, PAMANDZI);
  assert.ok(comparison);
  assert.equal(comparison.rows.length, 8);
  assert.ok(comparison.rows.every((row) => row.provenance?.sources.length));

  const cataloguePage = readFileSync("app/indicateurs/page.tsx", "utf8");
  const comparePage = readFileSync("app/indicateurs/comparer/page.tsx", "utf8");
  for (const page of [cataloguePage, comparePage]) {
    assert.match(page, /publicationDate/);
    assert.match(page, /source\.url/);
    assert.match(page, /provenance\.method/);
  }
});
