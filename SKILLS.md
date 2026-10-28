# Engineering Skills & Competencies Required

Dokumen ini memetakan keahlian teknis dan standar kompetensi yang wajib dipatuhi oleh pengembang dan agen AI sesuai struktur arsitektur yang saat ini diterapkan pada **Aksaventra Engine Validation & License Management System**:

---

## 1. Domain-Driven Design & Hexagonal Architecture
- **Framework-Agnostic Core Kernel (`src/core/`)**:
  - `src/core/application/`: Pembuatan Use Cases berbasis `BaseUseCase`, `BaseUploadUseCase`, dan orkestrasi `BaseService` dengan metode pengeksekusi terisolasi `execute()`.
  - `src/core/domain/`: Pembuatan Rich Domain Models (`BaseEntity`), kontrak repositori generic (`BaseRepository`), `BaseValueObject`, dan monad Railway-Oriented Programming (`Result<T, E>`).
  - `src/core/http/`: Pengendalian Route Handler via `BaseController`, penanganan respons otomatis melalui `HttpResultHandler`, dan ekstraksi parameter URL via `QueryParams` serta `RouteParamHelper`.
  - `src/core/infrastructure/`: Pengelolaan adapters, context eksekusi, dan storage.
  - `src/core/libs/`: Pengelolaan instance singleton Prisma Client (`src/core/libs/prisma.ts`).
  - `src/core/shared/`: Validasi variabel lingkungan (`env.ts`) dan type utilities global (`types/DeepPartial.ts`).
- **Bounded Contexts Domain (`src/modules/[feature-plural]/`)**:
  - `application/`: Implementasi orkestrator fasad `[Feature]Services.ts` dan aksi bisnis independen pada subdirektori `usecase/`.
  - `domain/`: Pengorganisasian entitas murni pada `entity/`, kontrak antarmuka pada `interfaces/`, aturan domain pada `rules/`, Value Objects pada `value-object/`, mapper pada `mapper/`, builder query pada `builders/`, serta DTO pada `dto/`.
  - `infrastructure/`: Implementasi adapter database Prisma pada `repo/`, HTTP handler pada `http/`, penyedia layanan eksternal pada `providers/` (`ArgonProvider`, `JwtProvider`), dan validasi input pada `validators/`.
  - `presentation/`: Pembuatan custom React hooks pada `hooks/` dan formatter data pada `helpers/`.
  - `shared/`: Penyediaan konstanta modul (`constants/`) dan utilitas server SSR (`server/serverAuth.ts`).
- **Strict Anti-Corruption Policy**:
  - **Zero Barrel Files**: Dilarang membuat berkas `index.ts` / `index.tsx` re-export untuk mencegah circular dependency dan penurunan performa bundling Next.js.

---

## 2. Security Engineering, Cryptography & Edge Gateway
- **Next.js 16 Request Proxy (`src/proxy.ts`)**:
  - Mengelola gerbang inspeksi request pada Edge network Next.js 16 (sebagai pengganti middleware konvensional).
  - Mengimplementasikan routing bypass untuk aset statis, otentikasi rute publik vs terproteksi, serta penyuntikan downstream headers (`x-engine-license-key`, `x-auth-*`).
- **Kriptografi & Lisensi Perangkat**:
  - Pustaka standar modern **`jose`** (`SignJWT`, `jwtVerify`) untuk autentikasi sesi admin berbasis JWT.
  - Pustaka standar industri **`argon2`** (varian Argon2id) untuk hashing kata sandi akun administratif.
  - **Hardware ID (HWID) Binding & State Machine**: Mengelola verifikasi lisensi 4-kondisi (Aktivasi Baru, Device Terdaftar, Lisensi Kadaluarsa/Dicabut, dan *Hardware Mismatch* 403).
- **Security Policy Engine (`src/security/`)**:
  - Implementasi RBAC matriks (`rbacConfig.ts`) dan evaluasi kebijakan otorisasi berbasis atribut (`policyEngine.ts` & `fieldGuard.ts`), memastikan hanya **`ADMIN`** yang berhak menerbitkan dan mengelola lisensi.

---

## 3. Database Engineering & Prisma ORM 7
- **Database Modeling & Relasi (`prisma/schema.prisma`)**:
  - Pengelolaan model relasional PostgreSQL (`users`, `sessions`, `licenses`, `engine_validations`, `validation_logs`, `audit_logs`).
  - Optimasi indeks query untuk penelusuran serial key dan hardware ID berkecepatan tinggi ($< 200\text{ ms}$).
- **Modular Database Seeding (`prisma/seed/`)**:
  - Mengorganisasi seeding terstruktur:
    - `data/`: Dataset mentah awal (.ts / .csv).
    - `lib/`: Utilitas seeding (csv parser, transformer).
    - `logs/`: Pencatatan log status seeding.
    - `seeders/`: Eksekutor per entitas domain.
    - `seed.ts`: Entrypoint orkestrator seeding.

---

## 4. Frontend & Atomic Design System
- **Atomic UI Structure (`src/sections/[feature-kebab]/`)**:
  - **Atomic**: Komponen atomik mikro (Badge status lisensi, HeroCard metric, Input fields spesifik).
  - **Molecules**: Gabungan atom (TableView, FormView, DetailCard, HeroView).
  - **Organisms**: Blok tampilan ber-state utuh yang mengintegrasikan molecules dengan custom hooks API.
  - **Pages**: Container level halaman yang diimpor langsung oleh Next.js App Router (`src/app/(protected)/dashboard/`).
- **Global Reusable UI (`src/shared-ui/`)**:
  - Komponen generik murni (`Button`, `Modal`, `Table`, `Form`, `Input`, `Grid`) dan kerangka layout (`AppLayout`, `AppSidebar`, `AppTopbar`).
- **Tailwind CSS v4.3 Styling**:
  - Penguasaan palet warna modern (Slate, Emerald, Orange, Crimson), layout kartu responsif, typography Plus Jakarta Sans, dan zero native HTML inputs pada antarmuka pengguna.

---

## 5. Testing & Quality Assurance (TDD Triple A)
- **Test-Driven Development (TDD)**:
  - Disiplin menulis skenario pengujian unit sebelum mengembangkan kode logika produksi.
- **Pola Triple A (Arrange, Act, Assert)**:
  - Struktur pengujian yang bersih, terisolasi, dan prediktif pada seluruh berkas `.test.ts`.
- **Vitest Test Suite**:
  - Eksekusi pengujian cepat dengan path aliases (`@/*`), isolasi worker, dan mocking repositori.
- **Strict Quality Gates**:
  - Lolos `npm test` ($100\%$ lulus, coverage $\ge 80\%$).
  - Lolos `npx tsc --noEmit` ($0$ error tipe).
  - Lolos `npm run lint` (`biome check` dengan $0$ error dan $0$ warning).
  - Lolos `npm run build` (Next.js Turbopack production compilation).