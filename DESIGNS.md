# System Design & Architecture Specification

## 1. Architectural Pattern: Hexagonal Architecture
Sistem dirancang dengan struktur *Ports & Adapters* untuk memastikan inti aplikasi (Domain & Application) bebas dari keterikatan teknologi eksternal (Database, Framework HTTP).
```
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
```

## 2. Data Flow: Validasi `aksaventra_engine.exe`
1. **Kirim Permintaan**: Klien mengirimkan `version` dan `hash` SHA-256 melalui `POST /api/v1/engine/validate`.
2. **Controller/Route Handler**: Menerima request, mengekstrak header (IP & User-Agent), lalu melesternya ke `ValidateEngineUseCase`.
3. **Use Case Execution**:
   - Memanggil `EngineValidationRepository` untuk mencari data versi engine.
   - Membandingkan `clientHash` dengan `serverHash` pada entitas.
   - Jika valid, increment `verifiedCount` dan catat log validasi.
4. **Respon**: Mengembalikan JSON DTO status validasi (`isValid: boolean`, `message: string`).

## 3. UI/UX Design System
- **Typography**:
  - Primary Sans: `Plus Jakarta Sans` (`--font-sans`) untuk seluruh antarmuka, heading, dan body text.
  - Monospace: `JetBrains Mono` (`--font-mono`) khusus untuk hash SHA-256, hex values, dan logging audit.
