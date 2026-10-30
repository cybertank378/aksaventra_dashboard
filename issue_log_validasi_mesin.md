# feat(validation-logs): Modul Audit & Telemetri Log Validasi Mesin (`/dashboard/logs/validations`) (Hexagonal + Atomic Design, Light Mode)

## 📌 Metadata
- **Issue ID:** `ISSUE-008`
- **Epic:** Security & Audit Trail (`Audit & Logs`)
- **Bounded Context:** `src/modules/validation-logs/` (Modul Baru)
- **UI Section:** `src/sections/validation-logs/` (Section Baru)
- **Protected Route:** `src/app/(protected)/dashboard/logs/validations/page.tsx`
- **API Routes:**
  - `GET /api/v1/logs/validations` (Daftar log validasi berpaginasi + filter)
  - `GET /api/v1/logs/validations/stats` (Metrik ringkasan 4 kartu KPI log validasi)
  - `GET /api/v1/logs/validations/[id]` (Detail inspeksi payload & metadata telemetri per log)
  - `GET /api/v1/logs/validations/export` (Ekspor laporan CSV / Excel menggunakan `ExcelAdapter`)
- **Permission RBAC:** `LOGS_VIEW` (`ADMIN`, `OPERATOR`, `AUDITOR`)
- **Requirement Terkait:** FR-03, FR-06, NFR-01, NFR-03, NFR-04 (`REQUIREMENT.md` & `issue_sidebar_menu.md`)
- **Priority:** High
- **Status:** Ready for Development

---

## 📋 Ringkasan & Konteks Masalah (Problem Statement)

Berdasarkan struktur navigasi pada `src/security/sidebar/getSidebarMenu.ts` dan `issue_sidebar_menu.md`, menu **Log Validasi Mesin (`/dashboard/logs/validations`)** telah didefinisikan di bawah grup **AUDIT & LOGS** dengan izin `LOGS_VIEW`. Selain itu, tabel Prisma `LicenseValidationLog` (`license_validation_logs`) beserta `LicenseValidationLogRepository.ts` di modul `licenses` sudah mulai mencatat hasil setiap request `POST /api/v1/validate` dari klien binary `aksaventra_engine.exe`.

Namun saat ini:
1. **Rute Halaman Belum Tersedia:** Direktori `src/app/(protected)/dashboard/logs/validations/page.tsx` belum dibuat (mengakibatkan `404 Not Found` saat diklik dari Sidebar).
2. **Belum Ada Bounded Context Khusus pembacaan & analitik Log Validasi:** `LicenseValidationLogRepository` di `src/modules/licenses/` hanya memiliki fungsi tulis (`record()`), belum memiliki *query builder*, pemfilteran multi-dimensi (berdasarkan `result`, `statusCode`, rentang tanggal, `serialKeyHint`, `engineVersion`, atau `clientIp`), statistik anomali, maupun ekspor laporan audit.
3. **Belum Ada Atomic UI Section (`src/sections/validation-logs/`):** Auditor dan Administrator membutuhkan antarmuka khusus untuk menginspeksi jejak autentikasi mesin klien (`200 VERIFIED`, `200 ACTIVATED`, `403 HWID_MISMATCH`, `401 EXPIRED/SUSPENDED`, `404 NOT_FOUND`), memantau latensi respons (`latencyMs`), serta mendeteksi indikasi *brute-force* atau pembajakan lisensi lintas perangkat.

---

## 🎨 Spesifikasi Desain UI (Light Mode — Konsisten dengan Sistem Desain Aksaventra)

> [!IMPORTANT]
> Seluruh komponen pada `src/sections/validation-logs/` **WAJIB menggunakan Light Mode** (`bg-slate-50`, permukaan kartu `bg-white`, border `border-slate-200/90`) agar seragam dengan *AppSidebar*, *AppTopbar*, modul *Dashboard*, dan modul *Releases*.

