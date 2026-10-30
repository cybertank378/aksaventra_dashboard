import { vi } from "vitest";
import type {
  EngineMonitorSummaryResponseDTO,
  LiveFeedListResponseDTO,
  PatchBinaryStatusResponseDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type {
  EngineMonitorRepositoryInterface,
  RawReleaseRecord,
  RawValidationLogRecord,
} from "@/modules/engine-validation/domain/interfaces/EngineMonitorInterfaces";

export function createMockSummaryResponse(
  overrides?: Partial<EngineMonitorSummaryResponseDTO>,
): EngineMonitorSummaryResponseDTO {
  return {
    requestsLast15m: 342,
    requestsPerMinuteRate: 22.8,
    avgLatencyMs24h: 38.5,
    p95LatencyMs24h: 84.0,
    slaCompliancePercent24h: 99.7,
    onlineDevices24h: 18,
    anomaliesLast1h: 3,
    outcomeBreakdown24h: {
      verifiedCount: 310,
      activatedCount: 12,
      mismatchCount: 15,
      rejectedCount: 5,
      totalCount: 342,
    },
    clientVersionDistribution: [
      {
        engineVersion: "v2.2.2",
        deviceCount: 15,
        percent: 83.3,
        isLatestStable: true,
      },
      {
        engineVersion: "v2.3.0-beta.1",
        deviceCount: 2,
        percent: 11.1,
        isLatestStable: false,
      },
      {
        engineVersion: "v2.1.0",
        deviceCount: 1,
        percent: 5.6,
        isLatestStable: false,
      },
    ],
    latestActiveRelease: {
      version: "v2.2.2",
      channel: "STABLE",
      checksumSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      publishedAt: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createMockReleaseRecord(overrides?: Partial<RawReleaseRecord>): RawReleaseRecord {
  return {
    id: "rel-test-1",
    version: "v2.2.2",
    channel: "STABLE",
    checksumSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    fileSize: 48920112,
    isActive: true,
    downloadCount: 142,
    publishedAt: new Date("2026-10-15T00:00:00Z"),
    createdAt: new Date("2026-10-15T00:00:00Z"),
    updatedAt: new Date("2026-10-15T00:00:00Z"),
    ...overrides,
  };
}

export function createMockValidationLogRecord(
  overrides?: Partial<RawValidationLogRecord>,
): RawValidationLogRecord {
  return {
    id: "log-test-1",
    licenseId: "lic-test-1",
    serialKeyHint: "AKSA-9F2A",
    hwidHash: "8f1c9901ad45cb2b001a1c9012a90b4321098765432109876543210987654321",
    result: "VERIFIED",
    statusCode: 200,
    engineVersion: "v2.2.2",
    clientIp: "103.14.22.8",
    userAgent: "aksaventra_engine/2.2.2 (Windows NT 10.0; Win64; x64)",
    latencyMs: 32,
    checkedAt: new Date(),
    license: {
      clientName: "PT Digital Nusantara Sejahtera",
      serialKey: "AKSA-2026-ABCD-9F2A",
    },
    ...overrides,
  };
}

export function createMockEngineMonitorRepository(): EngineMonitorRepositoryInterface {
  return {
    getSummaryMetrics: vi.fn().mockResolvedValue(createMockSummaryResponse()),
    getLiveFeed: vi.fn().mockResolvedValue({
      items: [
        {
          id: "log-test-1",
          licenseId: "lic-test-1",
          clientName: "PT Digital Nusantara Sejahtera",
          serialKeyMasked: "AKSA-••••-••••-9F2A",
          serialKeyHint: "AKSA-9F2A",
          hwidHash: "8f1c9901ad45cb2b",
          result: "VERIFIED",
          statusCode: 200,
          engineVersion: "v2.2.2",
          clientIp: "103.14.22.8",
          latencyMs: 32,
          isSlaBreached: false,
          checkedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        totalItems: 1,
        totalPages: 1,
      },
    } satisfies LiveFeedListResponseDTO),
    listBinaryReleases: vi.fn().mockResolvedValue([]),
    findBinaryReleaseByVersion: vi.fn().mockResolvedValue(createMockReleaseRecord()),
    findBinaryReleaseById: vi.fn().mockResolvedValue(createMockReleaseRecord()),
    updateBinaryStatus: vi.fn().mockResolvedValue({
      id: "rel-test-1",
      version: "v2.2.2",
      isActive: false,
      updatedAt: new Date().toISOString(),
    } satisfies PatchBinaryStatusResponseDTO),
  };
}
