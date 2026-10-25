# Project Planning: Aksaventra Engine Validation Server & Dashboard

## Project Overview
Proyek ini bertujuan untuk membangun sistem server API dan dashboard manajemen integritas binary `aksaventra_engine.exe` guna mengatasi isu keamanan (`moodle_portable/issues/39`). Sistem memastikan setiap binary yang diunduh dan dijalankan klien terverifikasi melalui hash SHA-256 dan tanda tangan kriptografis.

## Tech Stack
- **Framework**: Next.js 16.4.3+ (App Router)
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL & Prisma v7
- **Styling**: Tailwind CSS v4.3
- **Architecture**: Hexagonal Architecture (Ports & Adapters)
- **Testing**: Vitest / Jest dengan pola TDD (Triple A: Arrange, Act, Assert)

## Milestone & Timeline

### Phase 1: Inisialisasi & Domain Core (Minggu 1)
- [ ] Setup struktur direktori berstandar Hexagonal Architecture.
- [ ] Konfigurasi Prisma v7 Schema (`EngineValidation`, `ValidationLog`).
- [ ] Pembuatan Domain Entities, Value Objects, dan Repository Interfaces.

### Phase 2: Application Use Cases & TDD (Minggu 2)
- [ ] Implementasi Use Cases (`ValidateEngineUseCase`, `RegisterEngineUseCase`).
- [ ] Penulisan unit test menggunakan pola Triple A (Arrange-Act-Assert).
- [ ] Integrasi Mock Repositories untuk testing terisolasi.

### Phase 3: Infrastructure & API Routing (Minggu 3)
- [ ] Implementasi Prisma Repository adapters.
- [ ] Pembuatan Next.js API Routes (`/api/v1/engine/validate`).
- [ ] Konfigurasi middleware keamanan dan header logging.

### Phase 4: UI Dashboard & Deployment (Minggu 4)
- [ ] Perancangan UI Dashboard menggunakan Tailwind CSS v4.3 (Modern Clean UI, warna Slate & Emerald/Orange).
- [ ] Integrasi SSR/Server Actions pada halaman protected dashboard.
- [ ] Dokumentasi teknis (`Planning.md`, `requirement.md`, `skills.md`, `agents.md`, `design.md`).