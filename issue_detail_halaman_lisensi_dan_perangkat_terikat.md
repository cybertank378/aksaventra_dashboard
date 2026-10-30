# feat(license-management): Integrasi Full-Stack Direktori Lisensi (`/dashboard/licenses`), Perangkat Terikat HWID (`/dashboard/licenses/devices`), & Panel Detail Lisensi (Hexagonal + Atomic Design, Light Mode)

## 📌 Metadata
- **Issue ID:** `ISSUE-009`
- **Epic:** License Management & Hardware Locking (`aksaventra_engine.exe`)
- **Bounded Context:** `src/modules/licenses/`
- **UI Section:** `src/sections/license-management/`
- **Protected Routes:**
  - `src/app/(protected)/dashboard/licenses/page.tsx` (`LicenseManagementPage.tsx`)
  - `src/app/(protected)/dashboard/licenses/devices/page.tsx` (`LicenseDevicesPage.tsx`)
- **Target API Routes (Admin Management):**
  - `GET /api/v1/licenses` (Paginasi, pencarian, filter status & status binding HWID)
  - `POST /api/v1/licenses` (Penerbitan serial key baru & pembuatan `vaultSecret`)
  - `GET /api/v1/licenses/stats` (Metrik 4 kartu KPI direktori lisensi & utilisasi perangkat)
  - `GET /api/v1/licenses/[id]` (Detail lengkap 1 lisensi + riwayat 10 log validasi terakhir dari `license_validation_logs`)
  - `PATCH /api/v1/licenses/[id]/reset-hwid` (Melepas/mereset ikatan `hwid` perangkat klien + pencatatan `AuditLog`)
  - `PATCH /api/v1/licenses/[id]/status` (Mengubah status `ACTIVE` / `SUSPENDED` / perpanjangan `expiresAt` + pencatatan `AuditLog`)
- **Permissions RBAC:**
  - `LICENSES_VIEW` (`ADMIN`, `OPERATOR`, `AUDITOR`)
  - `LICENSES_CREATE` (`ADMIN`, `OPERATOR`)
  - `LICENSES_MANAGE` (`ADMIN`, `OPERATOR` — Reset HWID & Perpanjangan)
  - `LICENSES_REVOKE` (`ADMIN` — Suspend / Revoke Lisensi)
- **Requirement Terkait:** FR-01, FR-02, FR-03, FR-04, FR-06, NFR-01, NFR-03, NFR-04 (`REQUIREMENT.md`)
- **Priority:** High
- **Status:** Ready for Development

---

## 🔍 Audit Kode Saat Ini & Konteks Masalah (Problem Statement)

Berdasarkan hasil pemeriksaan pada kode sumber `aksaventra_dashboard-dev`:

1. **Data Statis (`INITIAL_LICENSES`) & Belum Terhubung ke Database pada UI:**
   - `LicenseDirectoryOrganism.tsx` (`/dashboard/licenses`), `BoundDevicesOrganism.tsx` (`/dashboard/licenses/devices`), dan `LicenseRevocationsOrganism.tsx` saat ini masih menggunakan data *hardcode* di memori (`INITIAL_LICENSES`) dan belum memanggil API melalui `useLicenseApi.ts`.
2. **Modul `src/modules/licenses/` Baru Mencakup Validasi Klien Engine:**
   - Saat ini `src/modules/licenses/` baru memiliki `ValidateLicenseUseCase.ts` (`POST /api/v1/validate` dan `/api/v1/validate-key` untuk binary `aksaventra_engine.exe`).
   - Belum tersedia *Use Case*, *Controller method*, dan *REST API endpoint* administratif untuk membaca daftar lisensi (`ListLicensesUseCase`), mengambil detail lisensi beserta riwayat validasinya (`GetLicenseDetailUseCase`), mereset ikatan perangkat (`ResetDeviceHwidUseCase`), maupun menangguhkan lisensi (`UpdateLicenseStatusUseCase`).
