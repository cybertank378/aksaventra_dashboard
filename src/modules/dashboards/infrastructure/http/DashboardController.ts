import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/http/BaseController";
import type { DashboardServices } from "@/modules/dashboards/application/services/DashboardServices";
import { DashboardValidator } from "@/modules/dashboards/infrastructure/validators/dashboard.validator";

export class DashboardController extends BaseController {
  constructor(private readonly services: DashboardServices) {
    super();
  }

  // Not used directly as BaseController requires handle implementation, but we expose granular methods
  protected async handle(_req: NextRequest): Promise<NextResponse> {
    return this.getSummary(_req);
  }

  public async getSummary(_req: NextRequest): Promise<NextResponse> {
    try {
      const result = await this.services.getSummary();
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }
      return NextResponse.json(
        { message: result.getError() || "Gagal memuat ringkasan dasbor" },
        { status: 500 },
      );
    } catch (_error) {
      return NextResponse.json(
        { message: "Terjadi kesalahan internal pada server" },
        { status: 500 },
      );
    }
  }

  public async getRecentLicenses(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const queryParams = {
        status: url.searchParams.get("status") ?? undefined,
        page: url.searchParams.get("page") ?? undefined,
        limit: url.searchParams.get("limit") ?? undefined,
      };

      const validation = DashboardValidator.validateRecentLicenses(queryParams);
      if (!validation.isValid || !validation.data) {
        const firstErrorKey = Object.keys(validation.errors)[0];
        return NextResponse.json(
          { message: validation.errors[firstErrorKey] || "Query tidak valid" },
          { status: 400 },
        );
      }

      const result = await this.services.getRecentLicenses(validation.data);
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }
      return NextResponse.json(
        { message: result.getError() || "Gagal memuat lisensi terbaru" },
        { status: 500 },
      );
    } catch (_error) {
      return NextResponse.json(
        { message: "Terjadi kesalahan internal pada server" },
        { status: 500 },
      );
    }
  }

  public async getActivities(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const queryParams = {
        limit: url.searchParams.get("limit") ?? undefined,
      };

      const validation = DashboardValidator.validateActivities(queryParams);
      if (!validation.isValid || !validation.data) {
        const firstErrorKey = Object.keys(validation.errors)[0];
        return NextResponse.json(
          { message: validation.errors[firstErrorKey] || "Query tidak valid" },
          { status: 400 },
        );
      }

      const result = await this.services.getRecentActivities(validation.data);
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }
      return NextResponse.json(
        { message: result.getError() || "Gagal memuat riwayat aktivitas" },
        { status: 500 },
      );
    } catch (_error) {
      return NextResponse.json(
        { message: "Terjadi kesalahan internal pada server" },
        { status: 500 },
      );
    }
  }

  public async getValidationTrend(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const queryParams = {
        range: url.searchParams.get("range") ?? undefined,
      };

      const validation = DashboardValidator.validateChartRange(queryParams);
      if (!validation.isValid || !validation.data) {
        const firstErrorKey = Object.keys(validation.errors)[0];
        return NextResponse.json(
          { message: validation.errors[firstErrorKey] || "Query tidak valid" },
          { status: 400 },
        );
      }

      const result = await this.services.getValidationTrend(validation.data);
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }
      return NextResponse.json(
        { message: result.getError() || "Gagal memuat tren validasi engine" },
        { status: 500 },
      );
    } catch (_error) {
      return NextResponse.json(
        { message: "Terjadi kesalahan internal pada server" },
        { status: 500 },
      );
    }
  }

  public async getLicenseStatusDistribution(_req: NextRequest): Promise<NextResponse> {
    try {
      const result = await this.services.getLicenseStatusDistribution();
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }
      return NextResponse.json(
        { message: result.getError() || "Gagal memuat distribusi status lisensi" },
        { status: 500 },
      );
    } catch (_error) {
      return NextResponse.json(
        { message: "Terjadi kesalahan internal pada server" },
        { status: 500 },
      );
    }
  }

  public async getIssuanceTrend(_req: NextRequest): Promise<NextResponse> {
    try {
      const result = await this.services.getIssuanceTrend();
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }
      return NextResponse.json(
        { message: result.getError() || "Gagal memuat tren penerbitan lisensi" },
        { status: 500 },
      );
    } catch (_error) {
      return NextResponse.json(
        { message: "Terjadi kesalahan internal pada server" },
        { status: 500 },
      );
    }
  }

  public async getExpiryForecast(_req: NextRequest): Promise<NextResponse> {
    try {
      const result = await this.services.getExpiryForecast();
      if (result.isSuccess) {
        return NextResponse.json(result.getValue(), { status: 200 });
      }
      return NextResponse.json(
        { message: result.getError() || "Gagal memuat proyeksi kedaluwarsa lisensi" },
        { status: 500 },
      );
    } catch (_error) {
      return NextResponse.json(
        { message: "Terjadi kesalahan internal pada server" },
        { status: 500 },
      );
    }
  }
}
