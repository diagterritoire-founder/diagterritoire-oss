import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getMayotteIndicatorValues,
} from "../data/mayotte-indicators";

test(
  "expose les 8 valeurs territoriales de Dzaoudzi-Labattoir avec leur millesime",
  () => {
    const values = getMayotteIndicatorValues(
      "territory-commune-dzaoudzi-labattoir",
    );

    assert.equal(values.length, 8);

    const byIndicatorId = new Map(
      values.map((value) => [
        value.indicatorId,
        value,
      ]),
    );

    const expectations = [
      ["population-2026", 20336, "2025-2026"],
      ["population-growth-2017-2026", 14, "2017-2026"],
      ["employment-2017", 29.1, "2017"],
      ["qualified-2017", 35.7, "2017"],
      ["water-inside-2017", 72.5, "2017"],
      ["electricity-2017", 93.1, "2017"],
      ["internet-2017", 33.1, "2017"],
      ["fixed-thd-coverage-2026", 49.7, "2026 T1"],
    ] as const;

    for (const [
      indicatorId,
      numericValue,
      referencePeriod,
    ] of expectations) {
      const value =
        byIndicatorId.get(indicatorId);

      assert.ok(
        value,
        `${indicatorId} absent`,
      );

      assert.equal(
        value.territoryId,
        "territory-commune-dzaoudzi-labattoir",
      );

      assert.equal(
        value.numericValue,
        numericValue,
      );

      assert.equal(
        value.referencePeriod,
        referencePeriod,
      );
    }
  },
);

test(
  "ne fabrique aucune valeur pour un territoire inconnu",
  () => {
    assert.deepEqual(
      getMayotteIndicatorValues(
        "territory-inconnu",
      ),
      [],
    );
  },
);


test(
  "raccorde la page Indicateurs aux valeurs de Dzaoudzi-Labattoir",
  () => {
    const source = readFileSync(
      "app/indicateurs/page.tsx",
      "utf8",
    );

    const expectedTokens = [
      "getMayotteIndicatorValues",
      "territory-commune-dzaoudzi-labattoir",
      "Valeur territoriale",
      "Valeur non disponible",
      "Période",
      "Source",
    ];

    for (const token of expectedTokens) {
      assert.ok(
        source.includes(token),
        `app/indicateurs/page.tsx: ${token} absent`,
      );
    }
  },
);
