/**
 * Mendeteksi apakah error merupakan sinyal internal Next.js untuk
 * bail-out prerendering / dynamic server usage (misalnya NEXT_PRERENDER_INTERRUPTED,
 * DYNAMIC_SERVER_USAGE, NEXT_REDIRECT, NEXT_NOT_FOUND).
 * Error jenis ini WAJIB di-rethrow agar pipeline prerender Next.js
 * dapat menandai rute sebagai dinamis secara bersih tanpa memicu log kesalahan palsu saat build.
 */
export function isNextBailoutError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("digest" in error && typeof (error as { digest?: unknown }).digest === "string") {
    const digest = (error as { digest: string }).digest;
    if (
      digest === "NEXT_PRERENDER_INTERRUPTED" ||
      digest === "DYNAMIC_SERVER_USAGE" ||
      digest.startsWith("NEXT_")
    ) {
      return true;
    }
  }

  return false;
}
