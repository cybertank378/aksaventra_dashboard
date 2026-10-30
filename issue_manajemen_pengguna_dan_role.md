# feat(users): Modul Manajemen Pengguna, Role RBAC, & Sesi Keamanan (`/dashboard/users`) (Hexagonal + Atomic Design, Light Mode)

## 📌 Metadata

* **Issue ID:** `ISSUE-010`
* **Epic:** System Administration & Access Control (`Administrasi`)
* **Bounded Context:** `src/modules/users/` (Modul Baru)
* **UI Section:** `src/sections/user-management/` (Section Baru)
* **Protected Page Route:** `src/app/(protected)/dashboard/users/page.tsx`
* **Target API Routes (Admin User Management):**
  * `GET /api/v1/users` (Daftar pengguna berpaginasi, pencarian, filter role & status akun)
  * `POST /api/v1/users` (Pembuatan akun internal baru: `ADMIN`, `OPERATOR`, `AUDITOR` + hash Argon2 + `AuditLog`)
  * `GET /api/v1/users/stats` (Metrik 4 kartu KPI: Total Pengguna, Pengguna Aktif, Terkunci/Suspended, Distribusi Role)
  * `GET /api/v1/users/[id]` (Detail pengguna + sesi aktif `UserSession` + 10 riwayat login terakhir `LoginAudit`)
  * `PATCH /api/v1/users/[id]` (Pembaruan profil nama, email, dan role RBAC + `AuditLog`)
  * `PATCH /api/v1/users/[id]/status` (Aktivasi / pembekuan akun `isActive` & buka kunci `lockedUntil` + cabut sesi aktif)
  * `POST /api/v1/users/[id]/revoke-sessions` (Pencabutan paksa seluruh sesi login aktif pengguna + `AuditLog`)
* **Permission RBAC:** `USERS_MANAGE` (Eksklusif untuk Role `ADMIN`)
* **Requirement Terkait:** FR-04, FR-06, NFR-02, NFR-03, NFR-04 (`REQUIREMENT.md` & `issue_sidebar_menu.md`)
* **Priority:** High
* **Status:** Ready for Development

---

## 🔍 Audit Kode Saat Ini & Konteks Masalah (Problem Statement)

Berdasarkan hasil pemeriksaan pada basis kode `aksaventra_dashboard-dev`:

1. **Menu & Permission Sudah Didefinisikan, Namun Route Belum Ada:**
   * Pada `src/security/Permissions.ts`, `src/security/policyEngine.ts`, dan `src/security/sidebar/getSidebarMenu.ts`, izin `USERS_MANAGE` serta menu **Pengguna & Role (`/dashboard/users`)** telah terdaftar untuk role `ADMIN`.
   * Namun file `src/app/(protected)/dashboard/users/page.tsx`, modul `src/modules/users/`, endpoint `src/app/api/v1/users/**`, serta section `src/sections/user-management/` belum dibuat (menghasilkan `404 Not Found` saat diakses dari Sidebar).
2. **Model Database `User`, `UserSession`, `LoginAudit`, dan `AuditLog` Sudah Siap di Prisma:**
   * `prisma/schema.prisma` telah memiliki model `User` (dengan enum `UserRole: ADMIN | OPERATOR | AUDITOR`, status `isActive`, `emailVerifiedAt`, `failedLoginAttempts`, `lockedUntil`, `lastLoginAt`), relasi ke `UserSession`, `LoginAudit`, dan `AuditLog`.
   * Seeder `prisma/seed/data/adminUsers.data.ts` juga telah menyiapkan akun awal untuk masing-masing role.
3. **Kebutuhan Operasional & Keamanan Enterprise:**
   * Administrator utama memerlukan antarmuka terpusat untuk menambahkan akun personel baru (`OPERATOR` atau `AUDITOR`), mengubah hak akses (`Role`), membuka kunci akun yang terblokir akibat batas *brute-force* (`AccountLockRule`), menonaktifkan akun personel yang sudah tidak bertugas, serta mencabut paksa sesi perangkat aktif (`UserSession`).

---

## 🎨 Spesifikasi Desain UI & Detail Halaman (Light Mode)

