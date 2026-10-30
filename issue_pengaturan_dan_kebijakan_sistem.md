# feat(settings): Modul Pengaturan Sistem, Kebijakan Validasi Engine, & Retensi Audit (`/dashboard/settings`) (Hexagonal + Atomic Design, Light Mode)

## 📌 Metadata

* **Issue ID:** `ISSUE-011`
* **Epic:** System Administration & Security Policies (`Administrasi`)
* **Bounded Context:** `src/modules/settings/` (Modul Baru)
* **UI Section:** `src/sections/system-settings/` (Section Baru)
* **Protected Page Route:** `src/app/(protected)/dashboard/settings/page.tsx`
* **Target API Routes (System Configuration Management):**
  * `GET /api/v1/settings` (Mengambil seluruh konfigurasi sistem dikelompokkan per kategori + status kesehatan *storage* & *environment*)
  * `PATCH /api/v1/settings` (Memperbarui nilai konfigurasi sistem secara parsial/grup + validasi batas aman + pencatatan `AuditLog`)
  * `POST /api/v1/settings/reset` (Mengembalikan konfigurasi kategori tertentu ke nilai *default* pabrik + pencatatan `AuditLog`)
  * `POST /api/v1/settings/maintenance/purge-logs` (Menjalankan pembersihan manual log validasi/update yang melampaui batas retensi + pencatatan `AuditLog`)
* **Permission RBAC:** `SETTINGS_MANAGE` (Eksklusif untuk Role `ADMIN`)
* **Requirement Terkait:** FR-02, FR-03, FR-04, FR-06, NFR-01, NFR-02, NFR-03, NFR-04 (`REQUIREMENT.md`, `ISSUE-006`, & `issue_sidebar_menu.md`)
* **Priority:** High
* **Status:** Ready for Development

---

## 🔍 Audit Kode Saat Ini & Konteks Masalah (Problem Statement)

Berdasarkan hasil pemeriksaan pada basis kode `aksaventra_dashboard-dev`:

1. **Menu & Izin RBAC Sudah Terdaftar, Namun Halaman & Modul Belum Ada:**
   * Pada `src/security/Permissions.ts`, `src/security/policyEngine.ts`, dan `src/security/sidebar/getSidebarMenu.ts`, izin `SETTINGS_MANAGE` serta menu **Pengaturan Sistem (`/dashboard/settings`)** telah didefinisikan untuk role `ADMIN`.
   * Namun berkas `src/app/(protected)/dashboard/settings/page.tsx`, modul `src/modules/settings/`, endpoint `src/app/api/v1/settings/**`, serta section `src/sections/system-settings/` belum diimplementasikan (menghasilkan `404 Not Found`).

2. **Parameter Kebijakan Operasional Masih Tersebar sebagai Konstanta Statis (*Hardcoded*):**
   * Di `ISSUE-006` (Bagian *KePATCHusan Terbuka*), terdapat kebutuhan untuk mengonfigurasi ambang batas **"Segera Habis" (`expiringSoonDays`, saat ini *hardcoded* `30` hari)** dan **Retensi Log Validasi (`validationLogRetentionDays`, misal `180` hari)**.
   * Kebijakan penguncian akun (`maxFailedLoginAttempts`, `accountLockDurationMinutes`), kebijakan validasi engine (`strictEngineHashCheck`, `defaultReleaseChannel`, `enforceMinEngineVersion`, `rateLimitPerMinute`), serta mode pemeliharaan (`maintenanceMode`) belum dapat diatur secara dinamis oleh Administrator melalui UI.

3. **Kebutuhan Visibilitas Infrastruktur (Read-Only Environment Diagnostics):**
   * Administrator memerlukan panel diagnostik yang aman (tanpa membocorkan *secret key* mentah) untuk melihat status driver penyimpanan biner (`LocalStorageProvider` vs `S3StorageProvider`), status koneksi PostgreSQL, konfigurasi SMTP Mailer, dan SLA latensi API (`< 200ms`).

---

## 🎨 Spesifikasi Desain UI & Detail Halaman (Light Mode)

