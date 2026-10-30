import { prisma } from "@/core/libs/prisma";
import type { SystemDiagnosticsDTO } from "../../domain/dto/SystemSettingsResponseDTO";
import type { EnvironmentDiagnosticsProviderInterface } from "../../domain/interfaces/SystemSettingsInterfaces";

export class EnvironmentDiagnosticsProvider implements EnvironmentDiagnosticsProviderInterface {
  public async getDiagnostics(): Promise<SystemDiagnosticsDTO> {
    const rawDriver = process.env.STORAGE_DRIVER?.toLowerCase();
    const storageDriver: "local" | "s3" = rawDriver === "s3" ? "s3" : "local";

    let databaseConnected = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseConnected = true;
    } catch {
      databaseConnected = false;
    }

    const vaultSecretConfigured = Boolean(
      process.env.VAULT_MASTER_SECRET && process.env.VAULT_MASTER_SECRET.trim().length >= 16,
    );

    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT);

    return {
      storageDriver,
      storageHealthy: true,
      databaseConnected,
      vaultSecretConfigured,
      smtpConfigured,
      targetSlaLatencyMs: 200,
      appTimezone: process.env.TZ || "Asia/Jakarta",
    };
  }
}
