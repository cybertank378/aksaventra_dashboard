# feat(releases): Modul Manajemen Rilis Biner Engine & Auto-Updater Telemetry (Hexagonal + Atomic Design, Light Mode)

## 📌 Metadata
- **Issue ID:** `ISSUE-007`
- **Epic:** Engine Release & Auto-Updater Distribution (`aksaventra_engine.exe`)
- **Bounded Context:** `src/modules/releases/`
- **UI Section:** `src/sections/releases/`
- **Protected Route:** `src/app/(protected)/dashboard/engine/releases/page.tsx`
- **API Routes:**
  - Admin REST API: `src/app/api/v1/releases/**`
  - Client Updater API: `src/app/api/v1/updater/**`
- **Requirement Terkait:** FR-04, FR-05, FR-06, NFR-01, NFR-03, NFR-04, NFR-05 (`REQUIREMENT.md`)
- **Priority:** High
- **Status:** Ready for Development / QA Verification

---

## 📋 Ringkasan & Konteks Masalah (Problem Statement)

Ekosistem **Aksaventra Engine Validation & License Management System** membutuhkan pusat kendali distribusi biner portabel `aksaventra_engine.exe` beserta layanan *auto-updater* yang aman, terukur, dan terintegrasi langsung dengan *dashboard* administrator:

1. **Manajemen Siklus Hidup Rilis Multi-Channel:** Administrator perlu mengunggah berkas biner `.exe` baru, memvalidasi format versi *Semantic Versioning* (`SemVer`), mengelompokkan rilis ke dalam kanal distribusi (`STABLE`, `BETA`, `NIGHTLY`), mengatur versi minimum yang didukung (`minSupportedVersion`), serta menandai pembaruan wajib (`mandatory`).
2. **Kalkulasi & Verifikasi Integritas SHA-256 Otomatis:** Setiap berkas biner yang diunggah melalui penyimpanan lokal (`LocalStorageProvider`) maupun objek cloud (`S3StorageProvider`) wajib dihitung *checksum* SHA-256 dan ukuran berkasnya secara otomatis untuk mencegah manipulasi biner.
3. **Dukungan HTTP Range Streaming (`206 Partial Content`):** Klien `aksaventra_engine.exe` memerlukan *endpoint* unduhan yang mendukung *resumable download* (`Range: bytes=start-end`) dan *presigned URL redirect* (S3) agar proses pembaruan di sisi klien tetap andal pada jaringan tidak stabil.
4. **Telemetri & Audit Log Pembaruan Klien:** Setiap permintaan pengecekan versi (`CHECK`) dan pengunduhan biner (`DOWNLOAD`) dari mesin klien wajib dicatat ke dalam tabel `engine_update_logs` beserta metadata `clientVersion`, `channel`, `hwid`, `serialKey`, dan `clientIp`.

---

## 🎨 Spesifikasi Desain UI (Light Mode — Konsisten dengan ISSUE-006)

> [!IMPORTANT]
> Seluruh komponen pada `src/sections/releases/` **WAJIB menggunakan Light Mode** (`bg-slate-50`, permukaan kartu `bg-white`, border `border-slate-200/90`) agar seragam dengan *AppSidebar*, *AppTopbar*, dan modul Dasbor Utama.

### Token Desain & Warna Status
| Komponen / Elemen | Nilai Kelas Tailwind / Hex |
| :--- | :--- |
| Latar Halaman & Kartu Utama | Halaman `bg-slate-50` (`#F8FAFC`), Kartu `bg-white` (`#FFFFFF`), `rounded-2xl`, `border-slate-200/90` |
| KPI 1 — Total Versi Rilis | Ikon `Layers`, `text-blue-600 bg-blue-50 border-blue-100` |
| KPI 2 — Rilis Aktif (Terkini) | Ikon `CheckCircle2`, `text-emerald-600 bg-emerald-50 border-emerald-100` |
| KPI 3 — Total Biner Diunduh | Ikon `ArrowDownToLine`, `text-purple-600 bg-purple-50 border-purple-100` |
| KPI 4 — Pengecekan Hari Ini | Ikon `Activity`, `text-amber-600 bg-amber-50 border-amber-100` |
| Channel Badge (`ReleaseChannelBadge`) | `STABLE`: `success` (Emerald) · `BETA`: `info` (Blue) · `NIGHTLY`: `warning` (Amber) |
| Kategori Update (`MandatoryBadge`) | `mandatory=true`: `error` ("Wajib Update") · `mandatory=false`: `secondary` ("Opsional") |
| Aksi Log (`ReleaseUpdateLogsView`) | `DOWNLOAD`: `bg-purple-50 text-purple-700` ("UNDUH") · `CHECK`: `bg-blue-50 text-blue-700` ("CEK VERSI") |

