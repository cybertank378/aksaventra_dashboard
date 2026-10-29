# ISSUE: Development of Authentication Suite (`sections/auth`) - KMS Enterprise

## Metadata
- **Issue ID:** `ISSUE-AUTH-SUITE-01`
- **Epic:** Authentication & Security Suite
- **Path:** `src/sections/auth/`
- **Priority:** High
- **Status:** Ready for Development

---

## 📂 Project Directory Structure Compliance
All implementations within the authentication module must strictly adhere to the following Atomic Design file tree:

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

## 🛠️ Technical Requirements & Integration Guidelines

### 1. Organisms Integration with `useAuthApi.ts`
* **Target Components:** `LoginForm.tsx`, `ForgetPasswordForm.tsx`, `ChangePasswordForm.tsx`, `ResetPasswordForm.tsx`, `RegisterForm.tsx`, and `VerifyEmailForm.tsx`.
* **Implementation Rule:**
  * Import and consume the custom hook `useAuthApi` directly inside the organism level.
  * Handle asynchronous states (`isLoading`, `error`, `isSuccess`) cleanly.
  * Execute API payload submissions (e.g., credentials, tokens, new password hashes) through the hook's provided methods.

### 2. Utilization of `shared-ui` Components
* **Rule:** Avoid redundant custom primitives. Leverage robust foundational components from the project's `@shared-ui` library (such as buttons, modals, cards, and typography wrappers).
* **Atoms Layer:** Wrap or compose `shared-ui` primitives inside local atoms (`AuthTextField.tsx`, `AuthCheckbox.tsx`) to guarantee consistent *Light Theme* padding, focus states, border-radius, and typography.

---

## 📋 Acceptance Criteria & Task Breakdown

- [ ] **Atoms (`src/sections/auth/atoms/`):**
  - [ ] Implement `AuthTextField.tsx` supporting password visibility toggle (eye icon), helper text, and error states using `shared-ui` inputs.
  - [ ] Implement `AuthCheckbox.tsx` for options like "Remember device for 30 days".
- [ ] **Molecules (`src/sections/auth/molecules/`):**
  - [ ] Implement `TermsConditionsModal.tsx` utilizing `shared-ui` Dialog/Modal primitives.
- [ ] **Organisms (`src/sections/auth/organisms/`):**
  - [ ] Integrate `useAuthApi.ts` inside `LoginForm.tsx` and handle login submissions and error toasts.
  - [ ] Integrate `useAuthApi.ts` inside `ForgetPasswordForm.tsx` and `ChangePasswordForm.tsx`.
- [ ] **Pages (`src/sections/auth/pages/`):**
  - [ ] Assemble `AuthPage.tsx` incorporating the respective organism forms within a responsive split-screen layout (Light Theme, 1280px reference width).