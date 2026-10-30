# feat(license-management): Panel Detail Lisensi, Manajemen Perangkat Terikat (HWID) & Pencabutan Akses (Light Mode)

## 📌 Metadata Issue
- **Issue ID:** `ISSUE-LICENSE-DETAIL-04`
- **Epic:** License Management & Hardware Locking (`aksaventra_engine.exe`)
- **Bounded Context:** `src/modules/licenses/`
- **Component / Path:** `src/sections/license-management/`
- **Routes:**
  - `src/app/(protected)/dashboard/licenses/page.tsx`
  - `src/app/(protected)/dashboard/licenses/devices/page.tsx`
  - `src/app/(protected)/dashboard/licenses/revocations/page.tsx`
- **Prioritas:** `High`
- **Status:** `Ready for Development`

---

## 📂 Struktur Direktori Target (Atomic Design Pattern)

```text
src/
└── sections/
    └── license-management/
        ├── atomic/
        │   ├── LicenseMetricCard.tsx
        │   ├── LicenseStatusBadge.tsx
        │   └── SerialKeyBadge.tsx
        ├── molecules/
        │   ├── DeviceResetModal.tsx
        │   ├── LicenseCreateFormView.tsx
        │   ├── LicenseFilterModal.tsx
        │   └── LicenseTableView.tsx
        ├── organisms/
        │   ├── BoundDevicesOrganism.tsx
        │   ├── LicenseCreateOrganism.tsx
        │   ├── LicenseDirectoryOrganism.tsx
        │   └── LicenseRevocationsOrganism.tsx
        └── pages/
            ├── CreateLicensePage.tsx
            ├── LicenseDevicesPage.tsx
            ├── LicenseManagementPage.tsx
            └── LicenseRevocationsPage.tsx
```

---

## 🎯 Detail & Spesifikasi Teknis

### 1. Integrasi API (`useLicenseApi.ts`)
- Mengintegrasikan `useLicenseApi` (`src/modules/licenses/presentation/hooks/useLicenseApi.ts`) pada level *organisms* (`LicenseDirectoryOrganism.tsx`, `BoundDevicesOrganism.tsx`, `LicenseRevocationsOrganism.tsx`).
- Mendukung operasi:
  - Menampilkan detail metadata lisensi (`clientName`, `serialKey` tersamar, `status`, `expiresAt`, `activatedAt`, `lastVerifiedAt`, `engineVersion`).
  - Menampilkan status ikatan perangkat keras (`hwid`) dan mereset ikatan perangkat melalui `DeviceResetModal.tsx`.
  - Mencabut (*revoke* / *suspend*) lisensi yang melanggar kebijakan atau mengalami *Hardware Mismatch*.

### 2. Pemanfaatan Shared UI (`src/shared-ui/component/`)
- Menggunakan `Table`, `Badge`, `Button`, `Card`, `Modal`, `SearchField`, `SelectField`, dan `Pagination` dari `src/shared-ui/component/`.
- Seluruh tampilan menggunakan palet *Light Mode* (`bg-slate-50`, kartu `bg-white`, border `border-slate-200/90`).

---

## 📋 Task Breakdown & Acceptance Criteria

- [x] **1. Atomic (`src/sections/license-management/atomic/`):**
  - [x] `SerialKeyBadge.tsx` menampilkan serial key dengan format monospaced tersamar dan tombol salin.
  - [x] `LicenseStatusBadge.tsx` merender status `ACTIVE` (Emerald), `EXPIRED` (Amber), dan `SUSPENDED` (Rose).
  - [x] `LicenseMetricCard.tsx` merender ringkasan metrik lisensi dan perangkat terikat.
- [x] **2. Molecules (`src/sections/license-management/molecules/`):**
  - [x] `LicenseTableView.tsx` menampilkan daftar lisensi beserta status ikatan HWID dan aksi cepat.
  - [x] `DeviceResetModal.tsx` menampilkan dialog konfirmasi pelepasan ikatan HWID perangkat.
- [x] **3. Organisms & Pages:**
  - [x] `BoundDevicesOrganism.tsx` & `LicenseDevicesPage.tsx` mengelola daftar perangkat yang terikat pada lisensi aktif.
  - [x] Otorisasi aksi mutasi dikunci untuk role `ADMIN` sesuai `Permissions.LICENSES_MANAGE` dan `Permissions.LICENSES_REVOKE`.
