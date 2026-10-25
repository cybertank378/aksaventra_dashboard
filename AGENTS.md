# Agent Roles & Responsibilities

Dalam pengembangan kolaboratif berbasis agen (AI/Human Hybrid), peran dibagi menjadi spesialisasi berikut:

## 1. Architect Agent
- **Tanggung Jawab**: Merancang struktur direktori Hexagonal Architecture, mendefinisikan kontrak interface (`EngineValidationRepositoryInterface`), dan memastikan kepatuhan terhadap prinsip SOLID.
- **Output**: Skema Prisma, Blueprint folder modul, dan Diagram relasi antar layer.

## 2. Backend & TDD Developer Agent
- **Tanggung Jawab**: Menulis unit test dengan pola Triple A, mengembangkan Use Cases, dan mengimplementasikan repository adapters serta Next.js API Routes.
- **Output**: Berkas `.test.ts`, Use Case classes, dan Controller/Route handlers.

## 3. Frontend & UI/UX Specialist Agent
- **Tanggung Jawab**: Membangun antarmuka dashboard admin menggunakan Next.js App Router dan Tailwind CSS v4.3 dengan estetika modern serta tata letak kartu responsif.
- **Output**: Halaman `/dashboard`, komponen tabel data, dan indikator status keamanan.

## 4. Security & QA Auditor Agent
- **Tanggung Jawab**: Memvalidasi penanganan isu keamanan `#39` (integritas binary `aksaventra_engine.exe`), memverifikasi pencatatan log akses, dan memastikan tidak ada celah injeksi hash.