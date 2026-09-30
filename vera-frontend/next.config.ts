import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const packagesDir = path.join(configDir, "..", "packages");

/** Workspace `file:../packages/*` deps — Turbopack needs file entrypoints (not package dirs). */
const VERA_PACKAGE_NAMES = [
  "api-contract",
  "autonomous-operations",
  "autonomous-safety",
  "civilization",
  "command-center",
  "digital-twin",
  "enterprise-automation",
  "enterprise-brain",
  "global-network",
  "industry-ecosystem",
  "intelligence",
  "interplanetary",
  "interstellar",
  "marketplace",
  "predictive-scheduling",
  "vision",
  "workflow-sim",
] as const;

/** Turbopack on Windows requires forward slashes in resolveAlias targets. */
function toAliasPath(p: string): string {
  return p.split(path.sep).join("/");
}

function veraPackageEntry(name: string): string {
  const pkgDir = path.join(packagesDir, `vera-${name}`);
  const candidates = [
    path.join(pkgDir, "src", "index.ts"),
    path.join(pkgDir, "dist", "index.js"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return toAliasPath(candidate);
  }
  return toAliasPath(pkgDir);
}

const veraResolveAlias = Object.fromEntries(
  VERA_PACKAGE_NAMES.map((name) => [`@vera/${name}`, veraPackageEntry(name)]),
);

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  productionBrowserSourceMaps: false,
  /** VeriForge dev UI (Vite :5175) proxies /vera → this app; allow its origin in dev. */
  allowedDevOrigins: ["localhost:5175", "127.0.0.1:5175"],
  output: "standalone",
  typedRoutes: false,
  transpilePackages: VERA_PACKAGE_NAMES.map((n) => `@vera/${n}`),
  turbopack: {
    root: configDir,
    resolveAlias: veraResolveAlias,
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      ...veraResolveAlias,
    };
    return config;
  },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const prefixes = [
      "workers",
      "companies",
      "equipment",
      "training",
      "training-records",
      "training-requirements",
      "training-ingestion",
      "certifications",
      "documents",
      "incidents",
      "incident",
      "equipment-assignments",
      "equipment-training-requirements",
      "site-access",
      "verification",
      "qr",
      "safety-station",
      "safety-stations",
      "gate",
      "logging",
      "cache",
      "map",
      // Note: do not blanket-proxy all of /api/v1 — Next preview routes under
      // /api/v1/core/dashboard, /api/v1/documents/completed, etc. must stay local.
      // Proxy Nest modules explicitly instead.
      "api/v1/pm",
      "api/v1/inspections",
      "api/v1/auth",
      "api/v1/acp",
      "api/v1/hub",
      "api/v1/ai",
      "api/v1/worker-wallet",
      "api/v1/maintenance-calibration",
      "api/v1/equipment",
      "api/v1/fall-clearance",
      "api/v1/safety-program-ingestion",
      "api/v1/contractor-portal",
    ];
    return prefixes.map((p) => ({
      source: `/${p}/:path*`,
      destination: `${api}/${p}/:path*`,
    }));
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const csp = isProd
      ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
      : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: http://localhost:3001 ws: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      {
        key: 'Content-Security-Policy',
        value: csp,
      },
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow, nosnippet',
      },
    ];
    if (isProd) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      });
    }
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
