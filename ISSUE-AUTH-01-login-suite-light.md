# feat(auth): Implementasi Halaman Login, Forgot Password & Change Password Administrator (Hexagonal + Atomic Design, Light Mode)

## 📌 Metadata Issue
- **Issue ID:** `ISSUE-AUTH-LOGIN-01`
- **Epic:** Authentication & Security Suite
- **Bounded Context:** `src/modules/auth/`
- **Component / Path:** `src/sections/auth/`
- **Routes:**
  - `src/app/(public)/login/page.tsx`
  - `src/app/(public)/forgot-password/page.tsx`
  - `src/app/(public)/reset-password/page.tsx`
- **Prioritas:** `High`
- **Status:** `Ready for Development`

---

## 📂 Struktur Direktori Target (Atomic Design Pattern)
Implementasi kode harus mematuhi struktur direktori berikut di dalam basis kode project (Zero Barrel Files):

```text
src/
└── sections/
    └── auth/
        ├── atoms/
        │   ├── AuthCheckbox.tsx
        │   ├── AuthTextField.tsx
        │   ├── quotes.ts
        │   └── terms.ts
        ├── molecules/
        │   ├── AuthTelemetryCard.tsx
        │   └── TermsConditionsModal.tsx
        ├── organisms/
        │   ├── ChangePasswordForm.tsx
        │   ├── ForgetPasswordForm.tsx
        │   ├── LoginForm.tsx
        │   ├── RegisterForm.tsx
        │   ├── ResetPasswordForm.tsx
        │   └── VerifyEmailForm.tsx
        └── pages/
            └── AuthPage.tsx
```

---

## 🎯 Detail & Spesifikasi Teknis

### 1. Integrasi API (`useAuthApi.ts`)
- **Hook:** `useAuthApi` (`src/modules/auth/presentation/hooks/useAuthApi.ts`) diimpor dan diintegrasikan langsung pada level *organisms* (`LoginForm.tsx`, `ForgetPasswordForm.tsx`, `ChangePasswordForm.tsx`, `ResetPasswordForm.tsx`).
- **Fungsionalitas:**
  - Mengirim payload kredensial (`email`, `password`) ke endpoint `/api/v1/auth/login`.
  - Mengirim permintaan token pemulihan ke `/api/v1/auth/forgot-password` dan pengaturan ulang sandi ke `/api/v1/auth/reset-password` serta `/api/v1/auth/change-password`.
  - Menangani status `loading`, pesan `error` validasi server, serta pengalihan halaman (`redirect`) ke `/dashboard` setelah autentikasi berhasil.

### 2. Pemanfaatan Shared UI (`src/shared-ui/component/`)
- Menggunakan komponen dasar dari `src/shared-ui/component/` (`Button`, `Card`, `Checkbox`, `TextField`, `Modal`, `Divider`) tanpa membuat elemen HTML mentah yang duplikat.
- Memanfaatkan *atoms* lokal (`AuthTextField.tsx` dan `AuthCheckbox.tsx`) untuk menjaga konsistensi *padding*, *border-radius*, dan *focus state* dalam tema terang (*Light Mode*).

---

## 📋 Task Breakdown & Acceptance Criteria

- [x] **1. Atoms & Molecules (`src/sections/auth/atoms/` & `molecules/`):**
  - [x] `AuthTextField.tsx` mendukung *toggle password visibility* dan status *error state*.
  - [x] `AuthCheckbox.tsx` merender opsi persetujuan / pengingat sesi dengan tema *Light Mode*.
  - [x] `AuthTelemetryCard.tsx` menampilkan ringkasan telemetri portal secara *real-time* di panel branding kiri.
- [x] **2. Organisms (`src/sections/auth/organisms/`):**
  - [x] `LoginForm.tsx`: Mengimplementasikan form login yang terhubung dengan `useAuthApi.ts`.
  - [x] `ForgetPasswordForm.tsx`: Mengimplementasikan alur pengiriman tautan pemulihan kata sandi.
  - [x] `ResetPasswordForm.tsx` & `ChangePasswordForm.tsx`: Mengimplementasikan pembaruan kata sandi dengan validasi kebijakan keamanan (`PasswordPolicyRule`).
- [x] **3. Pages (`src/sections/auth/pages/AuthPage.tsx`):**
  - [x] Merender tata letak *split-screen* dalam *Light Mode* yang responsif di resolusi desktop (`1280px+`), tablet, dan seluler.
