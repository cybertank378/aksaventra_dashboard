export type AuthModalTopic = "privacy" | "sla" | "api-docs" | "support";

export interface TermsSectionItem {
  id: string;
  code?: string;
  title: string;
  content: string;
  points?: string[];
  codeSnippet?: string;
}

export interface AuthModalTopicContent {
  topic: AuthModalTopic;
  tabLabel: string;
  badge: string;
  bannerText: string;
  title: string;
  subtitle: string;
  sections: TermsSectionItem[];
}

export const AUTH_MODAL_TOPICS: Record<AuthModalTopic, AuthModalTopicContent> = {
  privacy: {
    topic: "privacy",
    tabLabel: "Kebijakan Privasi",
    badge: "Privasi & Kriptografi",
    bannerText: "Standar Perlindungan Data, Argon2id Hash & Cookie HttpOnly",
    title: "Kebijakan Privasi Aksaventra Enterprise",
    subtitle:
      "Perlindungan data identitas administrator, enkripsi kata sandi Argon2id, telemetri Hardware ID (HWID), dan retensi log audit",
    sections: [
      {
        id: "credential-protection",
        code: "PRIV-01",
        title: "1. Enkripsi Kredensial & Penyimpanan Sandi",
        content:
          "Aksaventra tidak pernah menyimpan kata sandi pengguna dalam bentuk teks biasa (plain-text) di dalam basis data.",
        points: [
          "Seluruh kata sandi di-hash menggunakan algoritma Argon2id (memoryCost: 64 MB, timeCost: 3, parallelism: 4) beserta salt acak unik.",
          "Token sesi akses (Access Token) dan Refresh Token disimpan menggunakan atribut cookie HttpOnly, SameSite=Lax, dan Secure.",
          "Token pemulihan kata sandi sekali pakai (One-Time Recovery Token) memiliki masa berlaku ketat selama 15 menit.",
        ],
      },
      {
        id: "hwid-telemetry",
        code: "PRIV-02",
        title: "2. Pemrosesan Identitas Perangkat Keras (HWID)",
        content:
          "Saat klien binary aksaventra_engine.exe melakukan validasi lisensi, sistem hanya mengumpulkan sidik jari perangkat keras terenkripsi.",
        points: [
          "Data yang dikumpulkan terbatas pada Serial Key, hash Hardware ID (HWID), versi binary engine, alamat IP, dan User-Agent.",
          "Sistem tidak memindai berkas pribadi, dokumen lokal, maupun aktivitas di luar proses eksekusi aksaventra_engine.",
        ],
      },
      {
        id: "audit-log-retention",
        code: "PRIV-03",
        title: "3. Pencatatan Audit Log & Retensi Keamanan",
        content:
          "Setiap aktivitas autentikasi dan manajemen lisensi dicatat secara otomatis pada tabel AuditLog untuk kepatuhan forensik.",
        points: [
          "Mencatat aksi LOGIN_SUCCESS, LOGIN_FAILED, SUSPICIOUS_LOGIN, penerbitan lisensi, pencabutan lisensi, dan reset HWID.",
          "Hanya peran ADMIN dan AUDITOR yang memiliki hak baca terhadap rekam jejak audit keamanan.",
        ],
      },
    ],
  },
  sla: {
    topic: "sla",
    tabLabel: "Ketentuan Layanan SLA",
    badge: "Wajib Dipatuhi",
    bannerText: "Protokol Keamanan Lisensi & Validasi Engine v1",
    title: "Syarat & Ketentuan Layanan SLA Aksaventra",
    subtitle: "Kebijakan keamanan lisensi, penguncian HWID, dan kepatuhan audit operasional",
    sections: [
      {
        id: "license-binding",
        code: "SLA-01",
        title: "1. Penguncian Perangkat Keras (Single-HWID Binding)",
        content:
          "Setiap Serial Key yang diterbitkan melalui Aksaventra Enterprise terikat secara eksklusif pada satu Hardware ID (HWID) perangkat klien saat aktivasi pertama dilakukan.",
        points: [
          "Aktivasi Baru: Mengunci HWID perangkat pertama ke database dan menerbitkan tanda tangan validasi.",
          "Perangkat Terdaftar: Permintaan berikutnya dari HWID yang sama disetujui selama lisensi berstatus ACTIVE.",
          "Hardware Mismatch (HTTP 403): Penggunaan Serial Key pada perangkat berbeda ditolak secara otomatis.",
        ],
      },
      {
        id: "binary-integrity",
        code: "SLA-02",
        title: "2. Kepatuhan Integritas Binary Engine (SHA-256)",
        content:
          "Pengguna dan administrator wajib menggunakan binary resmi aksaventra_engine yang terverifikasi checksum SHA-256. Percobaan modifikasi binary akan memicu penolakan validasi.",
      },
      {
        id: "security-audit",
        code: "SLA-03",
        title: "3. Otorisasi Peran & Hak Akses Administratif",
        content:
          "Pembuatan lisensi baru, pencabutan (revoke), dan penghapusan lisensi dikunci secara ketat hanya untuk peran ADMIN melalui Policy Engine dan Field Guard.",
      },
      {
        id: "confidentiality",
        code: "SLA-04",
        title: "4. Kerahasiaan Kredensial & Vault Secret",
        content:
          "Administrator bertanggung jawab penuh atas kerahasiaan akun, token sesi, serta seed kriptografis Vault Secret yang didistribusikan kepada instansi klien.",
      },
    ],
  },
  "api-docs": {
    topic: "api-docs",
    tabLabel: "Dokumentasi API",
    badge: "REST API v1",
    bannerText: "Spesifikasi Endpoint Validasi Engine & Telemetri (/api/v1/*)",
    title: "Dokumentasi API Aksaventra v1",
    subtitle:
      "Referensi integrasi endpoint validasi lisensi untuk klien binary aksaventra_engine.exe",
    sections: [
      {
        id: "validate-endpoint",
        code: "POST /api/v1/validate",
        title: "1. Validasi Lisensi & Penguncian HWID",
        content:
          "Memvalidasi Serial Key dan Hardware ID (HWID) perangkat klien serta menerbitkan tanda tangan kriptografi HMAC-SHA256.",
        points: [
          "200 OK: Aktivasi baru berhasil atau perangkat terdaftar cocok.",
          "403 Forbidden: Hardware Mismatch (HWID tidak sesuai dengan perangkat terdaftar).",
          "401 / 404: Serial Key tidak ditemukan, kedaluwarsa (EXPIRED), atau ditangguhkan (SUSPENDED).",
        ],
        codeSnippet: `POST /api/v1/validate HTTP/1.1
Content-Type: application/json

{
  "serial_key": "AKSA-XXXX-YYYY-ZZZZ",
  "hwid": "HWID-WIN11-9F8A7B6C5D4E",
  "engine_version": "1.2.0"
}`,
      },
      {
        id: "engine-header-endpoint",
        code: "POST /api/v1/engine/validate",
        title: "2. Validasi Integritas Binary Engine (Header-Based)",
        content:
          "Memverifikasi kecocokan hash SHA-256 dari binary aksaventra_engine.exe dengan menyertakan header x-license-key.",
        codeSnippet: `POST /api/v1/engine/validate HTTP/1.1
x-license-key: AKSA-XXXX-YYYY-ZZZZ
Content-Type: application/json

{
  "version": "1.2.0",
  "sha256Hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}`,
      },
      {
        id: "telemetry-endpoint",
        code: "GET /api/v1/auth/telemetry",
        title: "3. Endpoint Status & Telemetri Portal",
        content:
          "Mengambil status koneksi database, jumlah lisensi aktif, persentase utilisasi perangkat, serta latensi respons server.",
      },
    ],
  },
  support: {
    topic: "support",
    tabLabel: "Bantuan Darurat IT",
    badge: "SecOps & Helpdesk",
    bannerText: "Kanal Penanganan Insiden Lisensi, Reset HWID & Pemulihan Akun",
    title: "Bantuan Darurat IT & SecOps Aksaventra",
    subtitle:
      "Panduan penanganan kendala akses administrator, insiden Hardware Mismatch (HTTP 403), dan kontak tim teknis",
    sections: [
      {
        id: "hwid-reset-procedure",
        code: "SUP-01",
        title: "1. Prosedur Reset Hardware ID (Migrasi Perangkat Klien)",
        content:
          "Langkah penanganan apabila perangkat klien mengalami pergantian perangkat keras sehingga memicu penolakan HTTP 403 Hardware Mismatch.",
        points: [
          "Masuk ke Dasbor menggunakan akun dengan peran ADMIN.",
          "Buka menu License Management -> Device Binding (HWID).",
          "Cari Serial Key klien terkait, verifikasi identitas pemohon, lalu jalankan aksi Reset HWID.",
        ],
      },
      {
        id: "account-lockout-recovery",
        code: "SUP-02",
        title: "2. Pemulihan Akses Akun Administrator",
        content:
          "Panduan apabila administrator lupa kata sandi atau mencurigai adanya sesi aktif yang tidak dikenali.",
        points: [
          "Gunakan halaman Lupa Kata Sandi (/forgot-password) untuk meminta tautan token pemulihan 15 menit.",
          "Gunakan halaman Atur Kata Sandi Baru (/reset-password) dan aktifkan opsi Force Logout.",
        ],
      },
      {
        id: "secops-contact",
        code: "SUP-03",
        title: "3. Kontak Kanal Darurat Tim SecOps",
        content:
          "Hubungi tim keamanan infrastruktur apabila menemukan indikasi kompromi Serial Key atau gangguan koneksi database.",
        points: [
          "Email Tim SecOps: secops@aksaventra.com",
          "Email Dukungan Teknis: support@aksaventra.com",
          "Sertakan ID Sesi Pemulihan, waktu kejadian (WIB), serta alamat IP saat melaporkan insiden.",
        ],
      },
    ],
  },
};

export const TERMS_SECTIONS: TermsSectionItem[] = AUTH_MODAL_TOPICS.sla.sections;
