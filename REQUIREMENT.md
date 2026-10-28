# Requirements Specification: Aksaventra Engine Validation & License Management System

## 1. Functional Requirements (FR)

### Modul Validasi Lisensi Klien (`aksaventra_engine.exe`)
- **FR-01 (Engine Validation Endpoints)**:
  Sistem wajib menyediakan API endpoint publik untuk validasi lisensi klien yang kompatibel dengan `aksaventra_engine.exe` (`src/security.rs`):
  - **Endpoint Utama**: `POST /api/v1/validate`
  - **Endpoint Fallback**: `POST /api/v1/validate-key` dan `POST /api/v1/engine/validate`
  - **Payload Permintaan (JSON)**:
    ```json
    {
      "serial_key": "string",
      "hwid": "string",
      "engine_version": "string (opsional)"
    }
    ```

- **FR-02 (4-State Hardware & License State Machine)**:
  Sistem verifikasi lisensi wajib mengevaluasi kondisi deterministik:
  1. *Aktivasi Baru (HTTP 200 OK)*:
     - Serial key valid, status `ACTIVE`, dan belum memiliki pasangan HWID (`hwid == null`).
     - Tindakan: Mengunci HWID perangkat ke database, menerbitkan `vault_secret` terenkripsi dan batas waktu `expires_at`.
  2. *Device Terdaftar (HTTP 200 OK)*:
     - Serial key valid, status `ACTIVE`, dan HWID cocok dengan yang terkunci di database.
     - Tindakan: Mengembalikan respon sukses validasi aktif beserta `vault_secret` dan `expires_at`.
  3. *Invalid / Expired / Revoked (HTTP 401 Unauthorized / HTTP 404 Not Found)*:
     - Serial key tidak ditemukan, berstatus `REVOKED`, atau masa berlaku telah habis.
     - Tindakan: Menolak permintaan dan mencatat percobaan akses tidak sah. Klien otomatis menghapus file lisensi lokal.
  4. *Hardware Mismatch (HTTP 403 Forbidden)*:
     - Serial key valid dan aktif, namun HWID perangkat klien berbeda dengan HWID yang terkunci.
     - Tindakan: Menolak aktivasi dengan pesan penolakan duplikasi lisensi.

- **FR-03 (Format Respon Lisensi Klien)**:
  Respon sukses (HTTP 200 OK) wajib mematuhi skema deserialisasi Rust `LicenseResponse` pada `src/security.rs`:
  ```json
  {
    "valid": true,
    "message": "Lisensi aktif",
    "client_name": "Universitas Aksaventra",
    "vault_secret": "AKSAVENTRA_VAULT_SEED_STRING",
    "expires_at": 1893456000
  }
  ```

### Modul Admin & Manajemen Lisensi
- **FR-04 (Admin-Only License Authority)**:
  Hanya pengguna dengan role **`ADMIN`** yang berhak menerbitkan serial key baru, menentukan nama instansi/klien, mengatur masa berlaku, mereset ikatan HWID, atau mencabut (*revoke*) lisensi melalui halaman terproteksi `/dashboard/licenses`.
- **FR-05 (Registri Integritas Binary Engine - Isu #39)**:
  Sistem menyediakan registri versi binary `aksaventra_engine.exe` untuk memvalidasi hash SHA-256, ukuran file, tanda tangan digital, dan URL download resmi.
- **FR-06 (Audit Log & Tracking)**:
  Setiap percobaan validasi klien wajib dicatat pada `validation_logs` (IP address, User-Agent, status validasi, HWID, timestamp), dan setiap aktivitas mutasi data admin dicatat pada `audit_logs`.

### Edge Gateway & Routing
- **FR-07 (Edge Gateway Proxy `src/proxy.ts`)**:
  Sistem mengimplementasikan `src/proxy.ts` sebagai filter gerbang request Next.js yang memvalidasi otentikasi sesi dashboard, melakukan bypass pada aset statis, serta menginjeksi header keamanan (`x-engine-license-key`, `x-auth-*`) ke downstream handler.

---

## 2. Non-Functional Requirements (NFR)

- **NFR-01 (Kinerja & Waktu Respon)**:
  - Waktu respon API validasi lisensi klien (`POST /api/v1/validate`) harus berada dalam rata-rata $< 200\text{ ms}$.
  - Kolom pencarian `serialKey` dan `hwid` pada database PostgreSQL wajib memiliki indeks unik untuk mempercepat proses lookup.
- **NFR-02 (Keamanan & Kriptografi)**:
  - Menggunakan algoritma **Argon2id** untuk hashing kata sandi akun administratif.
  - Menggunakan pustaka standar modern **`jose`** untuk penandatanganan dan verifikasi token sesi JWT.
  - Komunikasi klien-server wajib melalui HTTPS.
- **NFR-03 (Hexagonal Architecture & Clean Code)**:
  - Sistem mengadopsi struktur direktori Hexagonal Architecture yang memisahkan:
    - Kernel Inti: `src/core/application`, `src/core/domain`, `src/core/http`, `src/core/infrastructure`, `src/core/libs`, `src/core/shared`.
    - Bounded Contexts: `src/modules/[feature-plural]/` (`auth`, `licenses`, `engines`).
    - Atomic UI Sections: `src/sections/[feature-kebab]/` (`atomic`, `molecules`, `organisms`, `pages`).
  - Aliran data wajib memanfaatkan monad `Result<T, E>` (*Railway-Oriented Programming*).
  - **Zero Barrel Files**: Dilarang menggunakan re-export `index.ts` atau `index.tsx` di seluruh codebase.
- **NFR-04 (Testability & Code Coverage)**:
  - Menerapkan metodologi **Test-Driven Development (TDD)** dengan struktur pengujian **Triple A (Arrange, Act, Assert)** menggunakan Vitest.
  - Cakupan unit test minimal $80\%$ untuk seluruh Use Case, Repositori, dan Security Guards.
- **NFR-05 (Prisma ORM 7 & Database Seeding)**:
  - Skema database dikelola melalui Prisma v7 ORM (`prisma/schema.prisma`).
  - Seeding data awal diorganisasi secara modular pada `prisma/seed/` (`data/`, `lib/`, `logs/`, `seeders/`, `seed.ts`).