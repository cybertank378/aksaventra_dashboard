import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import { ExcelAdapter } from "@/core/infrastructure/adapters/ExcelAdapter";
import type { ExportValidationLogsQueryDTO } from "../../domain/dto/ValidationLogRequestDTO";
import type { ValidationLogRepositoryInterface } from "../../domain/interfaces/ValidationLogInterfaces";
import { ValidationLogMapper } from "../../domain/mapper/ValidationLogMapper";

export interface ExportValidationLogsResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

export class ExportValidationLogsUseCase
  implements BaseUseCase<ExportValidationLogsQueryDTO, Result<ExportValidationLogsResult, string>>
{
  constructor(private readonly repo: ValidationLogRepositoryInterface) {}

  public async execute(
    params: ExportValidationLogsQueryDTO = {},
  ): Promise<Result<ExportValidationLogsResult, string>> {
    try {
      const records = await this.repo.exportLogs(params);
      const dtoList = ValidationLogMapper.toDTOList(records);

      const rows = dtoList.map((item) => ({
        timestamp: item.checkedAt,
        clientName: item.clientName ?? "Klien Tidak Terdaftar",
        serialKey: item.serialKeyMasked,
        result: item.result,
        statusCode: item.statusCode,
        engineVersion: item.engineVersion ?? "-",
        hwidHash: item.hwidHash ?? "-",
        clientIp: item.clientIp ?? "-",
        latencyMs: item.latencyMs !== null ? `${item.latencyMs} ms` : "-",
        userAgent: item.userAgent ?? "-",
      }));

      const columns: { header: string; key: keyof (typeof rows)[0] }[] = [
        { header: "Waktu (ISO)", key: "timestamp" },
        { header: "Nama Klien", key: "clientName" },
        { header: "Serial Key Hint", key: "serialKey" },
        { header: "Hasil Validasi", key: "result" },
        { header: "Kode Status HTTP", key: "statusCode" },
        { header: "Versi Engine", key: "engineVersion" },
        { header: "Hash HWID", key: "hwidHash" },
        { header: "Alamat IP", key: "clientIp" },
        { header: "Latensi", key: "latencyMs" },
        { header: "User-Agent", key: "userAgent" },
      ];

      const csvBuffer = ExcelAdapter.toCsvBuffer({
        data: rows,
        columns,
        sheetName: "Log Validasi",
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `validation-logs-${timestamp}.csv`;

      return Result.ok({
        buffer: csvBuffer,
        filename,
        contentType: "text/csv; charset=utf-8",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengekspor data log validasi";
      return Result.fail(message);
    }
  }
}