3. **Hook `useLicenseApi.ts` Masih Terbatas:**
   - `src/modules/licenses/presentation/hooks/useLicenseApi.ts` baru mengekspos `validateLicense`, belum memiliki fungsi CRUD administratif (`fetchLicenses`, `fetchLicenseStats`, `fetchLicenseDetail`, `resetDeviceHwid`, `updateLicenseStatus`, `createLicense`).
4. **Belum Ada Komponen Detail Inspeksi Lisensi (`LicenseDetailDrawerModal.tsx`):**
   - Pada halaman `/dashboard/licenses` dan `/dashboard/licenses/devices`, administrator membutuhkan panel/modal detail ketika mengklik baris lisensi untuk melihat metadata lengkap (`id`, `clientName`, `serialKey`, status ikatan `hwid`, `activatedAt`, `lastVerifiedAt`, `engineVersion`, `expiresAt`) sekaligus melihat jejak validasi terbaru dari tabel `license_validation_logs` tanpa berpindah halaman.

---

## 🎨 Spesifikasi Desain UI & Detail Halaman (Light Mode)

> [!IMPORTANT]
> Seluruh halaman dan modal pada `src/sections/license-management/` **WAJIB menggunakan Light Mode** (`bg-slate-50`, permukaan kartu `bg-white`, border `border-slate-200/90`) dan wajib menggunakan komponen dari `src/shared-ui/component/`.

