import type {
  DashboardSummaryResponseDTO,
  RenewalWarningDTO,
} from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import { GrowthRateRule } from "@/modules/dashboards/domain/rules/GrowthRateRule";
import { UtilizationRate } from "@/modules/dashboards/domain/value-object/UtilizationRate";
import { EXPIRING_SOON_DAYS } from "@/modules/dashboards/shared/constants/dashboardConstants";

export interface RenewalWarningInput {
  id: string;
  clientName: string;
  serialKey: string;
  expiresAt: Date;
}

export interface DashboardSummaryProps {
  activeLicensesCount: number;
  previousActiveLicensesCount: number;
  expiringLicensesCount: number;
  expiredOrRevokedCount: number;
  activeWithHwidCount: number;
  renewalWarnings: RenewalWarningInput[];
  now: Date;
}

export class DashboardSummaryEntity {
  private readonly props: DashboardSummaryProps;

  constructor(props: DashboardSummaryProps) {
    this.props = { ...props };
  }

  get activeLicensesCount(): number {
    return this.props.activeLicensesCount;
  }

  get expiringLicensesCount(): number {
    return this.props.expiringLicensesCount;
  }

  get expiredOrRevokedCount(): number {
    return this.props.expiredOrRevokedCount;
  }

  get activeWithHwidCount(): number {
    return this.props.activeWithHwidCount;
  }

  get renewalWarnings(): readonly RenewalWarningInput[] {
    return this.props.renewalWarnings;
  }

  public hasRenewalWarning(): boolean {
    return this.props.renewalWarnings.length > 0;
  }

  public getUtilizationRate(): UtilizationRate {
    return new UtilizationRate(this.props.activeWithHwidCount, this.props.activeLicensesCount);
  }

  public getGrowthRate(): number {
    return GrowthRateRule.calculate(
      this.props.activeLicensesCount,
      this.props.previousActiveLicensesCount,
    );
  }

  public toDTO(): DashboardSummaryResponseDTO {
    const renewalWarningsDTO: RenewalWarningDTO[] = this.props.renewalWarnings.map((warning) => {
      const cleanKey = warning.serialKey.trim();
      const masked =
        cleanKey.length > 8
          ? `${cleanKey.slice(0, 4)}-••••-••••-${cleanKey.slice(-4)}`
          : `••••-${cleanKey.slice(-4)}`;

      const daysRemaining = Math.max(
        0,
        Math.ceil((warning.expiresAt.getTime() - this.props.now.getTime()) / (24 * 60 * 60 * 1000)),
      );

      return {
        id: warning.id,
        clientName: warning.clientName,
        serialKeyMasked: masked,
        daysRemaining,
        expiresAt: warning.expiresAt.toISOString(),
      };
    });

    return {
      kpis: {
        activeLicenses: {
          total: this.props.activeLicensesCount,
          growthRate: this.getGrowthRate(),
        },
        expiringLicenses: {
          total: this.props.expiringLicensesCount,
          daysThreshold: EXPIRING_SOON_DAYS,
        },
        expiredOrRevoked: {
          total: this.props.expiredOrRevokedCount,
        },
        hwidUtilization: {
          rate: this.getUtilizationRate().value,
          activeWithHwid: this.props.activeWithHwidCount,
          totalActive: this.props.activeLicensesCount,
        },
      },
      renewalWarnings: renewalWarningsDTO,
    };
  }
}
