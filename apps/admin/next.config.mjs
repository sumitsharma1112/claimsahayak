/** Admin Portal runs as a server application on a separate origin (V3 §3.4). */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // See apps/web/next.config.mjs for the full explanation: these packages
  // ship raw TypeScript source (no build step) and are consumed directly
  // via pnpm workspace symlinks, so Next must be told to transpile them.
  transpilePackages: [
    '@claimsahayak/design-tokens',
    '@claimsahayak/shared-config',
    '@claimsahayak/shared-types',
  ],
  webpack(config) {
    // Resolves this monorepo's NodeNext-style "./foo.js" relative imports
    // (which really point at "./foo.ts") the same way Vitest/tsx already
    // do — see apps/web/next.config.mjs for the full explanation.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;
