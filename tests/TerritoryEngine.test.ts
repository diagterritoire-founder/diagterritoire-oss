import assert from "node:assert/strict";
import test from "node:test";

import { TerritoryEngine } from "../core/engines/TerritoryEngine";
import type { Territory } from "../types/domain";

const territories: Territory[] = [
  {
    id: "territory-mayotte",
    code: "976",
    name: "Mayotte",
    slug: "mayotte",
    level: "department",
    status: "active",
  },
  {
    id: "territory-epci-cadema",
    code: "200060457",
    name: "CADEMA",
    slug: "cadema",
    level: "epci",
    parentId: "territory-mayotte",
    status: "active",
  },
  {
    id: "territory-commune-mamoudzou",
    code: "97611",
    name: "Mamoudzou",
    slug: "mamoudzou",
    level: "commune",
    parentId: "territory-epci-cadema",
    status: "active",
  },
];

test("retrouve un territoire par identifiant et par slug", () => {
  assert.equal(
    TerritoryEngine.findById(
      territories,
      "territory-commune-mamoudzou",
    )?.name,
    "Mamoudzou",
  );

  assert.equal(
    TerritoryEngine.findBySlug(
      territories,
      "cadema",
    )?.id,
    "territory-epci-cadema",
  );
});

test("construit le chemin hierarchique complet d une commune", () => {
  const path = TerritoryEngine.getPath(
    territories,
    "territory-commune-mamoudzou",
  );

  assert.deepEqual(
    path.map((territory) => territory.id),
    [
      "territory-mayotte",
      "territory-epci-cadema",
      "territory-commune-mamoudzou",
    ],
  );
});

test("retourne un chemin vide pour un territoire inconnu", () => {
  assert.deepEqual(
    TerritoryEngine.getPath(
      territories,
      "territory-inconnu",
    ),
    [],
  );
});

test("effectue une recherche insensible a la casse", () => {
  const result = TerritoryEngine.search(
    territories,
    "MAMOUDZOU",
  );

  assert.deepEqual(
    result.map((territory) => territory.id),
    ["territory-commune-mamoudzou"],
  );
});

test("interrompt la recherche d ancetres en presence d un cycle", () => {
  const cyclicTerritories: Territory[] = [
    {
      id: "a",
      code: "A",
      name: "A",
      slug: "a",
      level: "commune",
      parentId: "b",
      status: "active",
    },
    {
      id: "b",
      code: "B",
      name: "B",
      slug: "b",
      level: "epci",
      parentId: "a",
      status: "active",
    },
  ];

  const ancestors =
    TerritoryEngine.getAncestors(
      cyclicTerritories,
      "a",
    );

  assert.ok(ancestors.length <= 2);
});
