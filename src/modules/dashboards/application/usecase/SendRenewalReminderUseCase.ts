import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { MailProviderInterface } from "@/modules/auth/domain/interfaces/MailProviderInterface";
import type {
  RenewalReminderItemDTO,
  RenewalReminderResponseDTO,
} from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { ClockInterface } from "@/modules/dashboards/domain/interfaces/ClockInterface";
import type { DashboardRepositoryInterface } from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";
import { EXPIRING_SOON_DAYS } from "@/modules/dashboards/shared/constants/dashboardConstants";

export interface SendRenewalReminderInputDTO {
  licenseIds?: string[];
  actorUserId?: string;
  actorIp?: string;
}

export class SendRenewalReminderUseCase
  implements BaseUseCase<SendRenewalReminderInputDTO, Result<RenewalReminderResponseDTO, string>>
{
  constructor(
    private readonly repository: DashboardRepositoryInterface,
    private readonly clock: ClockInterface,
    private readonly mailProvider?: MailProviderInterface,
  ) {}

  public async execute(
    input: SendRenewalReminderInputDTO = {},
  ): Promise<Result<RenewalReminderResponseDTO, string>> {
    try {
      const now = this.clock.now();
      const expiringUntil = new Date(now.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);

      const targetLicenses = await this.repository.findExpiringLicensesForReminder(
        now,
        expiringUntil,
        input.licenseIds,
      );

      if (targetLicenses.length === 0) {
        return Result.ok({
          success: true,
          totalProcessed: 0,
          sentCount: 0,
          message: "Tidak ada lisensi mendekati kedaluwarsa yang memerlukan pengingat.",
          reminders: [],
        });
      }

      const reminders: RenewalReminderItemDTO[] = [];

      for (const license of targetLicenses) {
        const diffMs = license.expiresAt.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        let status: "SENT" | "QUEUED" | "FAILED" = "SENT";

        if (this.mailProvider && license.recipientEmail) {
          try {
            await this.mailProvider.sendMail({
              to: license.recipientEmail,
              subject: `[Pemberitahuan] Perpanjangan Masa Berlaku Lisensi Aksaventra Engine - ${license.clientName}`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 16px; color: #1e293b;">
                  <h2 style="color: #0f172a;">Pemberitahuan Perpanjangan Lisensi Aksaventra Engine</h2>
                  <p>Halo <strong>${license.clientName}</strong>,</p>
                  <p>Lisensi engine Anda dengan kunci serial <code>${license.serialKey}</code> akan kedaluwarsa dalam <strong>${daysRemaining === 0 ? "hari ini" : `${daysRemaining} hari lagi`}</strong> (pada ${license.expiresAt.toLocaleDateString("id-ID")}).</p>
                  <p>Harap segera berkoordinasi dengan Tim Administrator Aksaventra untuk melakukan perpanjangan lisensi agar akses dan operasional engine tetap berjalan normal tanpa hambatan.</p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #64748b;">Pesan otomatis dikirim oleh Aksaventra Engine Validation & License Portal.</p>
                </div>
              `,
            });
          } catch (_err) {
            status = "FAILED";
          }
        }

        // Record Audit Log for compliance
        await this.repository.createAuditLog({
          userId: input.actorUserId,
          action: "RENEWAL_REMINDER_SENT",
          target: `License:${license.id}`,
          details: JSON.stringify({
            clientName: license.clientName,
            serialKey: license.serialKey,
            expiresAt: license.expiresAt.toISOString(),
            daysRemaining,
            recipientEmail: license.recipientEmail || null,
            status,
          }),
          ipAddress: input.actorIp,
        });

        reminders.push({
          id: license.id,
          clientName: license.clientName,
          serialKey: license.serialKey,
          daysRemaining,
          expiresAt: license.expiresAt.toISOString(),
          recipientEmail: license.recipientEmail || null,
          status,
        });
      }

      const sentCount = reminders.filter((r) => r.status === "SENT").length;

      return Result.ok({
        success: true,
        totalProcessed: targetLicenses.length,
        sentCount,
        message: `Berhasil mengirimkan pengingat perpanjangan kepada ${sentCount} klien.`,
        reminders,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal memproses pengiriman pengingat";
      return Result.fail(msg);
    }
  }
}