### 1. Token Warna & Badge Hasil Validasi (`ValidationResultBadge.tsx`)
| Status Hasil (`LicenseValidationResult`) | Kode HTTP | Warna Badge (`shared-ui/component/Badge`) | Label UI (Bahasa Indonesia) |
| :--- | :---: | :--- | :--- |
| `VERIFIED` | `200` | `success` (`bg-emerald-50 text-emerald-700 border-emerald-200`) | `Terverifikasi (200)` |
| `ACTIVATED` | `200` | `info` (`bg-blue-50 text-blue-700 border-blue-200`) | `Aktivasi Baru (200)` |
| `HWID_MISMATCH` | `403` | `error` (`bg-rose-50 text-rose-700 border-rose-200`) | `HWID Mismatch (403)` |
| `EXPIRED` | `401` | `warning` (`bg-amber-50 text-amber-700 border-amber-200`) | `Kedaluwarsa (401)` |
| `SUSPENDED` | `401` | `error` (`bg-rose-50 text-rose-700 border-rose-200`) | `Dibekukan (401)` |
| `NOT_FOUND` | `404` | `secondary` (`bg-slate-100 text-slate-700 border-slate-200`) | `Key Tidak Dikenal (404)` |
| `BAD_REQUEST` | `400` | `secondary` (`bg-slate-100 text-slate-600 border-slate-200`) | `Payload Invalid (400)` |

### 2. Indikator Latensi (`LatencyIndicator.tsx`)
- `< 100 ms`: Hijau (`text-emerald-600`, optimal sesuai NFR-01)
- `100 ms – 199 ms`: Biru/Amber (`text-amber-600`, batas normal)
- `≥ 200 ms`: Merah (`text-rose-600 font-bold`, melewati ambang batas SLA NFR-01)

