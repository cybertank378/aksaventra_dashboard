# Aksaventra Engine Validation & License Management Portal

Sistem Manajemen Lisensi Terpusat, Validasi Biner Portabel, dan Portal Keamanan Administratif untuk ekosistem **Aksaventra Portable Engine** (`aksaventra_engine.exe`).

---

## 🚀 Ikhtisar Proyek

**Aksaventra Dashboard** adalah platform web modern berbasis **Next.js 16 (App Router)** dan **Hexagonal Architecture** yang dirancang untuk mengelola siklus hidup lisensi perangkat lunak, memvalidasi integritas biner klien, menyajikan analitik telemetri waktu-nyata, dan menegakkan kebijakan audit keamanan ketat bagi ekosistem Aksaventra Portable LMS Engine.

Platform ini mendukung penuh **arsitektur engine portabel tanpa penguncian perangkat keras (HWID Lock)**, memungkinkan media penyimpanan eksternal (Flashdisk / SSD Portable) dipindahkan antar-perangkat server/host secara aman dan fleksibel.

---

## ✨ Fitur Utama

### 1. Validasi Lisensi & Portabilitas Penuh (Issue #44)
- **Portable External Drive Engine**: Endpoint validasi publik (`POST /api/v1/validate`, `POST /api/v1/validate-key`) mendukung aktivasi dan verifikasi multi-device tanpa penolakan *403 Hardware Mismatch*.
- **Telemetry & Safety**: Pencatatan telemetri non-blocking (versi engine, IP klien, User-Agent, status validasi, dan latensi respons).
- **Dekripsi Vault Otomatis**: Pengiriman parameter aman `vault_secret` dan masa berlaku `expires_at` untuk pembukaan brankas kontainer aplikasi terenkripsi.

### 2. Manajemen Direktori Lisensi & Dasbor Analitik (Issue #20 & #28)
- **Ringkasan Eksekutif & KPI**: Visualisasi status lisensi (Aktif, Segera Habis, Kedaluwarsa, Ditangguhkan) dan tren penerbitan berkala.
- **Peringatan & Pengingat Perpanjangan**: Banner notifikasi lisensi mendekati masa habis beserta modal aksi **Kirim Pengingat** (`POST /api/v1/dashboard/reminders/send`).
- **Direktori Lisensi**: Pembuatan, penyaringan status/tier, penyalinan serial key instan, dan penyesuaian status lisensi.

