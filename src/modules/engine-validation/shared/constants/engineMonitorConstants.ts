export const DEFAULT_POLL_INTERVAL_MS = 5000;
export const SLA_TARGET_MS = 200;
export const ONLINE_THRESHOLD_HOURS = 24;
export const THROUGHPUT_WINDOW_MINUTES = 15;
export const ANOMALY_WINDOW_HOURS = 1;

export const LIVE_FEED_GROUPS = ["ALL", "VERIFIED", "ACTIVATED", "MISMATCH", "REJECTED"] as const;

export type LiveFeedGroup = (typeof LIVE_FEED_GROUPS)[number];

export const BINARY_INTEGRITY_OUTCOMES = [
  "VALID",
  "HASH_MISMATCH",
  "REVOKED",
  "UNKNOWN_VERSION",
] as const;

export type BinaryIntegrityOutcome = (typeof BINARY_INTEGRITY_OUTCOMES)[number];
