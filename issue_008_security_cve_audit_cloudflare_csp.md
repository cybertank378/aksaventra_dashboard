# ISSUE-008: Security Audit — Mitigasi Breaking CVE (Node.js & Next.js) dan Implementasi CSP Cloudflare (`aksaventra.ai.id`)

- **ID Issue:** `ISSUE-008`
- **Tanggal Audit:** 30 Oktober 2026
- **Proyek:** `aksaventra_dashboard-dev`
- **Domain Produksi:** `aksaventra.ai.id` (DNS & Proxy by Cloudflare)
- **Prioritas:** `CRITICAL` (P0)
- **Status:** `OPEN`
- **Modul & File Terdampak:**
  - `next.config.ts`
  - `package.json` & `package-lock.json`
  - `src/proxy.ts` (Middleware / Edge Proxy)
  - `src/modules/auth/infrastructure/providers/ArgonProvider.ts` (`@node-rs/argon2`)
  - `src/modules/releases/infrastructure/storage/*` & `src/app/api/v1/updater/*`

---

## 1. Latar Belakang & Ringkasan Eksekutif

Ekosistem Node.js dan Next.js baru-baru ini mengalami sejumlah *Common Vulnerabilities and Exposures* (CVE) dengan tingkat keparahan **Critical (CVSS 9.1 - 9.8)**. Sebagian besar *patch* keamanan tersebut bersifat *breaking* karena tidak lagi di-*backport* ke versi lawas (Node.js 20 telah mencapai *End-of-Life* dan perbaikan Next.js difokuskan pada rilis `15.5.28+` serta `16.4.1+`).

Selain itu, karena aplikasi `aksaventra_dashboard-dev` di-deploy menggunakan domain **`aksaventra.ai.id`** yang dikelola melalui DNS dan Reverse Proxy **Cloudflare**, diperlukan konfigurasi *Content Security Policy* (CSP) dan *HTTP Security Headers* yang ketat di dalam `next.config.ts` agar layanan Cloudflare (seperti Cloudflare Turnstile, Web Analytics/Beacon, dan CDN) tidak terblokir namun tetap terlindungi dari serangan XSS, Clickjacking, dan SSRF.

---

## 2. Daftar Temuan Kerentanan (CVE) & Analisis Dampak Proyek

| ID Kerentanan | Komponen | Skor CVSS | Deskripsi Singkat | Analisis Dampak pada `aksaventra_dashboard-dev` |
| :--- | :--- | :---: | :--- | :--- |
| **CVE-2026-111497** *(Node2Shell)* | Node.js Runtime (Brotli Decoder) | **9.8** (Critical) | *Remote Code Execution* (RCE) melalui pengiriman *payload* terkompresi Brotli yang dimanipulasi ke HTTP server Node.js. | **Terdampak Tinggi:** Endpoint publik seperti `/api/v1/validate`, `/api/v1/validate-key`, dan `/api/v1/updater/*` menerima *request* eksternal secara langsung. Wajib *upgrade* ke Node `22.23.4+` LTS atau `24.22.1+`. |
| **CVE-2026-96889** | Next.js Image Optimization (`sharp`) | **9.5** (Critical) | RCE saat memproses gambar vektor SVG di atas server Linux (`glibc`). | **Terdampak Sedang-Tinggi:** Proyek memiliki aset SVG di `public/` (`file.svg`, `globe.svg`, `src/app/icon0.svg`). Wajib menonaktifkan `dangerouslyAllowSVG` pada `next.config.ts` dan memaksa `sharp` ke `^0.35.5`. |
| **GHSA-673q-mjm6-r5xr** | Next.js App Router (`use cache`) | **9.1** (Critical) | RCE pada fitur *caching* React Server Components ketika mengembalikan beberapa *typed arrays*. | **Terdampak pada App Router:** Seluruh *route* di `src/app/(protected)/dashboard/*` dan `src/app/api/v1/*` menggunakan App Router. Wajib menggunakan `next@15.5.28+` atau `next@16.4.1+`. |
| **GHSA-p3m5-59mp-jv5r** | Next.js Server Actions | **7.5** (High) | *Denial of Service* (DoS) yang memicu penggunaan CPU 100% dan memblokir *event loop* melalui *request* `POST` berbahaya. | **Terdampak:** Perlu pembatasan `allowedOrigins` hanya untuk `aksaventra.ai.id` di `next.config.ts` dan *Rate Limiting* di Cloudflare WAF. |
| **CVE-2025-29927** *(Regression Check)* | Next.js Middleware / Proxy | **9.1** (Critical) | *Authorization Bypass* menggunakan *header* internal `x-middleware-subrequest`. | **Terdampak pada `src/proxy.ts`:** Harus dipastikan *header* internal dibersihkan di Cloudflare WAF dan ditangani oleh versi Next.js terbaru. |

---