### 3. Anatomi Tata Letak Halaman `/dashboard/logs/validations`
```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ AppTopbar: Dasbor / Audit & Logs / Log Validasi Mesin                    [Role] [Avatar]   │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ HEADER HALAMAN                                                                             │
│ Log Validasi Mesin (Engine Telemetry Trail)         [↻ Segarkan] [⬇ Ekspor CSV / Excel]    │
│ Rekam jejak seluruh permintaan otentikasi lisensi dari aksaventra_engine.exe secara utuh   │
├────────────────────┬────────────────────┬──────────────────────┬───────────────────────────┤
│ KPI 1              │ KPI 2              │ KPI 3                │ KPI 4                     │
│ Total Request (24J)│ Rasio Validasi Sah │ Pelanggaran HWID     │ Rata-rata Latensi API     │
│ 14.820 req         │ 96.4% (200 OK)     │ 42 kasus (403)       │ 38 ms (Target < 200ms)    │
├────────────────────┴────────────────────┴──────────────────────┴───────────────────────────┤
│ KARTU UTAMA DIREKTORI LOG (Card bg-white rounded-2xl p-6)                                  │
│ Filter Cepat Tab: [Semua] [Sukses (200)] [HWID Mismatch (403)] [Ditolak (401/404)]         │
│ Filter Bar: [🔍 Cari hint key, klien, IP...] [Hasil Validasi ▾] [Versi Engine ▾] [Tanggal] │
│ ────────────────────────────────────────────────────────────────────────────────────────── │
│ TABEL LOG VALIDASI (ValidationLogsTableView.tsx):                                          │
│ Waktu (WIB) │ Klien & Key Hint │ Hasil & HTTP │ Hash HWID │ Engine │ IP Address │ Latensi ││
│ 30 Okt 00:42│ PT Nusantara     │ Terverifikasi│ sha256:   │ v2.2.2 │ 103.14.x.x │ 34 ms  │🔍│
│             │ ••••-9F2A        │ (200)        │ 8f1c…a90b │        │            │        │ │
│ ────────────────────────────────────────────────────────────────────────────────────────── │
│ Menampilkan 1–15 dari 1.240 log validasi                             ‹ Sblm [1][2] Brkt ›  │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Sumber Data & Skema Prisma (`prisma/schema.prisma`)

Menggunakan model `LicenseValidationLog` yang berelasi ke `License` pada `prisma/schema.prisma`:

```prisma
model LicenseValidationLog {
  id             String                  @id @default(uuid())
  licenseId      String?                 @map("license_id")
  license        License?                @relation(fields: [licenseId], references: [id], onDelete: SetNull)
  serialKeyHint  String                  @map("serial_key_hint") // 4 karakter terakhir
  hwidHash       String?                 @map("hwid_hash")       // SHA-256 dari HWID klien
  result         LicenseValidationResult
  statusCode     Int                     @map("status_code")
  engineVersion  String?                 @map("engine_version")
  clientIp       String?                 @map("client_ip")
  userAgent      String?                 @map("user_agent")
  latencyMs      Int?                    @map("latency_ms")
  checkedAt      DateTime                @default(now()) @map("checked_at")

  @@index([checkedAt])
  @@index([result, checkedAt])
  @@index([licenseId])
  @@map("license_validation_logs")
}
```

> [!NOTE]
> Jika diperlukan pencarian cepat berdasarkan `clientIp` atau `serialKeyHint`, tambahkan index komposit `@@index([serialKeyHint, checkedAt])` pada migrasi pemeliharaan bila volume baris melebihi 100.000 log.

---

## 🏗️ Struktur Direktori Modul & Atomic Design

Mematuhi **Hexagonal Architecture**, **Atomic Design**, dan **Zero Barrel Files** (Dilarang keras membuat file `index.ts` atau `index.tsx`):

```text
src/
├── app/
│   ├── (protected)/
│   │   └── dashboard/
│   │       └── logs/
│   │           └── validations/
│   │               └── page.tsx                          # Server/Client Entry Route
│   └── api/
│       └── v1/
│           └── logs/
│               └── validations/
│                   ├── _factory.ts                       # DI Assembler
│                   ├── route.ts                          # GET list validation logs
│                   ├── stats/
│                   │   └── route.ts                      # GET 4 KPI metrics
│                   ├── export/
│                   │   └── route.ts                      # GET CSV/XLSX export
│                   └── [id]/
│                       └── route.ts                      # GET single log detail
│
├── modules/
│   └── validation-logs/
│       ├── application/
│       │   ├── services/
│       │   │   └── ValidationLogServices.ts              # Extends BaseService
│       │   └── usecase/
│       │       ├── ListValidationLogsUseCase.ts          # Paginasi + Filter multi-kriteria
│       │       ├── GetValidationLogStatsUseCase.ts       # 4 KPI (Total 24h, Success Rate, HWID Mismatch, Avg Latency)
│       │       ├── GetValidationLogDetailUseCase.ts      # Detail 1 log + info lisensi terkait
│       │       └── ExportValidationLogsUseCase.ts        # Ekspor via ExcelAdapterPort
│       ├── domain/
│       │   ├── builders/
│       │   │   └── ValidationLogQueryBuilder.ts          # Filter builder (date range, resultGroup, search, pagination)
│       │   ├── dto/
│       │   │   ├── ValidationLogRequestDTO.ts
│       │   │   └── ValidationLogResponseDTO.ts
│       │   ├── entity/
│       │   │   └── ValidationLogReadEntity.ts            # Domain representation dengan helper isAnomaly(), isSlowResponse()
│       │   ├── interfaces/
│       │   │   └── ValidationLogInterfaces.ts            # ValidationLogRepositoryInterface
│       │   ├── mapper/
│       │   │   └── ValidationLogMapper.ts                # Raw Prisma → DTO (sanitasi IP/User-Agent & format hint)
│       │   ├── rules/
│       │   │   ├── LatencyThresholdRule.ts               # Evaluasi SLA NFR-01 (<100ms optimal, <200ms warning, >=200ms breach)
│       │   │   └── SuspiciousValidationRule.ts           # Menandai log anomali (403 HWID_MISMATCH / 401 SUSPENDED)
│       │   └── types/
│       │       └── ValidationLogFilterGroup.ts           # "ALL" | "SUCCESS" | "MISMATCH" | "REJECTED"
│       ├── infrastructure/
│       │   ├── http/
│       │   │   └── ValidationLogController.ts            # Extends BaseController
│       │   ├── repo/
│       │   │   └── ValidationLogQueryRepository.ts       # Implementasi Prisma untuk baca/agregasi log
│       │   └── validators/
│       │       └── validationLog.validator.ts            # Zod validator untuk query string
│       ├── presentation/
│       │   ├── helpers/
│       │   │   └── validationLogFormatters.ts            # Formatter waktu WIB, pemendekan hash SHA-256
│       │   └── hooks/
│       │       └── useValidationLogApi.ts                # Custom hook berbasis useApiExecutor
│       ├── shared/
│       │   └── constants/
│       │       └── validationLogConstants.ts             # SLA_LATENCY_MS = 200, DEFAULT_PAGE_LIMIT = 15
│       └── tests/
│           ├── mocks/
│           │   └── mockValidationLogFactories.ts
│           ├── domain/
│           │   ├── rules.test.ts
│           │   └── ValidationLogQueryBuilder.test.ts
│           ├── application/
│           │   ├── ListValidationLogsUseCase.test.ts
│           │   ├── GetValidationLogStatsUseCase.test.ts
│           │   └── GetValidationLogDetailUseCase.test.ts
│           └── infrastructure/
│               ├── ValidationLogController.test.ts
│               └── ValidationLogValidator.test.ts
│
└── sections/
    └── validation-logs/
        ├── atomic/
        │   ├── ValidationResultBadge.tsx                 # Badge warna per LicenseValidationResult + HTTP status
        │   ├── LatencyIndicator.tsx                      # Badge/teks latensi (ms) dengan indikator warna SLA
        │   ├── HwidHashPill.tsx                          # Tampilan hash HWID singkat + tombol salin
        │   └── HttpStatusChip.tsx                        # Chip monospaced 200, 401, 403, 404
        ├── molecules/
        │   ├── ValidationLogStatsGrid.tsx                # 4 Kartu KPI di bagian atas halaman
        │   ├── ValidationLogFilterBar.tsx                # ToggleGroup tab cepat + SearchField + SelectField + DateRange
        │   ├── ValidationLogsTableView.tsx               # Tabel utama menggunakan shared-ui/component/Table & Pagination
        │   └── ValidationLogDetailModal.tsx              # Modal inspeksi detail log (User-Agent, IP, Lisensi, Timestamp)
        ├── organisms/
        │   └── ValidationLogsDirectoryOrganism.tsx       # Orkestrasi state filter, paginasi, modal detail & useValidationLogApi
        └── pages/
            └── ValidationLogsPage.tsx                    # Halaman penuh yang diimpor oleh route page.tsx
