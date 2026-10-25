# refactor(core): Restrukturisasi direktori core sesuai batas layer Clean/Hexagonal Architecture

## 📌 Deskripsi

Saat ini, direktori `core/` mencampurkan abstraksi murni (*Domain* & *Application*) dengan detail implementasi teknis (*HTTP/Presentation*, *Infrastructure Adapters*, dan *Library Eksternal* seperti Zod). Hal ini berisiko menimbulkan *leaky abstraction* dan melanggar *Dependency Rule* (misalnya layer domain tidak sengaja mengimpor modul HTTP atau *file storage*).

Issue ini bertujuan untuk merapikan dan mengelompokkan ulang file di dalam `core/` berdasarkan tanggung jawab arsitekturalnya (*Separation of Concerns*).

---

## 🔍 Temuan Masalah Saat Ini (Audit Struktur)

1. **`core/base/` Terlalu Gemuk (Mixed Concerns):**
   - Mencampurkan *Domain Building Blocks* (`BaseEntity`, `BaseValueObject`), *Application Building Blocks* (`BaseUseCase`, `BaseService`, `PaginationDTO`, `Result`), dan *HTTP/Presentation Layer* (`BaseController`, `BaseApiResponseDTO`).
2. **`core/utils/` Menjadi "Keranjang Sampah" Infrastruktur & HTTP:**
   - **Infrastruktur & Port/Adapter:** `FileStorageInterface.ts` (Port) dan `LocalFileStorageService.ts`, `ExcelAdapter.ts`, `PdfAdapter.ts` (Adapter/Infrastructure) seharusnya tidak berada di `utils/`.
   - **HTTP & Routing:** `HttpResultHandler.ts`, `QueryParams.ts`, dan `RouteParamHelper.ts` adalah utilitas spesifik *Presentation/Delivery layer*, bukan utilitas umum.
3. **Pencampuran Error Lintas Layer di `core/errors/`:**
   - `DomainError` dan `OptimisticLockError` berada satu level dengan `ApiError` (HTTP) dan `handleZodError` (spesifik library validasi).
4. **Duplikasi & Ketidakkonsistenan Penempatan:**
   - `BaseApiResponseDTO.ts` (di `base/`) dan `ApiResponse.ts` (di `types/`) memiliki tanggung jawab serupa terkait kontrak respons HTTP.
   - `validationHelper.ts` berada di dalam folder `core/response/`, padahal namanya mengindikasikan proses validasi (input), bukan pemformatan respons (output).
   - Aturan otorisasi tersebar antara `types/AuthorizationRule.ts` dan `utils/validators/validateAuthorization.ts`.

---

## 🎯 Usulan Struktur Baru (`Target Architecture`)

```text
├── core
│   ├── domain                      # Layer terdalam (Murni bisnis, 0 dependensi eksternal)
│   │   ├── BaseEntity.ts
│   │   ├── BaseValueObject.ts
│   │   ├── BaseRepository.ts       # Port / Repository Interface dasar
│   │   ├── Result.ts
│   │   └── errors
│   │       ├── DomainError.ts
│   │       └── OptimisticLockError.ts
│   │
│   ├── application                 # Orkestrasi use case, DTO, & Port Infrastruktur
│   │   ├── BaseUseCase.ts
│   │   ├── BaseUploadUseCase.ts
│   │   ├── BaseService.ts
│   │   ├── dto
│   │   │   ├── PaginationDTO.ts
│   │   │   └── PatchDTOHelper.ts
│   │   ├── ports                   # Kontrak/Interface untuk pihak ketiga
│   │   │   └── FileStorageInterface.ts
│   │   ├── auth
│   │   │   ├── AuthorizationRule.ts
│   │   │   └── validateAuthorization.ts
│   │   └── errors
│   │       ├── AppError.ts
│   │       └── ValidationError.ts
│   │
│   ├── infrastructure              # Implementasi konkrit dari Ports & Adapter eksternal
│   │   ├── storage
│   │   │   └── LocalFileStorageService.ts
│   │   ├── adapters
│   │   │   ├── ExcelAdapter.ts
│   │   │   └── PdfAdapter.ts
│   │   └── context
│   │       └── runWithRequestContext.ts
│   │
│   ├── http                        # Presentation / Delivery Layer (Controller, Response, Params)
│   │   ├── BaseController.ts
│   │   ├── HttpResultHandler.ts
│   │   ├── RouteParamHelper.ts
│   │   ├── QueryParams.ts
│   │   ├── response
│   │   │   ├── ApiResponse.ts
│   │   │   └── BaseApiResponseDTO.ts
│   │   ├── validation
│   │   │   ├── handleZodError.ts
│   │   │   └── validationHelper.ts
│   │   └── errors
│   │       └── ApiError.ts
│   │
│   ├── shared                      # Tipe utilitas TypeScript murni & konfigurasi global
│   │   ├── types
│   │   │   └── DeepPartial.ts
│   │   ├── utils
│   │   │   └── errorUtils.ts
│   │   └── env.ts
```

