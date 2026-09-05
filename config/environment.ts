export type Environment = "development" | "test" | "production";

export const environment: Environment =
  (process.env.NODE_ENV as Environment) ?? "development";

export const isDevelopment = environment === "development";
export const isTest = environment === "test";
export const isProduction = environment === "production";