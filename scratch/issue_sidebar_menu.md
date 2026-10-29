# feat(ui): perancangan dan implementasi struktur menu navigasi sidebar untuk license management & engine validation

## 📌 Ringkasan Masalah & Kebutuhan (Context & Problem Statement)

Aplikasi **Aksaventra Dashboard** merupakan sistem pengendali utama untuk otentikasi lisensi resmi klien binary `aksaventra_engine` berbasis penguncian perangkat (*Hardware ID / HWID Locking*) serta pemantauan keamanan integritas engine.

Namun saat ini, definisi navigasi sidebar pada `src/security/sidebar/getSidebarMenu.ts` masih bersifat dasar dan belum merefleksikan domain inti sistem:
1. **Belum ada grup menu Manajemen Lisensi**: Pengelolaan lisensi (penerbitan kunci serial, peninjauan status lisensi, reset ikatan HWID perangkat klien, dan riwayat penangguhan/revokasi) belum memiliki jalur navigasi resmi.
2. **Belum ada pemisahan peran izin (RBAC) granular untuk lisensi**: File `src/security/Permissions.ts` belum memiliki izin spesifik seperti `LICENSES_VIEW`, `LICENSES_CREATE`, `LICENSES_MANAGE`, dan `LICENSES_REVOKE`.
3. **Hirarki dan pengelompokan belum terstruktur**: Komponen `RecursiveSidebarItem.tsx` telah mendukung accordion bertingkat (`children?: SidebarItem[]`), namun belum dimanfaatkan secara optimal untuk menyusun fitur-fitur operasional lisensi dan audit validasi.

Diperlukan perancangan dan implementasi struktur menu sidebar yang modular, intuitif, berorientasi domain, dan terikat ketat dengan aturan keamanan (RBAC) pada kernel sistem.

---

## 🧭 Arsitektur Informasi & Hirarki Menu Sidebar yang Diusulkan

Struktur menu dibagi menjadi 5 kelompok domain fungsional yang logis:

```
├── IKHTISAR (Overview)
│   └── 📊 Dashboard (/dashboard)
│
├── MANAJEMEN LISENSI (License Management) [CORE DOMAIN]
│   ├── 🔑 Semua Lisensi (/dashboard/licenses)
│   ├── ➕ Terbitkan Lisensi (/dashboard/licenses/create)
│   ├── 💻 Perangkat Terikat (HWID) (/dashboard/licenses/devices)
│   └── 🚫 Blacklist & Revokasi (/dashboard/licenses/revocations)
│
├── ENGINE & VALIDASI (Engine Telemetry & Integrity)
│   ├── 📡 Live Validation Monitor (/dashboard/engine/monitor)
│   └── 🛡️ Integritas Binary (SHA-256) (/dashboard/engine/integrity)
│
├── AUDIT & LOGS (Security & Audit Trail)
│   ├── 📜 Log Validasi Mesin (/dashboard/logs/validations)
│   └── 🕒 Log Aktivitas Admin (/dashboard/logs/audit)
│
└── ADMINISTRASI (System Administration)
    ├── 👥 Pengguna & Role (/dashboard/users)
    └── ⚙️ Pengaturan & Kebijakan (/dashboard/settings)
```

### Rincian Spesifikasi Menu Item:

| Grup | Menu Item | Rute Path | Ikon (Lucide) | Izin (Permission) | Deskripsi Fungsional |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ikhtisar** | Dashboard | `/dashboard` | `LayoutDashboard` | `DASHBOARD_VIEW` | Ringkasan metrik lisensi aktif, rasio validasi sukses vs gagal, grafik aktivitas harian. |
| **Manajemen Lisensi** | Semua Lisensi | `/dashboard/licenses` | `KeyRound` | `LICENSES_VIEW` | Tabel utama direktori lisensi: status (ACTIVE/EXPIRED/SUSPENDED/REVOKED), filter tier, masa berlaku, dan pencarian serial key. |
| | Terbitkan Lisensi | `/dashboard/licenses/create` | `PlusCircle` / `KeyRound` | `LICENSES_CREATE` | Form pembuatan serial key baru, penentuan masa aktif, tier (Trial/Pro/Enterprise), kuota perangkat, dan data klien. |
| | Perangkat Terikat | `/dashboard/licenses/devices` | `Laptop` / `Cpu` | `LICENSES_MANAGE` | Manajemen perangkat klien yang terikat HWID. Fitur krusial untuk reset binding HWID jika klien melakukan pergantian mesin. |
| | Blacklist & Revokasi | `/dashboard/licenses/revocations` | `ShieldAlert` | `LICENSES_REVOKE` | Daftar serial key yang dibekukan atau dicabut permanen akibat pelanggaran integritas engine atau masa sewa berakhir. |
| **Engine & Validasi** | Live Monitor | `/dashboard/engine/monitor` | `Activity` | `ENGINE_VALIDATE` | Real-time telemetry feed yang menampilkan request validasi live dari `aksaventra_engine` (identifikasi HWID match vs mismatch). |
| | Integritas Binary | `/dashboard/engine/integrity` | `ShieldCheck` | `ENGINE_VALIDATE` | Pemantauan checksum SHA-256 binary engine (`aksaventra_engine.exe`) sesuai kepatuhan Issue #39 untuk mencegah modifikasi ilegal. |
| **Audit & Logs** | Log Validasi | `/dashboard/logs/validations` | `FileText` | `LOGS_VIEW` | Rekam jejak seluruh riwayat respon API `/api/v1/validate` (status 200, 401, 403, 404). |
| | Log Audit Admin | `/dashboard/logs/audit` | `History` | `LOGS_VIEW` | Catatan audit trail tindakan administratif (pembuatan lisensi, perubahan status, pergantian role pengguna). |
| **Administrasi** | Pengguna | `/dashboard/users` | `Users` | `USERS_MANAGE` | Manajemen akun operator, admin, dan auditor beserta hak akses RBAC. |
| | Pengaturan | `/dashboard/settings` | `Settings` | `SETTINGS_MANAGE` | Konfigurasi master secret seed engine, kebijakan rotasi token, dan threshold batas request validasi. |

