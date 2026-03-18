import { dirname } from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "spncxhvqcytxdruevfrz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Fallback for Vercel Edge: rewrite unprefixed public paths to /fr/…
        // Runs after middleware — only applies if the middleware rewrite was lost
        {
          source: "/:path(menu|galerie|reservation|contact)",
          destination: "/fr/:path",
        },
        {
          source: "/",
          destination: "/fr",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default withNextIntl(nextConfig);