### 3. Rilis Distribusi Biner Portable Engine v2.2.3 (Issue #21 & #35)
- **Paket Lengkap Portable**: Integrasi distribusi resmi biner `aksaventra-portable-v2.2.3-windows-x64.zip` langsung dari [GitHub Releases Tag v2.2.3](https://github.com/cybertank378/aksaventra-releases/releases/tag/v2.2.3).
- **Verifikasi Integritas SHA-256 (Isu #39)**: Pemeriksaan checksum biner klien untuk mencegah modifikasi atau injeksi kode biner berbahaya.

### 4. Profil Akun & Sesi Perangkat Aktif (Issue #43)
- **Manajemen Profil Pribadi (`/dashboard/profile`)**: Pembaruan nama personel, verifikasi status email, serta unggah dan sinkronisasi avatar ke App Topbar.
- **Kontrol Sesi Aktif**: Tampilan sesi browser aktif pengguna lengkap dengan fitur pencabutan sesi (*session revoke*) dan paginasi 5 item per halaman.
- **Role-Based Avatar Menu**: Navigasi kontekstual avatar dropdown sesuai peran pengguna (`ADMIN`, `OPERATOR`, `CLIENT`).

### 5. Audit Jejak Keamanan & Admin Trail (Issue #43)
- **Security Audit Trail (`/dashboard/security`)**: Riwayat terpusat perubahan konfigurasi sistem, mutasi lisensi, dan deteksi anomali percobaan login.
- **Pencarian & Ekspor**: Filter pencarian jejak audit berdasarkan aktor personel, target entitas, dan status mutasi.

### 6. Pertahanan Keamanan Berlapis (Issue #40)
- **Edge Gateway Proxy (`src/proxy.ts`)**: Pemeriksaan sesi terproteksi, injeksi header keamanan, dan bypass rute publik/aset statis.
- **Hardened HTTP Security Headers**: Kebijakan Content Security Policy (CSP) ketat, HSTS, X-Content-Type-Options, Frameguard, dan integritas remote pattern gambar.
- **Argon2id & Jose JWT**: Hashing kata sandi berstandar kriptografi Argon2id dan token otentikasi JWT yang tahan uji.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

| Lapisan / Komponen | Teknologi & Versi |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) 16.4.3 (App Router, Turbopack) |
| **UI Library** | [React](https://react.dev/) 19.3.0 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4.0 + Lucide React Icons |
| **Database & ORM** | PostgreSQL 16+ via [Prisma ORM](https://www.prisma.io/) 7.10.1 (`@prisma/adapter-pg`) |
| **Keamanan & Kriptografi** | [Argon2](https://github.com/ranisalt/node-argon2), [Jose](https://github.com/panva/jose) (JWT) |
| **Object Storage** | AWS S3 Client SDK (`@aws-sdk/client-s3`) / Local Fallback |
| **Visualisasi Data** | [Recharts](https://recharts.org/) 3.10.1 |
| **Testing Suite** | [Vitest](https://vitest.dev/) 5.0.5 (TDD Triple-A Pattern) |
| **Linting & Formatting** | [Biome](https://biomejs.dev/) 2.4.2 |
| **Runtime Engine** | Node.js `>= 22.23.4` |

---

## 🏛️ Pola Arsitektur

Proyek ini dibangun dengan mematuhi disiplin arsitektur perangkat lunak tingkat enterprise:

1. **Hexagonal Architecture (Ports & Adapters)**:
   - **Kernel Inti**: `src/core/` (Base Entity, Result Object, Base UseCase, Value Objects).
   - **Modul Terisolasi**: `src/modules/[feature-plural]/` yang terbagi ke `domain/`, `application/`, dan `infrastructure/`.
2. **Atomic Design System pada Frontend**:
   - `src/sections/[feature-kebab]/` dipecah menjadi:
     - `atomic/`: Komponen mikro independen (Badge, Pill, Chip, Indicator).
     - `molecules/`: Komposisi komponen (TableView, FormView, FilterModal, DetailCard).
     - `organisms/`: Blok tampilan ber-state utuh yang menghubungkan state dan custom API hooks.
     - `pages/`: Container halaman utama yang diimpor Next.js App Router.
3. **Kebijakan Zero Barrel Files**:
   - Larangan keras terhadap pembuatan berkas re-export `index.ts` / `index.tsx` guna mengoptimalkan *tree-shaking* dan performa *Hot Module Replacement* (HMR).
4. **Prinsip Pengujian Triple-A (Arrange, Act, Assert)**:
   - Seluruh berkas pengujian unit dan use case diuji secara modular dan terisolasi dengan vitest.

---

## 📂 Struktur Direktori

```text
aksaventra_dashboard/
├── prisma/
│   ├── schema.prisma                  # Skema database relasional PostgreSQL
│   └── seed/                          # Sistem database seeder modular
│       ├── data/                      # Data statis awal (licenses, releases, admin)
│       ├── lib/                       # Inisialisasi adapter koneksi database seeding
│       ├── logs/                      # Logger proses seeding
│       ├── seeders/                   # Seeder fungsional per model
│       └── seed.ts                    # Orkestrator utama seeding
├── src/
│   ├── app/                           # Next.js App Router (Halaman & REST API Handlers)
│   │   ├── (auth)/                    # Rute login, registrasi, verifikasi
│   │   ├── (protected)/dashboard/     # Rute terproteksi dasbor administratif
│   │   └── api/v1/                    # Endpoint REST API publik dan terproteksi
│   ├── core/                          # Kernel inti Hexagonal Architecture
│   │   ├── application/               # BaseUseCase contract
│   │   ├── domain/                    # Result object & Domain primitives
│   │   └── shared/                    # Utilitas global (logger, hashing)
│   ├── modules/                       # Bounded Context modul bisnis
│   │   ├── auth/                      # Otentikasi, Profil, dan Audit Log
│   │   ├── dashboards/                # Ringkasan statistik, tren validasi, reminder
│   │   ├── engine-validation/         # Monitor langsung validasi & integritas SHA-256
│   │   ├── licenses/                  # Validasi lisensi portable & manajemen lisensi
│   │   ├── releases/                  # Rilis distribusi biner auto-updater
│   │   ├── settings/                  # Konfigurasi sistem & retensi log
│   │   ├── users/                     # Manajemen pengguna administratif & RBAC
│   │   └── validation-logs/           # Log telemetri validasi engine
│   ├── sections/                      # Tampilan antarmuka berbasis Atomic Design
│   │   ├── auth/                      # Komponen halaman otentikasi
│   │   ├── dashboard/                 # Komponen dasbor ringkasan
│   │   ├── engine-validation/         # Simulator & feed validasi biner
│   │   ├── license-management/        # Manajemen lisensi & perangkat
│   │   ├── profile/                   # Formulir profil & sesi perangkat aktif
│   │   ├── releases/                  # Tabel rilis biner & unggah versi
│   │   ├── security-audit/            # Tabel jejak audit & filter mutasi
│   │   ├── system-settings/           # Tab kebijakan operasional & keamanan
│   │   └── validation-logs/           # Tabel log validasi telemetri
│   ├── security/                      # Engine otorisasi, guard field, & role policy
│   ├── shared-ui/                     # Design system generik (Button, Modal, Card, Table)
│   └── proxy.ts                       # Next.js Edge Request Proxy Gate
├── vitest.config.ts                   # Konfigurasi pengujian unit Vitest
└── next.config.ts                     # Konfigurasi Turbopack, CSP, & HTTP Security
```

---

## ⚡ Memulai Pengembangan (Quick Start)

### 1. Prasyarat Sistem
- **Node.js**: versi `22.23.4` atau yang lebih baru.
- **PostgreSQL**: versi `16` atau lebih baru.
- **Git**

### 2. Kloning Repositori & Instalasi Dependensi
```bash
git clone https://github.com/cybertank378/aksaventra_dashboard.git
cd aksaventra_dashboard
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin berkas sampel lingkungan atau sesuaikan variabel berikut pada berkas `.env`:
```env
# Database PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/aksaventra_db?schema=public"

# Otentikasi & JWT Secret
JWT_ACCESS_SECRET="ganti-dengan-kunci-rahasia-akses-jwt-32-karakter-acak"
JWT_REFRESH_SECRET="ganti-dengan-kunci-rahasia-refresh-jwt-32-karakter-acak"

# Kunci Tanda Tangan Validasi Lisensi (HMAC-SHA256)
LICENSE_SIGNING_SECRET="kunci-tanda-tangan-kriptografi-lisensi-engine"

# Penyimpanan Berkas Rilis (Local / AWS S3)
STORAGE_DRIVER="local" # atau "s3"
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION="ap-southeast-1"
# AWS_S3_BUCKET="aksaventra-releases"
```

### 4. Migrasi & Seeding Basis Data
Jalankan migrasi skema dan inisialisasi data awal (Admin, Lisensi Uji Coba v2.2.3, Rilis Biner Portable):
```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pengujian & Quality Gates

Sistem menerapkan standar *Zero Failure Tolerance* untuk seluruh pipeline CI/CD:

```bash
# Menjalankan seluruh pengujian unit & integrasi (Vitest)
npm test

# Menjalankan pengujian dalam mode interaktif / watcher
npm run test:watch

# Memeriksa kepatuhan kode dan linting (Biome)
npm run lint

# Memformat kode secara otomatis
npm run format

# Memvalidasi pengetikan TypeScript murni tanpa emit
npx tsc --noEmit

# Membangun aplikasi untuk distribusi produksi
npm run build
```

---

## 👥 Hak Akses & Matriks Peran (RBAC)

| Kemampuan / Fitur | ADMIN | OPERATOR | CLIENT |
|---|:---:|:---:|:---:|
| Akses Dasbor Eksekutif | ✅ | ✅ | ✅ |
| Penerbitan & Revokasi Lisensi | ✅ | ❌ | ❌ |
| Pengiriman Pengingat Perpanjangan | ✅ | ✅ | ❌ |
| Unggah Rilis Biner Auto-Updater | ✅ | ❌ | ❌ |
| Konfigurasi Kebijakan Sistem | ✅ | ❌ | ❌ |
| Manajemen Akun Pengguna & Role | ✅ | ❌ | ❌ |
| Akses Jejak Audit Keamanan | ✅ | ❌ | ❌ |
| Pembaruan Profil & Avatar Pribadi | ✅ | ✅ | ✅ |
| Manajemen Sesi Perangkat Pribadi | ✅ | ✅ | ✅ |

---

## 📄 Lisensi

Hak Cipta © 2026 **Aksaventra Technology**. Seluruh hak dilindungi undang-undang.
Dilisensikan di bawah lisensi kepemilikan komersial proprietary untuk penggunaan internal dan mitra resmi Aksaventra.