> [!IMPORTANT]
> Seluruh halaman dan komponen pada `src/sections/system-settings/` **WAJIB menggunakan Light Mode** (`bg-slate-50`, permukaan kartu `bg-white`, border `border-slate-200/90`) serta menggunakan komponen dari `src/shared-ui/component/` (`Card`, `ToggleGroup`, `TextField`, `SelectField`, `Switch`, `Button`, `Badge`, `Modal`, `Form/*`).

### 1. Pengelompokan Tab Konfigurasi (`SettingsCategoryTab`)

Halaman `/dashboard/settings` dibagi menjadi **4 Tab Kategori** menggunakan `ToggleGroup`:
1. **`LICENSE_ENGINE` (Kebijakan Lisensi & Engine):**
   * Ambang peringatan kedaluwarsa (`expiringSoonThresholdDays`: default `30` hari, rentang `7–90` hari).
   * Kanal rilis auto-updater default (`defaultReleaseChannel`: `STABLE` | `BETA` | `NIGHTLY`).
   * Wajibkan verifikasi checksum SHA-256 biner (`enforceBinaryIntegrityCheck`: `boolean`).
   * Tolak otomatis versi engine di bawah `minSupportedVersion` (`blockOutdatedEngineClients`: `boolean`).
   * Batas permintaan validasi per IP/Serial Key (`validationRateLimitPerMin`: default `60` req/menit).
2. **`SECURITY_AUTH` (Keamanan & Sesi Autentikasi):**
   * Batas gagal login sebelum akun dikunci (`maxFailedLoginAttempts`: default `5` kali, rentang `3–15`).
   * Durasi penguncian akun otomatis (`accountLockoutMinutes`: default `30` menit, rentang `5–1440`).
   * Masa berlaku sesi login dashboard (`sessionTtlHours`: default `24` jam).
   * Wajibkan verifikasi email untuk akun baru (`requireEmailVerification`: `boolean`).
3. **`RETENTION_AUDIT` (Retensi Log & Pemeliharaan Data):**
   * Masa simpan log validasi mesin `license_validation_logs` (`validationLogRetentionDays`: default `180` hari, rentang `30–730`).
   * Masa simpan log telemetri auto-updater `engine_update_logs` (`updateLogRetentionDays`: default `90` hari).
   * Tombol aksi pemeliharaan **Bersihkan Log Lama Sekarang (`Purge Expired Logs`)** dengan modal konfirmasi yang menampilkan estimasi baris yang akan dihapus.
4. **`INFRASTRUCTURE` (Diagnostik Storage & Environment — Read-Only):**
   * Menampilkan status `STORAGE_DRIVER` (`local` / `s3`), direktori/bucket terkonfigurasi, status koneksi database PostgreSQL, status kunci enkripsi `VAULT_MASTER_SECRET` (hanya indikator `Terpasang / Valid 256-bit` — **tanpa menampilkan nilai rahasia**), dan target SLA latensi (`200 ms`).