---

## ✅ Daftar Tugas (Action Items)

- [ ] **1. Pemisahan Layer Domain (`core/domain`):**
  - Pindahkan `BaseEntity.ts`, `BaseValueObject.ts`, `BaseRepository.ts`, dan `Result.ts` ke `core/domain/`.
  - Pindahkan `DomainError.ts` dan `OptimisticLockError.ts` ke `core/domain/errors/`.
- [ ] **2. Pemisahan Layer Application (`core/application`):**
  - Pindahkan `BaseUseCase.ts`, `BaseUploadUseCase.ts`, dan `BaseService.ts` ke `core/application/`.
  - Pindahkan `PaginationDTO.ts` dan `PatchDTOHelper.ts` ke `core/application/dto/`.
  - Pindahkan `FileStorageInterface.ts` ke `core/application/ports/` (ubah penamaan menjadi kontrak port yang konsisten jika diperlukan, misal `IFileStoragePort`).
  - Satukan `AuthorizationRule.ts` dan `validateAuthorization.ts` ke dalam `core/application/auth/`.
  - Pindahkan `AppError.ts` dan `ValidationError.ts` ke `core/application/errors/`.
- [ ] **3. Isolasi Layer Infrastructure (`core/infrastructure`):**
  - Pindahkan `LocalFileStorageService.ts` ke `core/infrastructure/storage/`.
  - Pindahkan `ExcelAdapter.ts` dan `PdfAdapter.ts` ke `core/infrastructure/adapters/`.
  - Pindahkan `runWithRequestContext.ts` ke `core/infrastructure/context/`.
- [ ] **4. Isolasi Layer HTTP / Presentation (`core/http`):**
  - Pindahkan `BaseController.ts`, `HttpResultHandler.ts`, `RouteParamHelper.ts`, dan `QueryParams.ts` ke `core/http/`.
  - Evaluasi dan gabungkan/rapikan `ApiResponse.ts` dan `BaseApiResponseDTO.ts` di dalam `core/http/response/`.
  - Pindahkan `validationHelper.ts` dan `handleZodError.ts` ke `core/http/validation/`.
  - Pindahkan `ApiError.ts` ke `core/http/errors/`.
- [ ] **5. Isolasi Shared Utilities (`core/shared`):**
  - Pindahkan `DeepPartial.ts` ke `core/shared/types/`.
  - Pindahkan `errorUtils.ts` ke `core/shared/utils/`.
  - Pindahkan `env.ts` ke `core/shared/`.
- [ ] **6. Update Barrel Exports & Path Aliases:**
  - Perbarui seluruh *import path* yang terdampak (misalnya `@/core/domain/...`, `@/core/http/...`).
  - Pastikan tidak ada *circular dependency* antar sub-folder di dalam `core/`.

---

## 🛡️ Kriteria Penerimaan (Acceptance Criteria)

1. **Zero Outward Dependency di Domain:** File di dalam `core/domain/` sama sekali tidak mengimpor file dari `application`, `infrastructure`, `http`, maupun library pihak ketiga (seperti Zod, Prisma, atau framework HTTP).
2. **Pemisahan Port vs Adapter:** *Use Case* di `core/application/` hanya bergantung pada interface di `core/application/ports/` (bukan mengimpor langsung `LocalFileStorageService` atau adapter konkrit).
3. **Typecheck & Test Lulus:** Seluruh pemeriksaan tipe (`tsc --noEmit`), *linter*/formatter, dan *unit test* berjalan hijau tanpa regresi.