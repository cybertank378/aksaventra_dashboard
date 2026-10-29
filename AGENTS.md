# Agent Roles & Responsibilities

Dalam pengembangan kolaboratif berbasis agen (AI/Human Hybrid) untuk ekosistem **Aksaventra Engine Validation & License Management System**, peran dibagi menjadi spesialisasi berikut sesuai struktur proyek yang saat ini diterapkan:

---

## 1. Architect Agent
- **Tanggung Jawab**:
  - Merancang dan memelihara kepatuhan struktur Hexagonal Architecture pada kernel inti (`src/core/application`, `src/core/domain`, `src/core/http`, `src/core/infrastructure`, `src/core/libs`, `src/core/shared`).
  - Mendefinisikan port antarmuka kontrak repositori (`[Feature]Interfaces.ts`), Entity Domain murni (`entity/`), Value Objects (`value-object/`), aturan bisnis (`rules/`), dan mapper (`mapper/`).
  - Merancang evolusi skema database (`prisma/schema.prisma`) untuk model lisensi, pengguna, sesi, validasi engine, dan log audit.
  - Memastikan kepatuhan terhadap prinsip SOLID, Clean Architecture, dan kebijakan **Zero Barrel Files** (larangan keras membuat re-export `index.ts`/`index.tsx`).
- **Output**:
  - Skema Prisma, blueprint modul Bounded Context (`src/modules/[feature-plural]/`), diagram arsitektur Mermaid, dan port interface contracts.

---

## 2. Backend & TDD Developer Agent
- **Tanggung Jawab**:
  - Mengembangkan Use Case bisnis menggunakan pendekatan **Test-Driven Development (TDD)** dengan struktur pengujian **Triple A (Arrange, Act, Assert)** pada `src/modules/[feature-plural]/tests/`.
  - Mengimplementasikan Application Use Cases pada subdirektori `usecase/` dan orkestrator fasad pada `application/services/[Feature]Services.ts`.
  - Membangun adapter infrastruktur: implementasi repositori Prisma ORM (`infrastructure/repo/[Feature]Repository.ts`), controller HTTP (`infrastructure/http/[Feature]Controller.ts`), dan validasi Zod (`infrastructure/validators/[feature].validator.ts`).
  - Menyusun REST API Route Handlers (`src/app/api/`) termasuk endpoint validasi lisensi klien (`src/app/api/v1/validate/route.ts`).
  - Mengembangkan sistem database seeding modular pada `prisma/seed/` (`data/`, `lib/`, `logs/`, `seeders/`, `seed.ts`).
- **Output**:
  - Berkas unit test `.test.ts`, kelas Use Cases, adapter repositori Prisma, controller, API Route Handlers, dan script seeder.

---

## 3. Frontend & UI/UX Specialist Agent
- **Tanggung Jawab**:
  - Membangun antarmuka dashboard admin yang modern, intuitif, dan responsif menggunakan Next.js App Router dan Tailwind CSS v4.3.
  - Menerapkan arsitektur **Atomic Design** terstruktur pada setiap fitur halaman di `src/sections/[feature-kebab]/`:
    - `atomic/`: Komponen mikro spesifik fitur (badge status lisensi, metric hero card, formatted fields).
    - `molecules/`: Gabungan komponen atom (TableView, FormView, DetailCard, HeroView).
    - `organisms/`: Blok tampilan ber-state utuh yang mengintegrasikan molecules dengan hooks API.
    - `pages/`: Container halaman utama yang diimpor langsung oleh Next.js App Router (`src/app/(protected)/dashboard/`).
  - Memanfaatkan secara konsisten komponen desain sistem global generik (`src/shared-ui/component/`, `src/shared-ui/layout/`) tanpa menggunakan elemen native HTML mentah.
  - Mengintegrasikan state management dan pemanggilan REST API menggunakan custom hooks (`presentation/hooks/use[Feature]Api.ts`).
- **Output**:
  - Halaman antarmuka `/dashboard/*`, komponen atomic sections, tabel data interaktif dengan pagination/filtering, dan modal form manajemen lisensi.

---

## 4. Security & QA Auditor Agent
- **Tanggung Jawab**:
  - Memvalidasi gerbang keamanan jaringan **`src/proxy.ts`** (Next.js Request Proxy) dan memastikan pemfilteran rute publik, rute terproteksi, serta rute validasi engine berjalan tepat.
  - Mengaudit dan menguji alur validasi lisensi klien binary `aksaventra_engine.exe` (`src/security.rs`) berdasarkan **Serial Key** dan **Hardware ID (HWID)** mencakup 4 kondisi:
    1. *Aktivasi Baru* (Kunci HWID ke DB & terbitkan signed token).
    2. *Device Terdaftar* (Pencocokan HWID & respon aktif).
    3. *Lisensi Invalid / Expired / Revoked* (Penolakan HTTP 401/404).
    4. *Hardware Mismatch* (Penolakan HTTP 403 Forbidden).
  - Memastikan otorisasi pembuatan dan manajemen lisensi dikunci secara ketat **HANYA untuk role `ADMIN`** via `src/security/policyEngine.ts` dan `src/security/fieldGuard.ts`.
  - Memvalidasi penanganan isu keamanan `#39` (integritas hash SHA-256 binary engine).
  - Menegakkan Quality Gates: verifikasi kelulusan 100% unit test (`vitest`), zero lint errors (`biome check`), zero type errors (`tsc --noEmit`), dan keberhasilan build produksi Next.js.
- **Output**:
  - Berkas pengujian keamanan (`proxy.test.ts`, `policyEngine.test.ts`, `fieldGuard.test.ts`), laporan audit log keamanan, dan verifikasi Quality Gate CI/CD.