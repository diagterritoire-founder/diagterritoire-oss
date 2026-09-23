import type { NextConfig } from "next";

const codespaceHost =
  process.env.CODESPACES === "true" &&
  process.env.CODESPACE_NAME &&
  process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    ? `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
    : undefined;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
      ...(codespaceHost
        ? {
            allowedOrigins: [
              codespaceHost,
              "localhost:3000",
            ],
          }
        : {}),
    },
  },
};

export default nextConfig;
