# Issue #005: Pengembangan UI Dashboard Admin dengan Tailwind CSS v4.3

## Deskripsi
Membangun antarmuka dashboard administrator di direktori `src/app/(protected)/dashboard/page.tsx` menggunakan Tailwind CSS v4.3, menampilkan metrik sistem, status keamanan binary, dan tabel audit log.

## Task List
- [ ] Membuat tata letak layout dashboard yang responsif dan bersih (*Modern Clean UI*).
- [ ] Menambahkan kartu ringkasan metrik (Total Binary, Versi Aktif, Binary Dicabut/Revoked).
- [ ] Membuat tabel daftar versi engine, hash SHA-256 (berformat *monospaced*), status badge (`emerald` / `orange`), dan tombol unduh.
- [ ] Menerapkan palet warna konsisten (`slate`, `emerald-600`, `orange-600`).

## Acceptance Criteria
- Tampilan UI sesuai dengan spesifikasi desain sistem (`design.md`).
- Halaman memuat data secara server-side (*Server Components*) dengan aman.
- Komponen responsif di berbagai ukuran layar perangkat.