```

---

## 🔌 Spesifikasi Kontrak API & Hook (`useValidationLogApi.ts`)

### 1. Daftar Endpoint REST API
| Method | Endpoint | Controller Method | Permission | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/logs/validations` | `ValidationLogController.list` | `LOGS_VIEW` | Mengambil daftar log dengan parameter `page`, `limit`, `search`, `group` (`ALL`\|`SUCCESS`\|`MISMATCH`\|`REJECTED`), `result`, `engineVersion`, `startDate`, `endDate` |
| `GET` | `/api/v1/logs/validations/stats` | `ValidationLogController.getStats` | `LOGS_VIEW` | Mengambil metrik 24 jam terakhir: `totalRequests24h`, `successRatePercent`, `hwidMismatchCount24h`, `avgLatencyMs` |
| `GET` | `/api/v1/logs/validations/[id]` | `ValidationLogController.getDetail` | `LOGS_VIEW` | Mengambil rincian lengkap 1 entri log beserta metadata `License` terkait (`clientName`, `status`, `expiresAt`) |
| `GET` | `/api/v1/logs/validations/export` | `ValidationLogController.export` | `LOGS_VIEW` | Mengekspor hasil filter saat ini ke berkas `.xlsx` / `.csv` menggunakan `ExcelAdapter` |

