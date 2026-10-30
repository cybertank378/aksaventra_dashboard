import { prisma } from "@/core/libs/prisma";
import type { PurgeResultDTO } from "../../domain/dto/SystemSettingsResponseDTO";
import type {
  SettingsDiffRecord,
  SystemConfigurationEntity,
} from "../../domain/entity/SystemConfigurationEntity";
import type { SystemSettingsRepositoryInterface } from "../../domain/interfaces/SystemSettingsInterfaces";
import { SystemSettingsMapper } from "../../domain/mapper/SystemSettingsMapper";
import type { SettingCategoryType } from "../../shared/constants/defaultSystemSettings";

export class SystemSettingsRepository implements SystemSettingsRepositoryInterface {
  public async getAllSettings(): Promise<SystemConfigurationEntity> {
    try {
      const delegate = (prisma as unknown as { systemSetting?: typeof prisma.systemSetting })
        .systemSetting;

      if (!delegate) {
        return SystemSettingsMapper.toEntity([]);
      }

      const records = await delegate.findMany({
        include: {
          updatedBy: {
            select: {
              name: true,
            },
          },
        },
      });

      return SystemSettingsMapper.toEntity(records);
    } catch (error) {
      console.warn(
        "[SystemSettingsRepository.getAllSettings] Falling back to default settings:",
        error,
      );
      return SystemSettingsMapper.toEntity([]);
    }
  }

  public async saveSettings(
    category: SettingCategoryType,
    diffs: SettingsDiffRecord[],
    userId?: string,
    ipAddress?: string,
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const diff of diffs) {
        const stringValue = String(diff.newValue);
        await tx.systemSetting.upsert({
          where: { key: diff.key },
          create: {
            key: diff.key,
            category,
            value: stringValue,
            valueType: typeof diff.newValue,
            updatedById: userId,
          },
          update: {
            value: stringValue,
            updatedById: userId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: userId ?? null,
          action: "SETTINGS_UPDATED",
          target: `SystemSetting:${category}`,
          details: JSON.stringify({
            category,
            changesCount: diffs.length,
            diffs,
          }),
          ipAddress: ipAddress ?? null,
        },
      });
    });
  }

  public async resetSettings(
    category: SettingCategoryType,
    diffs: SettingsDiffRecord[],
    userId?: string,
    ipAddress?: string,
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const diff of diffs) {
        const stringValue = String(diff.newValue);
        await tx.systemSetting.upsert({
          where: { key: diff.key },
          create: {
            key: diff.key,
            category,
            value: stringValue,
            valueType: typeof diff.newValue,
            updatedById: userId,
          },
          update: {
            value: stringValue,
            updatedById: userId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: userId ?? null,
          action: "SETTINGS_RESET",
          target: `SystemSetting:${category}`,
          details: JSON.stringify({
            category,
            resetKeys: diffs.map((d) => d.key),
            diffs,
          }),
          ipAddress: ipAddress ?? null,
        },
      });
    });
  }

  public async purgeExpiredLogs(
    target: "ALL" | "VALIDATION_LOGS" | "UPDATE_LOGS",
    validationCutoff: Date,
    updateCutoff: Date,
    userId?: string,
    ipAddress?: string,
  ): Promise<PurgeResultDTO> {
    return await prisma.$transaction(async (tx) => {
      let purgedValidationLogsCount = 0;
      let purgedUpdateLogsCount = 0;

      if (target === "ALL" || target === "VALIDATION_LOGS") {
        const deleted = await tx.licenseValidationLog.deleteMany({
          where: {
            checkedAt: {
              lt: validationCutoff,
            },
          },
        });
        purgedValidationLogsCount = deleted.count;
      }

      if (target === "ALL" || target === "UPDATE_LOGS") {
        const deleted = await tx.engineUpdateLog.deleteMany({
          where: {
            createdAt: {
              lt: updateCutoff,
            },
          },
        });
        purgedUpdateLogsCount = deleted.count;
      }

      const totalPurgedCount = purgedValidationLogsCount + purgedUpdateLogsCount;

      await tx.auditLog.create({
        data: {
          userId: userId ?? null,
          action: "LOGS_PURGED",
          target: "SystemSetting:Maintenance",
          details: JSON.stringify({
            target,
            purgedValidationLogsCount,
            purgedUpdateLogsCount,
            totalPurgedCount,
            validationCutoff: validationCutoff.toISOString(),
            updateCutoff: updateCutoff.toISOString(),
          }),
          ipAddress: ipAddress ?? null,
        },
      });

      return {
        purgedValidationLogsCount,
        purgedUpdateLogsCount,
        totalPurgedCount,
        purgedBeforeDate: validationCutoff.toISOString(),
      };
    });
  }
}