> [!IMPORTANT]
> Seluruh halaman dan modal pada `src/sections/user-management/` **WAJIB menggunakan Light Mode** (`bg-slate-50`, permukaan kartu `bg-white`, border `border-slate-200/90`) dan wajib menggunakan komponen dari `src/shared-ui/component/` (termasuk `RoleBadge.tsx`, `Avatar.tsx`, `Table.tsx`, `Modal.tsx`, `Switch.tsx`, `Badge.tsx`).

### 1. Token Visual & Komponen Status

| Komponen / Status | Variasi / Kelas Tailwind | Keterangan |
| :--- | :--- | :--- |
| **Role `ADMIN`** | Menggunakan `src/shared-ui/component/RoleBadge.tsx` | Full Access (Seluruh modul & konfigurasi) |
| **Role `OPERATOR`** | Menggunakan `src/shared-ui/component/RoleBadge.tsx` | Operasional Lisensi, Perangkat HWID & Monitor |
| **Role `AUDITOR`** | Menggunakan `src/shared-ui/component/RoleBadge.tsx` | Read-Only Audit Trail, Log Validasi & Dasbor |
| **Status `Aktif`** | `Badge` variant `success` (`emerald`) | `isActive === true` dan tidak sedang terkunci |
| **Status `Terkunci (Locked)`** | `Badge` variant `warning` (`amber`) | `lockedUntil !== null && lockedUntil > now` |
| **Status `Nonaktif`** | `Badge` variant `error` (`rose`) | `isActive === false` |

### 2. Anatomi Tata Letak Halaman `/dashboard/users`

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ AppTopbar: Dasbor / Administrasi / Pengguna & Role                       [ADMIN] [Avatar]  │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ HEADER HALAMAN                                                                             │
│ Manajemen Pengguna & Kontrol Akses (RBAC)           [↻ Segarkan] [+ Tambah Pengguna Baru]  │
│ Kelola akun administrator, operator, auditor, kebijakan kunci akun, dan sesi perangkat     │
├────────────────────┬────────────────────┬──────────────────────┬───────────────────────────┤
│ KPI 1              │ KPI 2              │ KPI 3                │ KPI 4                     │
│ Total Pengguna     │ Akun Aktif         │ Akun Terkunci / Beku │ Sesi Perangkat Aktif      │
│ 8 Personel         │ 6 Aktif            │ 2 Terkunci/Nonaktif  │ 5 Sesi Login              │
├────────────────────┴────────────────────┴──────────────────────┴───────────────────────────┤
│ KARTU DIREKTORI PENGGUNA (Card bg-white rounded-2xl p-6)                                   │
│ Tab Role: [Semua (8)] [Admin (2)] [Operator (4)] [Auditor (2)]                             │
│ Filter Bar: [🔍 Cari nama atau email...] [Status Akun ▾]                                   │
│ ────────────────────────────────────────────────────────────────────────────────────────── │
│ Pengguna & Email     │ Role RBAC │ Status Akun │ Sesi Aktif │ Login Terakhir │ Aktif │ Aksi│
│ [MF] M. Fahd Indrawan│ ADMIN     │ ● Aktif     │ 2 Perangkat│ 30 Okt, 08:05  │ [●]   │ 🔍 ✏️│
│      admin@aksa...   │           │             │            │                │       │     │
│ [RN] Rina N.         │ OPERATOR  │ ⚠ Terkunci  │ 0 Perangkat│ 29 Okt, 21:14  │ [●]   │ 🔓 🔍│
│      rina@aksa...    │           │ (5x gagal)  │            │                │       │     │
│ ────────────────────────────────────────────────────────────────────────────────────────── │
│ Menampilkan 1–8 dari 8 pengguna terdaftar                             ‹ Sblm [1] Brkt ›    │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3. Modal & Drawer Interaktif pada Halaman `/dashboard/users`

1. **Modal Tambah / Edit Pengguna (`UserFormModal.tsx`):**
   * Input: `Nama Lengkap`, `Alamat Email Korporat`, `Role RBAC` (`ADMIN`, `OPERATOR`, `AUDITOR`), `Kata Sandi Awal` (khusus mode tambah baru, tervalidasi `PasswordPolicyRule`), serta opsi checkbox `Verifikasi email otomatis`.
   * Menampilkan ringkasan matriks hak akses di bawah pilihan Role agar Administrator memahami izin yang diberikan.