---

## 🔐 Pembaruan Kontrak Izin (Permissions & RBAC)

Perluasan konstanta izin pada `src/security/Permissions.ts`:

```typescript
export type Permission =
  | "DASHBOARD_VIEW"
  | "LICENSES_VIEW"
  | "LICENSES_CREATE"
  | "LICENSES_MANAGE"
  | "LICENSES_REVOKE"
  | "ENGINE_VALIDATE"
  | "ENGINE_REGISTER"
  | "ENGINE_REVOKE"
  | "LOGS_VIEW"
  | "USERS_MANAGE"
  | "SETTINGS_MANAGE";
```

### Matriks Akses Berdasarkan Role (`UserRole`):
1. **`ADMIN`**:
   - Memiliki akses penuh (100%) ke seluruh kelompok menu dan aksi modifikasi/revokasi.
2. **`OPERATOR`**:
   - Akses: Ikhtisar, Semua Lisensi, Terbitkan Lisensi, Perangkat Terikat, Live Monitor, dan Log Validasi.
   - Dibatasi: Tidak dapat mengakses Manajemen Pengguna dan Kebijakan Sistem tingkat lanjut.
3. **`AUDITOR`**:
   - Akses Read-Only: Ikhtisar, Semua Lisensi (tanpa tombol aksi edit/revoke), Integritas Binary, Log Validasi, dan Log Audit Admin.

---

## 🏗️ Kepatuhan Arsitektur Frontend & Atomic Design

Implementasi halaman yang terhubung ke menu ini wajib mematuhi panduan `AGENTS.md`:
1. **Atomic Structure**:
   - Komponen halaman diletakkan pada `src/sections/[feature-kebab]/`:
     - `src/sections/license-management/` (`atomic/`, `molecules/`, `organisms/`, `pages/`)
     - `src/sections/engine-validation/`
     - `src/sections/audit-logs/`
2. **Shared UI Components**:
   - Menggunakan komponen dari `src/shared-ui/component/` dan `src/shared-ui/layout/` tanpa elemen native HTML mentah.
3. **Kebijakan Zero Barrel Files**:
   - Dilarang membuat re-export `index.ts` atau `index.tsx`. Semua import wajib mengarah langsung ke berkas spesifik.
4. **Data Fetching via Hooks**:
   - Mengintegrasikan pemanggilan API menggunakan hook terstandarisasi seperti `useLicenseApi.ts` via `useApiExecutor`.

---

## 📋 Rencana Kerja (Task Checklist)

- [ ] **Phase 1: Kontrak Izin & Konfigurasi Menu**
  - [ ] Tambahkan izin lisensi (`LICENSES_VIEW`, `LICENSES_CREATE`, `LICENSES_MANAGE`, `LICENSES_REVOKE`) ke `src/security/Permissions.ts`.
  - [ ] Update role policy matrix pada `src/security/policyEngine.ts` untuk mengizinkan role terkait.
  - [ ] Perbarui `src/security/sidebar/getSidebarMenu.ts` dengan struktur 5 grup di atas menggunakan ikon `lucide-react`.
- [ ] **Phase 2: Rute Dashboard & Atomic Pages Container**
  - [ ] Buat page route Next.js App Router di `src/app/(protected)/dashboard/licenses/page.tsx`.
  - [ ] Buat page route sub-fitur: `/create`, `/devices`, `/revocations`.
  - [ ] Buat page route monitor engine di `src/app/(protected)/dashboard/engine/page.tsx`.
- [ ] **Phase 3: Komponen Atomic Sections**
  - [ ] Implementasikan `src/sections/license-management/` (tabel lisensi, modal filter, form penerbitan lisensi, device reset modal).
- [ ] **Phase 4: Pengujian & Quality Gates**
  - [ ] Unit test untuk pemfilteran menu berdasarkan role (`getSidebarMenu.test.ts`).
  - [ ] Verifikasi izin guard (`policyEngine.test.ts`).
  - [ ] Lolos 100% Quality Gates: `npx vitest run`, `npx tsc --noEmit`, `npx @biomejs/biome check src/`.

---

## ✅ Kriteria Penerimaan (Acceptance Criteria)

- [ ] Navigasi sidebar menampilkan menu Manajemen Lisensi yang lengkap dan mudah diakses.
- [ ] Menu terfilter secara otomatis sesuai hak akses dan role pengguna (Admin, Operator, Auditor).
- [ ] Tautan aktif (active path) memiliki visual state yang jelas dan mendukung collapsible accordions untuk sub-menu.
- [ ] Tampilan responsif pada perangkat mobile (drawer/sidebar toggle) dan desktop.
- [ ] Kepatuhan arsitektur (Clean Architecture, Atomic Design, Zero Barrel Files).