### 1. Halaman Direktori Semua Lisensi (`/dashboard/licenses`)
- **Route File:** `src/app/(protected)/dashboard/licenses/page.tsx` → `LicenseManagementPage.tsx` → `LicenseDirectoryOrganism.tsx`
- **Susunan Komponen:**
  1. **Header Halaman & Aksi Cepat:**
     - Judul: **Direktori & Manajemen Lisensi**
     - Tombol Aksi: **Segarkan Data**, **Filter Lanjutan** (`LicenseFilterModal.tsx`), dan tombol utama **+ Terbitkan Lisensi Baru** (mengarah ke `/dashboard/licenses/create` atau membuka modal penerbitan, disembunyikan jika role tidak memiliki `LICENSES_CREATE`).
  2. **Baris 4 Kartu KPI (`LicenseMetricCard.tsx`):**
     - **Total Lisensi Terdaftar:** Jumlah seluruh baris di tabel `licenses`.
     - **Lisensi Aktif (`ACTIVE`):** Lisensi aktif yang belum melewati `expiresAt`.
     - **Perangkat Terikat (`HWID Bound`):** Jumlah lisensi dengan `hwid !== null` beserta persentase utilisasi ikatan mesin.
     - **Kedaluwarsa / Dibekukan (`EXPIRED` + `SUSPENDED`):** Jumlah lisensi yang tidak dapat digunakan klien.
  3. **Toolbar Pencarian & Tab Status Cepat:**
     - Tab (`ToggleGroup`): `Semua`, `Aktif`, `Segera Habis (≤30H)`, `Kedaluwarsa`, `Dibekukan`.
     - `SearchField`: Pencarian reaktif berdasarkan `clientName`, potongan `serialKey`, atau `hwid`.
  4. **Tabel Utama Direktori Lisensi (`LicenseTableView.tsx`):**
     - Kolom:
       - **Nama Klien & ID:** `clientName` + potongan UUID.
       - **Serial Key:** `SerialKeyBadge.tsx` (format tersamar `AKSA-••••-••••-9F2A` dengan tombol toggle lihat/sembunyikan & salin ke *clipboard* khusus `ADMIN`/`OPERATOR`).
       - **Status Lisensi:** `LicenseStatusBadge.tsx` (`ACTIVE` Emerald, `EXPIRED` Amber, `SUSPENDED` Rose).
       - **Ikatan Perangkat (HWID):** Badge status `Terikat (HWID)` beserta cuplikan hash monospaced (`8f1c...a90b`) atau `Belum Aktivasi` (`slate`).
       - **Versi Engine & Verifikasi Terakhir:** `engineVersion` (misal `v2.2.2`) dan waktu relatif `lastVerifiedAt`.
       - **Masa Berlaku (`expiresAt`):** Tanggal kedaluwarsa (atau badge `Seumur Hidup / Perpetual` jika `null`).
       - **Aksi:** Tombol **Detail** (membuka `LicenseDetailModal.tsx`), **Reset HWID** (membuka `DeviceResetModal.tsx`), dan **Bekukan / Aktifkan**.

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ AppTopbar: Dasbor / Manajemen Lisensi / Semua Lisensi                    [Role] [Avatar]   │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ HEADER HALAMAN                                                                             │
│ Direktori & Manajemen Lisensi                  [↻ Segarkan] [⚙ Filter] [+ Terbitkan Baru]  │
├────────────────────┬────────────────────┬──────────────────────┬───────────────────────────┤
│ KPI 1              │ KPI 2              │ KPI 3                │ KPI 4                     │
│ Total Lisensi      │ Lisensi Aktif      │ Perangkat Terikat    │ Kedaluwarsa / Dibekukan   │
│ 24 Lisensi         │ 18 Aktif           │ 15 Mesin (83.3%)     │ 6 Nonaktif                │
├────────────────────┴────────────────────┴──────────────────────┴───────────────────────────┤
│ KARTU TABEL DIREKTORI (Card bg-white rounded-2xl p-6)                                      │
│ [Semua] [Aktif] [Segera Habis] [Dibekukan]         [🔍 Cari nama klien, serial key, HWID…] │
│ ────────────────────────────────────────────────────────────────────────────────────────── │
│ Nama Klien      │ Serial Key       │ Status  │ Ikatan HWID   │ Engine & Ping │ Kedaluwarsa││
│ PT Nusantara    │ AKSA-••••-9F2A 📋│ ACTIVE  │ 🔒 8f1c…a90b  │ v2.2.2 (5m)   │ 25 Des 2026││
│ CV Bintang      │ AKSA-••••-11B4 📋│ ACTIVE  │ ⚪ Belum Ikat │ -             │ 14 Nov 2026││
│ ────────────────────────────────────────────────────────────────────────────────────────── │
│ Menampilkan 1–10 dari 24 lisensi                                      ‹ Sblm [1][2] Brkt › │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Halaman Perangkat Terikat / HWID (`/dashboard/licenses/devices`)
- **Route File:** `src/app/(protected)/dashboard/licenses/devices/page.tsx` → `LicenseDevicesPage.tsx` → `BoundDevicesOrganism.tsx`
- **Fokus Fungsional:**
  - Mengelola secara spesifik siklus hidup penguncian perangkat keras (*Hardware Locking* / `hwid`) sesuai **FR-02** dan **FR-03**.
  - Memudahkan operator teknis ketika pelanggan melakukan penggantian perangkat keras (migrasi server/PC) dan membutuhkan **Reset HWID** agar `aksaventra_engine.exe` dapat mengikat mesin baru pada request validasi berikutnya.
