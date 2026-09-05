export const ARCEP_FIXED_COVERAGE_SOURCE =
  "https://www.data.gouv.fr/datasets/ma-connexion-internet";

export type MayotteFixedCoverage = {
  premises: number;
  atLeast30Mbps: number;
  atLeast100Mbps: number;
};

export const MAYOTTE_FIXED_COVERAGE_2026_T1: Record<
  string,
  MayotteFixedCoverage
> = {
  "97601": { premises: 1237, atLeast30Mbps: 671, atLeast100Mbps: 0 },
  "97602": { premises: 2045, atLeast30Mbps: 1413, atLeast100Mbps: 0 },
  "97603": { premises: 1960, atLeast30Mbps: 986, atLeast100Mbps: 0 },
  "97604": { premises: 2080, atLeast30Mbps: 1071, atLeast100Mbps: 0 },
  "97605": { premises: 1907, atLeast30Mbps: 752, atLeast100Mbps: 0 },
  "97606": { premises: 2280, atLeast30Mbps: 538, atLeast100Mbps: 0 },
  "97607": { premises: 1967, atLeast30Mbps: 879, atLeast100Mbps: 0 },
  "97608": { premises: 4625, atLeast30Mbps: 2298, atLeast100Mbps: 1380 },
  "97609": { premises: 1286, atLeast30Mbps: 629, atLeast100Mbps: 0 },
  "97610": { premises: 7928, atLeast30Mbps: 4519, atLeast100Mbps: 2171 },
  "97611": { premises: 18048, atLeast30Mbps: 8249, atLeast100Mbps: 1264 },
  "97612": { premises: 2011, atLeast30Mbps: 1209, atLeast100Mbps: 0 },
  "97613": { premises: 1471, atLeast30Mbps: 851, atLeast100Mbps: 0 },
  "97614": { premises: 1494, atLeast30Mbps: 1055, atLeast100Mbps: 0 },
  "97615": { premises: 4092, atLeast30Mbps: 1336, atLeast100Mbps: 318 },
  "97616": { premises: 2421, atLeast30Mbps: 867, atLeast100Mbps: 0 },
  "97617": { premises: 4888, atLeast30Mbps: 2701, atLeast100Mbps: 515 },
};
