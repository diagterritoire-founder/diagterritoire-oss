import type { NextConfig } from "next";

const codespacesRecipe =
  process.env.CODESPACES === "true" &&
  process.env.DT_CODESPACES_RECIPE === "true";

const nextConfig: NextConfig = {
  ...(codespacesRecipe
    ? {
        experimental: {
          serverActions: {
            allowedOrigins: ["localhost:3200"],
          },
        },
      }
    : {}),
};

export default nextConfig;