2. **Modal Inspeksi Detail Pengguna & Sesi Keamanan (`UserDetailModal.tsx`):**
   * **Tab 1 — Profil & Status Keamanan:** Menampilkan metadata akun, jumlah percobaan login gagal (`failedLoginAttempts`), status `lockedUntil` dengan tombol **Buka Kunci Akun (Unlock)**, serta status verifikasi email.
   * **Tab 2 — Sesi Perangkat Aktif (`UserSession`):** Menampilkan daftar sesi login aktif (IP Address, User-Agent/OS, Waktu dibuat, Kedaluwarsa) beserta tombol **Cabut Semua Sesi Paksa (Force Logout All)**.
   * **Tab 3 — Riwayat Audit Login (`LoginAudit`):** Menampilkan 10 aktivitas autentikasi terakhir pengguna tersebut (`SUCCESS` / `FAILED`, IP Address, alasan gagal).

---

## 🏗️ Arsitektur Modul & Struktur Direktori

Mematuhi aturan **Hexagonal Architecture**, **Atomic Design**, dan **Zero Barrel Files** (Dilarang membuat file `index.ts` atau `index.tsx`):

```text
src/
├── app/
│   ├── (protected)/
│   │   └── dashboard/
│   │       └── users/
│   │           └── page.tsx                                  # Protected Route /dashboard/users
│   └── api/
│       └── v1/
│           └── users/
│               ├── _factory.ts                               # DI Assembler untuk UserAdminController
│               ├── route.ts                                  # GET (list paginated) & POST (create user)
│               ├── stats/
│               │   └── route.ts                              # GET 4 metrik KPI pengguna & sesi
│               └── [id]/
│                   ├── route.ts                              # GET detail user, PATCH update profil/role
│                   ├── status/
│                   │   └── route.ts                          # PATCH toggle isActive / unlock akun
│                   └── revoke-sessions/
│                       └── route.ts                          # POST cabut seluruh sesi aktif pengguna
│
├── modules/
│   └── users/
│       ├── application/
│       │   ├── services/
│       │   │   └── UserServices.ts                           # Orkestrator UseCase (extends BaseService)
│       │   └── usecase/
│       │       ├── ListUsersUseCase.ts                       # Paginasi + filter role, status, search
│       │       ├── GetUserStatsUseCase.ts                    # 4 KPI (Total, Active, Locked/Inactive, Active Sessions)
│       │       ├── GetUserDetailUseCase.ts                   # Detail user + active sessions + recent login audits
│       │       ├── CreateUserUseCase.ts                      # Hash password via ArgonProvider + simpan + AuditLog
│       │       ├── UpdateUserUseCase.ts                      # Update nama/email/role + cegah self-demotion + AuditLog
│       │       ├── UpdateUserStatusUseCase.ts                # Toggle isActive / unlock akun + cegah self-lockout + AuditLog
│       │       └── RevokeUserSessionsUseCase.ts              # Hapus/cabut seluruh UserSession milik userId + AuditLog
│       ├── domain/
│       │   ├── builders/
│       │   │   └── UserQueryBuilder.ts                       # Filter role, status (ACTIVE/LOCKED/INACTIVE), search
│       │   ├── dto/
│       │   │   ├── UserRequestDTO.ts                         # ListUsersQueryDTO, CreateUserDTO, UpdateUserDTO, UpdateUserStatusDTO
│       │   │   └── UserResponseDTO.ts                        # UserAdminItemDTO, UserStatsDTO, UserDetailDTO
│       │   ├── entity/
│       │   │   └── ManagedUserEntity.ts                      # Domain entity dengan helper isLocked(now), canBeModifiedBy(actorId)
│       │   ├── interfaces/
│       │   │   └── UserInterfaces.ts                         # UserRepositoryInterface (port)
│       │   ├── mapper/
│       │   │   └── UserMapper.ts                             # Pemetaan Prisma → DTO (TANPA passwordHash)
│       │   └── rules/
│       │       └── SelfProtectionRule.ts                     # Mencegah admin menonaktifkan atau menurunkan role dirinya sendiri
│       ├── infrastructure/
│       │   ├── http/
│       │   │   └── UserAdminController.ts                    # Extends BaseController
│       │   ├── repo/
│       │   │   └── UserRepository.ts                         # Satu-satunya tempat pemanggilan Prisma di modul users
│       │   └── validators/
│       │       └── user.validator.ts                         # Skema Zod untuk list query, create, update, status
│       ├── presentation/
│       │   ├── helpers/
│       │   │   └── userViewFormatters.ts                     # Inisial nama, deskripsi izin role, format waktu login
│       │   └── hooks/
│       │       └── useUserApi.ts                             # Custom hook berbasis useApiExecutor
│       ├── shared/
│       │   └── constants/
│       │       └── userConstants.ts                          # DEFAULT_USER_PAGE_LIMIT = 10, ROLE_DESCRIPTIONS
│       └── tests/
│           ├── mocks/
│           │   └── mockUserFactories.ts
│           ├── domain/
│           │   ├── SelfProtectionRule.test.ts
│           │   └── UserQueryBuilder.test.ts
│           ├── application/
│           │   ├── ListUsersUseCase.test.ts
│           │   ├── CreateUserUseCase.test.ts
│           │   ├── UpdateUserUseCase.test.ts
│           │   ├── UpdateUserStatusUseCase.test.ts
│           │   └── RevokeUserSessionsUseCase.test.ts
│           └── infrastructure/
│               ├── UserAdminController.test.ts
│               └── UserValidator.test.ts
│
└── sections/
    └── user-management/
        ├── atomic/
        │   ├── UserStatusBadge.tsx                           # Badge Aktif (emerald), Terkunci (amber), Nonaktif (rose)
        │   ├── ActiveSessionCounterChip.tsx                  # Chip jumlah perangkat/sesi aktif
        │   └── RolePermissionSummaryBox.tsx                  # Kotak info hak akses berdasarkan pilihan Role
        ├── molecules/
        │   ├── UserStatsGrid.tsx                             # 4 Kartu KPI pengguna & sesi
        │   ├── UserFilterBar.tsx                             # ToggleGroup tab Role + SearchField + SelectField status
        │   ├── UserTableView.tsx                             # Tabel pengguna menggunakan shared-ui Table, Avatar, RoleBadge, Switch
        │   ├── UserFormModal.tsx                             # Modal Tambah / Edit Pengguna
        │   └── UserDetailModal.tsx                           # Modal Inspeksi Detail, Sesi Aktif & Riwayat Login
        ├── organisms/
        │   └── UserDirectoryOrganism.tsx                     # Orkestrasi state, modal, dan integrasi useUserApi.ts
        └── pages/
            └── UserManagementPage.tsx                        # Diimpor oleh src/app/(protected)/dashboard/users/page.tsx
```

