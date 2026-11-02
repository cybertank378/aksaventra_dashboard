# feat(settings-avatar): Implementasi Modul Pengaturan Sistem (`/dashboard/settings`) & Penyelarasan Rute Menu Avatar (`Profile`, `Settings`, `Security Audit`) dengan Metode `PATCH`

## 📌 Metadata

* **Issue ID:** `ISSUE-013`
* **Epic:** System Administration, User Profile & Security Audit Suite
* **Bounded Context:**
  * `src/modules/settings/` (Modul Baru untuk `/dashboard/settings`)
  * `src/modules/auth/` (Perluasan endpoint profil & audit keamanan untuk menu Avatar)
* **UI Sections:**
  * `src/sections/system-settings/` (Halaman `/dashboard/settings`)
  * `src/sections/profile/` (Halaman `/dashboard/profile`)
  * `src/sections/security-audit/` (Halaman `/dashboard/security` & `/dashboard/logs/audit`)
* **Protected Page Routes:**
  * `src/app/(protected)/dashboard/settings/page.tsx`
  * `src/app/(protected)/dashboard/profile/page.tsx`
  * `src/app/(protected)/dashboard/security/page.tsx`
* **API Routes (Wajib `PATCH` untuk Pembaruan):**
  * `GET /api/v1/settings`
  * `PATCH /api/v1/settings` *(Menggunakan `PATCH` sesuai standar partial update proyek, bukan `PUT`)*
  * `POST /api/v1/settings/reset`
  * `POST /api/v1/settings/maintenance/purge-logs`
  * `PATCH /api/v1/auth/profile`
  * `GET /api/v1/security/audit-logs`
* **Permissions RBAC:**
  * `SETTINGS_MANAGE` (`ADMIN` — Akses penuh `/dashboard/settings` & `PATCH /api/v1/settings`)
  * `LOGS_VIEW` (`ADMIN`, `OPERATOR`, `AUDITOR` — Akses baca `/dashboard/security`)
  * Sesi Terautentikasi (`ADMIN`, `OPERATOR`, `AUDITOR` — Akses `/dashboard/profile` & `PATCH /api/v1/auth/profile`)
* **Requirement Terkait:** FR-02, FR-03, FR-04, FR-06, NFR-01, NFR-02, NFR-03, NFR-04 (`REQUIREMENT.md`, `ISSUE-006`, & `issue_sidebar_menu.md`)
* **Priority:** High
* **Status:** Ready for Development

---

## 🔍 Audit Kode Saat Ini & Temuan Masalah pada `AvatarMenu.ts`

Pada file `src/security/AvatarMenu.ts` saat ini tertulis:

```typescript
export function getAvatarMenuByRole(_role?: UserRole): AvatarMenuItem[] {
  return [
    { label: "Profile", icon: User, path: "/profile" },
    { label: "Settings", icon: Settings, path: "/settings" },
    { label: "Security Audit", icon: ShieldAlert, path: "/admin/security" },
  ];
}
```

### Temuan Ketidaksesuaian:
1. **Path Tidak Selaras dengan Prefix Protected Layout (`/dashboard/*`):**
   * Seluruh halaman terproteksi di `src/app/(protected)/dashboard/**` dan `src/security/sidebar/getSidebarMenu.ts` menggunakan prefix `/dashboard/...`.
   * Path `/profile`, `/settings`, dan `/admin/security` pada `AvatarMenu.ts` menghasilkan **404 Not Found** karena tidak ada rute di luar `/dashboard`.
2. **Parameter `_role?: UserRole` Belum Difilter Berdasarkan Izin RBAC:**
   * Menu **Settings** (`/dashboard/settings`) seharusnya hanya muncul untuk role yang memiliki izin `SETTINGS_MANAGE` (`ADMIN`).
   * Menu **Security Audit** (`/dashboard/security`) seharusnya hanya muncul untuk role yang memiliki izin `LOGS_VIEW` (`ADMIN`, `OPERATOR`, `AUDITOR`).
3. **Modul & Section `/dashboard/settings` Belum Dibuat:**
   * Belum ada *Bounded Context* `src/modules/settings/`, *UI section* `src/sections/system-settings/`, maupun *API route* `src/app/api/v1/settings/**`.

---

## 🛠️ Perbaikan `src/security/AvatarMenu.ts` (Role-Aware & Konsisten dengan `/dashboard/*`)

