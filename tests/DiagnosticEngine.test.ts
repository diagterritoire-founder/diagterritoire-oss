import assert from "node:assert/strict";
import test from "node:test";

import {
  DiagnosticEngine,
  type DiagnosticIndicator,
} from "../core/engines/DiagnosticEngine";

function indicator(
  overrides: Partial<DiagnosticIndicator> = {},
): DiagnosticIndicator {
  return {
    id: "indicator-1",
    name: "Indicateur 1",
    value: 100,
    target: 100,
    ...overrides,
  };
}

test("retourne un diagnostic critique sans indicateur", () => {
  const result = DiagnosticEngine.analyze([]);

  assert.equal(result.score, 0);
  assert.equal(result.status, "critique");
  assert.deepEqual(result.strengths, []);
  assert.deepEqual(result.weaknesses, []);
  assert.deepEqual(result.alerts, []);
  assert.deepEqual(result.actions, []);

  assert.deepEqual(
    result.recommendations,
    [
      "Ajouter des indicateurs pour établir un diagnostic.",
    ],
  );
});

test("respecte les seuils favorable vigilance et critique", () => {
  const cases = [
    {
      value: 70,
      expectedScore: 70,
      expectedStatus: "favorable",
      expectedPriority: "preserver",
      collection: "strengths",
    },
    {
      value: 40,
      expectedScore: 40,
      expectedStatus: "vigilance",
      expectedPriority: "consolider",
      collection: "weaknesses",
    },
    {
      value: 39,
      expectedScore: 39,
      expectedStatus: "critique",
      expectedPriority: "forte",
      collection: "alerts",
    },
  ] as const;

  for (const current of cases) {
    const result = DiagnosticEngine.analyze([
      indicator({
        value: current.value,
        target: 100,
      }),
    ]);

    assert.equal(
      result.score,
      current.expectedScore,
    );

    assert.equal(
      result.status,
      current.expectedStatus,
    );

    assert.equal(
      result[current.collection].length,
      1,
    );

    assert.equal(
      result.actions[0]?.priority,
      current.expectedPriority,
    );
  }
});

test("traite une cible absente ou nulle comme sans valeur de reference", () => {
  const targets: Array<number | undefined> = [
    undefined,
    0,
  ];

  for (const target of targets) {
    const result = DiagnosticEngine.analyze([
      indicator({
        value: 80,
        target,
      }),
    ]);

    assert.equal(result.score, 50);
    assert.equal(result.status, "vigilance");
    assert.equal(result.weaknesses.length, 1);

    assert.match(
      result.weaknesses[0]?.message ?? "",
      /Aucune valeur de référence/,
    );

    assert.equal(
      result.actions[0]?.priority,
      "consolider",
    );
  }
});

test("calcule higher-is-better et borne le score a 100", () => {
  const result = DiagnosticEngine.analyze([
    indicator({
      value: 120,
      target: 100,
      direction: "higher-is-better",
    }),
  ]);

  assert.equal(result.score, 100);
  assert.equal(result.status, "favorable");
  assert.equal(result.strengths.length, 1);
  assert.equal(
    result.actions[0]?.priority,
    "preserver",
  );
});

test("calcule lower-is-better", () => {
  const result = DiagnosticEngine.analyze([
    indicator({
      value: 20,
      target: 10,
      direction: "lower-is-better",
    }),
  ]);

  assert.equal(result.score, 50);
  assert.equal(result.status, "vigilance");
  assert.equal(result.weaknesses.length, 1);
  assert.equal(
    result.actions[0]?.priority,
    "consolider",
  );
});

test("protege lower-is-better lorsque la valeur est nulle", () => {
  const result = DiagnosticEngine.analyze([
    indicator({
      value: 0,
      target: 10,
      direction: "lower-is-better",
    }),
  ]);

  assert.equal(result.score, 100);
  assert.equal(result.status, "favorable");
  assert.equal(result.strengths.length, 1);
  assert.equal(
    result.actions[0]?.priority,
    "preserver",
  );
});

test("applique les poids dans le score global", () => {
  const result = DiagnosticEngine.analyze([
    indicator({
      id: "favorable",
      name: "Favorable",
      value: 100,
      target: 100,
      weight: 3,
    }),
    indicator({
      id: "critique",
      name: "Critique",
      value: 0,
      target: 100,
      weight: 1,
    }),
  ]);

  assert.equal(result.score, 75);
  assert.equal(result.status, "favorable");
  assert.equal(result.strengths.length, 1);
  assert.equal(result.alerts.length, 1);
  assert.equal(result.actions.length, 2);
});