---

## 🔌 Spesifikasi Kontrak REST API & `useUserApi.ts`

### 1. Daftar Endpoint (`/api/v1/users/**`)

| Method | Endpoint | Controller Method | Izin RBAC | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | `UserAdminController.list` | `USERS_MANAGE` | Daftar pengguna dengan query `page`, `limit`, `search`, `role` (`ALL`\|`ADMIN`\|`OPERATOR`\|`AUDITOR`), `accountState` (`ALL`\|`ACTIVE`\|`LOCKED`\|`INACTIVE`) |
| `GET` | `/api/v1/users/stats` | `UserAdminController.getStats` | `USERS_MANAGE` | Mengambil 4 KPI (`totalUsers`, `activeUsers`, `lockedOrInactiveUsers`, `activeSessionsCount`) + hitungan per role |
| `GET` | `/api/v1/users/[id]` | `UserAdminController.getDetail` | `USERS_MANAGE` | Mengambil detail pengguna beserta daftar `activeSessions` dan 10 `recentLoginAudits` |
| `POST` | `/api/v1/users` | `UserAdminController.create` | `USERS_MANAGE` | Membuat pengguna baru, melakukan hash password dengan `ArgonProvider`, dan mencatat `AuditLog` (`USER_CREATED`) |
| `PATCH` | `/api/v1/users/[id]` | `UserAdminController.update` | `USERS_MANAGE` | Memperbarui `name`, `email`, atau `role` pengguna (dilindungi `SelfProtectionRule`) + mencatat `AuditLog` (`USER_UPDATED`) |
| `PATCH` | `/api/v1/users/[id]/status` | `UserAdminController.updateStatus` | `USERS_MANAGE` | Mengubah `isActive` atau mereset `lockedUntil = null` & `failedLoginAttempts = 0` + mencatat `AuditLog` (`USER_STATUS_UPDATED`) |
| `POST` | `/api/v1/users/[id]/revoke-sessions` | `UserAdminController.revokeSessions` | `USERS_MANAGE` | Menghapus seluruh sesi aktif pengguna di tabel `user_sessions` + mencatat `AuditLog` (`USER_SESSIONS_REVOKED`) |