- **Susunan Komponen:**
  1. **4 Kartu KPI Perangkat (`LicenseMetricCard.tsx`):**
     - **Total Perangkat Terikat:** Jumlah lisensi dengan `hwid IS NOT NULL`.
     - **Slot Menunggu Aktivasi Pertama:** Jumlah lisensi `ACTIVE` dengan `hwid IS NULL`.
     - **Terkoneksi Hari Ini (24 Jam):** Jumlah perangkat terikat yang melakukan *heartbeat* (`lastVerifiedAt >= now - 24h`).
     - **Anomali HWID Mismatch (24 Jam):** Jumlah percobaan gagal `403 HWID_MISMATCH` dari tabel `license_validation_logs`.
  2. **Filter & Pencarian Perangkat:**
     - Tab Cepat (`ToggleGroup`): `Semua Perangkat Terikat`, `Online (≤24 Jam)`, `Tidak Aktif (>7 Hari)`, `Menunggu Ikatan Baru`.
     - `SearchField`: Cari berdasarkan `hwid`, `clientName`, `serialKey`, atau `engineVersion`.
  3. **Tabel Perangkat Terikat & Modal Reset HWID (`DeviceResetModal.tsx`):**
     - Menampilkan `Identitas Klien`, `Serial Key`, `Fingerprint HWID` (monospaced + tombol salin), `Versi Engine`, `Waktu Aktivasi Awal (activatedAt)`, `Heartbeat Terakhir (lastVerifiedAt)`, dan tombol aksi **Lepas Ikatan HWID** (`Reset HWID`) serta **Detail Perangkat**.
     - Saat **Lepas Ikatan HWID** diklik, `DeviceResetModal.tsx` meminta konfirmasi dan alasan reset (dicatat ke `audit_logs`), lalu mengosongkan kolom `hwid = null` dan `activatedAt = null` di database.

---

### 3. Modal / Drawer Detail Lisensi & Riwayat Validasi (`LicenseDetailModal.tsx`)
- Dibuka ketika pengguna mengklik tombol **Detail** pada baris di `/dashboard/licenses` maupun `/dashboard/licenses/devices`.
- Menampilkan 3 bagian utama:
  1. **Metadata Lisensi & Klien:** Nama Klien, Status Badge, Tanggal Dibuat, Tanggal Kedaluwarsa, dan Serial Key (dengan opsi salin).
  2. **Status Penguncian Mesin (Hardware Lock Box):**
     - Status Ikatan (`Terikat` / `Belum Terikat`), nilai `HWID` lengkap, `activatedAt`, `lastVerifiedAt`, `engineVersion`, serta tombol cepat **Reset Ikatan HWID** (jika `canAccess(role, "LICENSES_MANAGE")`).
  3. **10 Riwayat Validasi Terakhir (`license_validation_logs`):**
     - Tabel ringkas berisi `checkedAt`, `result` (`VERIFIED`, `ACTIVATED`, `HWID_MISMATCH`, dll.), `clientIp`, `engineVersion`, dan `latencyMs`.

---

## 🏗️ Arsitektur Modul & Struktur Direktori

Mematuhi aturan **Hexagonal Architecture**, **Atomic Design**, dan **Zero Barrel Files** (tanpa `index.ts` / `index.tsx`):