### 2. Kontrak DTO Respons (`ValidationLogResponseDTO.ts`)
```typescript
export interface ValidationLogItemDTO {
  id: string;
  licenseId: string | null;
  clientName: string | null;       // Diambil dari relasi License.clientName (null jika NOT_FOUND)
  serialKeyMasked: string;         // Format: "AKSA-••••-••••-" + serialKeyHint
  serialKeyHint: string;
  hwidHash: string | null;
  result: LicenseValidationResult;
  statusCode: number;
  engineVersion: string | null;
  clientIp: string | null;
  userAgent: string | null;
  latencyMs: number | null;
  isSlaBreached: boolean;          // true jika latencyMs >= 200
  checkedAt: string;               // ISO-8601 string
}

export interface ValidationLogStatsDTO {
  totalRequests24h: number;
  verifiedCount24h: number;
  successRatePercent: number;      // (ACTIVATED + VERIFIED) / totalRequests24h * 100
  hwidMismatchCount24h: number;    // Jumlah kasus 403 HWID_MISMATCH dalam 24 jam
  rejectedCount24h: number;        // EXPIRED + SUSPENDED + NOT_FOUND + BAD_REQUEST
  avgLatencyMs: number;            // Rata-rata latencyMs (dibulatkan ke integer terdekat)
}
```

### 3. Integrasi Hook `useValidationLogApi.ts` pada `ValidationLogsDirectoryOrganism.tsx`
- Menggunakan `createApiExecutor` / `apiRequest` dan `unwrapApiResponse` dari `src/shared/lib/api/`.
- Menyediakan method:
  - `fetchLogs(params)`: Memuat daftar log sesuai state filter & halaman aktif.
  - `fetchStats()`: Memuat 4 metrik kartu KPI saat halaman dibuka atau tombol **Segarkan** diklik.
  - `fetchLogDetail(id)`: Memuat detail log saat pengguna mengklik tombol inspeksi pada baris tabel untuk ditampilkan di `ValidationLogDetailModal.tsx`.
  - `exportLogs(params)`: Mengunduh laporan audit validasi dalam format Excel/CSV.

---

## 🔐 Keamanan, Privasi & RBAC (`src/security/`)

1. **Perlindungan Data Sensitif (Zero Plaintext Key/HWID Exposure):**
   - Sesuai arsitektur keamanan `ISSUE-006`, tabel log hanya menyimpan `serialKeyHint` (4 karakter terakhir) dan `hwidHash` (SHA-256).
   - `ValidationLogMapper` tidak boleh pernah mengekspos `vaultSecret` atau serial key penuh meskipun log berelasi dengan tabel `License`.
2. **Kebijakan RBAC (`src/security/policyEngine.ts` & `src/security/sidebar/getSidebarMenu.ts`):**
   - Tambahkan pemetaan rute `/dashboard/logs/validations` dan `/api/v1/logs/validations` ke permission `LOGS_VIEW`.
   - Tambahkan item menu **Log Validasi Mesin** (`/dashboard/logs/validations`) pada `getSidebarMenu.ts` di bawah grup **Audit & Logs** sehingga dapat diakses oleh role `ADMIN`, `OPERATOR`, dan `AUDITOR`.

---

## 📋 Rencana Kerja (Task Breakdown)

### Phase 1 — Kontrak Domain & Query Builder (`src/modules/validation-logs/domain/`)
- [ ] Buat tipe `ValidationLogFilterGroup.ts`, DTO `ValidationLogRequestDTO.ts` & `ValidationLogResponseDTO.ts`, serta port `ValidationLogInterfaces.ts`.
- [ ] Implementasikan `LatencyThresholdRule.ts` dan `SuspiciousValidationRule.ts`.
- [ ] Implementasikan `ValidationLogQueryBuilder.ts` untuk memetakan grup filter (`ALL`, `SUCCESS`, `MISMATCH`, `REJECTED`), rentang tanggal, dan kata kunci pencarian.
- [ ] Implementasikan `ValidationLogMapper.ts`.

### Phase 2 — TDD Use Cases & Application Services (`src/modules/validation-logs/application/`)
- [ ] **RED:** Buat unit test menggunakan pola **Triple A (Arrange-Act-Assert)** untuk:
  - `ListValidationLogsUseCase.test.ts`
  - `GetValidationLogStatsUseCase.test.ts`
  - `GetValidationLogDetailUseCase.test.ts`
  - `rules.test.ts` & `ValidationLogQueryBuilder.test.ts`
