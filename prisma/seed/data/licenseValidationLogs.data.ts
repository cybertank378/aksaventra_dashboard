import crypto from "node:crypto";
import type { LicenseValidationResult } from "@prisma/client";

export interface ValidationLogSeedItem {
  id: string;
  serialKeyHint: string;
  hwidHash: string | null;
  result: LicenseValidationResult;
  statusCode: number;
  engineVersion: string | null;
  clientIp: string | null;
  userAgent: string | null;
  latencyMs: number | null;
  checkedAt: Date;
}

export function generateValidationLogSeedData(): ValidationLogSeedItem[] {
  const items: ValidationLogSeedItem[] = [];
  const now = Date.now();

  const dummyHwid = "1caee749-5928-4c89-a052-ca4f27af8c41";
  const dummyHwidHash = crypto.createHash("sha256").update(dummyHwid).digest("hex");
  const mismatchHwid = "bad-device-hwid-9999-0000";
  const mismatchHwidHash = crypto.createHash("sha256").update(mismatchHwid).digest("hex");

  // Spans 90 days (from 89 days ago up to today)
  for (let day = 89; day >= 0; day--) {
    const dayTimestamp = now - day * 24 * 60 * 60 * 1000;

    // Daily volume deterministic curve: base 5, with weekend/weekday modulation
    const dayOfWeek = new Date(dayTimestamp).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const verifiedCount = isWeekend ? 3 + (day % 3) : 8 + (day % 5);

    // 1. Verified events
    for (let i = 0; i < verifiedCount; i++) {
      const minuteOffset = i * 45 * 60 * 1000;
      items.push({
        id: `seed-vlog-day-${day}-ver-${i}`,
        serialKeyHint: "9F2A",
        hwidHash: dummyHwidHash,
        result: "VERIFIED",
        statusCode: 200,
        engineVersion: "v2.2.1",
        clientIp: "192.168.1.100",
        userAgent: "AksaventraEngine/2.2.1 (Windows)",
        latencyMs: 12 + ((day + i) % 15),
        checkedAt: new Date(dayTimestamp + minuteOffset),
      });
    }

    // 2. Activated events (every 3 days)
    if (day % 3 === 0) {
      items.push({
        id: `seed-vlog-day-${day}-act-0`,
        serialKeyHint: "M1A1",
        hwidHash: dummyHwidHash,
        result: "ACTIVATED",
        statusCode: 200,
        engineVersion: "v2.2.1",
        clientIp: "10.0.0.12",
        userAgent: "AksaventraEngine/2.2.1 (Windows)",
        latencyMs: 25 + (day % 10),
        checkedAt: new Date(dayTimestamp + 30 * 60 * 1000),
      });
    }

    // 3. HWID Mismatch events (every 4 days)
    if (day % 4 === 0) {
      items.push({
        id: `seed-vlog-day-${day}-mis-0`,
        serialKeyHint: "5DAY",
        hwidHash: mismatchHwidHash,
        result: "HWID_MISMATCH",
        statusCode: 403,
        engineVersion: "v2.2.0",
        clientIp: "172.16.0.44",
        userAgent: "AksaventraEngine/2.2.0 (Windows)",
        latencyMs: 8 + (day % 5),
        checkedAt: new Date(dayTimestamp + 120 * 60 * 1000),
      });
    }

    // 4. Rejected events (Expired / Not Found / Suspended / Bad Request)
    if (day % 2 === 0) {
      const isNotFound = day % 4 === 0;
      const isExpired = day % 6 === 0;
      const isSuspended = day % 8 === 0;

      const result: LicenseValidationResult = isNotFound
        ? "NOT_FOUND"
        : isExpired
          ? "EXPIRED"
          : isSuspended
            ? "SUSPENDED"
            : "BAD_REQUEST";

      const statusCode = result === "NOT_FOUND" ? 404 : result === "BAD_REQUEST" ? 400 : 401;

      items.push({
        id: `seed-vlog-day-${day}-rej-0`,
        serialKeyHint: isNotFound ? "0000" : "8A1C",
        hwidHash: dummyHwidHash,
        result,
        statusCode,
        engineVersion: "v2.1.0",
        clientIp: "10.0.1.55",
        userAgent: "AksaventraEngine/2.1.0",
        latencyMs: 10 + (day % 8),
        checkedAt: new Date(dayTimestamp + 200 * 60 * 1000),
      });
    }
  }

  return items;
}

