# Requirements Specification: Aksaventra Engine Validation System

## 1. Functional Requirements
- **FR-01**: Sistem harus menyediakan API endpoint (`POST /api/v1/engine/validate`) untuk memverifikasi versi dan hash SHA-256 dari `aksaventra_engine.exe`.
- **FR-02**: Dashboard admin harus menampilkan daftar seluruh versi engine yang terdaftar beserta status keamanan (`VALID`, `REVOKED`, `PENDING`).
- **FR-03**: Sistem wajib mencatat log setiap percobaan validasi klien (mencakup IP address, User-Agent, status validasi, dan timestamp).
- **FR-04**: Admin dapat mendaftarkan, memperbarui, atau mencabut (revocation) status suatu versi engine melalui panel manajemen.
- **FR-05**: Sistem menolak verifikasi binary yang memiliki kecocokan hash tidak valid atau berstatus `REVOKED` (penanggulangan isu #39).

## 2. Non-Functional Requirements
- **NFR-01 (Performance)**: Respon API validasi hash harus merespon dalam waktu rata-rata $< 200\text{ ms}$.
- **NFR-02 (Security)**: Komunikasi data wajib menggunakan HTTPS, dan penyimpanan database menggunakan enkripsi serta pembatasan akses ketat.
- **NFR-03 (Maintainability)**: Kode harus mematuhi prinsip Hexagonal Architecture dengan pemisahan ketat antara Domain, Application, Infrastructure, dan Presentation layer.
- **NFR-04 (Testability)**: Cakupan unit test (coverage) minimal mencapai 80% dengan penerapan pola TDD Triple A.