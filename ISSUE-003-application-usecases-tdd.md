# Issue #003: Implementasi Use Cases dan Unit Testing dengan TDD (Triple A)

## Deskripsi
Mengembangkan logika bisnis aplikasi melalui Use Cases (`ValidateEngineUseCase`) dengan menerapkan metode Test-Driven Development (TDD) menggunakan pola Triple A (*Arrange-Act-Assert*).

## Task List
- [ ] Menulis unit test pada `ValidateEngineUseCase.test.ts` menggunakan pola Triple A.
- [ ] Mengimplementasikan `ValidateEngineUseCase` untuk verifikasi hash SHA-256 dan penanganan status `VALID`/`REVOKED`.
- [ ] Memastikan pemanggilan `incrementVerifiedCount` berjalan saat validasi sukses.

## Acceptance Criteria
- Unit test berhasil dijalankan (`npm test`) dan lulus 100%.
- Cakupan test (*coverage*) untuk layer application mencapai minimal 80%.
- Logika penolakan hash tidak valid atau binary yang dicabut (*revoked*) berfungsi akurat (mengatasi isu #39).
