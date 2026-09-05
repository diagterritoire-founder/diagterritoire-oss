import {
  environment,
  isDevelopment,
  isProduction,
  isTest,
} from "./environment";

export const platformConfig = {
  platform: {
    name: "DiagTerritoire",
    version: "0.1.0",
  },

  environment,

  runtime: {
    debug: isDevelopment,
    testMode: isTest,
    productionMode: isProduction,
    timeoutMs: 30_000,
  },

  features: {
    aiAssistant: true,
    diagnostics: true,
    indicators: true,
    prospective: true,
    cartography: true,
    executiveDashboard: true,
  },

  dataSources: {
    staticMayotte: true,
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  },

  cartography: {
    defaultZoom: 10,
  },
} as const;

export type PlatformConfig = typeof platformConfig;