### Anatomi Tata Letak Halaman `/dashboard/engine/releases`
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ AppTopbar: Dasbor / Engine / Rilis Biner & Auto-Updater      [Storage Ready] [ADMIN]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ HEADER HALAMAN                                                                         │
│ Manajemen Rilis & Auto-Updater Engine (v2.2.1+)     [↻ Segarkan] [+ Unggah Rilis Baru] │
├──────────────────┬──────────────────┬──────────────────────┬───────────────────────────┤
│ KPI 1            │ KPI 2            │ KPI 3                │ KPI 4                     │
│ Total Versi Rilis│ Rilis Aktif      │ Total Biner Diunduh  │ Pengecekan Hari Ini       │
├──────────────────┴──────────────────┴──────────────────────┴───────────────────────────┤
│ KARTU UTAMA (Card bg-white rounded-2xl p-6)                                            │
│ [Daftar Rilis Biner | Log Pengecekan & Unduhan]   [🔍 Cari versi...] [Semua Channel ▾] │
│ ────────────────────────────────────────────────────────────────────────────────────── │
│ TAB 1 (ReleaseTableView):                                                              │
│ Versi & Channel │ Tgl Publikasi │ Ukuran │ Checksum SHA-256 │ Diunduh │ Kategori │ Aksi│
│ ────────────────────────────────────────────────────────────────────────────────────── │
│ TAB 2 (ReleaseUpdateLogsView):                                                         │
│ Waktu │ Aksi (UNDUH/CEK VERSI) │ Versi Klien │ Channel │ HWID │ Serial Key │ IP Address│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Skema Database Prisma (`prisma/schema.prisma`)

```prisma
enum ReleaseChannel {
  STABLE
  BETA
  NIGHTLY
}

model EngineRelease {
  id                  String         @id @default(uuid())
  version             String         @unique
  channel             ReleaseChannel @default(STABLE)
  minSupportedVersion String?        @map("min_supported_version")
  mandatory           Boolean        @default(false)
  downloadUrl         String?        @map("download_url")
  filePath            String?        @map("file_path")
  checksumSha256      String         @map("checksum_sha256")
  fileSize            BigInt         @map("file_size")
  releaseNotes        String?        @map("release_notes")
  isActive            Boolean        @default(true) @map("is_active")
  downloadCount       Int            @default(0) @map("download_count")
  publishedAt         DateTime       @default(now()) @map("published_at")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  updateLogs          EngineUpdateLog[]

  @@index([channel, isActive])
  @@index([publishedAt])
  @@map("engine_releases")
}

model EngineUpdateLog {
  id            String         @id @default(uuid())
  releaseId     String?        @map("release_id")
  release       EngineRelease? @relation(fields: [releaseId], references: [id], onDelete: SetNull)
  clientVersion String         @map("client_version")
  hwid          String?        @map("hwid")
  serialKey     String?        @map("serial_key")
  channel       String         @default("stable")
  action        String         @default("CHECK")    // CHECK | DOWNLOAD
  status        String         @default("SUCCESS")  // SUCCESS | FAILED
  clientIp      String?        @map("client_ip")
  userAgent     String?        @map("user_agent")
  createdAt     DateTime       @default(now()) @map("created_at")

  @@index([createdAt])
  @@index([releaseId])
  @@index([action, createdAt])
  @@map("engine_update_logs")
}
```

---

## 🏗️ Struktur Direktori Modul & Atomic Design

Mematuhi aturan **Hexagonal Architecture**, **Atomic Design**, dan **Zero Barrel Files** (tanpa `index.ts` / `index.tsx`):

