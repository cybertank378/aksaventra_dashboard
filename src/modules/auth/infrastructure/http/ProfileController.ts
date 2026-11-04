import { type NextRequest, NextResponse } from "next/server";
import { isNextBailoutError } from "@/core/utils/isNextBailoutError";
import { GetUserProfileUseCase } from "@/modules/auth/application/usecase/GetUserProfileUseCase";
import { RevokeSessionUseCase } from "@/modules/auth/application/usecase/RevokeSessionUseCase";
import { UpdateProfileUseCase } from "@/modules/auth/application/usecase/UpdateProfileUseCase";
import { getCurrentAuth } from "@/modules/auth/infrastructure/decorator/getCurrentAuth";
import { ProfileValidator } from "@/modules/auth/infrastructure/validators/profile.validator";

export class ProfileController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase = new GetUserProfileUseCase(),
    private readonly updateProfileUseCase: UpdateProfileUseCase = new UpdateProfileUseCase(),
    private readonly revokeSessionUseCase: RevokeSessionUseCase = new RevokeSessionUseCase(),
  ) {}

  public async getProfile(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      if (!auth) {
        return NextResponse.json(
          { success: false, message: "Tidak terautentikasi" },
          { status: 401 },
        );
      }

      const sessionToken =
        req.cookies.get("auth_token")?.value || req.cookies.get("session_token")?.value;

      const profile = await this.getUserProfileUseCase.execute({
        userId: auth.userId,
        currentToken: sessionToken,
      });

      if (!profile) {
        return NextResponse.json(
          { success: false, message: "Profil tidak ditemukan" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: profile }, { status: 200 });
    } catch (error) {
      if (isNextBailoutError(error)) throw error;
      console.error("[ProfileController.getProfile]", error);
      return NextResponse.json(
        { success: false, message: "Terjadi kesalahan internal" },
        { status: 500 },
      );
    }
  }

  public async patchProfile(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      if (!auth) {
        return NextResponse.json(
          { success: false, message: "Tidak terautentikasi" },
          { status: 401 },
        );
      }

      const body = await req.json().catch(() => ({}));
      const validation = ProfileValidator.validateUpdate(body);

      if (!validation.isValid || !validation.data) {
        return NextResponse.json(
          {
            success: false,
            message: "Validasi formulir profil gagal",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }

      const ipAddress =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        undefined;

      const updated = await this.updateProfileUseCase.execute({
        userId: auth.userId,
        dto: validation.data,
        ipAddress,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Profil berhasil diperbarui",
          data: updated,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("[ProfileController.patchProfile]", error);
      return NextResponse.json(
        { success: false, message: "Terjadi kesalahan internal" },
        { status: 500 },
      );
    }
  }

  public async revokeSession(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
  ): Promise<NextResponse> {
    try {
      const auth = await getCurrentAuth(req);
      if (!auth) {
        return NextResponse.json(
          { success: false, message: "Tidak terautentikasi" },
          { status: 401 },
        );
      }

      const { id: sessionId } = await context.params;
      if (!sessionId) {
        return NextResponse.json(
          { success: false, message: "ID sesi wajib diisi" },
          { status: 400 },
        );
      }

      const ipAddress =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        undefined;

      const revoked = await this.revokeSessionUseCase.execute({
        userId: auth.userId,
        sessionId,
        ipAddress,
      });

      if (!revoked) {
        return NextResponse.json(
          { success: false, message: "Sesi tidak ditemukan atau bukan milik Anda" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Sesi berhasil diputuskan",
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("[ProfileController.revokeSession]", error);
      return NextResponse.json(
        { success: false, message: "Terjadi kesalahan internal" },
        { status: 500 },
      );
    }
  }
}
