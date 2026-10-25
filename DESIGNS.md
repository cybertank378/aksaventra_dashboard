# System Design & Architecture Specification

## 1. Architectural Pattern: Hexagonal Architecture
Sistem dirancang dengan struktur *Ports & Adapters* untuk memastikan inti aplikasi (Domain & Application) bebas dari keterikatan teknologi eksternal (Database, Framework HTTP).
[ Client / UI ]
│
▼ (HTTP / Server Actions)
[ Infrastructure: Next.js API Routes / Controllers ]
│
▼ (Calls)
[ Application: Use Cases (ValidateEngineUseCase) ]
│
▼ (Implements Port / Interface)
[ Domain: Entities & Repository Interfaces ]
▲
│ (Adapts via Prisma)
[ Infrastructure: Prisma Repository & Database ]

## 2. Data Flow: Validasi `aksaventra_engine.exe`
1. **Kirim Permintaan**: Klien mengirimkan `version` dan `hash` SHA-256 melalui `POST /api/v1/engine/validate`.
2. **Controller/Route Handler**: Menerima request, mengekstrak header (IP & User-Agent), lalu melesternya ke `ValidateEngineUseCase`.
3. **Use Case Execution**:
   - Memanggil `EngineValidationRepository` untuk mencari data versi engine.
   - Membandingkan `clientHash` dengan `serverHash` pada entitas.
   - Jika valid, increment `verifiedCount` dan catat log validasi.
4. **Respon**: Mengembalikan JSON DTO status validasi (`isValid: boolean`, `message: string`).

## 3. UI/UX Design System
- **Color Palette**: 
  - Neutral Background: `bg-slate-50` / `bg-white`
  - Primary / Success: `emerald-600` (Valid, Secure badges)
  - Warning / Revoked: `orange-600` (Flagged binaries, Issue #39 alerts)
  - Text & Borders: `slate-800` (Heading), `slate-500` (Muted), `border-slate-100` (Card borders)
- **Component Style**: Rounded cards (`rounded-2xl`), soft shadows (`shadow-sm`), font monospaced untuk hash SHA-256 (`font-mono text-xs`).