```text
src/
├── modules/
│   └── releases/
│       ├── application/
│       │   ├── services/
│       │   │   └── ReleaseServices.ts
│       │   └── usecase/
│       │       ├── CheckEngineVersionUseCase.ts
│       │       ├── CreateReleaseUseCase.ts
│       │       ├── DeleteReleaseUseCase.ts
│       │       ├── GetLatestReleaseUseCase.ts
│       │       ├── GetReleaseStatsUseCase.ts
│       │       ├── GetUpdateLogsUseCase.ts
│       │       ├── ListReleasesUseCase.ts
│       │       ├── RecordDownloadUseCase.ts
│       │       └── ToggleReleaseStatusUseCase.ts
│       ├── domain/
│       │   ├── dto/
│       │   │   ├── ReleaseRequestDTO.ts
│       │   │   └── ReleaseResponseDTO.ts
│       │   ├── entity/
│       │   │   ├── EngineReleaseEntity.ts
│       │   │   └── EngineUpdateLogEntity.ts
│       │   ├── interfaces/
│       │   │   └── ReleaseInterfaces.ts
│       │   ├── mapper/
│       │   │   └── ReleaseMapper.ts
│       │   └── value-object/
│       │       ├── ReleaseChannelVO.ts
│       │       └── SemVer.ts
│       ├── infrastructure/
│       │   ├── http/
│       │   │   ├── ReleaseAdminController.ts
│       │   │   └── UpdaterController.ts
│       │   ├── repo/
│       │   │   ├── EngineReleaseRepository.ts
│       │   │   └── EngineUpdateLogRepository.ts
│       │   ├── storage/
│       │   │   ├── LocalStorageProvider.ts
│       │   │   ├── S3StorageProvider.ts
│       │   │   └── StorageFactory.ts
│       │   └── validators/
│       │       └── release.validator.ts
│       ├── presentation/
│       │   └── hooks/
│       │       └── useReleaseApi.ts
│       └── tests/
│           ├── application/
│           │   └── CheckEngineVersionUseCase.test.ts
│           ├── domain/
│           │   ├── EngineReleaseEntity.test.ts
│           │   └── SemVer.test.ts
│           └── infrastructure/
│               ├── ReleaseValidator.test.ts
│               ├── S3StorageProvider.test.ts
│               ├── StorageFactory.test.ts
│               └── UpdaterController.test.ts
└── sections/
    └── releases/
        ├── atomic/
        │   ├── MandatoryBadge.tsx
        │   ├── ReleaseChannelBadge.tsx
        │   └── ReleaseStatusBadge.tsx
        ├── molecules/
        │   ├── ReleaseStatsCards.tsx
        │   ├── ReleaseTableView.tsx
        │   ├── ReleaseUpdateLogsView.tsx
        │   └── ReleaseUploadModal.tsx
        ├── organisms/
        │   └── ReleaseManagementOrganism.tsx
        └── pages/
            └── ReleaseManagementPage.tsx
```

---

## 🔌 Spesifikasi Integrasi API & `useReleaseApi.ts`

