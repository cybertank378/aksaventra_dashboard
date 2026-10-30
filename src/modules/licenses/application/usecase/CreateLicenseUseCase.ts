import { randomUUID } from "node:crypto";
import { Result } from "@/core/domain/Result";
import type { UserRole } from "@/libs/enums";
import type { CreateLicenseDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";
import type { LicenseAdminItemDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import { LicenseEntity } from "@/modules/licenses/domain/entity/LicenseEntity";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";
import { LicenseMapper } from "@/modules/licenses/domain/mapper/LicenseMapper";
import { SerialKeyGeneratorRule } from "@/modules/licenses/domain/rules/SerialKeyGeneratorRule";

export class CreateLicenseUseCase {
  constructor(private readonly repo: LicenseRepositoryInterface) {}

  public async execute(
    dto: CreateLicenseDTO,
    userId?: string,
    ipAddress?: string,
    role?: UserRole,
  ): Promise<Result<LicenseAdminItemDTO, Error>> {
    try {
      const clientName = dto.clientName ? dto.clientName.trim() : "";
      if (!clientName) {
        return Result.fail(new Error("Nama klien wajib diisi"));
      }

      // 1. Tentukan serial key
      let serialKey = dto.customSerialKey ? dto.customSerialKey.trim() : "";
      if (!serialKey) {
        serialKey = SerialKeyGeneratorRule.generate(dto.tier ?? "PRO");
      }

      // 2. Pastikan serial key belum dipakai
      const existing = await this.repo.findBySerialKey(serialKey);
      if (existing) {
        return Result.fail(new Error(`Serial key "${serialKey}" sudah terdaftar`));
      }

      // 3. Vault secret kriptografis
      const vaultSecret = dto.vaultSecret?.trim() || SerialKeyGeneratorRule.generateVaultSecret();

      // 4. Hitung masa kedaluwarsa
      let expiresAt: Date | null = null;
      if (dto.expiresAt) {
        expiresAt = new Date(dto.expiresAt);
      } else {
        const months = dto.durationMonths && dto.durationMonths > 0 ? dto.durationMonths : 12;
        const now = new Date();
        expiresAt = new Date(now.getFullYear(), now.getMonth() + months, now.getDate(), 23, 59, 59);
      }

      const license = LicenseEntity.create({
        id: randomUUID(),
        serialKey,
        clientName,
        npsn: dto.npsn?.trim() || null,
        userId: dto.userId?.trim() || null,
        vaultSecret,
        status: "ACTIVE",
        expiresAt,
        engineVersion: dto.engineVersion?.trim() || "v1.4.2",
      });

      await this.repo.save(license, {
        userId: userId ?? null,
        action: "LICENSE_CREATED",
        target: license.id,
        details: JSON.stringify({
          clientName,
          serialKey: LicenseMapper.maskSerialKey(serialKey),
          tier: dto.tier ?? "PRO",
          expiresAt: expiresAt.toISOString(),
        }),
        ipAddress: ipAddress ?? null,
      });

      const adminDTO = LicenseMapper.toAdminDTO(license, role);
      return Result.ok(adminDTO);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menerbitkan lisensi baru";
      return Result.fail(new Error(message));
    }
  }
}
