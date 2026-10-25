# Issue #001: Konfigurasi Database Schema dan Prisma v7 untuk Engine Validation

## Deskripsi
Melakukan inisialisasi skema basis data PostgreSQL menggunakan Prisma v7 untuk mendukung penyimpanan registrasi versi `aksaventra_engine.exe`, hash SHA-256, status keamanan, serta log audit validasi klien guna menanggulangi isu keamanan `#39`.

## Task List
- [ ] Inisialisasi konfigurasi Prisma v7 dengan provider PostgreSQL.
- [ ] Membuat model `EngineValidation` (id, version, sha256Hash, fileSize, status, signature, downloadUrl, verifiedCount, timestamps).
- [ ] Membuat model `ValidationLog` untuk pencatatan akses klien (clientIp, userAgent, isValid, checkedAt).
- [ ] Menjalankan migrasi database awal (`prisma migrate dev`).

## Acceptance Criteria
- Skema berhasil dibuat tanpa error sintaks pada Prisma v7.
- Relasi antara `EngineValidation` dan `ValidationLog` terhubung secara *cascade delete*.
- Field `version` bersifat unik (`@unique`) untuk mencegah duplikasi entri binary.