### 2. Kontrak DTO Respons (`UserResponseDTO.ts`)

```typescript
export type UserAccountState = "ACTIVE" | "LOCKED" | "INACTIVE";

export interface UserAdminItemDTO {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR" | "AUDITOR";
  isActive: boolean;
  accountState: UserAccountState;
  isEmailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  activeSessionsCount: number;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UserStatsResponseDTO {
  totalUsers: number;
  activeUsers: number;
  lockedOrInactiveUsers: number;
  activeSessionsCount: number;
  roleCounts: {
    ADMIN: number;
    OPERATOR: number;
    AUDITOR: number;
  };
}

export interface UserDetailResponseDTO extends UserAdminItemDTO {
  activeSessions: Array<{
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    deviceInfo: string | null;
    createdAt: string;
    expiresAt: string;
  }>;
  recentLoginAudits: Array<{
    id: string;
    status: string;
    ipAddress: string | null;
    userAgent: string | null;
    failureReason: string | null;
    createdAt: string;
  }>;
}
```

---

## 🔐 Aturan Keamanan & Bisnis Inti (`SelfProtectionRule` & Audit)

1. **Zero Password Hash Exposure:**
   * `UserMapper` **dilarang keras** menyertakan kolom `passwordHash` atau token sesi mentah pada respons DTO apa pun.
2. **Aturan Perlindungan Diri (`SelfProtectionRule.ts`):**
   * Administrator yang sedang login (`actorUserId === targetUserId`) **tidak boleh** menonaktifkan akunnya sendiri (`isActive = false`) atau menurunkan rolenya sendiri dari `ADMIN` menjadi `OPERATOR`/`AUDITOR` guna mencegah terkuncinya sistem tanpa administrator (*system-wide admin lockout*).
   * Sistem juga wajib memastikan minimal selalu tersisa **1 akun `ADMIN` aktif** di dalam database.
3. **Pencabutan Sesi Otomatis saat Akun Dinonaktifkan:**
   * Ketika `UpdateUserStatusUseCase` mengubah status pengguna menjadi `isActive = false`, seluruh baris `UserSession` milik pengguna tersebut wajib langsung dihapus dalam satu transaksi Prisma (`prisma.$transaction`) agar token aksesnya segera gugur.
4. **Integrasi `policyEngine.ts` & `getSidebarMenu.ts`:**
   * Pastikan rute `/dashboard/users` dan `/api/v1/users` dipetakan ke izin `USERS_MANAGE` pada `src/security/policyEngine.ts`.
   * Pastikan item menu **Pengguna & Role** (`/dashboard/users`) tampil di `src/security/sidebar/getSidebarMenu.ts` di bawah grup **SISTEM & ADMINISTRASI**.

---

## 📋 Rencana Kerja (Task Checklist)

### Phase 1 — Kontrak Domain & Rules (`src/modules/users/domain/`)
* [ ] Buat `UserRequestDTO.ts`, `UserResponseDTO.ts`, `UserInterfaces.ts`, dan `userConstants.ts`.
* [ ] Implementasikan `ManagedUserEntity.ts` dan `SelfProtectionRule.ts` (validasi pencegahan *self-lockout*, *self-demotion*, dan *last-admin protection*).
* [ ] Implementasikan `UserQueryBuilder.ts` dan `UserMapper.ts`.

### Phase 2 — TDD Use Cases & Application Services (`src/modules/users/application/`)
* [ ] **RED:** Tulis unit test menggunakan pola **Triple A (Arrange-Act-Assert)**:
  * `SelfProtectionRule.test.ts` & `UserQueryBuilder.test.ts`
  * `ListUsersUseCase.test.ts`
  * `CreateUserUseCase.test.ts` (memastikan email duplikat ditolak, password di-hash dengan `PasswordHasherInterface`, dan `AuditLog` tercatat)
  * `UpdateUserUseCase.test.ts` (memastikan perubahan role valid dan `SelfProtectionRule` ditegakkan)
  * `UpdateUserStatusUseCase.test.ts` (memastikan `isActive=false` mencabut sesi aktif & *unlock* mereset `failedLoginAttempts = 0`)
  * `RevokeUserSessionsUseCase.test.ts`