```text
src/
├── app/
│   ├── (protected)/
│   │   └── dashboard/
│   │       └── licenses/
│   │           ├── page.tsx                                  # Route /dashboard/licenses
│   │           ├── create/
│   │           │   └── page.tsx                              # Route /dashboard/licenses/create
│   │           ├── devices/
│   │           │   └── page.tsx                              # Route /dashboard/licenses/devices
│   │           └── revocations/
│   │               └── page.tsx                              # Route /dashboard/licenses/revocations
│   └── api/
│       └── v1/
│           └── licenses/
│               ├── _factory.ts                               # DI Assembler untuk LicenseAdminController
│               ├── route.ts                                  # GET (list) & POST (create)
│               ├── stats/
│               │   └── route.ts                              # GET metrik KPI lisensi & perangkat
│               └── [id]/
│                   ├── route.ts                              # GET detail lisensi + log validasi
│                   ├── reset-hwid/
│                   │   └── route.ts                          # PATCH lepas ikatan HWID
│                   └── status/
│                       └── route.ts                          # PATCH ubah status (ACTIVE/SUSPENDED) & perpanjang
│
├── modules/
│   └── licenses/
│       ├── application/
│       │   ├── services/
│       │   │   └── LicenseServices.ts                        # Orkestrator seluruh UseCase lisensi
│       │   └── usecase/
│       │       ├── ValidateLicenseUseCase.ts                 # (Sudah ada — untuk klien engine)
│       │       ├── ListLicensesUseCase.ts                    # (Baru) Paginasi + filter status/hwid/search
│       │       ├── GetLicenseStatsUseCase.ts                 # (Baru) 4 KPI lisensi & 4 KPI perangkat HWID
│       │       ├── GetLicenseDetailUseCase.ts                # (Baru) Detail lisensi + 10 log validasi terbaru
│       │       ├── CreateLicenseUseCase.ts                   # (Baru) Generate serial key & vaultSecret
│       │       ├── ResetDeviceHwidUseCase.ts                 # (Baru) Reset hwid=null + tulis AuditLog
│       │       └── UpdateLicenseStatusUseCase.ts             # (Baru) Suspend/Activate/Extend + tulis AuditLog
│       ├── domain/
│       │   ├── builders/
│       │   │   └── LicenseQueryBuilder.ts                    # (Baru) Filter status, binding state, search, sort
│       │   ├── dto/
│       │   │   ├── LicenseRequestDTO.ts                      # Perluas dengan DTO filter, create, resetHwid, updateStatus
│       │   │   └── LicenseResponseDTO.ts                     # Perluas dengan LicenseAdminItemDTO, LicenseDetailDTO, LicenseStatsDTO
│       │   ├── entity/
│       │   │   ├── LicenseEntity.ts                          # Tambahkan method resetHwid(), suspend(), activate(), isExpiringSoon()
│       │   │   └── LicenseValidationLogEntity.ts             # (Sudah ada)
│       │   ├── interfaces/
│       │   │   └── LicenseInterfaces.ts                      # Perluas kontrak LicenseRepositoryInterface
│       │   ├── mapper/
│       │   │   └── LicenseMapper.ts                          # Pemetaan Entity → Admin DTO (tanpa membocorkan vaultSecret)
│       │   └── rules/
│       │       └── SerialKeyGeneratorRule.ts                 # (Baru) Generator kriptografi AKSA-XXXX-XXXX-XXXX
│       ├── infrastructure/
│       │   ├── http/
│       │   │   ├── LicenseController.ts                      # (Sudah ada — endpoint validasi engine)
│       │   │   └── LicenseAdminController.ts                 # (Baru) Endpoint manajemen admin dashboard
│       │   ├── repo/
│       │   │   ├── LicenseRepository.ts                      # Perluas dengan findManyPaginated, getStats, updateHwid, updateStatus
│       │   │   └── LicenseValidationLogRepository.ts         # Tambahkan findRecentByLicenseId(licenseId, limit)
│       │   └── validators/
│       │       └── license.validator.ts                      # Tambahkan skema Zod untuk query list, create, reset-hwid, status
│       ├── presentation/
│       │   └── hooks/
│       │       └── useLicenseApi.ts                          # Perluas dengan method CRUD & manajemen perangkat
│       └── tests/
│           ├── application/
│           │   ├── ListLicensesUseCase.test.ts
│           │   ├── ResetDeviceHwidUseCase.test.ts
│           │   ├── UpdateLicenseStatusUseCase.test.ts
│           │   └── CreateLicenseUseCase.test.ts
│           └── infrastructure/
│               └── LicenseAdminController.test.ts
│
└── sections/
    └── license-management/
        ├── atomic/
        │   ├── LicenseMetricCard.tsx                         # (Sudah ada)
        │   ├── LicenseStatusBadge.tsx                        # (Sudah ada)
        │   ├── SerialKeyBadge.tsx                            # (Sudah ada)
        │   └── HwidBindingBadge.tsx                          # (Baru) Indikator Terikat / Menunggu Aktivasi + copy HWID
        ├── molecules/
        │   ├── DeviceResetModal.tsx                          # Perbarui agar mengirim alasan reset & loading state
        │   ├── LicenseCreateFormView.tsx                     # Hubungkan dengan submit handler
        │   ├── LicenseFilterModal.tsx                        # Hubungkan dengan state query filter
        │   ├── LicenseTableView.tsx                          # Tambahkan aksi buka detail & loading skeleton
        │   ├── BoundDevicesTableView.tsx                     # (Baru) Tabel khusus /dashboard/licenses/devices
        │   └── LicenseDetailModal.tsx                        # (Baru) Modal/Drawer detail lisensi & riwayat validasi
        ├── organisms/
        │   ├── LicenseDirectoryOrganism.tsx                  # Ganti INITIAL_LICENSES dengan useLicenseApi
        │   ├── BoundDevicesOrganism.tsx                      # Ganti INITIAL_LICENSES dengan useLicenseApi
        │   ├── LicenseCreateOrganism.tsx                     # Hubungkan dengan useLicenseApi.createLicense
        │   └── LicenseRevocationsOrganism.tsx                # Hubungkan dengan useLicenseApi
        └── pages/
            ├── LicenseManagementPage.tsx
            ├── LicenseDevicesPage.tsx
            ├── CreateLicensePage.tsx
            └── LicenseRevocationsPage.tsx
```

