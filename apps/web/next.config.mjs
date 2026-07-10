/** @type {import('next').NextConfig} */
const securityHeaders = [
  // V3 §5.5 controls. CSP tightened further when analytics endpoint lands (M11).
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  // These are consumed as raw TypeScript source, not pre-built JS — every
  // packages/* package's "main"/"exports" points straight at its own
  // src/index.ts (see e.g. packages/shared-config/package.json). Next's
  // default webpack config only auto-transpiles files it doesn't treat as
  // "external" node_modules imports, and a symlinked pnpm workspace
  // package importing raw .ts is exactly the case that heuristic misses,
  // so these must be listed explicitly.
  transpilePackages: [
    '@claimsahayak/design-tokens',
    '@claimsahayak/shared-config',
    '@claimsahayak/shared-types',
    '@claimsahayak/shared-utils',
  ],
  webpack(config) {
    // Every packages/* source file writes relative imports with an
    // explicit ".js" extension pointing at a sibling ".ts" file (e.g.
    // `export * from "./brand.js"` in packages/shared-config/src/index.ts,
    // which really resolves to brand.ts) — the standard NodeNext-style
    // convention, consistent across this entire monorepo, that lets the
    // same source run as real Node ESM. Vitest/tsx already resolve this
    // correctly out of the box, which is why the workspace's tests pass;
    // webpack does not, without being told to.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;