## 3. Implementasi Kode `next.config.ts` (Cloudflare CSP & Mitigasi CVE)

Salin dan terapkan konfigurasi berikut ke dalam file `next.config.ts` di *root* proyek `aksaventra_dashboard-dev`:

```typescript
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
	// Mengizinkan gambar dari domain sendiri, blob/data URI (untuk chart/avatar), Cloudflare, dan AWS S3
	"img-src 'self' blob: data: https://aksaventra.ai.id https://*.aksaventra.ai.id https://*.cloudflare.com https://*.s3.amazonaws.com https://*.s3.*.amazonaws.com",
	// Mengizinkan font lokal dan data URI
	"font-src 'self' data: https://aksaventra.ai.id",
	// Mengizinkan koneksi API, Telemetry, S3/Storage, dan Cloudflare Insights/Turnstile
	`connect-src 'self' https://aksaventra.ai.id https://*.aksaventra.ai.id https://*.cloudflare.com https://cloudflareinsights.com https://challenges.cloudflare.com https://*.s3.amazonaws.com https://*.s3.*.amazonaws.com ${isDev ? "ws://localhost:* http://localhost:*" : ""}`,
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

	// Memastikan native packages (seperti Argon2) tidak di-bundle secara keliru oleh Webpack/Turbopack
	serverExternalPackages: ["@node-rs/argon2"],

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
			{
				protocol: "https",
				hostname: "*.s3.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "*.s3.*.amazonaws.com",
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
```

---

## 4. Rencana Mitigasi Teknis (*Action Plan*)

### 4.1. Pembaruan `package.json` (Overrides & Engines)
Untuk mencegah *breaking changes* pada dependensi *native* (seperti `@node-rs/argon2` pada `src/modules/auth/infrastructure/providers/ArgonProvider.ts` dan `@prisma/client` pada `prisma7.config.ts`), tambahkan penguncian versi runtime dan *dependency overrides* di `package.json`:

```json
{
  "engines": {
    "node": ">=22.23.4"
  },
  "overrides": {
    "sharp": "^0.35.5"
  }
}
```

**Langkah Eksekusi Terminal:**
```bash
# 1. Pastikan menggunakan Node.js 22 LTS terbaru (minimal 22.23.4)
nvm install 22.23.4 && nvm use 22.23.4

# 2. Upgrade Next.js ke versi patch aman menggunakan codemod resmi
npx @next/codemod@canary upgrade latest

# 3. Rebuild native modules (Argon2, Sharp, Prisma)
npm rebuild
npx prisma generate
```

### 4.2. Aturan Tambahan di Dashboard Cloudflare (`aksaventra.ai.id`)
Karena DNS dan trafik melewati Cloudflare Proxy (Orange Cloud), terapkan perlindungan lapis pertama di level Edge Cloudflare sebelum *request* menyentuh server Node.js:

1. **Mitigasi Node2Shell (CVE-2026-111497) & Subrequest Bypass via Cloudflare WAF Custom Rule:**
   - **Rule Name:** `Block Inbound Brotli Payload & Subrequest Bypass`
   - **Expression:**
     ```text
     (http.request.headers["content-encoding"][*] contains "br") or (any(http.request.headers.names[*] =~ "^x-middleware-subrequest$"))
     ```
   - **Action:** `Block`
2. **Rate Limiting untuk Endpoint Sensitif:**
   - Pasang aturan Rate Limit di Cloudflare WAF pada URI `/api/v1/auth/*` dan `/api/v1/validate*` untuk mencegah *Brute Force* serta *Server Actions DoS* (GHSA-p3m5-59mp-jv5r).

---

## 5. Kriteria Penerimaan (*Acceptance Criteria*)

- [ ] Runtime Node.js di lingkungan *development*, CI/CD, dan *production* telah diperbarui ke minimal `v22.23.4` (Node 20 dihentikan sepenuhnya).
- [ ] `npm ls sharp` menunjukkan versi `>= 0.35.5` dan `next` berada pada versi yang telah ditambal (`>= 15.5.28` atau `>= 16.4.1`).
- [ ] File `next.config.ts` telah menerapkan *Content Security Policy* (CSP) untuk `aksaventra.ai.id` dan `cloudflare.com`.
- [ ] Seluruh *unit & integration tests* (`npx vitest run`) pada modul `auth`, `dashboards`, `licenses`, `releases`, `validation-logs`, dan `security` (`src/security/tests/proxy.test.ts`) berjalan lulus tanpa *error*.
- [ ] Pemeriksaan `next build` berhasil tanpa *error* kompilasi TypeScript maupun pelanggaran aturan Biome (`npx @biomejs/biome check .`).
- [ ] Verifikasi *Response Headers* di browser pada `https://aksaventra.ai.id` menampilkan header `Content-Security-Policy`, `X-Frame-Options: DENY`, dan `X-Content-Type-Options: nosniff`.