### 1. Endpoint REST API
| Method | Endpoint | Controller Method | Otorisasi | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/releases` | `ReleaseAdminController.list` | `ENGINE_REGISTER` (`ADMIN`) | Daftar rilis dengan filter `channel`, `isActive`, `search`, `page`, `limit` |
| `POST` | `/api/v1/releases` | `ReleaseAdminController.create` | `ENGINE_REGISTER` (`ADMIN`) | Unggah rilis baru (`multipart/form-data` atau JSON manual SHA-256) |
| `PATCH` | `/api/v1/releases/[id]` | `ReleaseAdminController.toggle` | `ENGINE_REGISTER` (`ADMIN`) | Mengaktifkan / menonaktifkan status distribusi rilis (`isActive`) |
| `DELETE` | `/api/v1/releases/[id]` | `ReleaseAdminController.delete` | `ENGINE_REVOKE` (`ADMIN`) | Menghapus entri rilis biner dari database |
| `GET` | `/api/v1/releases/stats` | `ReleaseAdminController.getStats` | `ENGINE_REGISTER` (`ADMIN`) | Mengambil 4 metrik kartu KPI (`totalReleases`, `activeReleases`, `totalDownloads`, `checksToday`) |
| `GET` | `/api/v1/releases/logs` | `ReleaseAdminController.getLogs` | `LOGS_VIEW` | Riwayat log pengecekan versi & unduhan klien (`EngineUpdateLog`) |
| `GET/POST` | `/api/v1/updater/version` | `UpdaterController.checkVersion` | Publik (Mesin Klien) | Mengecek pembaruan versi `aksaventra_engine.exe` & mencatat log `CHECK` |
| `GET` | `/api/v1/updater/download/[filename]` | `UpdaterController.downloadBinary` | Publik (Mesin Klien) | Mengunduh biner dengan dukungan `HTTP 206 Range` & mencatat log `DOWNLOAD` |

### 2. Integrasi Hook `useReleaseApi.ts` pada `ReleaseManagementOrganism.tsx`
- **`fetchStats()`**: Dipanggil saat *mount* dan setelah mutasi (buat, *toggle*, hapus) untuk menyegarkan `ReleaseStatsCards`.
- **`fetchReleases(query)`**: Mendukung filter `channel` (`STABLE` | `BETA` | `NIGHTLY`) dan pencarian `search` secara reaktif.
- **`fetchLogs(query)`**: Memuat riwayat telemetri pengecekan dan unduhan biner pada tab `ReleaseUpdateLogsView`.
- **`createRelease(formData)`**: Mengirim `FormData` dari `ReleaseUploadModal` ke `POST /api/v1/releases`.
- **`toggleRelease(id, isActive)`**: Mengubah status aktif rilis langsung dari komponen `Switch` pada `ReleaseTableView`.
- **`deleteRelease(id)`**: Menghapus rilis setelah konfirmasi administrator.

---

## ✅ Daftar Tugas & Kriteria Penerimaan (Acceptance Criteria)

- [x] **1. Komponen Atomic (`src/sections/releases/atomic/`):**
  - [x] `ReleaseChannelBadge.tsx` menampilkan badge warna sesuai kanal (`STABLE` hijau, `BETA` biru, `NIGHTLY` kuning/amber) menggunakan `@/shared-ui/component/Badge`.
  - [x] `MandatoryBadge.tsx` merender status `Wajib Update` (`error`) atau `Opsional` (`secondary`).
  - [x] `ReleaseStatusBadge.tsx` merender status `Aktif` (`success`) atau `Nonaktif` (`secondary`).
- [x] **2. Komponen Molecules (`src/sections/releases/molecules/`):**
  - [x] `ReleaseStatsCards.tsx` merender 4 kartu KPI menggunakan `@/shared-ui/component/Card` dan `@/shared-ui/component/Skeleton` saat `loading`.
  - [x] `ReleaseTableView.tsx` menggunakan `@/shared-ui/component/Table`, `@/shared-ui/component/Switch`, dan `@/shared-ui/component/Button`, dilengkapi fitur salin *hash* SHA-256 ke *clipboard* dan tautan unduh langsung.
  - [x] `ReleaseUpdateLogsView.tsx` menampilkan tabel log telemetri auto-updater (`Waktu`, `Aksi`, `Versi Klien`, `Channel`, `HWID` tersamar, `Serial Key` tersamar, `IP Address`).
  - [x] `ReleaseUploadModal.tsx` memvalidasi input versi dengan `SemVer.isValid()` sebelum mengirim `FormData`, menggunakan `@/shared-ui/component/Modal`, `TextField`, `SelectField`, `Checkbox`, dan `TextAreaField`.
- [x] **3. Komponen Organisms & Pages (`src/sections/releases/organisms/` & `pages/`):**
  - [x] `ReleaseManagementOrganism.tsx` mengintegrasikan `useReleaseApi.ts` dengan `ToggleGroup` untuk perpindahan tab tanpa memuat ulang halaman.
  - [x] Terhubung ke rute Next.js App Router `src/app/(protected)/dashboard/engine/releases/page.tsx` dan menu sidebar `getSidebarMenu.ts` dengan izin `ENGINE_REGISTER`.
- [x] **4. Quality Gates & Pengujian (TDD Triple A):**
  - [x] Unit test `SemVer.test.ts`, `EngineReleaseEntity.test.ts`, `CheckEngineVersionUseCase.test.ts`, `ReleaseValidator.test.ts`, `StorageFactory.test.ts`, `S3StorageProvider.test.ts`, dan `UpdaterController.test.ts` lulus 100%.
  - [x] Bebas dari *barrel files* (`index.ts`/`index.tsx`) dan lulus pemeriksaan tipe TypeScript (`tsc --noEmit`) serta Biome linter.