### 2. Anatomi Tata Letak Halaman `/dashboard/settings`

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ AppTopbar: Dasbor / Administrasi / Pengaturan & Kebijakan                [ADMIN] [Avatar]  │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ HEADER HALAMAN                                                                             │
│ Pengaturan Sistem & Kebijakan Keamanan        [↺ Reset ke Default] [💾 Simpan Perubahan]   │
│ Konfigurasi parameter operasional lisensi, validasi engine, autentikasi, dan retensi log   │
├────────────────────┬────────────────────┬──────────────────────┬───────────────────────────┤
│ STATUS CARD 1      │ STATUS CARD 2      │ STATUS CARD 3        │ STATUS CARD 4             │
│ Mode Sistem        │ Storage Driver     │ Kebijakan Integritas │ Retensi Log Validasi      │
│ ● Normal (Online)  │ Local / S3 Ready   │ SHA-256 Enforced     │ 180 Hari Aktif            │
├────────────────────┴────────────────────┴──────────────────────┴───────────────────────────┤
│ NAVIGASI KATEGORI (ToggleGroup)                                                            │
│ [🔑 Lisensi & Engine] [🛡️ Keamanan & Sesi] [🗄️ Retensi & Audit] [🖧 Diagnostik Sistem]     │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ KARTU FORMULIR KONFIGURASI (Card bg-white rounded-2xl p-6)                                 │
│                                                                                            │
│ Bagian 1: Kebijakan Masa Berlaku & Peringatan Lisensi                                      │
│ ┌──────────────────────────────────────────┐ ┌───────────────────────────────────────────┐ │
│ │ Ambang Peringatan "Segera Habis" (Hari)  │ │ Kanal Auto-Updater Default                │ │
│ │ [ 30                                   ] │ │ [ STABLE (Direkomendasikan)             ▾]│ │
│ │ Lisensi ≤ 30 hari muncul di banner Dasbor│ │ Kanal default untuk aksaventra_engine.exe │ │
│ └──────────────────────────────────────────┘ └───────────────────────────────────────────┘ │
│                                                                                            │
│ Bagian 2: Aturan Validasi & Keamanan Biner Engine                                          │
│ ────────────────────────────────────────────────────────────────────────────────────────── │
│ Wajibkan Verifikasi Checksum SHA-256 Biner (#39)                                    [ ● ]  │
│ Tolak permintaan /api/v1/validate jika hash biner klien tidak terdaftar atau REVOKED       │
│ ────────────────────────────────────────────────────────────────────────────────────────── │
│ Blokir Klien Engine di Bawah Versi Minimum (minSupportedVersion)                    [ ● ]  │
│ Paksa pembaruan (mandatory update) sebelum mengizinkan dekripsi vaultSecret                │
│ ────────────────────────────────────────────────────────────────────────────────────────── │
│ Terakhir diperbarui oleh M. Fahd Indrawan pada 30 Okt 2026, 08:15 WIB                      │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Skema Database Prisma (`prisma/schema.prisma`)

Menambahkan model `SystemSetting` untuk menyimpan konfigurasi dinamis berbasis *key-value* bertipe kuat (*strongly-typed JSON/value*) yang dapat di-*seed* dan diaudit:

```prisma
enum SettingCategory {
  LICENSE_ENGINE
  SECURITY_AUTH
  RETENTION_AUDIT
}

model SystemSetting {
  key         String          @id @map("setting_key")
  category    SettingCategory
  value       String          @map("setting_value") // Disimpan sebagai serialized JSON / string tervalidasi
  valueType   String          @default("string") @map("value_type") // "number" | "boolean" | "string"
  description String?
  updatedById String?         @map("updated_by_id")
  updatedBy   User?           @relation(fields: [updatedById], references: [id], onDelete: SetNull)
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  @@index([category])
  @@map("system_settings")
}
```

* Tambahkan relasi balik `updatedSettings SystemSetting[]` pada model `User`.
* Jika baris konfigurasi belum ada di database, `SystemSettingsRepository` otomatis melakukan *fallback* ke konstanta *default* pada `defaultSystemSettings.ts` sehingga aplikasi tidak pernah gagal berjalan.

---

## 🏗️ Arsitektur Modul & Struktur Direktori

Mematuhi aturan **Hexagonal Architecture**, **Atomic Design**, dan **Zero Barrel Files** (Dilarang keras membuat file `index.ts` atau `index.tsx`):

```text
src/
├── app/
│   ├── (protected)/
│   │   └── dashboard/
│   │       └── settings/
│   │           └── page.tsx                                  # Protected Route /dashboard/settings
│   └── api/
│       └── v1/
│           └── settings/
│               ├── _factory.ts                               # DI Assembler untuk SystemSettingsController
│               ├── route.ts                                  # GET (all settings + diagnostics) & PATCH (update settings)
│               ├── reset/
│               │   └── route.ts                              # POST reset kategori ke nilai default
│               └── maintenance/
│                   └── purge-logs/
│                       └── route.ts                          # POST bersihkan log lama sesuai usia retensi
│
├── modules/
│   └── settings/
│       ├── application/
│       │   ├── services/
│       │   │   └── SystemSettingsServices.ts                 # Orkestrator UseCase (extends BaseService)
│       │   └── usecase/
│       │       ├── GetSystemSettingsUseCase.ts               # Mengambil konfigurasi + diagnostik environment terfilter
│       │       ├── UpdateSystemSettingsUseCase.ts            # Validasi domain rules + simpan transaksi + AuditLog
│       │       ├── ResetSystemSettingsUseCase.ts             # Mengembalikan kategori ke DEFAULT_SETTINGS + AuditLog
│       │       └── PurgeExpiredLogsUseCase.ts                # Menghapus log > retentionDays + mencatat jumlah terhapus ke AuditLog
│       ├── domain/
│       │   ├── dto/
│       │   │   ├── SystemSettingsRequestDTO.ts               # UpdateSystemSettingsDTO, ResetCategoryDTO, PurgeLogsDTO
│       │   │   └── SystemSettingsResponseDTO.ts              # SystemSettingsPayloadDTO, SystemDiagnosticsDTO, PurgeResultDTO
│       │   ├── entity/
│       │   │   └── SystemConfigurationEntity.ts              # Aggregate konfigurasi dengan validasi invarian
│       │   ├── interfaces/
│       │   │   └── SystemSettingsInterfaces.ts               # SystemSettingsRepositoryInterface (port)
│       │   ├── mapper/
│       │   │   └── SystemSettingsMapper.ts                   # Pemetaan baris key-value DB ↔ Strongly-Typed DTO
│       │   └── rules/
│       │       └── SettingsBoundsRule.ts                     # Validasi rentang aman (mis. retention >= 30 hari, lockout >= 5 menit)
│       ├── infrastructure/
│       │   ├── http/
│       │   │   └── SystemSettingsController.ts               # Extends BaseController
│       │   ├── providers/
│       │   │   └── EnvironmentDiagnosticsProvider.ts         # Membaca status aman storage/DB/env tanpa membocorkan secret
│       │   ├── repo/
│       │   │   └── SystemSettingsRepository.ts               # Satu-satunya tempat pemanggilan Prisma di modul settings
│       │   └── validators/
│       │       └── systemSettings.validator.ts               # Skema Zod untuk payload PATCH, POST reset, & POST purge
│       ├── presentation/
│       │   └── hooks/
│       │       └── useSystemSettingsApi.ts                   # Custom hook berbasis useApiExecutor
│       ├── shared/
│       │   └── constants/
│       │       └── defaultSystemSettings.ts                  # Nilai default resmi untuk seluruh key konfigurasi
│       └── tests/
│           ├── mocks/
│           │   └── mockSystemSettingsFactories.ts
│           ├── domain/
│           │   ├── SettingsBoundsRule.test.ts
│           │   └── SystemConfigurationEntity.test.ts
│           ├── application/
│           │   ├── GetSystemSettingsUseCase.test.ts
│           │   ├── UpdateSystemSettingsUseCase.test.ts
│           │   ├── ResetSystemSettingsUseCase.test.ts
│           │   └── PurgeExpiredLogsUseCase.test.ts
│           └── infrastructure/
│               ├── SystemSettingsController.test.ts
│               └── SystemSettingsValidator.test.ts
│
└── sections/
    └── system-settings/
        ├── atomic/
        │   ├── SettingToggleRow.tsx                          # Baris pengaturan Switch dengan label, deskripsi & badge rekomendasi
        │   ├── DiagnosticStatusItem.tsx                      # Item kartu indikator status infrastruktur (Online/Ready/Masked)
        │   └── UnsavedChangesBanner.tsx                      # Banner mengambang saat form memiliki perubahan yang belum disimpan
        ├── molecules/
        │   ├── SystemStatusSummaryGrid.tsx                   # 4 kartu ringkasan status konfigurasi di atas halaman
        │   ├── LicenseEngineSettingsForm.tsx                 # Form Tab 1: Kebijakan Lisensi & Validasi Engine
        │   ├── SecurityAuthSettingsForm.tsx                  # Form Tab 2: Keamanan Login, Lockout & Sesi
        │   ├── RetentionAuditSettingsForm.tsx                # Form Tab 3: Retensi Log & tombol Purge Expired Logs
        │   ├── InfrastructureDiagnosticsView.tsx             # Panel Tab 4: Diagnostik Storage, DB & Env (Read-Only)
        │   └── ConfirmPurgeLogsModal.tsx                     # Modal konfirmasi pembersihan log lama
        ├── organisms/
        │   └── SystemSettingsOrganism.tsx                    # Orkestrasi tab, state dirty form, modal, & useSystemSettingsApi
        └── pages/
            └── SystemSettingsPage.tsx                        # Diimpor oleh src/app/(protected)/dashboard/settings/page.tsx
```

---

## 🔌 Spesifikasi Kontrak REST API & `useSystemSettingsApi.ts`

### 1. Daftar Endpoint (`/api/v1/settings/**`)

| Method | Endpoint | Controller Method | Izin RBAC | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/settings` | `SystemSettingsController.getSettings` | `SETTINGS_MANAGE` | Mengambil seluruh nilai pengaturan (`licenseEngine`, `securityAuth`, `retentionAudit`) beserta `diagnostics` dan metadata `lastUpdatedAt` |
| `PATCH` | `/api/v1/settings` | `SystemSettingsController.updateSettings` | `SETTINGS_MANAGE` | Memperbarui konfigurasi secara atomik (`prisma.$transaction`) + mencatat nilai lama & baru ke `AuditLog` (`SETTINGS_UPDATED`) |
| `POST` | `/api/v1/settings/reset` | `SystemSettingsController.resetCategory` | `SETTINGS_MANAGE` | Mengembalikan satu kategori (`category`) ke nilai default `DEFAULT_SYSTEM_SETTINGS` + mencatat `AuditLog` (`SETTINGS_RESET`) |
| `POST` | `/api/v1/settings/maintenance/purge-logs` | `SystemSettingsController.purgeExpiredLogs` | `SETTINGS_MANAGE` | Menghapus baris `license_validation_logs` dan `engine_update_logs` yang lebih tua dari usia retensi aktif + mencatat `AuditLog` (`LOGS_PURGED`) |

### 2. Kontrak DTO Respons (`SystemSettingsResponseDTO.ts`)

```typescript
export interface LicenseEngineSettingsDTO {
  expiringSoonThresholdDays: number;     // Default: 30 (Min: 7, Max: 90)
  defaultReleaseChannel: "STABLE" | "BETA" | "NIGHTLY";
  enforceBinaryIntegrityCheck: boolean;  // Default: true
  blockOutdatedEngineClients: boolean;   // Default: true
  validationRateLimitPerMin: number;     // Default: 60 (Min: 10, Max: 1000)
  maintenanceMode: boolean;              // Default: false
}

export interface SecurityAuthSettingsDTO {
  maxFailedLoginAttempts: number;        // Default: 5 (Min: 3, Max: 15)
  accountLockoutMinutes: number;         // Default: 30 (Min: 5, Max: 1440)
  sessionTtlHours: number;               // Default: 24 (Min: 1, Max: 168)
  requireEmailVerification: boolean;     // Default: true
}

export interface RetentionAuditSettingsDTO {
  validationLogRetentionDays: number;    // Default: 180 (Min: 30, Max: 730)
  updateLogRetentionDays: number;        // Default: 90 (Min: 30, Max: 365)
}

export interface SystemDiagnosticsDTO {
  storageDriver: "local" | "s3";
  storageHealthy: boolean;
  databaseConnected: boolean;
  vaultSecretConfigured: boolean;        // Hanya boolean, TIDAK PERNAH mengirim isi secret
  smtpConfigured: boolean;
  targetSlaLatencyMs: number;            // 200
  appTimezone: string;                   // "Asia/Jakarta"
}

export interface SystemSettingsResponseDTO {
  licenseEngine: LicenseEngineSettingsDTO;
  securityAuth: SecurityAuthSettingsDTO;
  retentionAudit: RetentionAuditSettingsDTO;
  diagnostics: SystemDiagnosticsDTO;
  lastUpdatedAt: string | null;
  lastUpdatedByName: string | null;
}
```

---

## 🔐 Keamanan, Batas Invarian (`SettingsBoundsRule`) & RBAC

1. **Zero Secret Leakage pada Endpoint Diagnostik:**
   * `EnvironmentDiagnosticsProvider.ts` **dilarang keras** mengembalikan nilai mentah variabel `.env` seperti `DATABASE_URL`, `JWT_SECRET`, `AWS_SECRET_ACCESS_KEY`, atau `VAULT_MASTER_SECRET`. Provider hanya boleh mengembalikan status boolean (`true`/`false`) atau nama driver (`local`/`s3`).
2. **Aturan Batas Aman (`SettingsBoundsRule.ts`):**
   * Mencegah administrator memasukkan angka ekstrem yang dapat merusak operasional:
     * `expiringSoonThresholdDays`: wajib di antara `7` dan `90` hari.
     * `maxFailedLoginAttempts`: wajib di antara `3` dan `15` kali (mencegah penguncian instan 1x salah ketik).
     * `validationLogRetentionDays`: wajib minimal `30` hari agar jejak audit terbaru tidak tidak sengaja terhapus oleh fitur *Purge Logs*.
3. **Pencatatan `AuditLog` Lengkap (Diff Sebelum & Sesudah):**
   * Setiap panggilan `PATCH /api/v1/settings`, `POST /api/v1/settings/reset`, dan `POST /api/v1/settings/maintenance/purge-logs` wajib menulis ke tabel `audit_logs` dengan menyimpan daftar kunci yang berubah (`changedKeys`, `previousValues`, `newValues`).
4. **Proteksi RBAC Ketat:**
   * Hanya pengguna dengan role `ADMIN` (memiliki izin `SETTINGS_MANAGE`) yang dapat mengakses `/dashboard/settings` dan `/api/v1/settings/**`. Role `OPERATOR` dan `AUDITOR` ditolak dengan `403 Forbidden`.

---

## 📋 Rencana Kerja (Task Checklist)

### Phase 1 — Skema Database, Seeder & Kontrak Domain (`src/modules/settings/`)
* [ ] Tambahkan enum `SettingCategory` dan model `SystemSetting` ke `prisma/schema.prisma`, lalu jalankan migrasi.
* [ ] Tambahkan seeder `prisma/seed/data/systemSettings.data.ts` dan `prisma/seed/seeders/systemSettingSeeder.ts` (`upsert` idempoten).
* [ ] Buat `defaultSystemSettings.ts`, `SystemSettingsRequestDTO.ts`, `SystemSettingsResponseDTO.ts`, dan `SystemSettingsInterfaces.ts`.
* [ ] Implementasikan `SettingsBoundsRule.ts`, `SystemConfigurationEntity.ts`, dan `SystemSettingsMapper.ts`.

### Phase 2 — TDD Use Cases & Application Services (`src/modules/settings/application/`)
* [ ] **RED:** Tulis unit test menggunakan pola **Triple A (Arrange-Act-Assert)**:
  * `SettingsBoundsRule.test.ts` & `SystemConfigurationEntity.test.ts`
  * `GetSystemSettingsUseCase.test.ts` (memastikan nilai DB digabung dengan default fallback jika ada key yang belum di-seed)
  * `UpdateSystemSettingsUseCase.test.ts` (memastikan nilai di luar batas ditolak & perubahan sukses mencatat `AuditLog`)
  * `ResetSystemSettingsUseCase.test.ts`
  * `PurgeExpiredLogsUseCase.test.ts` (memastikan hanya log di luar rentang retensi yang dihapus & mencatat jumlah baris terhapus)
* [ ] **GREEN:** Implementasikan keempat Use Case dan orkestrator `SystemSettingsServices.ts`.

### Phase 3 — Infrastructure, Repository & Next.js API Routes
* [ ] Implementasikan `SystemSettingsRepository.ts` dan `EnvironmentDiagnosticsProvider.ts`.
* [ ] Implementasikan `systemSettings.validator.ts` (Zod) dan `SystemSettingsController.ts`.
* [ ] Buat assembler `src/app/api/v1/settings/_factory.ts` dan 3 route handlers di `src/app/api/v1/settings/**`.
* [ ] Pastikan `/dashboard/settings` dan `/api/v1/settings` terdaftar dengan izin `SETTINGS_MANAGE` pada `src/security/policyEngine.ts` dan `src/security/sidebar/getSidebarMenu.ts`.

### Phase 4 — Hook Presentation & Atomic UI (`src/sections/system-settings/`)
* [ ] Buat `useSystemSettingsApi.ts` (`fetchSettings`, `updateSettings`, `resetCategory`, `purgeExpiredLogs`).
* [ ] Buat komponen **Atomic**: `SettingToggleRow.tsx`, `DiagnosticStatusItem.tsx`, `UnsavedChangesBanner.tsx`.
* [ ] Buat komponen **Molecules**: `SystemStatusSummaryGrid.tsx`, `LicenseEngineSettingsForm.tsx`, `SecurityAuthSettingsForm.tsx`, `RetentionAuditSettingsForm.tsx`, `InfrastructureDiagnosticsView.tsx`, `ConfirmPurgeLogsModal.tsx`.
* [ ] Buat komponen **Organism**: `SystemSettingsOrganism.tsx` dengan *named event handlers* (`handleTabChange`, `handleFieldChange`, `handleSaveSettings`, `handleResetCategory`, `handleOpenPurgeModal`, `handleConfirmPurgeLogs`).
* [ ] Buat **Page**: `SystemSettingsPage.tsx` dan hubungkan ke `src/app/(protected)/dashboard/settings/page.tsx`.

### Phase 5 — Pengujian & Quality Gates
* [ ] Tambahkan unit test `SystemSettingsController.test.ts`, `SystemSettingsValidator.test.ts`, dan perbarui `policyEngine.test.ts`.
* [ ] Jalankan seluruh pemeriksaan kualitas kode hingga lulus 100%.

---

## ✅ Kriteria Penerimaan (Acceptance Criteria)

* [ ] Mengakses `/dashboard/settings` sebagai `ADMIN` menampilkan halaman Pengaturan & Kebijakan Sistem dalam **Light Mode** tanpa error `404`.
* [ ] Menampilkan 4 Kartu Status di bagian atas dan 4 Tab Kategori (`Lisensi & Engine`, `Keamanan & Sesi`, `Retensi & Audit`, `Diagnostik Sistem`) yang dapat disimpan atau direset ke nilai default.
* [ ] Saat form diubah, indikator `UnsavedChangesBanner` muncul dan tombol **Simpan Perubahan** memperbarui tabel `system_settings` serta mencatat rincian perubahan ke `audit_logs`.
* [ ] Fitur **Bersihkan Log Lama Sekarang** pada tab Retensi & Audit berhasil menghapus log validasi/update yang melampaui usia retensi (`validationLogRetentionDays` / `updateLogRetentionDays`) dan menampilkan notifikasi jumlah log yang dibersihkan.
* [ ] Tab Diagnostik Sistem menampilkan status kesehatan storage, database, dan variabel lingkungan secara aman tanpa membocorkan kunci rahasia apa pun.
* [ ] Mematuhi prinsip **Hexagonal Architecture**, **Atomic Design**, **Shared-UI Components**, **Named Event Handlers**, dan **Zero Barrel Files**.
* [ ] **Quality Gates:**
  * [ ] `npx vitest run` → 100% lulus, coverage modul `settings` ≥ 80%.
  * [ ] `npx tsc --noEmit` → 0 error TypeScript.
  * [ ] `npx @biomejs/biome check src/ prisma/seed/` → 0 error & 0 warning.
```

### Ringkasan Spesifikasi `ISSUE-011-system-settings-module.md`:
1. **Menjawab Kebutuhan Konfigurasi Dinamis Proyecto**: Menyelesaikan poin terbuka dari `ISSUE-006` dan `issue_sidebar_menu.md` seperti pengaturan ambang batas **"Segera Habis" (`expiringSoonThresholdDays`)**, **Retensi Log Validasi (`validationLogRetentionDays`)**, kebijakan integritas SHA-256 biner, serta batas percobaan login gagal (`maxFailedLoginAttempts`).
2. **Fitur Pemeliharaan Database (`PurgeExpiredLogsUseCase`)**: Memungkinkan `ADMIN` membersihkan log lama di `license_validation_logs` dan `engine_update_logs` sesuai usia retensi yang diatur.
3. **Diagnostik Infrastruktur Aman (`EnvironmentDiagnosticsProvider`)**: Menampilkan kesiapan *Storage Driver* (`Local` / `S3`), koneksi database, dan status kunci kriptografi tanpa pernah membocorkan isi variabel `.env` ke klien.