* [ ] **GREEN:** Implementasikan seluruh Use Case dan orkestrator `UserServices.ts`.

### Phase 3 — Infrastructure, Repository & Next.js API Routes
* [ ] Implementasikan `UserRepository.ts` menggunakan Prisma Client (`user`, `userSession`, `loginAudit`, `auditLog`).
* [ ] Implementasikan `user.validator.ts` (Zod) dan `UserAdminController.ts`.
* [ ] Buat assembler `src/app/api/v1/users/_factory.ts` (menginjeksi `UserRepository` dan `ArgonProvider` dari modul `auth`).
* [ ] Buat 4 route handlers di `src/app/api/v1/users/**`.
* [ ] Perbarui `src/security/policyEngine.ts` dan `src/security/sidebar/getSidebarMenu.ts`.

### Phase 4 — Hook Presentation & Atomic UI (`src/sections/user-management/`)
* [ ] Buat `useUserApi.ts` (`fetchUsers`, `fetchUserStats`, `fetchUserDetail`, `createUser`, `updateUser`, `updateUserStatus`, `revokeUserSessions`).
* [ ] Buat komponen **Atomic**: `UserStatusBadge.tsx`, `ActiveSessionCounterChip.tsx`, `RolePermissionSummaryBox.tsx`.
* [ ] Buat komponen **Molecules**: `UserStatsGrid.tsx`, `UserFilterBar.tsx`, `UserTableView.tsx`, `UserFormModal.tsx`, `UserDetailModal.tsx`.
* [ ] Buat komponen **Organism**: `UserDirectoryOrganism.tsx` dengan *named event handlers* (`handleSearchChange`, `handleRoleTabChange`, `handleOpenCreateModal`, `handleOpenEditModal`, `handleOpenDetailModal`, `handleToggleStatus`, `handleUnlockAccount`, `handleRevokeSessions`).
* [ ] Buat **Page**: `UserManagementPage.tsx` dan hubungkan ke `src/app/(protected)/dashboard/users/page.tsx`.

### Phase 5 — Pengujian & Quality Gates
* [ ] Tambahkan unit test `UserAdminController.test.ts`, `UserValidator.test.ts`, serta perbarui `policyEngine.test.ts` dan `getSidebarMenu.test.ts`.
* [ ] Jalankan seluruh pemeriksaan kualitas kode hingga lulus 100%.

---

## ✅ Kriteria Penerimaan (Acceptance Criteria)

* [ ] Mengakses `/dashboard/users` sebagai `ADMIN` menampilkan halaman Manajemen Pengguna & Role dalam **Light Mode** dengan 4 kartu KPI, filter tab Role (`Semua`, `Admin`, `Operator`, `Auditor`), pencarian nama/email, dan tabel pengguna berpaginasi.
* [ ] Pengguna dengan role `OPERATOR` atau `AUDITOR` tidak melihat menu **Pengguna & Role** di Sidebar dan ditolak (`403 Forbidden`) jika mengakses `/dashboard/users` atau `/api/v1/users/**`.
* [ ] Administrator dapat membuat akun baru (`ADMIN`/`OPERATOR`/`AUDITOR`), mengubah role pengguna lain, membuka kunci akun yang terblokir (`lockedUntil`), menonaktifkan akun, serta mencabut seluruh sesi perangkat aktif dari `UserDetailModal`.
* [ ] Percobaan menonaktifkan atau menurunkan role akun `ADMIN` milik diri sendiri ditolak secara aman oleh `SelfProtectionRule` dengan pesan error yang jelas.
* [ ] Seluruh aksi mutasi (`create`, `update`, `status`, `revoke-sessions`) tercatat ke tabel `audit_logs` dan langsung terlihat pada panel Riwayat Aktivitas di Dasbor.
* [ ] Mematuhi prinsip **Hexagonal Architecture**, **Atomic Design**, **Shared-UI Components**, **Named Event Handlers**, dan **Zero Barrel Files**.
* [ ] **Quality Gates:**
  * [ ] `npx vitest run` → 100% lulus, coverage modul `users` ≥ 80%.
  * [ ] `npx tsc --noEmit` → 0 error TypeScript.
  * [ ] `npx @biomejs/biome check src/` → 0 error & 0 warning.