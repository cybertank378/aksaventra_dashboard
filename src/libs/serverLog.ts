/**
 * Server-side logger for debugging and security auditing.
 * Prevents raw unstructured logging in production.
 */
export function serverLog(tag: string, ...details: unknown[]): void {
  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error(`[SERVER_LOG] ${tag}`, ...details);
  }
}