---

## 🔌 Spesifikasi Kontrak REST API & `useLicenseApi.ts`

### 1. Daftar Endpoint Administratif (`/api/v1/licenses/**`)

| Method | Endpoint | Controller Method | Izin RBAC | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/licenses` | `LicenseAdminController.list` | `LICENSES_VIEW` | Mengambil daftar lisensi dengan query `page`, `limit`, `search`, `status` (`ACTIVE`\|`EXPIRED`\|`SUSPENDED`), `binding` (`ALL`\|`BOUND`\|`UNBOUND`), `expiringSoon` (`boolean`) |
| `GET` | `/api/v1/licenses/stats` | `LicenseAdminController.getStats` | `LICENSES_VIEW` | Mengambil metrik KPI untuk halaman `/dashboard/licenses` dan `/dashboard/licenses/devices` |
| `GET` | `/api/v1/licenses/[id]` | `LicenseAdminController.getDetail` | `LICENSES_VIEW` | Mengambil detail 1 lisensi beserta 10 baris terbaru `license_validation_logs` |
| `POST` | `/api/v1/licenses` | `LicenseAdminController.create` | `LICENSES_CREATE` | Menerbitkan lisensi baru (`clientName`, `expiresAt`, `engineVersion` opsional) + mencatat `AuditLog` (`LICENSE_CREATE`) |
| `PATCH` | `/api/v1/licenses/[id]/reset-hwid` | `LicenseAdminController.resetHwid` | `LICENSES_MANAGE` | Mereset `hwid = null`, `activatedAt = null` + mencatat `AuditLog` (`LICENSE_RESET_HWID`) beserta alasan reset |
| `PATCH` | `/api/v1/licenses/[id]/status` | `LicenseAdminController.updateStatus` | `LICENSES_REVOKE` / `LICENSES_MANAGE` | Mengubah `status` (`ACTIVE`\|`SUSPENDED`) atau memperpanjang `expiresAt` + mencatat `AuditLog` |

### 2. Kontrak DTO Respons (`LicenseResponseDTO.ts`)
```typescript
export interface LicenseAdminItemDTO {
  id: string;
  serialKey: string;               // Ditampilkan untuk ADMIN/OPERATOR, disamarkan untuk AUDITOR via fieldGuard
  serialKeyMasked: string;         // Format: "AKSA-••••-••••-9F2A"
  clientName: string;
  hwid: string | null;
  isBound: boolean;                // hwid !== null
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  isExpiringSoon: boolean;         // true jika ACTIVE dan 0 < expiresAt - now <= 30 hari
  engineVersion: string | null;
  activatedAt: string | null;
  lastVerifiedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface LicenseStatsResponseDTO {
  totalLicenses: number;
  activeLicenses: number;
  expiringSoonLicenses: number;
  expiredOrSuspendedLicenses: number;
  boundDevicesCount: number;
  unboundActiveCount: number;
  verifiedLast24hCount: number;
  hwidMismatchLast24hCount: number;
}

export interface LicenseDetailResponseDTO extends LicenseAdminItemDTO {
  recentValidationLogs: Array<{
    id: string;
    result: string;
    statusCode: number;
    hwidHash: string | null;
    clientIp: string | null;
    engineVersion: string | null;
    latencyMs: number | null;
    checkedAt: string;
  }>;
}
```

> [!CAUTION]
> Kolom rahasia `vaultSecret` dari tabel `licenses` **DILARANG KERAS** disertakan di dalam `LicenseAdminItemDTO` maupun `LicenseDetailResponseDTO`. `vaultSecret` hanya boleh dikirim ke binary klien `aksaventra_engine.exe` melalui endpoint `POST /api/v1/validate` ketika seluruh verifikasi lulus.

---

## 🔐 Keamanan, Audit Trail & Matriks RBAC

| Aksi / Elemen UI | `ADMIN` | `OPERATOR` | `AUDITOR` |
| :--- | :---: | :---: | :---: |
| Melihat `/dashboard/licenses` & `/dashboard/licenses/devices` | ✅ | ✅ | ✅ |
| Melihat Serial Key penuh (Unmask & Copy) | ✅ | ✅ | ❌ (Hanya `serialKeyMasked`) |
| Menerbitkan Lisensi Baru (`POST /api/v1/licenses`) | ✅ | ✅ | ❌ (Tombol disembunyikan) |
| Mereset Ikatan Perangkat (`PATCH .../reset-hwid`) | ✅ | ✅ | ❌ (Tombol disembunyikan) |
| Membekukan / Mencabut Lisensi (`PATCH .../status`) | ✅ | ❌ | ❌ (Tombol disembunyikan) |

- **Pencatatan `AuditLog` Wajib:** Setiap mutasi (`create`, `resetHwid`, `updateStatus`) wajib mencatat baris baru ke tabel `audit_logs` dengan `userId` dari sesi aktif (`getCurrentAuth()`), `action` (`LICENSE_CREATED`, `LICENSE_HWID_RESET`, `LICENSE_STATUS_UPDATED`), `targetId` (`license.id`), dan `details` JSON (misal HWID lama yang dilepas dan alasan reset).
- **Pembaruan `src/security/policyEngine.ts`:** Tambahkan aturan rute `/api/v1/licenses` sesuai matriks izin di atas.

---

## 📋 Rencana Kerja (Task Checklist)

### Phase 1 — Perluasan Domain & Repository (`src/modules/licenses/`)
- [ ] Tambahkan method domain `resetHwid()`, `suspend()`, `activate()`, dan `isExpiringSoon(now)` pada `LicenseEntity.ts`.
- [ ] Buat `SerialKeyGeneratorRule.ts` (menghasilkan format `AKSA-XXXX-XXXX-XXXX` unik dan `vaultSecret` kriptografis 64-byte hex).
- [ ] Buat `LicenseQueryBuilder.ts` untuk membangun filter Prisma (`status`, `binding`, `search`, `expiringSoon`).
- [ ] Perbarui `LicenseInterfaces.ts` dan `LicenseRepository.ts` untuk mendukung `findManyPaginated`, `getStats`, `findByIdWithLogs`, `create`, `resetHwid`, dan `updateStatus`.

### Phase 2 — TDD Use Cases & Application Services (`src/modules/licenses/application/`)
- [ ] **RED:** Tulis unit test dengan pola **Triple A (Arrange-Act-Assert)**:
  - `ListLicensesUseCase.test.ts`
  - `ResetDeviceHwidUseCase.test.ts` (memastikan `hwid` menjadi `null` dan `AuditLog` tercatat)
  - `UpdateLicenseStatusUseCase.test.ts`
  - `CreateLicenseUseCase.test.ts`
- [ ] **GREEN:** Implementasikan Use Case di atas dan daftarkan ke dalam `LicenseServices.ts`.

### Phase 3 — Controller, Validator & Next.js API Routes
- [ ] Perbarui `license.validator.ts` dengan skema validasi query list, body create, body reset-hwid, dan body update status.
- [ ] Buat `LicenseAdminController.ts` dan assembler `src/app/api/v1/licenses/_factory.ts`.
- [ ] Buat route handlers di `src/app/api/v1/licenses/**`.
- [ ] Perbarui `src/security/policyEngine.ts` untuk mengamankan endpoint `/api/v1/licenses/**`.

### Phase 4 — Hook Presentation & Atomic UI (`src/sections/license-management/`)
- [ ] Perluas `src/modules/licenses/presentation/hooks/useLicenseApi.ts` dengan fungsi `fetchLicenses`, `fetchStats`, `fetchLicenseDetail`, `createLicense`, `resetHwid`, dan `updateStatus`.
- [ ] Buat komponen `HwidBindingBadge.tsx`, `BoundDevicesTableView.tsx`, dan `LicenseDetailModal.tsx`.
- [ ] Refaktor `LicenseDirectoryOrganism.tsx` (`/dashboard/licenses`) agar menghapus `INITIAL_LICENSES` dan terhubung penuh ke `useLicenseApi`.
- [ ] Refaktor `BoundDevicesOrganism.tsx` (`/dashboard/licenses/devices`) agar menghapus `INITIAL_LICENSES`, menampilkan 4 KPI perangkat, filter status ikatan, serta aksi Reset HWID ke database melalui `DeviceResetModal.tsx`.
- [ ] Pastikan seluruh event handler menggunakan **named functions** (`handleSearchChange`, `handleFilterApply`, `handleOpenResetModal`, `handleConfirmResetHwid`, `handleInspectLicense`).

### Phase 5 — Quality Gates & Verifikasi
- [ ] Tambahkan unit test `LicenseAdminController.test.ts` dan perbarui `policyEngine.test.ts`.
- [ ] Jalankan seluruh pemeriksaan kualitas kode hingga lulus 100%.

---

## ✅ Kriteria Penerimaan (Acceptance Criteria)

- [ ] Halaman **`/dashboard/licenses`** memuat daftar lisensi, 4 kartu KPI, pencarian, filter status, dan paginasi secara *real-time* dari PostgreSQL (tidak lagi memakai `INITIAL_LICENSES`).
- [ ] Halaman **`/dashboard/licenses/devices`** menampilkan daftar perangkat yang terikat HWID, metrik utilisasi perangkat, status konektivitas 24 jam terakhir, serta fitur **Lepas Ikatan HWID (Reset HWID)** yang langsung memperbarui database.
- [ ] Mengklik tombol **Detail** pada baris di `/dashboard/licenses` atau `/dashboard/licenses/devices` membuka `LicenseDetailModal` yang menampilkan metadata lisensi dan 10 riwayat log validasi terakhir dari `license_validation_logs`.
- [ ] Setiap tindakan **Reset HWID** dan **Perubahan Status Lisensi** tercatat ke dalam tabel `audit_logs` sehingga langsung muncul pada panel Riwayat Aktivitas di Dasbor Utama.
- [ ] `vaultSecret` tidak pernah dikirim di endpoint `/api/v1/licenses/**`, dan role `AUDITOR` hanya menerima `serialKeyMasked` serta tidak melihat tombol mutasi.
- [ ] Mematuhi prinsip **Hexagonal Architecture**, **Atomic Design**, **Light Mode**, **Named Event Handlers**, dan **Zero Barrel Files**.
- [ ] **Quality Gates:**
  - [ ] `npx vitest run` → 100% lulus, coverage modul `licenses` ≥ 80%.
  - [ ] `npx tsc --noEmit` → 0 error TypeScript.
  - [ ] `npx @biomejs/biome check src/` → 0 error & 0 warning.