- **Color Palette**: 
  - Neutral Background: `bg-slate-50` / `bg-white` (Dark mode: `bg-slate-950` / `bg-slate-900`)
  - Primary / Success: `emerald-600` (Aksen utama, tombol aksi, status valid & secure badges)
  - Warning / Revoked: `orange-600` (Flagged binaries, revoked engine, alert isu #39)
  - Error / Danger: `red-600` (Penolakan integritas, kegagalan validasi, tombol hapus/logout)
  - Text & Borders: `slate-800` (Heading), `slate-500` (Muted/labels), `border-slate-100` (Card borders), `border-slate-200` (Divider/input)
- **Component Style**:
  - Rounded cards: `rounded-2xl`
  - Soft shadows: `shadow-sm`
  - Form inputs & buttons: `rounded-xl`
  - Font monospaced untuk hash SHA-256: `font-mono text-xs`

---

## 4. Shared UI Component Standard (Strict Non-Native HTML Rule)

> [!IMPORTANT]
> **ATURAN WAJIB ANTARMUKA (ZERO NATIVE HTML):**  
> Seluruh halaman dan komponen presentasi (`src/app/*`, `src/modules/*/presentation/*`) **DILARANG KERAS** menggunakan elemen HTML native secara langsung (seperti `<button>`, `<input>`, `<select>`, `<textarea>`, `<table>`, `<dialog>`, atau wrapper card `<div>` manual).  
> Semua elemen antarmuka wajib mengimpor dan memanfaatkan komponen terstandarisasi yang berada di direktori `src/shared-ui`.

### 4.1 Tabel Pemetaan Elemen Native ke Komponen `src/shared-ui`

| Elemen HTML Native | Komponen Pengganti (`src/shared-ui`) | Import Path | Keterangan / Penggunaan |
| :--- | :--- | :--- | :--- |
| `<button>` | `Button` | `@/shared-ui/component/Button` | Tombol interaktif dengan varian (`filled`, `label`, `outline`, `text`, `ghost`), warna tema, dan state `loading`. |
| `<a href="...">` / `<Link>` (gaya tombol) | `LinkButton` | `@/shared-ui/component/LinkButton` | Navigasi Next.js Link berpenampilan tombol standar. |
| `<input type="text \| password \| email">` | `TextField` | `@/shared-ui/component/TextField` | Input teks terintegrasi dengan icon, show/hide password, error state, dan helper text. |
| `<textarea>` | `TextAreaField` | `@/shared-ui/component/TextAreaField` | Area teks multi-baris dengan auto-resize dan validation styling. |
| `<select>` | `SelectField` | `@/shared-ui/component/SelectField` | Dropdown pemilihan opsi dengan dukungan styling konsisten. |
| `<input type="checkbox">` | `Checkbox` / `CheckboxGroup` | `@/shared-ui/component/Checkbox` | Komponen centang tunggal atau grup multi-opsi. |
| `<input type="radio">` | `Radio` | `@/shared-ui/component/Radio` | Pilihan radio eksklusif berpenampilan modern. |
| Switch / toggle switch | `Switch` | `@/shared-ui/component/Switch` | Saklar on/off untuk pengaturan binary/opsi sistem. |
| `<input type="date">` | `DatePicker` | `@/shared-ui/component/DatePicker` | Kalender pemilihan tanggal berbahasa Indonesia (date-fns locale `id`). |
| `<input type="search">` | `SearchField` | `@/shared-ui/component/SearchField` | Input pencarian instan dengan ikon search dan tombol clear. |
| `<input type="file">` | `UploadButton` | `@/shared-ui/component/UploadButton` | Unggah berkas engine binary atau dokumen pendukung. |
| `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` | `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, `TableHeaderCell` | `@/shared-ui/component/Table` | Struktur tabel data terstandarisasi dengan striping dan responsivitas. |
| Tabel data dinamis / expandable | `ExpandableTable` | `@/shared-ui/component/ExpandableTable` | Tabel data lengkap dengan baris detail yang dapat dibuka (accordion), loading skeleton, dan empty state. |
| `<dialog>` / Modal overlay | `Modal` | `@/shared-ui/component/Modal` | Dialog modal berbasis backdrop dengan animasi dan tombol aksi footer. |
| `<hr>` | `Divider` | `@/shared-ui/component/Divider` | Garis pemisah konten horizontal atau vertikal. |
| Card container `<div>` | `Card` / `ExpandableCard` | `@/shared-ui/component/Card` | Kontainer kartu bersudut `rounded-2xl`, `bg-white`, `border-slate-100`, dan `shadow-sm`. |
| Badge / Tag `<span>` | `Badge` / `RoleBadge` / `Chip` | `@/shared-ui/component/Badge` | Indikator status (`primary`, `success`, `warning`, `error`, `info`) dan tag role admin. |
| Loading spinner / Skeleton `<div>` | `Loading` / `Skeleton` | `@/shared-ui/component/Loading`, `@/shared-ui/component/Skeleton` | State pemuatan halaman dan skeleton shimmering. |
| `alert(...)` / Notifikasi native | `toastHandler` / `Toast` | `@/shared-ui/component/toastHandler` | Notifikasi toast responsif dengan penanganan otomatis pesan error `ApiError` core. |

---

### 4.2 Katalog Lengkap Komponen `src/shared-ui`

#### A. Layout & Struktur Aplikasi
1. **`AppLayout`** (`@/shared-ui/layout/AppLayout`): Shell utama dashboard yang mengintegrasikan sidebar, topbar, dan area konten berlatar `bg-slate-50`.
2. **`AppSidebar`** (`@/shared-ui/layout/AppSidebar`): Sidebar navigasi responsif dengan dukungan menu bertingkat, branding Aksaventra, dan indikator role aktif.
3. **`AppTopbar`** (`@/shared-ui/layout/AppTopbar`): Bar navigasi atas sticky dengan field pencarian cepat, notifikasi, dan avatar profil dropdown.
4. **`RecursiveSidebarItem`** (`@/shared-ui/layout/sidebar/RecursiveSidebarItem`): Item navigasi sidebar dengan ekspansi submenu animasi Framer Motion.

#### B. Kontainer & Permukaan
1. **`Card`** (`@/shared-ui/component/Card`): Pembungkus kartu dasar dengan style `rounded-2xl border border-slate-100 bg-white p-6 shadow-sm`.
2. **`ExpandableCard`** (`@/shared-ui/component/ExpandableCard`): Kartu yang dapat di-collapse/expand untuk informasi rinci teknis atau metadata binary.
3. **`Divider`** (`@/shared-ui/component/Divider`): Komponen pemisah seksi form atau tata letak.

#### C. Formulir & Masukan Data
1. **Struktur Form**:
   - `FormLayout` (`@/shared-ui/component/Form/FormLayout`): Pembungkus formulir komprehensif.
   - `FormGrid` & `AutoFormGrid` (`@/shared-ui/component/Form/FormGrid`, `@/shared-ui/component/Grid/AutoFormGrid`): Grid responsif untuk tata letak field masukan.
   - `FormSection` (`@/shared-ui/component/Form/FormSection`): Pengelompokan bagian form dengan judul dan deskripsi.
   - `FormControl` (`@/shared-ui/component/Form/FormControl`): Pembungkus field input individual.
   - `FormLabel` (`@/shared-ui/component/Form/FormLabel`): Label field input standar.
   - `FormError` (`@/shared-ui/component/Form/FormError`): Pesan validasi error berwarna merah.
   - `FormHelperText` (`@/shared-ui/component/Form/FormHelperText`): Teks petunjuk input berwarna slate-500.
2. **Field Masukan**:
   - `TextField` (`@/shared-ui/component/TextField`): Input teks/password dengan dukungan ikon prefix/suffix.
   - `TextAreaField` (`@/shared-ui/component/TextAreaField`): Masukan teks panjang seperti deskripsi log atau catatan audit.
   - `SelectField` (`@/shared-ui/component/SelectField`): Pemilihan opsi dropdown terstandarisasi.
   - `Checkbox` & `CheckboxGroup` (`@/shared-ui/component/Checkbox`, `@/shared-ui/component/CheckboxGroup`): Masukan pilihan kotak centang.
   - `Radio` (`@/shared-ui/component/Radio`): Masukan pilihan radio.
   - `Switch` (`@/shared-ui/component/Switch`): Toggle switch aktivasi/deaktivasi.
   - `DatePicker` & `DatePickerHeader` (`@/shared-ui/component/DatePicker`, `@/shared-ui/component/DatePickerHeader`): Pemilihan tanggal berbasis kalender.
   - `SearchField` (`@/shared-ui/component/SearchField`): Kotak pencarian filter data.

#### D. Tindakan & Tombol
1. **`Button`** (`@/shared-ui/component/Button`): Tombol aksi utama dengan palet warna `primary` (`emerald-600`), `warning` (`orange-600`), `error` (`red-500`), dan `secondary` (`slate-600`).
2. **`LinkButton`** (`@/shared-ui/component/LinkButton`): Tautan internal berbasis Next.js Link dengan visual tombol.
3. **`UploadButton`** (`@/shared-ui/component/UploadButton`): Tombol unggah binary `.exe` atau dokumen laporan.
4. **`ToggleGroup`** (`@/shared-ui/component/ToggleGroup`): Sekelompok tombol toggle segmentasi (misal: filter status VALID / REVOKED / ALL).

#### E. Penyajian Data & Tabel
1. **`Table`** (`@/shared-ui/component/Table`): Primitive komponen tabel modular (`TableHead`, `TableBody`, `TableRow`, `TableCell`, `TableHeaderCell`).
2. **`ExpandableTable`** (`@/shared-ui/component/ExpandableTable`): Tabel interaktif dengan kemampuan expand detail baris (misal: menampilkan detail SHA-256 hash dan riwayat validasi mesin), animasi, dan penanganan empty state otomatis.
3. **`Pagination`** (`@/shared-ui/component/Pagination`): Kontrol navigasi pagination terstandarisasi (prev, next, page numbers).
4. **`FilterBar`** (`@/shared-ui/component/FilterBar`): Bilah filter pencarian dan opsi sortir di atas tabel.
5. **`ReportToolbar`** (`@/shared-ui/component/ReportToolbar`): Toolbar aksi laporan (Export Excel, Export PDF, Print).

#### F. Indikator, Umpan Balik & Profil
1. **`Badge`** (`@/shared-ui/component/Badge`): Label status visual (`emerald-600` untuk valid/secure, `orange-600` untuk revoked/alert, dsb.).
2. **`RoleBadge`** (`@/shared-ui/component/RoleBadge`): Badge identitas peran pengguna (`ADMIN`).
3. **`Chip`** (`@/shared-ui/component/Chip`): Tag pill interaktif yang dapat dihapus.
4. **`Modal`** (`@/shared-ui/component/Modal`): Jendela dialog konfirmasi atau formulir pop-up.
5. **`Toast` & `toastHandler`** (`@/shared-ui/component/Toast`, `@/shared-ui/component/toastHandler`): Sistem notifikasi pop-up terintegrasi `ApiError` core.
6. **`Loading` & `Skeleton`** (`@/shared-ui/component/Loading`, `@/shared-ui/component/Skeleton`): Indikator loading dan skeleton visual saat memuat data.
7. **`Avatar` & `AvatarDropdown`** (`@/shared-ui/component/Avatar`, `@/shared-ui/component/AvatarDropdown`): Komponen foto profil pengguna dan dropdown menu aksi (Profile, Settings, Security Audit, Logout).
8. **`RotatingQuote`** (`@/shared-ui/component/RotatingQuote`): Komponen banner kutipan dinamis untuk login page atau welcome screen.