```typescript
import { Settings, ShieldAlert, User } from "lucide-react";
import type { UserRole } from "@/libs/enums";
import { canAccess } from "@/security/policyEngine";

export interface AvatarMenuItem {
  label: string;
  icon: typeof User;
  path: string;
}

export function getAvatarMenuByRole(role?: UserRole): AvatarMenuItem[] {
  const items: AvatarMenuItem[] = [
    { label: "Profil Saya", icon: User, path: "/dashboard/profile" },
  ];

  if (role && canAccess(role, "SETTINGS_MANAGE")) {
    items.push({
      label: "Pengaturan Sistem",
      icon: Settings,
      path: "/dashboard/settings",
    });
  }

  if (role && canAccess(role, "LOGS_VIEW")) {
    items.push({
      label: "Audit Keamanan",
      icon: ShieldAlert,
      path: "/dashboard/security",
    });
  }

  return items;
}
```

---

## 🎨 Spesifikasi Desain UI & Penyelarasan Desain Sistem yang Ada

> [!IMPORTANT]
> **Catatan Penyesuaian Ilustrasi UI**:
> Desain UI yang disertakan pada tiket ini berfungsi sebagai **ilustrasi konsep tata letak (layout & functional wireframe)**. Implementasi teknis wajib disesuaikan dengan arsitektur dan komponen yang telah ada pada proyek:
> 1. **Pure Light Mode Palette**: Seluruh layout dan halaman (`/dashboard/profile`, `/dashboard/security`, dan `/dashboard/settings`) **WAJIB menggunakan tema Light Mode** (`bg-slate-50`, permukaan kartu `bg-white`, border `border-slate-200/90`, teks `text-slate-900`/`text-slate-600`) serta mempertahankan konsistensi `AppSidebar.tsx` dan `AppTopbar.tsx` yang sudah ada (tidak menggunakan elemen tema gelap).
> 2. **Zero Native HTML Elements**: Menggunakan komponen global dari `src/shared-ui/component/` (`Avatar`, `Card`, `ToggleGroup`, `TextField`, `SelectField`, `Switch`, `Button`, `Badge`, `Modal`, `Table`, `Form/*`).
> 3. **Status Modul Settings**: Fondasi modul `src/modules/settings/` dan halaman `/dashboard/settings` telah selesai diimplementasikan pada Issue #37. Tugas utama pada tiket ini adalah menyelaraskan rute menu avatar, membangun halaman profil (`/dashboard/profile`), serta membangun halaman audit keamanan (`/dashboard/security`).

### 1. Anatomi Tata Letak Halaman `/dashboard/settings`

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ AppTopbar: Dasbor / Administrasi / Pengaturan & Kebijakan                [ADMIN] [Avatar]  │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ HEADER HALAMAN                                                                             │
│ Pengaturan Sistem & Kebijakan Keamanan  [↺ Reset Default] [💾 Simpan Perubahan (PATCH)]   │
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
│ Terakhir diperbarui oleh M. Fahd Indrawan • Dicatat otomatis ke tabel audit_logs           │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Anatomi Halaman `/dashboard/profile` & `/dashboard/security` (Target `AvatarMenu.ts`)
* **`/dashboard/profile` (`UserProfilePage.tsx`):**
  * **Kolom Kiri (4 Kolom):** Kartu identitas pengguna (`Avatar`, nama, email, `RoleBadge`, tanggal login terakhir, daftar chip `Permissions` aktif, serta tombol **Putuskan Semua Sesi Perangkat Lain**).
  * **Kolom Kanan (8 Kolom):** Formulir edit nama profil (`PATCH /api/v1/auth/profile`), formulir ubah kata sandi (`ChangePasswordForm.tsx` yang memanggil `/api/v1/auth/change-password`), dan daftar sesi perangkat aktif (`UserSession`).
* **`/dashboard/security` (`SecurityAuditPage.tsx`):**
  * Menampilkan 4 Kartu KPI Keamanan (Total Aksi Admin 30H, Login Sukses 24J, Percobaan Login Gagal/Brute-Force, dan Mutasi Kritis).
  * Dilengkapi `ToggleGroup` untuk berpindah antara **Log Audit Admin (`audit_logs`)** dan **Jejak Autentikasi & Anomali Login (`login_audits`)**.

---

## 🗄️ Skema Database Prisma (`prisma/schema.prisma`)

Menambahkan model `SystemSetting` untuk menyimpan konfigurasi dinamis berbasis *key-value* bertipe kuat:

```prisma
enum SettingCategory {
  LICENSE_ENGINE
  SECURITY_AUTH
  RETENTION_AUDIT
}

model SystemSetting {
  key         String          @id @map("setting_key")
  category    SettingCategory
  value       String          @map("setting_value")
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

---

## 🏗️ Struktur Direktori Modul, Sections, API Routes & Page Routes

Mematuhi **Hexagonal Architecture**, **Atomic Design**, dan **Zero Barrel Files** (tanpa `index.ts` / `index.tsx`):

```text
src/
├── app/
│   ├── (protected)/
│   │   └── dashboard/
│   │       ├── settings/
│   │       │   └── page.tsx                                  # Merender SystemSettingsPage
│   │       ├── profile/
│   │       │   └── page.tsx                                  # Merender UserProfilePage (dari AvatarMenu)
│   │       └── security/
│   │           └── page.tsx                                  # Merender SecurityAuditPage (dari AvatarMenu)
│   └── api/
│       └── v1/
│           ├── settings/
│           │   ├── _factory.ts                               # DI Assembler untuk SystemSettingsController
│           │   ├── route.ts                                  # GET (ambil pengaturan) & PATCH (perbarui pengaturan parsial)
│           │   ├── reset/
│           │   │   └── route.ts                              # POST reset kategori ke nilai default
│           │   └── maintenance/
│           │       └── purge-logs/
│           │           └── route.ts                          # POST bersihkan log validasi/update yang kedaluwarsa
│           ├── auth/
│           │   └── profile/
│           │       └── route.ts                              # PATCH perbarui nama/profil pengguna aktif
│           └── security/
│               └── audit-logs/
│                   └── route.ts                              # GET daftar audit_logs & login_audits berpaginasi
│
├── modules/
│   └── settings/
│       ├── application/
│       │   ├── services/
│       │   │   └── SystemSettingsServices.ts                 # Extends BaseService
│       │   └── usecase/
│       │       ├── GetSystemSettingsUseCase.ts               # Ambil seluruh pengaturan + diagnostik environment
│       │       ├── PatchSystemSettingsUseCase.ts             # PATCH parsial pengaturan + validasi batas + tulis AuditLog
│       │       ├── ResetSystemSettingsUseCase.ts             # Reset kategori ke DEFAULT_SYSTEM_SETTINGS + tulis AuditLog
│       │       └── PurgeExpiredLogsUseCase.ts                # Hapus log > retentionDays + tulis AuditLog
│       ├── domain/
│       │   ├── dto/
│       │   │   ├── SystemSettingsRequestDTO.ts               # PatchSystemSettingsDTO (Partial), ResetCategoryDTO
│       │   │   └── SystemSettingsResponseDTO.ts              # SystemSettingsResponseDTO, SystemDiagnosticsDTO
│       │   ├── entity/
│       │   │   └── SystemConfigurationEntity.ts              # Domain aggregate dengan applyPatch()
│       │   ├── interfaces/
│       │   │   └── SystemSettingsInterfaces.ts               # SystemSettingsRepositoryInterface (port)
│       │   ├── mapper/
│       │   │   └── SystemSettingsMapper.ts                   # Pemetaan baris key-value DB ↔ DTO
│       │   └── rules/
│       │       └── SettingsBoundsRule.ts                     # Validasi rentang aman (expiringSoon: 7-90, retention: 30-730)
│       ├── infrastructure/
│       │   ├── http/
│       │   │   └── SystemSettingsController.ts               # Extends BaseController (getSettings, patchSettings, resetCategory, purgeLogs)
│       │   ├── providers/
│       │   │   └── EnvironmentDiagnosticsProvider.ts         # Diagnostik aman (boolean status tanpa membocorkan secret)
│       │   ├── repo/
│       │   │   └── SystemSettingsRepository.ts               # Satu-satunya akses Prisma di modul settings
│       │   └── validators/
│       │       └── systemSettings.validator.ts               # Zod schema untuk PATCH parsial (.partial())
│       ├── presentation/
│       │   └── hooks/
│       │       └── useSystemSettingsApi.ts                   # Menggunakan apiRequest dengan method: "PATCH"
│       ├── shared/
│       │   └── constants/
│       │       └── defaultSystemSettings.ts                  # Konstanta fallback default
│       └── tests/
│           ├── domain/
│           │   ├── SettingsBoundsRule.test.ts
│           │   └── SystemConfigurationEntity.test.ts
│           ├── application/
│           │   ├── GetSystemSettingsUseCase.test.ts
│           │   ├── PatchSystemSettingsUseCase.test.ts
│           │   ├── ResetSystemSettingsUseCase.test.ts
│           │   └── PurgeExpiredLogsUseCase.test.ts
│           └── infrastructure/
│               ├── SystemSettingsController.test.ts
│               └── SystemSettingsValidator.test.ts
│
└── sections/
    ├── system-settings/
    │   ├── atomic/
    │   │   ├── SettingToggleRow.tsx
    │   │   ├── DiagnosticStatusItem.tsx
    │   │   └── UnsavedChangesBanner.tsx
    │   ├── molecules/
    │   │   ├── SystemStatusSummaryGrid.tsx
    │   │   ├── LicenseEngineSettingsForm.tsx
    │   │   ├── SecurityAuthSettingsForm.tsx
    │   │   ├── RetentionAuditSettingsForm.tsx
    │   │   ├── InfrastructureDiagnosticsView.tsx
    │   │   └── ConfirmPurgeLogsModal.tsx
    │   ├── organisms/
    │   │   └── SystemSettingsOrganism.tsx
    │   └── pages/
    │       └── SystemSettingsPage.tsx
    ├── profile/
    │   ├── molecules/
    │   │   ├── ProfileIdentityCard.tsx
    │   │   ├── ProfileBasicInfoForm.tsx
    │   │   └── ProfileActiveSessionsCard.tsx
    │   ├── organisms/
    │   │   └── UserProfileOrganism.tsx
    │   └── pages/
    │       └── UserProfilePage.tsx
    └── security-audit/
        ├── molecules/
        │   ├── SecurityAuditKpiGrid.tsx
        │   ├── AdminAuditTrailTableView.tsx
        │   └── SuspiciousLoginAuditTableView.tsx
        ├── organisms/
        │   └── SecurityAuditOrganism.tsx
        └── pages/
            └── SecurityAuditPage.tsx
