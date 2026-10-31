import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Konfigurasi Content Security Policy (CSP) untuk:
 * - Domain Utama: aksaventra.ai.id & *.aksaventra.ai.id
 * - DNS & Edge Proxy: Cloudflare (Turnstile, Web Analytics, CDN)
 */
const cspDirectives = [
  "default-src 'self' https://aksaventra.ai.id https://*.aksaventra.ai.id",
  // Mengizinkan script Next.js serta layanan keamanan & analitik Cloudflare
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://aksaventra.ai.id https://*.aksaventra.ai.id https://*.cloudflare.com https://challenges.cloudflare.com https://static.cloudflareinsights.com`,
  // Mengizinkan style internal & Tailwind CSS
  "style-src 'self' 'unsafe-inline' https://aksaventra.ai.id https://*.cloudflare.com",
  // Mengizinkan gambar dari domain sendiri, blob/data URI (untuk chart/avatar), dan Cloudflare
  "img-src 'self' blob: data: https://aksaventra.ai.id https://*.aksaventra.ai.id https://*.cloudflare.com",
  // Mengizinkan font lokal dan data URI
  "font-src 'self' data: https://aksaventra.ai.id",
  // Mengizinkan koneksi API, Telemetry, S3/Storage, dan Cloudflare Insights/Turnstile
  `connect-src 'self' https://aksaventra.ai.id https://*.aksaventra.ai.id https://*.cloudflare.com https://cloudflareinsights.com https://challenges.cloudflare.com ${isDev ? "ws://localhost:* http://localhost:*" : ""}`,
  // Mengizinkan iframe khusus untuk widget Cloudflare Turnstile / Challenge
  "frame-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com",
  // Mencegah website di-embed di iframe pihak ketiga (Anti-Clickjacking)
  "frame-ancestors 'none'",
  // Membatasi pengiriman form dan manipulasi base URI hanya ke domain sendiri
  "form-action 'self' https://aksaventra.ai.id",
  "base-uri 'self'",
  "object-src 'none'",
  // Otomatis upgrade request HTTP ke HTTPS di production (di belakang proxy Cloudflare)
  ...(!isDev ? ["upgrade-insecure-requests"] : []),
];

const contentSecurityPolicyHeaderValue = cspDirectives
  .join("; ")
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicyHeaderValue,
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Menyembunyikan header X-Powered-By: Next.js agar versi framework tidak mudah di-fingerprinting
  poweredByHeader: false,

  // Memastikan native packages tidak di-bundle secara keliru oleh Webpack/Turbopack
  serverExternalPackages: ["@node-rs/argon2", "argon2"],

  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Mitigasi CVE-2026-96889 (Next.js Image Optimization RCE via SVG)
  images: {
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aksaventra.ai.id",
      },
      {
        protocol: "https",
        hostname: "*.aksaventra.ai.id",
      },
      {
        protocol: "https",
        hostname: "*.cloudflare.com",
      },
    ],
  },

  // Mitigasi GHSA-p3m5-59mp-jv5r & CSRF ketika berada di belakang Reverse Proxy Cloudflare
  experimental: {
    serverActions: {
      allowedOrigins: [
        "aksaventra.ai.id",
        "*.aksaventra.ai.id",
        ...(isDev ? ["localhost:3000"] : []),
      ],
    },
  },

  async headers() {
    return [
      {
        // Terapkan security headers & CSP ke seluruh route aplikasi dan API
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