- [ ] **GREEN:** Implementasikan keempat Use Case dan orkestrator `ValidationLogServices.ts`.

### Phase 3 — Infrastructure, Repository & Next.js API Routes
- [ ] Implementasikan `ValidationLogQueryRepository.ts` menggunakan Prisma (`findMany`, `count`, `aggregate` rata-rata `latencyMs`).
- [ ] Implementasikan `validationLog.validator.ts` (Zod) dan `ValidationLogController.ts`.
- [ ] Buat `_factory.ts` dan 4 route handler di `src/app/api/v1/logs/validations/**`.
- [ ] Daftarkan rute `/api/v1/logs/validations` dan `/dashboard/logs/validations` pada `src/security/policyEngine.ts` serta `src/security/sidebar/getSidebarMenu.ts`.

### Phase 4 — Hook Presentation & Atomic UI (`src/sections/validation-logs/`)
- [ ] Buat `useValidationLogApi.ts` dan `validationLogFormatters.ts`.
- [ ] Buat komponen **Atomic**: `ValidationResultBadge.tsx`, `LatencyIndicator.tsx`, `HwidHashPill.tsx`, `HttpStatusChip.tsx`.
- [ ] Buat komponen **Molecules**: `ValidationLogStatsGrid.tsx`, `ValidationLogFilterBar.tsx`, `ValidationLogsTableView.tsx`, `ValidationLogDetailModal.tsx`.
- [ ] Buat komponen **Organism**: `ValidationLogsDirectoryOrganism.tsx` dengan *named event handlers* (`handleSearchChange`, `handleGroupChange`, `handlePageChange`, `handleInspectLog`, `handleExportLogs`).
- [ ] Buat **Page**: `ValidationLogsPage.tsx` dan hubungkan ke `src/app/(protected)/dashboard/logs/validations/page.tsx`.

### Phase 5 — Pengujian & Quality Gates
- [ ] Tambah unit test untuk `ValidationLogController.test.ts`, `ValidationLogValidator.test.ts`, dan perbarui `getSidebarMenu.test.ts` serta `policyEngine.test.ts`.
- [ ] Jalankan seluruh pemeriksaan kualitas kode hingga lulus 100%.

---

## ✅ Kriteria Penerimaan (Acceptance Criteria)

- [ ] Mengklik menu **Log Validasi Mesin** (`/dashboard/logs/validations`) pada Sidebar membuka halaman audit log validasi dalam tema **Light Mode** tanpa error `404`.
- [ ] Menampilkan 4 kartu KPI di bagian atas: **Total Request (24 Jam)**, **Rasio Validasi Sah (%)**, **Pelanggaran HWID (403)**, dan **Rata-rata Latensi API (ms)**.
- [ ] Pengguna dapat memfilter log berdasarkan tab cepat (`Semua`, `Sukses (200)`, `HWID Mismatch (403)`, `Ditolak (401/404)`), memilih spesifik `LicenseValidationResult`, memilih versi engine, serta mencari berdasarkan nama klien, `serialKeyHint`, atau alamat IP.
- [ ] Mengklik tombol detail pada baris log membuka `ValidationLogDetailModal` yang menampilkan informasi lengkap (`checkedAt`, status HTTP, `hwidHash` penuh dengan tombol salin, `userAgent`, `clientIp`, `latencyMs`, serta tautan ke lisensi terkait bila ada).
- [ ] Seluruh komponen menggunakan `src/shared-ui/component/` (`Card`, `Table`, `Badge`, `Button`, `Modal`, `SearchField`, `SelectField`, `ToggleGroup`, `Pagination`, `Skeleton`) dan mematuhi aturan **Zero Barrel Files** serta **Named Event Handlers**.
- [ ] **Quality Gates:**
  - [ ] `npx vitest run` → 100% lulus, coverage modul `validation-logs` ≥ 80%.
  - [ ] `npx tsc --noEmit` → 0 error TypeScript.
  - [ ] `npx @biomejs/biome check src/` → 0 error & 0 warning.