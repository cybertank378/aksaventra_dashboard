# Issue #004: Implementasi Prisma Repository Adapter dan Next.js API Route

## Deskripsi
Menghubungkan core application dengan infrastruktur luar melalui Prisma Repository Adapter dan menyediakan endpoint HTTP API untuk klien `aksaventra_engine.exe`.

## Task List
- [ ] Mengimplementasikan `EngineValidationRepository` menggunakan Prisma Client.
- [ ] Membuat Next.js API Route di `src/app/api/v1/engine/validate/route.ts`.
- [ ] Menambahkan ekstraksi header (Client IP, User-Agent) pada penanganan request API.

## Acceptance Criteria
- Endpoint `POST /api/v1/engine/validate` mengembalikan status HTTP 200 dengan format JSON DTO yang benar.
- Respon API merespon dalam waktu di bawah 200ms (`NFR-01`).
- Penanganan error server mengembalikan respons yang aman tanpa membocorkan stack trace internal.