```

---

## 🔌 Spesifikasi Kontrak REST API (Wajib Menggunakan Metode `PATCH`)

| Method | Endpoint | Controller Method | Izin RBAC | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/settings` | `SystemSettingsController.getSettings` | `SETTINGS_MANAGE` | Mengambil seluruh konfigurasi sistem per kategori beserta status diagnostik |
| `PATCH` | `/api/v1/settings` | `SystemSettingsController.patchSettings` | `SETTINGS_MANAGE` | Memperbarui sebagian (*partial update*) parameter pengaturan menggunakan `PatchDTOHelper` + mencatat diff ke `AuditLog` (`SETTINGS_UPDATED`) |
| `POST` | `/api/v1/settings/reset` | `SystemSettingsController.resetCategory` | `SETTINGS_MANAGE` | Mereset kategori tertentu ke nilai default pabrik + mencatat `AuditLog` |
| `POST` | `/api/v1/settings/maintenance/purge-logs` | `SystemSettingsController.purgeExpiredLogs` | `SETTINGS_MANAGE` | Menghapus log validasi & auto-updater yang melewati batas usia retensi |
| `PATCH` | `/api/v1/auth/profile` | `AuthController.patchProfile` | Terautentikasi | Memperbarui nama profil pengguna yang sedang login via `PATCH` |
| `GET` | `/api/v1/security/audit-logs` | `AuthController.getSecurityAuditLogs` | `LOGS_VIEW` | Mengambil daftar `audit_logs` administratif & `login_audits` mencurigakan |

### Contoh Payload `PATCH /api/v1/settings`
Karena menggunakan metode **`PATCH`**, klien hanya perlu mengirimkan *field* yang berubah (memanfaatkan `src/core/application/dto/PatchDTOHelper.ts`):

```json
{
  "licenseEngine": {
    "expiringSoonThresholdDays": 30,
    "enforceBinaryIntegrityCheck": true
  }
}
```

---

## ✅ Daftar Tugas & Kriteria Penerimaan (Acceptance Criteria)

* [ ] **1. Penyelarasan `AvatarMenu.ts` & Halaman Terkait:**
  * [ ] Perbarui `getAvatarMenuByRole` di `src/security/AvatarMenu.ts` agar mengarah ke `/dashboard/profile`, `/dashboard/settings`, dan `/dashboard/security` serta memfilter menu berdasarkan role (`canAccess`).
  * [ ] Buat halaman `/dashboard/profile/page.tsx` dan `/dashboard/security/page.tsx` sehingga seluruh item pada dropdown Avatar berfungsi tanpa `404`.
* [ ] **2. Implementasi Modul `src/modules/settings/` dengan Metode `PATCH`:**
  * [ ] Buat `PatchSystemSettingsUseCase.ts` yang menerima pembaruan parsial, memvalidasi batas aman melalui `SettingsBoundsRule.ts`, menyimpan dalam transaksi Prisma, dan mencatat perubahan ke `audit_logs`.
  * [ ] Ekspos `GET` dan `PATCH` pada `src/app/api/v1/settings/route.ts` (tanpa method `PUT`).
* [ ] **3. Implementasi Atomic UI `src/sections/system-settings/`:**
  * [ ] Tampilkan 4 Kartu Status Ringkasan dan 4 Tab Kategori (`Lisensi & Engine`, `Keamanan & Sesi`, `Retensi & Audit`, `Diagnostik Sistem`) dalam **Light Mode**.
  * [ ] Gunakan komponen dari `src/shared-ui/component/` dan *named event handlers*.
* [ ] **4. Quality Gates & TDD Triple A:**
  * [ ] `npx vitest run` → 100% lulus, coverage modul `settings` ≥ 80%.
  * [ ] `npx tsc --noEmit` → 0 error TypeScript.
  * [ ] `npx @biomejs/biome check src/` → 0 error & 0 warning.